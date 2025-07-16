import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/app/lib/firebase";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const rawBody = await req.arrayBuffer();
  const signature = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(rawBody),
      signature,
      endpointSecret
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return new Response("Webhook Error", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const sessionId = session.id;

    if (!userId) {
      console.warn("Missing userId in metadata.");
      return NextResponse.json({ received: true });
    }

    try {
      // Get line items from Stripe session
      const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, {
        limit: 100,
      });

      for (const item of lineItems.data) {
        // Get product ID from Stripe price.product (can be string or Stripe.Product)
        const productId =
          typeof item.price?.product === "string"
            ? item.price.product
            : item.price?.product?.id;

        if (!productId) {
          console.warn("No product ID found for line item", item);
          continue;
        }

        // Fetch product details from Firestore 'products' collection
        const productDoc = await getDoc(doc(db, "products", productId));

        if (!productDoc.exists()) {
          console.warn(`Product ${productId} not found in Firestore.`);
          continue;
        }

        const productData = productDoc.data();

        // Prepare purchase record based on your desired schema
        const purchaseRecord = {
          userId,
          sessionId,
          id: productId,
          name: productData.name || null,
          author: productData.author || null,
          description: productData.description || null,
          downloadUrl: productData.downloadUrl || null,
          email: null, // You can store user email if you have it elsewhere
          game: productData.game || null,
          image: productData.image || null,
          price: productData.price || 0,
          timestamp: new Date().toISOString(),
          quantity: item.quantity ?? 1,
        };

        // Save to 'purchases' collection
        await addDoc(collection(db, "purchases"), purchaseRecord);
      }

      console.log(`✅ Purchases recorded for user ${userId}`);
    } catch (e) {
      console.error("Failed to save purchases:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
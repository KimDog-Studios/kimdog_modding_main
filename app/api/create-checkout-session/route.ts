import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "22025-06-30.basil",
});

export async function POST(request: NextRequest) {
  try {
    const { items, success_url, cancel_url } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    const line_items = [];

    for (const item of items) {
      if (!item.id || !item.quantity || item.quantity < 1) continue;

      const docRef = doc(db, "products", item.id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return NextResponse.json(
          { error: `Product not found: ${item.id}` },
          { status: 400 }
        );
      }

      const productData = docSnap.data();
      if (!productData.price || !productData.name) {
        return NextResponse.json(
          { error: `Invalid product data for: ${item.id}` },
          { status: 400 }
        );
      }

      line_items.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: productData.name,
          },
          unit_amount: Math.round(productData.price * 100),
        },
        quantity: item.quantity,
      });
    }

    if (line_items.length === 0) {
      return NextResponse.json({ error: "No valid items to checkout" }, { status: 400 });
    }

    const origin = request.headers.get("origin") || "";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url:
        success_url || `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${origin}/cart`,
    });

    return NextResponse.json({ id: session.id });
  } catch (error) {
    console.error("Stripe checkout session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
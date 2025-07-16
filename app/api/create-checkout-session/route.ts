import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export async function POST(request: NextRequest) {
  try {
    const { items, success_url, cancel_url, userId, discountPercent } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    const discount = typeof discountPercent === "number" && discountPercent > 0 && discountPercent <= 100
      ? discountPercent
      : 0;

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of items) {
      if (!item.id || !item.quantity || item.quantity < 1) continue;

      // Fetch product data from Firestore
      const docRef = doc(db, "products", item.id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return NextResponse.json(
          { error: `Product not found: ${item.id}` },
          { status: 400 }
        );
      }

      const productData = docSnap.data();

      // Ensure product price and name exist
      if (
        productData.price === undefined ||
        productData.price === null ||
        isNaN(productData.price) ||
        productData.price <= 0 ||
        !productData.name
      ) {
        return NextResponse.json(
          { error: `Invalid product data for: ${item.id}` },
          { status: 400 }
        );
      }

      // Calculate discounted price per unit in cents
      let unitAmountCents = Math.round(productData.price * 100);
      if (discount > 0) {
        unitAmountCents = Math.round(unitAmountCents * (1 - discount / 100));
      }

      line_items.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: productData.name,
            description: productData.description || undefined,
            images: productData.image ? [productData.image] : undefined,
          },
          unit_amount: unitAmountCents,
        },
        quantity: item.quantity,
      });
    }

    if (line_items.length === 0) {
      return NextResponse.json(
        { error: "No valid items to checkout" },
        { status: 400 }
      );
    }

    const origin = request.headers.get("origin") || "";

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url:
        success_url || `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${origin}/cart`,
      metadata: userId ? { userId } : {},
    });

    return NextResponse.json({ id: session.id });
  } catch (error) {
    console.error("❌ Stripe checkout session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
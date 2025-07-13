import { db } from "./firebaseClient";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function addToLibrary(userId, product) {
  try {
    const docRef = await addDoc(collection(db, "userLibrary"), {
      userId,
      productId: product.id,
      productName: product.name,
      purchasedAt: serverTimestamp(),
    });
    console.log("Added to library with ID: ", docRef.id);
    return true;
  } catch (e) {
    console.error("Error adding to library: ", e);
    return false;
  }
}

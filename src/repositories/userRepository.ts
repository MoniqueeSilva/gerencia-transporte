import {
  doc,
  collection,
  getDocs,
  getDoc,
  setDoc
} from "firebase/firestore";

import { db } from "../firebase/firestore";
import { User } from "../models/User";

export async function createUser(user: User) {
  await setDoc(
    doc(db, "users", user.uid),
    user
  );
}

export async function getUser(uid: string) {
  const snapshot = await getDoc(
    doc(db, "users", uid)
  );

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as User;
}

export async function getAllUsers() {

  const snapshot =
    await getDocs(
      collection(db, "users")
    );

  return snapshot.docs.map(doc =>
    doc.data() as User
  );
}
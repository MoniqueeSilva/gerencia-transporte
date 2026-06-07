import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import { db } from "../firebase/firestore";
import { User } from "../models/user";

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
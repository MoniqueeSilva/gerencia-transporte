import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";

import { auth } from "../firebase/auth";
import { registerUser } from "./userService";

export async function register(
  name: string,
  email: string,
  password: string
) {

  const credential =
    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

  await registerUser(
    credential.user.uid,
    name,
    email
  );

  return credential;
}

export async function login(
  email: string,
  password: string
) {

  return signInWithEmailAndPassword(
    auth,
    email,
    password
  );
}
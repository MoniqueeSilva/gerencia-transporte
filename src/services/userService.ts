import { createUser } from "../repositories/userRepository";
import { User } from "../models/User";

export async function registerUser(
  uid: string,
  name: string,
  email: string
) {

  const user: User = {
    uid,
    name,
    email,
    role: "student",
    createdAt: new Date()
  };

  await createUser(user);
}
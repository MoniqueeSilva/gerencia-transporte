import { getUser } from "../repositories/userRepository";

export async function findUserById(uid: string) {
  return await getUser(uid);
}

export async function isDriver(uid: string) {
  const user = await getUser(uid);
  return user?.role === "driver";
}

export async function isStudent(uid: string) {
  const user = await getUser(uid);
  return user?.role === "student";
}

export async function isAdmin(uid: string) {
  const user = await getUser(uid);
  return user?.role === "admin";
}
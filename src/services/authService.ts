import { isDriver } from "./userService";

export async function requireDriver(
  uid: string
) {
  const allowed =
    await isDriver(uid);

  if (!allowed) {
    throw new Error(
      "Acesso permitido apenas para motoristas"
    );
  }
}
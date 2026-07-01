import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firestore";

export type UserRole = "student" | "driver" | "admin";

export type Usuario = {
  id: string;
  uid?: string;
  nome?: string;
  email?: string;
  role?: UserRole;
  instituicaoId?: string;
  turno?: string;
  rotaId?: string;
  paradaOrdem?: number;
  telefone?: string;
  ativo?: boolean;
};

export async function getUser(uid: string): Promise<Usuario | null> {
  const ref = doc(db, "usuarios", uid);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<Usuario, "id">),
  };
}
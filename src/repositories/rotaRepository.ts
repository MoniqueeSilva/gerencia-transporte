import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

export type Rota = {
  id: string;
  nome: string;
  motoristaId?: string;
  ativa: boolean;
  criadoEm?: unknown;
};

export type NovaRota = {
  nome: string;
  motoristaId?: string;
  ativa: boolean;
};

export async function createRota(dados: NovaRota) {
  const ref = await addDoc(collection(db, "rotas"), {
    ...dados,
    criadoEm: serverTimestamp(),
  });

  return ref.id;
}

export async function getRotaById(id: string): Promise<Rota | null> {
  const snapshot = await getDoc(doc(db, "rotas", id));

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<Rota, "id">),
  };
}

export async function getRotasAtivas(): Promise<Rota[]> {
  const q = query(collection(db, "rotas"), where("ativa", "==", true));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((documento) => ({
    id: documento.id,
    ...(documento.data() as Omit<Rota, "id">),
  }));
}
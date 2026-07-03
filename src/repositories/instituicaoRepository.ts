import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firestore";

export type Instituicao = {
  id: string;
  nome: string;
  sigla: string;
  cidade: string;
  ativa: boolean;
};

export async function getInstituicoes(): Promise<Instituicao[]> {
  const q = query(
    collection(db, "instituicoes"),
    where("ativa", "==", true)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((documento) => ({
    id: documento.id,
    ...(documento.data() as Omit<Instituicao, "id">),
  }));
}
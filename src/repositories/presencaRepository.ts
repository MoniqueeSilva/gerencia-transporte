import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

export type Presenca = {
  id: string;
  usuarioId: string;
  nomeAluno: string;
  instituicaoId: string;
  rotaId: string;
  turno: string;
  tipoTransporte: string;
  data: string;
  vai: boolean;
  retorna: boolean;
};

export async function getPresencasPorRota(
  rotaId: string,
  data: string
): Promise<Presenca[]> {

  const q = query(
    collection(db, "presencas"),
    where("rotaId", "==", rotaId),
    where("data", "==", data)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Presenca, "id">),
  }));
}
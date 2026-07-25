import {
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
  type Unsubscribe,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

export type Presenca = {
  id: string;
  usuarioId: string;
  nomeAluno: string;
  instituicaoId: string;
  turno: string;
  tipoTransporte: string;
  vai: boolean;
  retorna: boolean;
  data: string;
  atualizadoEm?: unknown;
};

function formatarPresenca(
  documento: QueryDocumentSnapshot<DocumentData>
): Presenca {
  return {
    id: documento.id,
    ...(documento.data() as Omit<Presenca, "id">),
  };
}

export async function listarPresencasPorData(
  data: string
): Promise<Presenca[]> {
  const consulta = query(
    collection(db, "presencas"),
    where("data", "==", data),
    where("vai", "==", true),
    orderBy("nomeAluno", "asc")
  );

  const snapshot = await getDocs(consulta);

  return snapshot.docs.map(formatarPresenca);
}

export async function listarPresencasPorInstituicao(
  instituicaoId: string,
  data: string
): Promise<Presenca[]> {
  const consulta = query(
    collection(db, "presencas"),
    where("instituicaoId", "==", instituicaoId),
    where("data", "==", data),
    where("vai", "==", true),
    orderBy("nomeAluno", "asc")
  );

  const snapshot = await getDocs(consulta);

  return snapshot.docs.map(formatarPresenca);
}

export async function listarPresencasPorTurno(
  turno: string,
  data: string
): Promise<Presenca[]> {
  const consulta = query(
    collection(db, "presencas"),
    where("turno", "==", turno),
    where("data", "==", data),
    where("vai", "==", true),
    orderBy("nomeAluno", "asc")
  );

  const snapshot = await getDocs(consulta);

  return snapshot.docs.map(formatarPresenca);
}

export function acompanharPresencasPorData(
  data: string,
  callback: (presencas: Presenca[]) => void
): Unsubscribe {
  const consulta = query(
    collection(db, "presencas"),
    where("turno", "==", true),
    where("data", "==", data),
    where("vai", "==", true),
    orderBy("nomeAluno", "asc")
  );

  return onSnapshot(consulta, (snapshot) => {
    console.log("Consulta por turno executada");
    console.log("Quantidade:", snapshot.docs.length);
    const presencas = snapshot.docs.map(formatarPresenca);
    console.log(presencas);
    callback(presencas);
  });
}

export function acompanharPresencasPorInstituicao(
  instituicaoId: string,
  data: string,
  callback: (presencas: Presenca[]) => void
): Unsubscribe {
  const consulta = query(
    collection(db, "presencas"),
    where("instituicaoId", "==", instituicaoId),
    where("data", "==", data),
    where("vai", "==", true),
    orderBy("nomeAluno", "asc")
  );

  return onSnapshot(consulta, (snapshot) => {
    const presencas = snapshot.docs.map(formatarPresenca);
    callback(presencas);
  });
}

export function acompanharPresencasPorTurno(
  turno: string,
  data: string,
  callback: (presencas: Presenca[]) => void
): Unsubscribe {
  const consulta = query(
    collection(db, "presencas"),
    where("turno", "==", turno),
    where("data", "==", data),
    where("vai", "==", true),
    orderBy("nomeAluno", "asc")
  );

  return onSnapshot(consulta, (snapshot) => {
    const presencas = snapshot.docs.map(formatarPresenca);
    callback(presencas);
  });
}
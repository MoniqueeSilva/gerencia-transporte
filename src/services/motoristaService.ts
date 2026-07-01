import {
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
  type Unsubscribe,
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
  rotaId?: string;
  paradaOrdem?: number;
  atualizadoEm?: unknown;
};

function formatarPresenca(docSnap: any): Presenca {
  return {
    id: docSnap.id,
    ...(docSnap.data() as Omit<Presenca, "id">),
  };
}

export async function listarPresencasPorData(data: string) {
  const q = query(
    collection(db, "presencas"),
    where("data", "==", data),
    where("vai", "==", true),
    orderBy("nomeAluno", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(formatarPresenca);
}

export async function listarPresencasPorInstituicao(instituicaoId: string, data: string) {
  const q = query(
    collection(db, "presencas"),
    where("instituicaoId", "==", instituicaoId),
    where("data", "==", data),
    where("vai", "==", true),
    orderBy("nomeAluno", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(formatarPresenca);
}

export async function listarPresencasPorTurno(turno: string, data: string) {
  const q = query(
    collection(db, "presencas"),
    where("turno", "==", turno),
    where("data", "==", data),
    where("vai", "==", true),
    orderBy("nomeAluno", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(formatarPresenca);
}

export async function listarPresencasPorRota(rotaId: string, data: string) {
  const q = query(
    collection(db, "presencas"),
    where("rotaId", "==", rotaId),
    where("data", "==", data),
    where("vai", "==", true),
    orderBy("paradaOrdem", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(formatarPresenca);
}

export function acompanharPresencasPorData(
  data: string,
  callback: (presencas: Presenca[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "presencas"),
    where("data", "==", data),
    where("vai", "==", true),
    orderBy("nomeAluno", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const presencas = snapshot.docs.map(formatarPresenca);
    callback(presencas);
  });
}

export function acompanharPresencasPorInstituicao(
  instituicaoId: string,
  data: string,
  callback: (presencas: Presenca[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "presencas"),
    where("instituicaoId", "==", instituicaoId),
    where("data", "==", data),
    where("vai", "==", true),
    orderBy("nomeAluno", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const presencas = snapshot.docs.map(formatarPresenca);
    callback(presencas);
  });
}

export function acompanharPresencasPorTurno(
  turno: string,
  data: string,
  callback: (presencas: Presenca[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "presencas"),
    where("turno", "==", turno),
    where("data", "==", data),
    where("vai", "==", true),
    orderBy("nomeAluno", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const presencas = snapshot.docs.map(formatarPresenca);
    callback(presencas);
  });
}

export function acompanharPresencasPorRota(
  rotaId: string,
  data: string,
  callback: (presencas: Presenca[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "presencas"),
    where("rotaId", "==", rotaId),
    where("data", "==", data),
    where("vai", "==", true),
    orderBy("paradaOrdem", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const presencas = snapshot.docs.map(formatarPresenca);
    callback(presencas);
  });
}
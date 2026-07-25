import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  type Unsubscribe,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

export type LocalizacaoMotorista = {
  motoristaId: string;
  nomeMotorista?: string;
  turno: string;
  latitude: number;
  longitude: number;
  precisao: number;
  compartilhando: boolean;
  atualizadoEm?: unknown;
};

type SalvarLocalizacaoParams = {
  motoristaId: string;
  nomeMotorista: string;
  turno: string;
  latitude: number;
  longitude: number;
  precisao: number;
};

export async function salvarLocalizacaoMotorista({
  motoristaId,
  nomeMotorista,
  turno,
  latitude,
  longitude,
  precisao,
}: SalvarLocalizacaoParams) {
  const referencia = doc(
    db,
    "localizacoesMotoristas",
    motoristaId
  );

  await setDoc(
    referencia,
    {
      motoristaId,
      nomeMotorista,
      turno,
      latitude,
      longitude,
      precisao,
      compartilhando: true,
      atualizadoEm: serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}

export async function encerrarCompartilhamento(
  motoristaId: string
) {
  const referencia = doc(
    db,
    "localizacoesMotoristas",
    motoristaId
  );

  await updateDoc(referencia, {
    compartilhando: false,
    atualizadoEm: serverTimestamp(),
  });
}

/**
 * Escuta a localização de um motorista específico.
 */
export function acompanharLocalizacaoMotorista(
  motoristaId: string,
  callback: (
    localizacao: LocalizacaoMotorista | null
  ) => void
): Unsubscribe {
  const referencia = doc(
    db,
    "localizacoesMotoristas",
    motoristaId
  );

  return onSnapshot(referencia, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }

    callback(snapshot.data() as LocalizacaoMotorista);
  });
}

/**
 * Escuta o motorista que está compartilhando
 * localização para um determinado turno.
 */
export function acompanharMotoristaPorTurno(
  turno: string,
  callback: (
    motorista: LocalizacaoMotorista | null
  ) => void
): Unsubscribe {
  const consulta = query(
    collection(db, "localizacoesMotoristas"),
    where("turno", "==", turno),
    where("compartilhando", "==", true)
  );

  return onSnapshot(
    consulta,
    (snapshot) => {
      if (snapshot.empty) {
        callback(null);
        return;
      }

      callback(
        snapshot.docs[0].data() as LocalizacaoMotorista
      );
    },
    (error) => {
      console.error(
        "Erro ao acompanhar localização:",
        error
      );
      callback(null);
    }
  );
}
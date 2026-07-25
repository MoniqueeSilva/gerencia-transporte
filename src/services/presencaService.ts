import {
  doc,
  deleteDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

export type DadosPresenca = {
  usuarioId: string;
  nomeAluno: string;
  instituicaoId: string;
  turno: string;
  tipoTransporte: string;
  vai: boolean;
  retorna: boolean;
  data: string;
};

export async function salvarPresenca(
  dados: DadosPresenca
) {
  const idDocumento = `${dados.usuarioId}_${dados.data}`;

  const referencia = doc(
    db,
    "presencas",
    idDocumento
  );

  await setDoc(
    referencia,
    {
      ...dados,
      atualizadoEm: serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}

export async function cancelarPresenca(
  usuarioId: string,
  data: string
) {
  const idDocumento = `${usuarioId}_${data}`;

  const referencia = doc(
    db,
    "presencas",
    idDocumento
  );

  await deleteDoc(referencia);
}
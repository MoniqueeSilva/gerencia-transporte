import { doc, setDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/firestore";

type DadosPresenca = {
  usuarioId: string;
  nomeAluno: string;
  escolaId: string;
  turno: string;
  tipoTransporte: string;
  vai: boolean;
  retorna: boolean;
  data: string;
};

export async function salvarPresenca(dados: DadosPresenca) {
  const idDocumento = `${dados.usuarioId}_${dados.data}`;

  await setDoc(doc(db, "presencas", idDocumento), {
    ...dados,
    atualizadoEm: serverTimestamp(),
  });
}

export async function cancelarPresenca(usuarioId: string, data: string) {
  const idDocumento = `${usuarioId}_${data}`;
  await deleteDoc(doc(db, "presencas", idDocumento));
}
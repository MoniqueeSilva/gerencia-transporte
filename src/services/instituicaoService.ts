import {
  getInstituicoes,
  type Instituicao,
} from "../repositories/instituicaoRepository";

export async function listarInstituicoes(): Promise<Instituicao[]> {
  return await getInstituicoes();
}
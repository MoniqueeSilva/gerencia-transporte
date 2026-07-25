import {
  createRota,
  getRotaById,
  getRotasAtivas,
  type NovaRota,
} from "../repositories/rotaRepository";

export async function cadastrarRota(dados: NovaRota) {
  return await createRota(dados);
}

export async function buscarRotaPorId(id: string) {
  return await getRotaById(id);
}

export async function listarRotasAtivas() {
  return await getRotasAtivas();
}
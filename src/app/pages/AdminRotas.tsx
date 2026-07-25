import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Route, Save } from "lucide-react";

import { cadastrarRota, listarRotasAtivas } from "../../services/rotaService";
import type { Rota } from "../../repositories/rotaRepository";

export default function AdminRotas() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [rotas, setRotas] = useState<Rota[]>([]);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    carregarRotas();
  }, []);

  async function carregarRotas() {
    const dados = await listarRotasAtivas();
    setRotas(dados);
  }

  async function handleCadastrarRota(e: React.FormEvent) {
    e.preventDefault();

    setErro("");
    setSucesso("");
    setCarregando(true);

    try {
      if (!nome.trim()) {
        throw new Error("Informe o nome da rota.");
      }

      await cadastrarRota({
        nome,
        motoristaId: "",
        ativa: true,
      });

      setSucesso("Rota cadastrada com sucesso.");
      setNome("");

      await carregarRotas();
    } catch (err: any) {
      setErro(err.message || "Erro ao cadastrar rota.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-[#14213D] text-white px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-white hover:text-[#FCA311]"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <h1 className="text-white">Gerenciar rotas</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white border-2 border-[#E5E5E5] rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-[#14213D] font-bold mb-6 flex items-center gap-2">
            <Route className="w-6 h-6 text-[#FCA311]" />
            Cadastrar nova rota
          </h2>

          <form onSubmit={handleCadastrarRota} className="space-y-5">
            <div>
              <label className="block mb-2 text-sm font-medium">
                Nome da rota
              </label>

              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Rota Centro"
                className="w-full px-4 py-3 border border-[#E5E5E5] rounded-lg focus:border-[#FCA311] focus:outline-none"
              />
            </div>

            {erro && (
              <div className="text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                {erro}
              </div>
            )}

            {sucesso && (
              <div className="text-green-700 bg-green-50 p-3 rounded-lg text-sm">
                {sucesso}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-[#FCA311] text-white py-3 rounded-lg font-bold hover:bg-[#E39310] disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {carregando ? "Salvando..." : "Salvar rota"}
            </button>
          </form>
        </div>

        <div className="bg-white border-2 border-[#E5E5E5] rounded-2xl p-6 shadow-sm">
          <h2 className="text-[#14213D] font-bold mb-4">Rotas cadastradas</h2>

          {rotas.length === 0 ? (
            <p className="text-gray-500">Nenhuma rota cadastrada.</p>
          ) : (
            <div className="space-y-3">
              {rotas.map((rota) => (
                <div
                  key={rota.id}
                  className="border border-[#E5E5E5] rounded-lg p-4"
                >
                  <p className="font-bold text-[#14213D]">{rota.nome}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
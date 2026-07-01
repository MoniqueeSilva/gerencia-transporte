import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Bus,
  MapPin,
  CalendarDays,
} from "lucide-react";

import { Calendar } from "../components/ui/calendar";
import { format, isWeekend } from "date-fns";
import { ptBR } from "date-fns/locale";

import { auth } from "../../firebase/auth";
import {
  salvarPresenca,
  cancelarPresenca,
} from "../../services/presencaService";

import { findUserById } from "../../services/userService";

type UsuarioBanco = {
  uid?: string;
  nome?: string;
  email?: string;
  role?: string;
  instituicaoId?: string;
  turno?: string;
  rotaId?: string;
  paradaOrdem?: number;
};

export default function StudentPanel() {
  const navigate = useNavigate();

  const [selectedShift, setSelectedShift] = useState("manha");
  const [selectedTransport, setSelectedTransport] = useState("ida-volta");
  const [usuarioBanco, setUsuarioBanco] = useState<UsuarioBanco | null>(null);

  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(
    new Date()
  );

  const [presencasConfirmadas, setPresencasConfirmadas] = useState<string[]>(
    []
  );

  useEffect(() => {
    async function carregarUsuario() {
      const usuario = auth.currentUser;

      if (!usuario) {
        navigate("/");
        return;
      }

      const dados = await findUserById(usuario.uid);

      if (!dados) {
        alert("Dados do usuário não encontrados.");
        return;
      }

      setUsuarioBanco(dados as UsuarioBanco);

      if (dados.turno) {
        setSelectedShift(dados.turno);
      }
    }

    carregarUsuario();
  }, [navigate]);

  const confirmedPassengers = [
    { id: 1, name: "Maria Santos", shift: "Manhã", type: "Ida e volta" },
    { id: 2, name: "Pedro Costa", shift: "Manhã", type: "Somente ida" },
    { id: 3, name: "Ana Lima", shift: "Manhã", type: "Ida e volta" },
    { id: 4, name: "Carlos Souza", shift: "Manhã", type: "Somente volta" },
  ];

  const handleConfirmarPresenca = async () => {
    if (!dataSelecionada) return;

    const usuario = auth.currentUser;

    if (!usuario) {
      alert("Usuário não autenticado.");
      navigate("/");
      return;
    }

    if (!usuarioBanco?.instituicaoId) {
      alert("Instituição do aluno não encontrada no cadastro.");
      return;
    }

    const dataFormatada = format(dataSelecionada, "yyyy-MM-dd");

    await salvarPresenca({
      usuarioId: usuario.uid,
      nomeAluno: usuarioBanco.nome || usuario.displayName || "Aluno",
      instituicaoId: usuarioBanco.instituicaoId,
      turno: selectedShift,
      tipoTransporte: selectedTransport,
      vai: true,
      retorna:
        selectedTransport === "volta" || selectedTransport === "ida-volta",
      data: dataFormatada,
    });

    if (!presencasConfirmadas.includes(dataFormatada)) {
      setPresencasConfirmadas([...presencasConfirmadas, dataFormatada]);
    }
  };

  const handleCancelarPresenca = async () => {
    if (!dataSelecionada) return;

    const usuario = auth.currentUser;

    if (!usuario) {
      alert("Usuário não autenticado.");
      navigate("/");
      return;
    }

    const dataFormatada = format(dataSelecionada, "yyyy-MM-dd");

    await cancelarPresenca(usuario.uid, dataFormatada);

    setPresencasConfirmadas(
      presencasConfirmadas.filter((data) => data !== dataFormatada)
    );
  };

  const dataFormatadaAtual = dataSelecionada
    ? format(dataSelecionada, "yyyy-MM-dd")
    : "";

  const isConfirmado = presencasConfirmadas.includes(dataFormatadaAtual);
  const isFimDeSemana = dataSelecionada ? isWeekend(dataSelecionada) : false;

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-[#14213D] text-white px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-white hover:text-[#FCA311] transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <h1 className="text-white">Confirmar presença</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white border-2 border-[#E5E5E5] rounded-2xl p-6 mb-8 shadow-sm">
          <div className="space-y-6">
            <div>
              <label className="block text-[#000000] mb-2">
                Nome do aluno
              </label>

              <input
                type="text"
                value={usuarioBanco?.nome || auth.currentUser?.displayName || ""}
                readOnly
                className="w-full px-4 py-3 bg-[#E5E5E5] border-2 border-[#E5E5E5] rounded-lg text-[#000000]"
              />
            </div>

            <div>
              <label className="block text-[#000000] mb-3">
                Selecione o turno
              </label>

              <div className="flex flex-wrap gap-3">
                {[
                  { id: "manha", label: "Manhã" },
                  { id: "tarde", label: "Tarde" },
                  { id: "noite", label: "Noite" },
                ].map((shift) => (
                  <label
                    key={shift.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="shift"
                      value={shift.id}
                      checked={selectedShift === shift.id}
                      onChange={(e) => setSelectedShift(e.target.value)}
                      className="w-4 h-4 accent-[#FCA311]"
                    />

                    <span className="text-[#000000]">{shift.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[#000000] mb-3">
                Tipo de transporte
              </label>

              <div className="flex flex-wrap gap-3">
                {[
                  { id: "ida", label: "Somente ida" },
                  { id: "volta", label: "Somente volta" },
                  { id: "ida-volta", label: "Ida e volta" },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedTransport(type.id)}
                    className={`px-6 py-3 rounded-lg border-2 transition-colors ${
                      selectedTransport === type.id
                        ? "bg-[#14213D] text-white border-[#14213D]"
                        : "bg-white text-[#14213D] border-[#14213D] hover:bg-[#14213D] hover:text-white"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t-2 border-[#E5E5E5] pt-6 mt-6">
              <label className="text-[#000000] mb-3 flex items-center gap-2 font-medium">
                <CalendarDays className="w-5 h-5 text-[#14213D]" />
                Para qual data?
              </label>

              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="border-2 border-[#E5E5E5] rounded-xl p-2 inline-block bg-white shadow-sm">
                  <Calendar
                    mode="single"
                    selected={dataSelecionada}
                    onSelect={setDataSelecionada}
                    locale={ptBR}
                    disabled={(date) =>
                      date.getDay() === 0 || date.getDay() === 6
                    }
                    className="rounded-md"
                  />
                </div>

                <div className="flex-1 w-full">
                  {isFimDeSemana ? (
                    <div className="p-4 bg-gray-100 rounded-lg text-gray-600 font-medium text-center">
                      O ônibus não roda aos fins de semana.
                    </div>
                  ) : (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-4 text-center">
                      <p className="text-sm text-blue-800">
                        Data selecionada:
                        <br />
                        {dataSelecionada && (
                          <strong className="text-lg">
                            {format(dataSelecionada, "dd 'de' MMMM", {
                              locale: ptBR,
                            })}
                          </strong>
                        )}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3">
                    <button
                      type="button"
                      onClick={handleConfirmarPresenca}
                      disabled={isFimDeSemana || isConfirmado}
                      className={`flex items-center justify-center gap-2 py-4 rounded-lg transition-colors font-bold shadow-md ${
                        isConfirmado
                          ? "bg-green-600 text-white"
                          : isFimDeSemana
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-[#FCA311] text-white hover:bg-[#E39310]"
                      }`}
                    >
                      <CheckCircle className="w-5 h-5" />
                      {isConfirmado
                        ? "PRESENÇA CONFIRMADA"
                        : "VOU NESSE DIA"}
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelarPresenca}
                      disabled={isFimDeSemana || !isConfirmado}
                      className={`flex items-center justify-center gap-2 py-3 rounded-lg transition-colors font-medium ${
                        !isConfirmado || isFimDeSemana
                          ? "bg-[#E5E5E5] text-[#A0A0A0] cursor-not-allowed"
                          : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                      }`}
                    >
                      <XCircle className="w-5 h-5" />
                      CANCELAR PRESENÇA
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-[#E5E5E5] rounded-2xl p-6 shadow-sm">
          <h3 className="text-[#14213D] mb-4 flex items-center gap-2">
            <Bus className="w-6 h-6 text-[#FCA311]" />
            Passageiros confirmados
          </h3>

          <div className="space-y-3">
            {confirmedPassengers.map((passenger) => (
              <div
                key={passenger.id}
                className="flex items-center justify-between p-4 border-2 border-[#E5E5E5] rounded-lg hover:border-[#FCA311] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FCA311] rounded-full flex items-center justify-center">
                    <Bus className="w-5 h-5 text-white" />
                  </div>

                  <div>
                    <p className="text-[#000000] font-medium">
                      {passenger.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {passenger.shift} • {passenger.type}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/localizacao")}
          className="fixed bottom-8 right-8 bg-[#14213D] text-white px-6 py-4 rounded-full shadow-lg hover:bg-[#0F1829] transition-colors flex items-center gap-3"
        >
          <MapPin className="w-5 h-5 text-[#FCA311]" />
          <span>Ver ônibus no mapa</span>
        </button>
      </main>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Radio,
  Users,
  MapPin,
  CalendarDays,
  Bus,
} from "lucide-react";

import { Calendar } from "../components/ui/calendar";
import { format, isWeekend } from "date-fns";
import { ptBR } from "date-fns/locale";

import {
  acompanharPresencasPorData,
  type Presenca,
} from "../../services/motoristaService";

export default function DriverPanel() {
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState("todos");
  const [isSharing, setIsSharing] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(
    new Date()
  );

  const [presencas, setPresencas] = useState<Presenca[]>([]);

  const isFimDeSemana = dataSelecionada ? isWeekend(dataSelecionada) : false;

  useEffect(() => {
    if (!dataSelecionada || isFimDeSemana) {
      setPresencas([]);
      return;
    }

    const dataFormatada = format(dataSelecionada, "yyyy-MM-dd");

    const unsubscribe = acompanharPresencasPorData(dataFormatada, (dados) => {
      setPresencas(dados);
    });

    return () => unsubscribe();
  }, [dataSelecionada, isFimDeSemana]);

  const filteredStudents =
    activeFilter === "todos"
      ? presencas
      : presencas.filter(
          (p) => p.turno.toLowerCase() === activeFilter.toLowerCase()
        );

  const confirmedCount = filteredStudents.filter((p) => p.vai).length;

  function formatarTurno(turno: string) {
    const turnos: Record<string, string> = {
      manha: "Manhã",
      tarde: "Tarde",
      noite: "Noite",
    };

    return turnos[turno] || turno;
  }

  function formatarTipoTransporte(tipo: string) {
    const tipos: Record<string, string> = {
      ida: "Somente ida",
      volta: "Somente volta",
      "ida-volta": "Ida e volta",
    };

    return tipos[tipo] || tipo;
  }

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

          <h1 className="text-white">Gerenciar transporte</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1 bg-white border-2 border-[#E5E5E5] rounded-2xl p-4 shadow-sm flex flex-col items-center">
            <h3 className="text-[#14213D] font-bold mb-3 flex items-center gap-2 w-full px-2">
              <CalendarDays className="w-5 h-5 text-[#FCA311]" />
              Data da Rota
            </h3>

            <div className="border border-[#E5E5E5] rounded-xl p-1 bg-gray-50/50">
              <Calendar
                mode="single"
                selected={dataSelecionada}
                onSelect={setDataSelecionada}
                locale={ptBR}
                disabled={(date) => date.getDay() === 0 || date.getDay() === 6}
                className="rounded-md"
              />
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white border-2 border-[#E5E5E5] rounded-2xl p-6 shadow-sm flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center border-2 border-blue-100 flex-shrink-0">
                  <Users className="w-8 h-8 text-[#14213D]" />
                </div>

                <div>
                  <p className="text-[#000000] text-lg font-medium">
                    Passageiros para{" "}
                    {dataSelecionada && (
                      <strong className="text-[#14213D]">
                        {format(dataSelecionada, "dd/MM/yyyy")}
                      </strong>
                    )}
                  </p>

                  {isFimDeSemana ? (
                    <div className="mt-2 text-red-500 font-medium">
                      Fim de semana - Sem rotas programadas
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 mt-2">
                      <span className="inline-flex items-center justify-center w-12 h-12 bg-[#FCA311] text-white rounded-full text-xl font-bold shadow-md">
                        {confirmedCount}
                      </span>

                      <span className="text-[#000000]">
                        confirmados de{" "}
                        <strong className="text-[#14213D]">
                          {filteredStudents.length}
                        </strong>{" "}
                        listados no turno atual
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-[#E5E5E5] rounded-2xl p-4 shadow-sm">
              <p className="text-sm text-gray-500 font-medium mb-3">
                Filtrar por turno da viagem:
              </p>

              <div className="flex flex-wrap gap-3">
                {[
                  { id: "manha", label: "Manhã" },
                  { id: "tarde", label: "Tarde" },
                  { id: "noite", label: "Noite" },
                  { id: "todos", label: "Todos" },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`px-6 py-2 rounded-lg transition-colors font-medium ${
                      activeFilter === filter.id
                        ? "bg-[#14213D] text-white border-2 border-[#14213D] shadow-md"
                        : "bg-gray-50 text-[#14213D] border-2 border-[#E5E5E5] hover:border-[#FCA311]"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#14213D] text-white">
                <tr>
                  <th className="px-6 py-4 text-left">Nome</th>
                  <th className="px-6 py-4 text-left">Instituição</th>
                  <th className="px-6 py-4 text-left">Turno</th>
                  <th className="px-6 py-4 text-left">Tipo</th>
                  <th className="px-6 py-4 text-left">Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-500 font-medium"
                    >
                      {isFimDeSemana
                        ? "Sem passageiros aos fins de semana."
                        : "Nenhum passageiro encontrado para esta data e turno."}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, index) => (
                    <tr
                      key={student.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="px-6 py-4 text-[#000000] font-medium flex items-center gap-2">
                        <Bus className="w-4 h-4 text-gray-400" />
                        {student.nomeAluno}
                      </td>

                      <td className="px-6 py-4 text-[#000000]">
                        {student.instituicaoId}
                      </td>

                      <td className="px-6 py-4 text-[#000000]">
                        {formatarTurno(student.turno)}
                      </td>

                      <td className="px-6 py-4 text-[#000000]">
                        {formatarTipoTransporte(student.tipoTransporte)}
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                          Confirmado
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <button
            onClick={() => setIsSharing(!isSharing)}
            className={`flex items-center justify-center gap-3 py-6 px-8 rounded-2xl transition-colors shadow-md font-bold text-lg ${
              isSharing
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-[#FCA311] text-white hover:bg-[#E39310]"
            }`}
          >
            <Radio className={`w-6 h-6 ${isSharing ? "animate-pulse" : ""}`} />

            <span>
              {isSharing
                ? "Encerrar compartilhamento de localização"
                : "Iniciar compartilhamento de localização"}
            </span>
          </button>

          <div className="bg-[#E5E5E5] rounded-2xl h-64 flex flex-col items-center justify-center gap-3 border-2 border-[#E5E5E5]">
            <MapPin className="w-12 h-12 text-[#14213D]" />

            <p className="text-[#14213D] font-medium">Mapa do trajeto</p>

            <button
              onClick={() => navigate("/localizacao")}
              className="mt-2 px-6 py-2 bg-[#FCA311] text-white rounded-lg hover:bg-[#E39310] transition-colors font-medium shadow-sm"
            >
              Ver mapa completo
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
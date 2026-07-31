import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { onAuthStateChanged } from "firebase/auth";

import {
  ArrowLeft,
  Radio,
  Users,
  MapPin,
  CalendarDays,
  Bus,
  XCircle,
} from "lucide-react";

import { Calendar } from "../components/ui/calendar";
import { format, isWeekend } from "date-fns";
import { ptBR } from "date-fns/locale";

import { auth } from "../../firebase/auth";

import {
  acompanharPresencasPorTurno,
  type Presenca,
} from "../../services/motoristaService";

import { findUserById } from "../../services/userService";

import {
  salvarLocalizacaoMotorista,
  encerrarCompartilhamento,
} from "../../services/localizacaoService";

type MotoristaBanco = {
  id?: string;
  uid?: string;
  nome?: string;
  email?: string;
  role?: string;
  turno?: string;
  ativo?: boolean;
};

export default function DriverPanel() {
  const navigate = useNavigate();
  const [acessoNegado, setAcessoNegado] = useState(false);
  const [motoristaBanco, setMotoristaBanco] =
    useState<MotoristaBanco | null>(null);

  const [dataSelecionada, setDataSelecionada] = useState<
    Date | undefined
  >(new Date());

  const [presencas, setPresencas] = useState<Presenca[]>([]);

  const [isSharing, setIsSharing] = useState(false);
  const [carregandoMotorista, setCarregandoMotorista] =
    useState(true);

  const [erroLocalizacao, setErroLocalizacao] = useState("");
  const [erroPresencas, setErroPresencas] = useState("");

  const watchIdRef = useRef<number | null>(null);

  const isFimDeSemana = dataSelecionada
    ? isWeekend(dataSelecionada)
    : false;

  /*
   * Busca os dados do motorista autenticado.
   */
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (usuario) => {
        if (!usuario) {
          navigate("/");
          return;
        }

        try {
          setCarregandoMotorista(true);

          const dados = await findUserById(usuario.uid);

          if (!dados || dados.role !== "driver") {
            setAcessoNegado(true);
            setCarregandoMotorista(false);
            return;
          } 

          if (dados.ativo === false) {
            alert("Este motorista está desativado.");
            navigate("/");
            return;
          }

          if (!dados.turno) {
            alert("O motorista não possui um turno cadastrado.");
            navigate("/");
            return;
          }

          setMotoristaBanco(dados as MotoristaBanco);
        } catch (error) {
          console.error(
            "Erro ao carregar motorista:",
            error
          );

          alert(
            "Não foi possível carregar os dados do motorista."
          );
        } finally {
          setCarregandoMotorista(false);
        }
      }
    );

    return () => unsubscribeAuth();
  }, [navigate]);

  /*
   * Busca as presenças pela data e pelo turno do motorista.
   */
  useEffect(() => {
    if (
      !dataSelecionada ||
      isFimDeSemana ||
      !motoristaBanco?.turno
    ) {
      setPresencas([]);
      return;
    }

    setErroPresencas("");

    const dataFormatada = format(
      dataSelecionada,
      "yyyy-MM-dd"
    );

    const unsubscribe = acompanharPresencasPorTurno(
      motoristaBanco.turno,
      dataFormatada,
      (dados: Presenca[]) => {
        setPresencas(dados);
      }
    );

    return () => unsubscribe();
  }, [
    dataSelecionada,
    isFimDeSemana,
    motoristaBanco?.turno,
  ]);

  /*
   * Interrompe o GPS quando a tela é fechada.
   */
  useEffect(() => {
    return () => {
      if (
        watchIdRef.current !== null &&
        navigator.geolocation
      ) {
        navigator.geolocation.clearWatch(
          watchIdRef.current
        );

        watchIdRef.current = null;
      }
    };
  }, []);

  const iniciarCompartilhamento = () => {
    setErroLocalizacao("");

    const usuario = auth.currentUser;

    if (!usuario) {
      alert("Usuário não autenticado.");
      navigate("/");
      return;
    }

    if (!motoristaBanco?.turno) {
      setErroLocalizacao(
        "O motorista não possui um turno cadastrado."
      );
      return;
    }

    if (!navigator.geolocation) {
      setErroLocalizacao(
        "Este navegador não oferece suporte ao compartilhamento de localização."
      );
      return;
    }

    if (watchIdRef.current !== null) {
      return;
    }

    const watchId =
      navigator.geolocation.watchPosition(
        async (position) => {
          try {
            await salvarLocalizacaoMotorista({
              motoristaId: usuario.uid,
              nomeMotorista: motoristaBanco.nome ?? "",
              turno: motoristaBanco.turno!,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              precisao: position.coords.accuracy,
          });
            setIsSharing(true);
            setErroLocalizacao("");
          } catch (error) {
            console.error(
              "Erro ao salvar localização:",
              error
            );

            setErroLocalizacao(
              "Não foi possível enviar sua localização para o sistema."
            );
          }
        },

        (error) => {
          console.error(
            "Erro de geolocalização:",
            error
          );

          if (
            error.code ===
            GeolocationPositionError.PERMISSION_DENIED
          ) {
            setErroLocalizacao(
              "A permissão de localização foi negada. Autorize o acesso nas configurações do navegador."
            );
          } else if (
            error.code ===
            GeolocationPositionError.POSITION_UNAVAILABLE
          ) {
            setErroLocalizacao(
              "Sua localização não está disponível neste momento."
            );
          } else if (
            error.code ===
            GeolocationPositionError.TIMEOUT
          ) {
            setErroLocalizacao(
              "O navegador demorou muito para obter sua localização."
            );
          } else {
            setErroLocalizacao(
              "Não foi possível acessar sua localização."
            );
          }

          setIsSharing(false);

          if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(
              watchIdRef.current
            );

            watchIdRef.current = null;
          }
        },

        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000,
        }
      );

    watchIdRef.current = watchId;
  };

  const pararCompartilhamento = async () => {
    const usuario = auth.currentUser;

    if (!usuario) {
      return;
    }

    try {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(
          watchIdRef.current
        );

        watchIdRef.current = null;
      }

      await encerrarCompartilhamento(usuario.uid);

      setIsSharing(false);
      setErroLocalizacao("");
    } catch (error) {
      console.error(
        "Erro ao encerrar compartilhamento:",
        error
      );

      setErroLocalizacao(
        "Não foi possível encerrar o compartilhamento de localização."
      );
    }
  };

  const confirmedCount = presencas.filter(
    (presenca) => presenca.vai
  ).length;

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

  if (acessoNegado) {
    return (
      <div className="min-h-screen bg-red-600 flex flex-col items-center justify-center text-white px-6">
        <XCircle className="w-20 h-20 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Acesso Negado</h1>
        <p className="text-lg text-red-100 text-center max-w-md mb-6">
          Você não tem permissão para acessar o painel do motorista. Esta área é restrita.
        </p>
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="bg-white text-red-600 font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-red-50 transition-colors"
        >
          Voltar para o menu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-[#14213D] text-white px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="text-white hover:text-[#FCA311] transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div>
            <h1 className="text-white">
              Gerenciar transporte
            </h1>

            {motoristaBanco && (
              <p className="text-sm text-gray-300 mt-1">
                {motoristaBanco.nome || "Motorista"} —{" "}
                {formatarTurno(
                  motoristaBanco.turno || ""
                )}
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {carregandoMotorista ? (
          <div className="p-8 text-center text-gray-500">
            Carregando dados do motorista...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-1 bg-white border-2 border-[#E5E5E5] rounded-2xl p-4 shadow-sm flex flex-col items-center">
                <h3 className="text-[#14213D] font-bold mb-3 flex items-center gap-2 w-full px-2">
                  <CalendarDays className="w-5 h-5 text-[#FCA311]" />
                  Data da viagem
                </h3>

                <div className="border border-[#E5E5E5] rounded-xl p-1 bg-gray-50/50">
                  <Calendar
                    mode="single"
                    selected={dataSelecionada}
                    onSelect={setDataSelecionada}
                    locale={ptBR}
                    disabled={(date) =>
                      date.getDay() === 0 ||
                      date.getDay() === 6
                    }
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
                            {format(
                              dataSelecionada,
                              "dd/MM/yyyy"
                            )}
                          </strong>
                        )}
                      </p>

                      {isFimDeSemana ? (
                        <div className="mt-2 text-red-500 font-medium">
                          Fim de semana — sem viagens
                          programadas
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 mt-2">
                          <span className="inline-flex items-center justify-center w-12 h-12 bg-[#FCA311] text-white rounded-full text-xl font-bold shadow-md">
                            {confirmedCount}
                          </span>

                          <span className="text-[#000000]">
                            passageiros confirmados para o
                            turno da{" "}
                            <strong className="text-[#14213D]">
                              {formatarTurno(
                                motoristaBanco?.turno ||
                                  ""
                              )}
                            </strong>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white border-2 border-[#E5E5E5] rounded-2xl p-4 shadow-sm">
                  <p className="text-sm text-gray-500 font-medium">
                    Turno do motorista
                  </p>

                  <p className="mt-2 text-lg font-bold text-[#14213D]">
                    {formatarTurno(
                      motoristaBanco?.turno || ""
                    )}
                  </p>
                </div>
              </div>
            </div>

            {erroPresencas && (
              <div className="mb-6 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg">
                {erroPresencas}
              </div>
            )}

            <div className="bg-white border-2 border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#14213D] text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        Nome
                      </th>
                      <th className="px-6 py-4 text-left">
                        Instituição
                      </th>
                      <th className="px-6 py-4 text-left">
                        Turno
                      </th>
                      <th className="px-6 py-4 text-left">
                        Tipo
                      </th>
                      <th className="px-6 py-4 text-left">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {presencas.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-8 text-center text-gray-500 font-medium"
                        >
                          {isFimDeSemana
                            ? "Sem passageiros aos fins de semana."
                            : "Nenhum passageiro confirmado para esta data e turno."}
                        </td>
                      </tr>
                    ) : (
                      presencas.map(
                        (student, index) => (
                          <tr
                            key={student.id}
                            className={`hover:bg-gray-50 transition-colors ${
                              index % 2 === 0
                                ? "bg-white"
                                : "bg-gray-50/50"
                            }`}
                          >
                            <td className="px-6 py-4 text-[#000000] font-medium">
                              <div className="flex items-center gap-2">
                                <Bus className="w-4 h-4 text-gray-400" />
                                {student.nomeAluno}
                              </div>
                            </td>

                            <td className="px-6 py-4 text-[#000000]">
                              {student.instituicaoId}
                            </td>

                            <td className="px-6 py-4 text-[#000000]">
                              {formatarTurno(
                                student.turno
                              )}
                            </td>

                            <td className="px-6 py-4 text-[#000000]">
                              {formatarTipoTransporte(
                                student.tipoTransporte
                              )}
                            </td>

                            <td className="px-6 py-4">
                              <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                                Confirmado
                              </span>
                            </td>
                          </tr>
                        )
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <button
                type="button"
                onClick={
                  isSharing
                    ? pararCompartilhamento
                    : iniciarCompartilhamento
                }
                className={`flex items-center justify-center gap-3 py-6 px-8 rounded-2xl transition-colors shadow-md font-bold text-lg ${
                  isSharing
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-[#FCA311] text-white hover:bg-[#E39310]"
                }`}
              >
                <Radio
                  className={`w-6 h-6 ${
                    isSharing
                      ? "animate-pulse"
                      : ""
                  }`}
                />

                <span>
                  {isSharing
                    ? "Encerrar compartilhamento de localização"
                    : "Iniciar compartilhamento de localização"}
                </span>
              </button>

              <div className="bg-[#E5E5E5] rounded-2xl h-64 flex flex-col items-center justify-center gap-3 border-2 border-[#E5E5E5]">
                <MapPin className="w-12 h-12 text-[#14213D]" />

                <p className="text-[#14213D] font-medium">
                  Mapa do trajeto
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/localizacao")
                  }
                  className="mt-2 px-6 py-2 bg-[#FCA311] text-white rounded-lg hover:bg-[#E39310] transition-colors font-medium shadow-sm"
                >
                  Ver mapa completo
                </button>
              </div>

              {erroLocalizacao && (
                <div className="lg:col-span-2 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">
                  {erroLocalizacao}
                </div>
              )}

              {isSharing && (
                <div className="lg:col-span-2 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm">
                  Sua localização está sendo compartilhada
                  em tempo real.
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
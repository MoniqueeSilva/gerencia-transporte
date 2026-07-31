import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Bus,
  MapPin,
  CalendarDays,
  School,
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
import { listarInstituicoes } from "../../services/instituicaoService";

import {
  acompanharPresencasPorTurno,
  type Presenca,
} from "../../services/motoristaService";

import type { Instituicao } from "../../repositories/instituicaoRepository";

type UsuarioBanco = {
  uid?: string;
  nome?: string;
  email?: string;
  role?: string;
  turno?: string;
  ativo?: boolean;
};

export default function StudentPanel() {
  const navigate = useNavigate();
  const [acessoNegado, setAcessoNegado] = useState(false);

  const [selectedShift, setSelectedShift] = useState("manha");
  const [selectedTransport, setSelectedTransport] =
    useState("ida-volta");

  const [usuarioBanco, setUsuarioBanco] =
    useState<UsuarioBanco | null>(null);

  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);

  const [instituicaoSelecionadaId, setInstituicaoSelecionadaId] =
    useState("");

  const [passageirosConfirmados, setPassageirosConfirmados] = useState<
    Presenca[]
  >([]);

  const [carregandoUsuario, setCarregandoUsuario] = useState(true);

  const [carregandoInstituicoes, setCarregandoInstituicoes] =
    useState(false);

  const [salvandoPresenca, setSalvandoPresenca] = useState(false);
  const [cancelandoPresenca, setCancelandoPresenca] = useState(false);

  const [dataSelecionada, setDataSelecionada] = useState<
    Date | undefined
  >(new Date());

  /*
   * Carrega o usuário autenticado.
   */
  useEffect(() => {
    async function carregarUsuario() {
      const usuario = auth.currentUser;

      if (!usuario) {
        navigate("/");
        return;
      }

      try {
        setCarregandoUsuario(true);

        const dados = await findUserById(usuario.uid);

        if (!dados) {
          alert("Dados do usuário não encontrados.");
          navigate("/");
          return;
        }
        
        if (dados.role !== "student") {
          console.log("ROLE ENCONTRADO NO BANCO:", dados.role);
          setAcessoNegado(true);
          setCarregandoUsuario(false);
          return;
        }

        if (dados.ativo === false) {
          alert("Este usuário está desativado.");
          navigate("/");
          return;
        }

        setUsuarioBanco(dados as UsuarioBanco);
        setSelectedShift(dados.turno ?? "manha");
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        alert("Não foi possível carregar os dados do usuário.");
      } finally {
        setCarregandoUsuario(false);
      }
    }

    carregarUsuario();
  }, [navigate]);

  /*
   * Carrega as instituições disponíveis.
   */
  useEffect(() => {
    async function carregarInstituicoes() {
      try {
        setCarregandoInstituicoes(true);

        const dados = await listarInstituicoes();

        setInstituicoes(dados);
      } catch (error) {
        console.error("Erro ao carregar instituições:", error);
        alert("Não foi possível carregar as instituições.");
      } finally {
        setCarregandoInstituicoes(false);
      }
    }

    carregarInstituicoes();
  }, []);

  /*
   * Acompanha, em tempo real, os passageiros confirmados
   * para a data e o turno selecionados.
   */
  useEffect(() => {
    if (!dataSelecionada || isWeekend(dataSelecionada)) {
      setPassageirosConfirmados([]);
      return;
    }

    const dataFormatada = format(dataSelecionada, "yyyy-MM-dd");

    const unsubscribe = acompanharPresencasPorTurno(
      selectedShift,
      dataFormatada,
      (dados) => {
        setPassageirosConfirmados(dados);
      }
    );

    return () => unsubscribe();
  }, [dataSelecionada, selectedShift]);

  const handleConfirmarPresenca = async () => {
    if (!dataSelecionada) {
      alert("Selecione uma data.");
      return;
    }

    if (isWeekend(dataSelecionada)) {
      alert("O ônibus não funciona aos fins de semana.");
      return;
    }

    const usuario = auth.currentUser;

    if (!usuario) {
      alert("Usuário não autenticado.");
      navigate("/");
      return;
    }

    if (!usuarioBanco) {
      alert("Os dados do aluno ainda não foram carregados.");
      return;
    }

    if (!instituicaoSelecionadaId) {
      alert("Selecione a instituição para a qual você vai.");
      return;
    }

    const dataFormatada = format(dataSelecionada, "yyyy-MM-dd");

    try {
      setSalvandoPresenca(true);

      await salvarPresenca({
        usuarioId: usuario.uid,
        nomeAluno:
          usuarioBanco.nome ||
          usuario.displayName ||
          "Aluno",
        instituicaoId: instituicaoSelecionadaId,
        turno: selectedShift,
        tipoTransporte: selectedTransport,
        vai: true,
        retorna:
          selectedTransport === "volta" ||
          selectedTransport === "ida-volta",
        data: dataFormatada,
      });

      alert("Presença confirmada com sucesso.");
    } catch (error) {
      console.error("Erro ao confirmar presença:", error);
      alert("Não foi possível confirmar a presença.");
    } finally {
      setSalvandoPresenca(false);
    }
  };

  const handleCancelarPresenca = async () => {
    if (!dataSelecionada) {
      return;
    }

    const usuario = auth.currentUser;

    if (!usuario) {
      alert("Usuário não autenticado.");
      navigate("/");
      return;
    }

    const dataFormatada = format(dataSelecionada, "yyyy-MM-dd");

    try {
      setCancelandoPresenca(true);

      await cancelarPresenca(usuario.uid, dataFormatada);

      alert("Presença cancelada com sucesso.");
    } catch (error) {
      console.error("Erro ao cancelar presença:", error);
      alert("Não foi possível cancelar a presença.");
    } finally {
      setCancelandoPresenca(false);
    }
  };

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

  function obterNomeInstituicao(instituicaoId: string) {
    const instituicao = instituicoes.find(
      (item) => item.id === instituicaoId
    );

    return instituicao?.nome || instituicaoId;
  }

  const isFimDeSemana = dataSelecionada
    ? isWeekend(dataSelecionada)
    : false;

  const usuarioAtualId = auth.currentUser?.uid;

  const presencaUsuarioAtual = passageirosConfirmados.find(
    (presenca) => presenca.usuarioId === usuarioAtualId
  );

  const isConfirmado = Boolean(presencaUsuarioAtual);

  /*
   * Quando uma presença já existe, apresenta no formulário
   * os dados que foram salvos anteriormente.
   */
  useEffect(() => {
    if (!presencaUsuarioAtual) {
      return;
    }

    setInstituicaoSelecionadaId(
      presencaUsuarioAtual.instituicaoId
    );

    setSelectedTransport(
      presencaUsuarioAtual.tipoTransporte
    );
  }, [presencaUsuarioAtual]);

  if (acessoNegado) {
    return (
      <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-6 text-center">
        <XCircle className="w-24 h-24 text-red-600 mb-6 shadow-sm rounded-full bg-white" />
        <h1 className="text-3xl font-bold text-red-700 mb-2">Acesso Restrito</h1>
        <p className="text-red-700 mb-8 max-w-md">
          Esta página é exclusiva para o controle de presença dos alunos. Como motorista, você não tem permissão para acessar esta área.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-red-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-red-700 flex items-center gap-2 transition-colors shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
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

          <h1 className="text-white">Confirmar presença</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {carregandoUsuario ? (
          <div className="py-12 text-center text-gray-500">
            Carregando dados do aluno...
          </div>
        ) : (
          <>
            <div className="bg-white border-2 border-[#E5E5E5] rounded-2xl p-6 mb-8 shadow-sm">
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="nomeAluno"
                    className="block text-[#000000] mb-2"
                  >
                    Nome do aluno
                  </label>

                  <input
                    id="nomeAluno"
                    type="text"
                    value={
                      usuarioBanco?.nome ||
                      auth.currentUser?.displayName ||
                      ""
                    }
                    readOnly
                    className="w-full px-4 py-3 bg-[#E5E5E5] border-2 border-[#E5E5E5] rounded-lg text-[#000000]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="instituicao"
                    className="block text-[#000000] mb-3"
                  >
                    Para qual instituição você vai?
                  </label>

                  <div className="relative">
                    <School className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#14213D]" />

                    <select
                      id="instituicao"
                      value={instituicaoSelecionadaId}
                      onChange={(event) =>
                        setInstituicaoSelecionadaId(
                          event.target.value
                        )
                      }
                      disabled={
                        carregandoInstituicoes || isConfirmado
                      }
                      className="w-full pl-12 pr-4 py-3 border-2 border-[#E5E5E5] rounded-lg bg-white focus:border-[#FCA311] focus:outline-none disabled:bg-gray-100"
                    >
                      <option value="">
                        {carregandoInstituicoes
                          ? "Carregando instituições..."
                          : instituicoes.length === 0
                            ? "Nenhuma instituição disponível"
                            : "Selecione a instituição"}
                      </option>

                      {instituicoes.map((instituicao) => (
                        <option
                          key={instituicao.id}
                          value={instituicao.id}
                        >
                          {instituicao.nome}
                        </option>
                      ))}
                    </select>
                  </div>
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
                          onChange={(event) =>
                            setSelectedShift(
                              event.target.value
                            )
                          }
                          className="w-4 h-4 accent-[#FCA311]"
                        />

                        <span className="text-[#000000]">
                          {shift.label}
                        </span>
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
                      {
                        id: "ida",
                        label: "Somente ida",
                      },
                      {
                        id: "volta",
                        label: "Somente volta",
                      },
                      {
                        id: "ida-volta",
                        label: "Ida e volta",
                      },
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        disabled={isConfirmado}
                        onClick={() =>
                          setSelectedTransport(type.id)
                        }
                        className={`px-6 py-3 rounded-lg border-2 transition-colors ${
                          selectedTransport === type.id
                            ? "bg-[#14213D] text-white border-[#14213D]"
                            : "bg-white text-[#14213D] border-[#14213D] hover:bg-[#14213D] hover:text-white"
                        } ${
                          isConfirmado
                            ? "opacity-60 cursor-not-allowed"
                            : ""
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
                          date.getDay() === 0 ||
                          date.getDay() === 6
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
                                {format(
                                  dataSelecionada,
                                  "dd 'de' MMMM",
                                  { locale: ptBR }
                                )}
                              </strong>
                            )}
                          </p>
                        </div>
                      )}

                      {presencaUsuarioAtual && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                          <p className="text-green-800 font-medium">
                            Sua presença está confirmada.
                          </p>

                          <p className="text-sm text-green-700 mt-1">
                            Instituição:{" "}
                            {obterNomeInstituicao(
                              presencaUsuarioAtual.instituicaoId
                            )}
                          </p>

                          <p className="text-sm text-green-700">
                            Turno:{" "}
                            {formatarTurno(
                              presencaUsuarioAtual.turno
                            )}
                          </p>

                          <p className="text-sm text-green-700">
                            Transporte:{" "}
                            {formatarTipoTransporte(
                              presencaUsuarioAtual.tipoTransporte
                            )}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-3">
                        <button
                          type="button"
                          onClick={handleConfirmarPresenca}
                          disabled={
                            isFimDeSemana ||
                            isConfirmado ||
                            salvandoPresenca ||
                            carregandoInstituicoes
                          }
                          className={`flex items-center justify-center gap-2 py-4 rounded-lg transition-colors font-bold shadow-md ${
                            isConfirmado
                              ? "bg-green-600 text-white"
                              : isFimDeSemana ||
                                  salvandoPresenca ||
                                  carregandoInstituicoes
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-[#FCA311] text-white hover:bg-[#E39310]"
                          }`}
                        >
                          <CheckCircle className="w-5 h-5" />

                          {salvandoPresenca
                            ? "CONFIRMANDO..."
                            : isConfirmado
                              ? "PRESENÇA CONFIRMADA"
                              : "VOU NESSE DIA"}
                        </button>

                        <button
                          type="button"
                          onClick={handleCancelarPresenca}
                          disabled={
                            isFimDeSemana ||
                            !isConfirmado ||
                            cancelandoPresenca
                          }
                          className={`flex items-center justify-center gap-2 py-3 rounded-lg transition-colors font-medium ${
                            !isConfirmado ||
                            isFimDeSemana ||
                            cancelandoPresenca
                              ? "bg-[#E5E5E5] text-[#A0A0A0] cursor-not-allowed"
                              : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                          }`}
                        >
                          <XCircle className="w-5 h-5" />

                          {cancelandoPresenca
                            ? "CANCELANDO..."
                            : "CANCELAR PRESENÇA"}
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
                {passageirosConfirmados.length === 0 ? (
                  <p className="text-gray-500 text-center py-6">
                    Nenhum passageiro confirmado para esta data e
                    turno.
                  </p>
                ) : (
                  passageirosConfirmados.map((passageiro) => (
                    <div
                      key={passageiro.id}
                      className="flex items-center justify-between p-4 border-2 border-[#E5E5E5] rounded-lg hover:border-[#FCA311] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#FCA311] rounded-full flex items-center justify-center">
                          <Bus className="w-5 h-5 text-white" />
                        </div>

                        <div>
                          <p className="text-[#000000] font-medium">
                            {passageiro.nomeAluno}
                          </p>

                          <p className="text-sm text-gray-600">
                            {formatarTurno(passageiro.turno)} •{" "}
                            {formatarTipoTransporte(
                              passageiro.tipoTransporte
                            )}
                          </p>

                          <p className="text-xs text-gray-500">
                            Instituição:{" "}
                            {obterNomeInstituicao(
                              passageiro.instituicaoId
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
          </>
        )}
      </main>
    </div>
  );
}
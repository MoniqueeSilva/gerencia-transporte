import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Bus, Mail, Lock, User, School } from "lucide-react";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth } from "../../firebase/auth";
import { db } from "../../firebase/firestore";

import {
  listarInstituicoes,
} from "../../services/instituicaoService";

import type {
  Instituicao,
} from "../../repositories/instituicaoRepository";

export default function Login() {
  const navigate = useNavigate();

  const [isCadastro, setIsCadastro] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [instituicaoId, setInstituicaoId] = useState("");

  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [carregandoInstituicoes, setCarregandoInstituicoes] = useState(false);

  useEffect(() => {
    async function carregarInstituicoes() {
      try {
        setCarregandoInstituicoes(true);
        setErro("");

        const dados = await listarInstituicoes();

        console.log("Instituições carregadas:", dados);

        setInstituicoes(dados);
      } catch (error: any) {
        console.error("Erro ao carregar instituições:", error);
        setErro(error.message || "Erro ao carregar instituições.");
      } finally {
        setCarregandoInstituicoes(false);
      }
    }

    carregarInstituicoes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErro("");
    setSucesso("");
    setCarregando(true);

    try {
      if (isCadastro) {
        if (!nome.trim()) {
          throw new Error("Informe seu nome");
        }

        if (!instituicaoId) {
          throw new Error("Selecione sua instituição");
        }

        if (password.length < 6) {
          throw new Error("A senha deve ter pelo menos 6 caracteres");
        }

        const credencial = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        await updateProfile(credencial.user, {
          displayName: nome,
        });

        await setDoc(doc(db, "usuarios", credencial.user.uid), {
          uid: credencial.user.uid,
          nome,
          email,
          role: "student",
          instituicaoId,
          matricula: "",
          telefone: "",
          rotaId: "",
          paradaOrdem: 0,
          turno: "",
          ativo: true,
          criadoEm: serverTimestamp(),
        });

        setSucesso("Cadastro realizado com sucesso! Faça login para entrar");
        setIsCadastro(false);
        setPassword("");
        setNome("");
        setInstituicaoId("");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        navigate("/aluno");
      }
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setErro("Este e-mail já está cadastrado.");
      } else if (err.code === "auth/invalid-credential") {
        setErro("E-mail ou senha incorretos.");
      } else if (err.code === "auth/invalid-email") {
        setErro("E-mail inválido.");
      } else if (err.code === "auth/weak-password") {
        setErro("A senha deve ter pelo menos 6 caracteres.");
      } else if (err.code === "permission-denied") {
        setErro("Sem permissão para salvar no Firestore.");
      } else {
        setErro(err.message || "Erro ao processar solicitação.");
      }
    } finally {
      setCarregando(false);
    }
  };

  const alternarModo = () => {
    setIsCadastro(!isCadastro);
    setErro("");
    setSucesso("");
    setEmail("");
    setPassword("");
    setNome("");
    setInstituicaoId("");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-[#FCA311] rounded-full flex items-center justify-center mb-6 shadow-lg">
            <Bus className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-[#14213D] text-center mb-2 text-2xl font-bold">
            Transporte Escolar
          </h1>

          <p className="text-[#000000] text-center">
            Gestão de Presença e Localização
          </p>
        </div>

        <h2 className="text-xl text-center text-[#14213D] font-semibold mb-6">
          {isCadastro ? "Criar Nova Conta" : "Faça o seu Login"}
        </h2>

        {sucesso && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 text-sm text-center rounded-lg border border-green-200">
            {sucesso}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {isCadastro && (
            <>
              <div>
                <label
                  htmlFor="nome"
                  className="block text-[#000000] mb-2 text-sm font-medium"
                >
                  Nome
                </label>

                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#14213D]" />

                  <input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-[#E5E5E5] rounded-lg focus:border-[#FCA311] focus:outline-none transition-colors"
                    placeholder="Digite o seu nome"
                    required={isCadastro}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="instituicao"
                  className="block text-[#000000] mb-2 text-sm font-medium"
                >
                  Instituição
                </label>

                <div className="relative">
                  <School className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#14213D]" />

                <select
                  id="instituicao"
                  value={instituicaoId}
                  onChange={(e) => setInstituicaoId(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-[#E5E5E5] rounded-lg focus:border-[#FCA311] focus:outline-none transition-colors bg-white"
                  required={isCadastro}
                  disabled={carregandoInstituicoes}
                >
                  <option value="">
                    {carregandoInstituicoes
                      ? "Carregando instituições..."
                      : instituicoes.length === 0
                      ? "Nenhuma instituição encontrada"
                      : "Selecione sua instituição"}
                  </option>

                  {instituicoes.map((instituicao) => (
                    <option key={instituicao.id} value={instituicao.id}>
                      {instituicao.nome}
                    </option>
                  ))}
                </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-[#000000] mb-2 text-sm font-medium"
            >
              E-mail
            </label>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#14213D]" />

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-[#E5E5E5] rounded-lg focus:border-[#FCA311] focus:outline-none transition-colors"
                placeholder="Digite o seu e-mail"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-[#000000] mb-2 text-sm font-medium"
            >
              Senha
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#14213D]" />

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-[#E5E5E5] rounded-lg focus:border-[#FCA311] focus:outline-none transition-colors"
                placeholder="Digite a sua senha"
                required
              />
            </div>
          </div>

          {erro && (
            <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className={`w-full text-white font-semibold py-3.5 rounded-lg transition-colors shadow-md ${
              carregando
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#FCA311] hover:bg-[#E39310]"
            }`}
          >
            {carregando
              ? "Processando..."
              : isCadastro
              ? "Registrar Conta"
              : "Entrar"}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            onClick={alternarModo}
            type="button"
            className="text-[#14213D] hover:underline font-medium focus:outline-none"
          >
            {isCadastro
              ? "Já tem uma conta? Faça Login"
              : "Não tem conta? Cadastrar-se"}
          </button>

          {!isCadastro && (
            <a href="#" className="text-[#14213D] text-sm hover:underline">
              Esqueci a senha
            </a>
          )}
        </div>

        <footer className="mt-12 text-center text-[#000000]">
          <p className="text-xs">
            © 2026 Transporte Escolar - Todos os direitos reservados
          </p>
        </footer>
      </div>
    </div>
  );
}
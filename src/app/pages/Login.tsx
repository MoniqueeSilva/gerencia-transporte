import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Bus,
  Mail,
  Lock,
  User,
  UserCog,
  Clock,
} from "lucide-react";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  deleteUser,
} from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth } from "../../firebase/auth";
import { db } from "../../firebase/firestore";

import { findUserById } from "../../services/userService";

type TipoUsuario = "student" | "driver";
type Turno = "manha" | "tarde" | "noite";

export default function Login() {
  const navigate = useNavigate();

  const [isCadastro, setIsCadastro] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] = useState<TipoUsuario>("student");
  const [turnoMotorista, setTurnoMotorista] =
    useState<Turno>("manha");

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  const limparFormulario = () => {
    setNome("");
    setEmail("");
    setPassword("");
    setRole("student");
    setTurnoMotorista("manha");
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErro("");
    setSucesso("");
    setCarregando(true);

    try {
      const nomeNormalizado = nome.trim();
      const emailNormalizado = email.trim().toLowerCase();

      if (isCadastro) {
        if (!nomeNormalizado) {
          throw new Error("Informe seu nome.");
        }

        if (!emailNormalizado) {
          throw new Error("Informe seu e-mail.");
        }

        if (role === "driver" && !turnoMotorista) {
          throw new Error("Selecione o turno do motorista.");
        }

        if (password.length < 6) {
          throw new Error(
            "A senha deve ter pelo menos 6 caracteres."
          );
        }

        const credencial =
          await createUserWithEmailAndPassword(
            auth,
            emailNormalizado,
            password
          );

        try {
          await updateProfile(credencial.user, {
            displayName: nomeNormalizado,
          });

          await setDoc(
            doc(db, "usuarios", credencial.user.uid),
            {
              uid: credencial.user.uid,
              nome: nomeNormalizado,
              email: emailNormalizado,
              role,

              // O turno é fixo somente para o motorista.
              turno:
                role === "driver" ? turnoMotorista : "",

              matricula: "",
              telefone: "",
              ativo: true,
              criadoEm: serverTimestamp(),
            }
          );
        } catch (error) {
          /*
           * Remove o usuário do Authentication caso o documento
           * não consiga ser salvo no Firestore.
           */
          try {
            await deleteUser(credencial.user);
          } catch (deleteError) {
            console.error(
              "Erro ao remover usuário incompleto:",
              deleteError
            );
          }

          throw error;
        }

        setSucesso(
          role === "driver"
            ? "Motorista cadastrado com sucesso! Faça login para entrar."
            : "Aluno cadastrado com sucesso! Faça login para entrar."
        );

        setIsCadastro(false);
        limparFormulario();
        return;
      }

      const credencial =
        await signInWithEmailAndPassword(
          auth,
          emailNormalizado,
          password
        );

      const dadosUsuario = await findUserById(
        credencial.user.uid
      );

      if (!dadosUsuario) {
        throw new Error(
          "Os dados deste usuário não foram encontrados no Firestore."
        );
      }

      if (dadosUsuario.ativo === false) {
        throw new Error("Este usuário está desativado.");
      }

      if (dadosUsuario.role === "driver") {
        navigate("/motorista");
        return;
      }

      if (dadosUsuario.role === "student") {
        navigate("/aluno");
        return;
      }

      throw new Error("O perfil deste usuário não é válido.");
    } catch (err: unknown) {
      console.error("Erro de autenticação:", err);

      const erroFirebase = err as {
        code?: string;
        message?: string;
      };

      if (erroFirebase.code === "auth/email-already-in-use") {
        setErro("Este e-mail já está cadastrado.");
      } else if (
        erroFirebase.code === "auth/invalid-credential" ||
        erroFirebase.code === "auth/wrong-password" ||
        erroFirebase.code === "auth/user-not-found"
      ) {
        setErro("E-mail ou senha incorretos.");
      } else if (
        erroFirebase.code === "auth/invalid-email"
      ) {
        setErro("Informe um e-mail válido.");
      } else if (
        erroFirebase.code === "auth/weak-password"
      ) {
        setErro(
          "A senha deve ter pelo menos 6 caracteres."
        );
      } else if (
        erroFirebase.code === "permission-denied" ||
        erroFirebase.code ===
          "firestore/permission-denied"
      ) {
        setErro(
          "Sem permissão para acessar o Firestore."
        );
      } else {
        setErro(
          erroFirebase.message ||
            "Não foi possível processar a solicitação."
        );
      }
    } finally {
      setCarregando(false);
    }
  };

  const alternarModo = () => {
    setIsCadastro((estadoAtual) => !estadoAtual);
    setErro("");
    setSucesso("");
    limparFormulario();
  };

  const alterarTipoUsuario = (
    novoTipo: TipoUsuario
  ) => {
    setRole(novoTipo);
    setErro("");

    if (novoTipo === "student") {
      setTurnoMotorista("manha");
    }
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
          {isCadastro
            ? "Criar Nova Conta"
            : "Faça o seu Login"}
        </h2>

        {sucesso && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 text-sm text-center rounded-lg border border-green-200">
            {sucesso}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
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
                    onChange={(event) =>
                      setNome(event.target.value)
                    }
                    className="w-full pl-12 pr-4 py-3 border border-[#E5E5E5] rounded-lg focus:border-[#FCA311] focus:outline-none"
                    placeholder="Digite o seu nome"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="tipoUsuario"
                  className="block text-[#000000] mb-2 text-sm font-medium"
                >
                  Tipo de usuário
                </label>

                <div className="relative">
                  <UserCog className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#14213D]" />

                  <select
                    id="tipoUsuario"
                    value={role}
                    onChange={(event) =>
                      alterarTipoUsuario(
                        event.target.value as TipoUsuario
                      )
                    }
                    className="w-full pl-12 pr-4 py-3 border border-[#E5E5E5] rounded-lg bg-white focus:border-[#FCA311] focus:outline-none"
                  >
                    <option value="student">
                      Aluno
                    </option>
                    <option value="driver">
                      Motorista
                    </option>
                  </select>
                </div>
              </div>

              {role === "driver" && (
                <div>
                  <label
                    htmlFor="turnoMotorista"
                    className="block text-[#000000] mb-2 text-sm font-medium"
                  >
                    Turno do motorista
                  </label>

                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#14213D]" />

                    <select
                      id="turnoMotorista"
                      value={turnoMotorista}
                      onChange={(event) =>
                        setTurnoMotorista(
                          event.target.value as Turno
                        )
                      }
                      className="w-full pl-12 pr-4 py-3 border border-[#E5E5E5] rounded-lg bg-white focus:border-[#FCA311] focus:outline-none"
                      required
                    >
                      <option value="manha">
                        Manhã
                      </option>
                      <option value="tarde">
                        Tarde
                      </option>
                      <option value="noite">
                        Noite
                      </option>
                    </select>
                  </div>
                </div>
              )}
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
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                className="w-full pl-12 pr-4 py-3 border border-[#E5E5E5] rounded-lg focus:border-[#FCA311] focus:outline-none"
                placeholder="Digite o seu e-mail"
                autoComplete="email"
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
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                className="w-full pl-12 pr-4 py-3 border border-[#E5E5E5] rounded-lg focus:border-[#FCA311] focus:outline-none"
                placeholder="Digite a sua senha"
                autoComplete={
                  isCadastro
                    ? "new-password"
                    : "current-password"
                }
                required
              />
            </div>
          </div>

          {erro && (
            <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-3 rounded-lg border border-red-100">
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
                ? role === "driver"
                  ? "Registrar Motorista"
                  : "Registrar Aluno"
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
            <button
              type="button"
              className="text-[#14213D] text-sm hover:underline"
            >
              Esqueci a senha
            </button>
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
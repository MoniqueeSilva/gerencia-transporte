import { useState } from "react";
import { useNavigate } from "react-router";
import { Bus, Mail, Lock, User } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  
  // Alterna entre a visualização de Login e Cadastro
  const [isCadastro, setIsCadastro] = useState(false);
  
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(""); 
    setSucesso("");
    setCarregando(true); 

    try {
      // Simula o tempo de resposta do servidor (1.5 segundos)
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (isCadastro) {
        // LÓGICA DE CADASTRO (Guardar no localStorage)
        if (password.length < 3) {
          throw new Error("A senha deve ter pelo menos 3 caracteres.");
        }

        const novoUsuario = { 
          nome: nome, 
          email: email, 
          password: password,
          tipoUsuario: "ALUNO" // Definimos como aluno por defeito para o teste
        };

        localStorage.setItem('usuarioTeste', JSON.stringify(novoUsuario));
        
        setSucesso("Cadastro realizado com sucesso! Faça login para entrar.");
        setIsCadastro(false); // Volta automaticamente para o ecrã de login
        setPassword(""); // Limpa a senha por segurança

      } else {
        // LÓGICA DE LOGIN (Ler do localStorage)
        const usuarioSalvoString = localStorage.getItem('usuarioTeste');
        const usuarioSalvo = usuarioSalvoString ? JSON.parse(usuarioSalvoString) : null;

        // Verifica se é o utilizador que acabou de se cadastrar OU o nosso teste fixo
        const isLoginValido = 
          (usuarioSalvo && email === usuarioSalvo.email && password === usuarioSalvo.password) ||
          (email === "aluno@teste.com" && password === "123");

        if (isLoginValido) {
          localStorage.setItem('meuToken', 'abc-123-token-simulado');
          navigate("/aluno"); 
        } else {
          throw new Error('E-mail ou senha incorretos!');
        }
      }
    } catch (err: any) {
      setErro(err.message); 
    } finally {
      setCarregando(false); 
    }
  };

  // Função para limpar os formulários ao alternar as abas
  const alternarModo = () => {
    setIsCadastro(!isCadastro);
    setErro("");
    setSucesso("");
    setEmail("");
    setPassword("");
    setNome("");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
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

        {/* Título do Formulário */}
        <h2 className="text-xl text-center text-[#14213D] font-semibold mb-6">
          {isCadastro ? "Criar Nova Conta" : "Faça o seu Login"}
        </h2>

        {/* Mensagem de Sucesso (após o cadastro) */}
        {sucesso && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 text-sm text-center rounded-lg border border-green-200">
            {sucesso}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Campo Nome (Aparece apenas se for Cadastro) */}
          {isCadastro && (
            <div>
              <label htmlFor="nome" className="block text-[#000000] mb-2 text-sm font-medium">
                Nome Completo
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
          )}

          <div>
            <label htmlFor="email" className="block text-[#000000] mb-2 text-sm font-medium">
              E-mail ou Matrícula
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#14213D]" />
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-[#E5E5E5] rounded-lg focus:border-[#FCA311] focus:outline-none transition-colors"
                placeholder="Digite o seu e-mail"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-[#000000] mb-2 text-sm font-medium">
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

          {/* Mensagem de Erro */}
          {erro && (
            <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className={`w-full text-white font-semibold py-3.5 rounded-lg transition-colors shadow-md ${
              carregando ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#FCA311] hover:bg-[#E39310]'
            }`}
          >
            {carregando 
              ? 'A processar...' 
              : isCadastro ? 'Registar Conta' : 'Entrar'
            }
          </button>
        </form>

        {/* Links para alternar */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <button 
            onClick={alternarModo}
            type="button" 
            className="text-[#14213D] hover:underline font-medium focus:outline-none"
          >
            {isCadastro 
              ? 'Já tem uma conta? Faça Login' 
              : 'Não tem conta? Cadastrar-se'
            }
          </button>
          
          {!isCadastro && (
            <a href="#" className="text-[#14213D] text-sm hover:underline">
              Esqueci a senha
            </a>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-[#000000]">
          <p className="text-xs">© 2026 Transporte Escolar - Todos os direitos reservados</p>
        </footer>
      </div>
    </div>
  );
}
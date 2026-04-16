import { useState } from "react";
import { useNavigate } from "react-router";
import { Bus, Mail, Lock } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - redirect to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-24 h-24 bg-[#FCA311] rounded-full flex items-center justify-center mb-6 shadow-lg">
            <Bus className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-[#14213D] text-center mb-2">
            Transporte Escolar
          </h1>
          <p className="text-[#000000] text-center">
            Gestão de Presença e Localização
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-[#000000] mb-2">
              E-mail ou Matrícula
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#14213D]" />
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-[#E5E5E5] rounded-lg focus:border-[#FCA311] focus:outline-none transition-colors"
                placeholder="Digite seu e-mail"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-[#000000] mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#14213D]" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-[#E5E5E5] rounded-lg focus:border-[#FCA311] focus:outline-none transition-colors"
                placeholder="Digite sua senha"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#FCA311] text-white py-4 rounded-lg hover:bg-[#E39310] transition-colors shadow-md"
          >
            Entrar
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <a href="#" className="text-[#14213D] hover:underline">
            Cadastrar-se
          </a>
          <a href="#" className="text-[#14213D] hover:underline">
            Esqueci a senha
          </a>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-[#000000]">
          <p className="text-sm">© 2026 Transporte Escolar - Todos os direitos reservados</p>
        </footer>
      </div>
    </div>
  );
}

import { useNavigate } from "react-router";
import { LogOut, User, Truck, CheckCircle, Users, MapPin } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#14213D] text-white px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-white">Transporte Escolar</h1>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white hover:text-[#FCA311] transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Greeting */}
        <div className="mb-8">
          <h2 className="text-[#000000] mb-2">Olá, João Silva</h2>
          <p className="text-[#000000]">Bem-vindo ao sistema de transporte escolar</p>
        </div>

        {/* Main Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Student Panel Card */}
          <button
            onClick={() => navigate("/aluno")}
            className="bg-white border-2 border-[#E5E5E5] rounded-2xl p-8 text-left hover:border-[#FCA311] hover:shadow-lg transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-[#FCA311] rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-[#14213D] mb-2">Painel do Aluno</h3>
                <p className="text-[#000000]">
                  Confirme sua presença e visualize informações sobre o transporte
                </p>
              </div>
            </div>
          </button>

          {/* Driver Panel Card */}
          <button
            onClick={() => navigate("/motorista")}
            className="bg-white border-2 border-[#E5E5E5] rounded-2xl p-8 text-left hover:border-[#FCA311] hover:shadow-lg transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-[#FCA311] rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-[#14213D] mb-2">Painel do Motorista</h3>
                <p className="text-[#000000]">
                  Gerencie passageiros e compartilhe sua localização
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-[#14213D] mb-4">Atalhos Rápidos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/aluno")}
              className="bg-white border-2 border-[#E5E5E5] rounded-2xl p-6 hover:border-[#FCA311] hover:shadow-md transition-all flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 bg-[#FCA311] rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-[#14213D]">Confirmar presença</span>
            </button>

            <button
              onClick={() => navigate("/motorista")}
              className="bg-white border-2 border-[#E5E5E5] rounded-2xl p-6 hover:border-[#FCA311] hover:shadow-md transition-all flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 bg-[#FCA311] rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-[#14213D]">Lista de passageiros</span>
            </button>

            <button
              onClick={() => navigate("/localizacao")}
              className="bg-white border-2 border-[#E5E5E5] rounded-2xl p-6 hover:border-[#FCA311] hover:shadow-md transition-all flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 bg-[#FCA311] rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <span className="text-[#14213D]">Localização do ônibus</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

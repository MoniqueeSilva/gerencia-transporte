import { useNavigate } from "react-router";
import { ArrowLeft, Bus, MapPin, Navigation } from "lucide-react";

export default function LiveLocation() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-[#14213D] text-white px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-white hover:text-[#FCA311] transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white">Localização do Ônibus</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col">
        {/* Info Card */}
        <div className="bg-white border-2 border-[#E5E5E5] rounded-2xl p-4 mb-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#FCA311] rounded-full flex items-center justify-center animate-pulse">
              <Bus className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[#14213D]">Ônibus em movimento</p>
              <p className="text-sm text-[#000000]">
                Última atualização: agora há pouco
              </p>
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 bg-[#E5E5E5] rounded-2xl border-2 border-[#E5E5E5] relative overflow-hidden min-h-[400px] shadow-inner">
          {/* Map Grid Background */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <defs>
                <pattern
                  id="grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="#14213D"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Route Line (Dashed) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
          >
            <path
              d="M 100 100 Q 200 150, 300 200 T 500 300 T 700 400"
              fill="none"
              stroke="#14213D"
              strokeWidth="3"
              strokeDasharray="10,10"
              opacity="0.5"
            />
          </svg>

          {/* Bus Marker */}
          <div
            className="absolute bg-[#FCA311] rounded-full p-4 shadow-lg animate-pulse"
            style={{
              top: "45%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 2,
            }}
          >
            <Bus className="w-8 h-8 text-white" />
          </div>

          {/* Location Pins */}
          <div
            className="absolute"
            style={{ top: "20%", left: "20%", zIndex: 2 }}
          >
            <MapPin className="w-6 h-6 text-[#14213D]" />
          </div>
          <div
            className="absolute"
            style={{ top: "70%", left: "75%", zIndex: 2 }}
          >
            <MapPin className="w-6 h-6 text-[#14213D]" />
          </div>

          {/* Map Label */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-[#E5E5E5] z-10">
            <p className="text-sm text-[#14213D]">Rota: Escola ↔ Bairro Central</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <button className="flex items-center justify-center gap-3 bg-[#FCA311] text-white py-4 px-6 rounded-lg hover:bg-[#E39310] transition-colors shadow-md">
            <Navigation className="w-5 h-5" />
            Centralizar no ônibus
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center justify-center gap-3 bg-[#14213D] text-white py-4 px-6 rounded-lg hover:bg-[#0F1829] transition-colors shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar ao painel
          </button>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-sm text-[#000000]">
            Localização atualizada em tempo real via GPS
          </p>
        </footer>
      </main>
    </div>
  );
}

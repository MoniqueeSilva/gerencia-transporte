import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, CheckCircle, XCircle, Bus, MapPin } from "lucide-react";

export default function StudentPanel() {
  const navigate = useNavigate();
  const [selectedShift, setSelectedShift] = useState("manha");
  const [selectedTransport, setSelectedTransport] = useState("ida-volta");

  const confirmedPassengers = [
    { id: 1, name: "Maria Santos", shift: "Manhã", type: "Ida e volta" },
    { id: 2, name: "Pedro Costa", shift: "Manhã", type: "Somente ida" },
    { id: 3, name: "Ana Lima", shift: "Manhã", type: "Ida e volta" },
    { id: 4, name: "Carlos Souza", shift: "Manhã", type: "Somente volta" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Confirmation Form */}
        <div className="bg-white border-2 border-[#E5E5E5] rounded-2xl p-6 mb-8 shadow-sm">
          <div className="space-y-6">
            {/* Student Name */}
            <div>
              <label className="block text-[#000000] mb-2">Nome do aluno</label>
              <input
                type="text"
                value="João Silva"
                readOnly
                className="w-full px-4 py-3 bg-[#E5E5E5] border-2 border-[#E5E5E5] rounded-lg text-[#000000]"
              />
            </div>

            {/* Shift Selection */}
            <div>
              <label className="block text-[#000000] mb-3">Selecione o turno</label>
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

            {/* Transport Type Selection */}
            <div>
              <label className="block text-[#000000] mb-3">Tipo de transporte</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { id: "ida", label: "Somente ida" },
                  { id: "volta", label: "Somente volta" },
                  { id: "ida-volta", label: "Ida e volta" },
                ].map((type) => (
                  <button
                    key={type.id}
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

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <button className="flex items-center justify-center gap-2 bg-[#FCA311] text-white py-4 rounded-lg hover:bg-[#E39310] transition-colors shadow-md">
                <CheckCircle className="w-5 h-5" />
                VOU
              </button>
              <button className="flex items-center justify-center gap-2 bg-[#E5E5E5] text-[#000000] py-4 rounded-lg hover:bg-[#D0D0D0] transition-colors">
                <XCircle className="w-5 h-5" />
                NÃO VOU
              </button>
            </div>
          </div>
        </div>

        {/* Confirmed Passengers List */}
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
                    <p className="text-[#000000]">{passenger.name}</p>
                    <p className="text-sm text-[#000000]">
                      {passenger.shift} • {passenger.type}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Action Button */}
        <button
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

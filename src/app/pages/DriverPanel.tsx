import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Radio, Users, MapPin } from "lucide-react";

export default function DriverPanel() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("todos");
  const [isSharing, setIsSharing] = useState(false);

  const students = [
    { id: 1, name: "Maria Santos", shift: "Manhã", type: "Ida e volta", status: "Confirmado" },
    { id: 2, name: "Pedro Costa", shift: "Manhã", type: "Somente ida", status: "Confirmado" },
    { id: 3, name: "Ana Lima", shift: "Manhã", type: "Ida e volta", status: "Confirmado" },
    { id: 4, name: "Carlos Souza", shift: "Manhã", type: "Somente volta", status: "Pendente" },
    { id: 5, name: "Julia Oliveira", shift: "Tarde", type: "Ida e volta", status: "Confirmado" },
    { id: 6, name: "Lucas Ferreira", shift: "Tarde", type: "Somente ida", status: "Confirmado" },
  ];

  const filteredStudents =
    activeFilter === "todos"
      ? students
      : students.filter(
          (s) => s.shift.toLowerCase() === activeFilter.toLowerCase()
        );

  const confirmedCount = students.filter((s) => s.status === "Confirmado").length;

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
          <h1 className="text-white">Gerenciar transporte</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { id: "manha", label: "Manhã" },
            { id: "tarde", label: "Tarde" },
            { id: "noite", label: "Noite" },
            { id: "todos", label: "Todos" },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeFilter === filter.id
                  ? "bg-[#E5E5E5] text-[#14213D] border-2 border-[#FCA311]"
                  : "bg-[#E5E5E5] text-[#14213D] border-2 border-[#E5E5E5] hover:border-[#FCA311]"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Passenger Counter */}
        <div className="bg-white border-2 border-[#E5E5E5] rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Users className="w-8 h-8 text-[#FCA311]" />
            <div>
              <p className="text-[#000000]">Total de passageiros confirmados</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="inline-flex items-center justify-center w-10 h-10 bg-[#FCA311] text-white rounded-full">
                  {confirmedCount}
                </span>
                <span className="text-[#000000]">de {students.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white border-2 border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#14213D] text-white">
                <tr>
                  <th className="px-6 py-4 text-left">Nome</th>
                  <th className="px-6 py-4 text-left">Turno</th>
                  <th className="px-6 py-4 text-left">Tipo</th>
                  <th className="px-6 py-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr
                    key={student.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-[#E5E5E5]/30"}
                  >
                    <td className="px-6 py-4 text-[#000000]">{student.name}</td>
                    <td className="px-6 py-4 text-[#000000]">{student.shift}</td>
                    <td className="px-6 py-4 text-[#000000]">{student.type}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm ${
                          student.status === "Confirmado"
                            ? "bg-[#FCA311] text-white"
                            : "bg-[#E5E5E5] text-[#000000]"
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Location Sharing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Share Location Button */}
          <button
            onClick={() => setIsSharing(!isSharing)}
            className={`flex items-center justify-center gap-3 py-6 px-8 rounded-2xl transition-colors shadow-md ${
              isSharing
                ? "bg-[#14213D] text-white"
                : "bg-[#FCA311] text-white hover:bg-[#E39310]"
            }`}
          >
            <Radio className="w-6 h-6" />
            <span>
              {isSharing
                ? "Compartilhamento ativo"
                : "Iniciar compartilhamento de localização"}
            </span>
          </button>

          {/* Map Placeholder */}
          <div className="bg-[#E5E5E5] rounded-2xl h-64 flex flex-col items-center justify-center gap-3 border-2 border-[#E5E5E5]">
            <MapPin className="w-12 h-12 text-[#14213D]" />
            <p className="text-[#14213D]">Mapa do trajeto</p>
            <button
              onClick={() => navigate("/localizacao")}
              className="mt-2 px-6 py-2 bg-[#FCA311] text-white rounded-lg hover:bg-[#E39310] transition-colors"
            >
              Ver mapa completo
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

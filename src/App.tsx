import { confirmAttendance } from "./services/attendanceService";
import { getPassengersByDate } from "./services/driverService";

function App() {

  async function testarPresenca() {
    try {
      await confirmAttendance({
        studentId: "testeNovo",
        date: "2026-06-09",
        going: true,
        returning: false,
        createdAt: new Date()
      });

      alert("Presença registrada!");
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
      }
    }
  }

  async function testarMotorista() {
    try {

      const result =
        await getPassengersByDate(
          "UID_DO_MOTORISTA",
          "2026-06-09"
        );

      console.log(result);

      alert("Consulta realizada. Veja o console.");

    } catch (error) {

      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
      }

    }
  }

  return (
    <div>
      <h1>Testes Back-end</h1>

      <button onClick={testarPresenca}>
        Testar Presença
      </button>

      <br /><br />

      <button onClick={testarMotorista}>
        Testar Motorista
      </button>
    </div>
  );
}

export default App;
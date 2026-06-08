import { register } from "./services/authService";

function App() {

  async function testarCadastro() {
    try {

      const email =
        `teste${Date.now()}@ifpb.edu.br`;

      const result = await register(
        "Monique",
        email,
        "123456"
      );

      console.log(result);

      alert("Usuário criado!");

    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <button onClick={testarCadastro}>
        Testar Cadastro
      </button>
    </div>
  );
}

export default App;
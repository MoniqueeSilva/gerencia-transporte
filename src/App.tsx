import { login } from "./services/authService";

function App() {

  async function testLogin() {
    try {
      const result = await login(
        "teste@ifpb.edu.br",
        "123456"
      );

      console.log("Login realizado:", result.user);

      alert("Login realizado!");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <button onClick={testLogin}>
        Testar Login
      </button>
    </div>
  );
}

export default App;
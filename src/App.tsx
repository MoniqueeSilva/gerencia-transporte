import { useAuth }
from "./contexts/AuthContext";

function App() {

  const {
    user,
    loading,
    logout
  } = useAuth();

  if (loading) {
    return <h1>Carregando...</h1>;
  }

  return (
    <div>

      <h1>
        Gerência Transporte
      </h1>

      {user ? (
        <>
          <p>
            {user.email}
          </p>

          <button
            onClick={logout}
          >
            Sair
          </button>
        </>
      ) : (
        <p>
          Usuário não autenticado
        </p>
      )}

    </div>
  );
}

export default App;
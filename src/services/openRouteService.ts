import axios from "axios";

const api = axios.create({
  baseURL: "https://api.openrouteservice.org",
  headers: {
    Authorization: import.meta.env.VITE_ORS_API_KEY,
  },
});

export async function buscarRota(
  origem: [number, number],
  destino: [number, number]
) {
  const resposta = await api.get(
    "/v2/directions/driving-car",
    {
      params: {
        start: `${origem[1]},${origem[0]}`,
        end: `${destino[1]},${destino[0]}`,
      },
    }
  );

  return resposta.data.features[0].geometry.coordinates.map(
    ([longitude, latitude]: number[]) => [
      latitude,
      longitude,
    ]
  );
}
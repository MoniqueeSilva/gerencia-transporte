import iconeOnibus from "../../assets/onibus.png";
import iconeAluno from "../../assets/aluno.png";
import { buscarRota } from "../../services/openRouteService";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Bus,
  Navigation,
} from "lucide-react";

import { auth } from "../../firebase/auth";
import { findUserById } from "../../services/userService";
import {
  acompanharMotoristaPorTurno,
  type LocalizacaoMotorista,
} from "../../services/localizacaoService";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline
} from "react-leaflet";

import type { Map as LeafletMap } from "leaflet";

import "leaflet/dist/leaflet.css";

import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const iconeOnibusPersonalizado = L.icon({
  iconUrl: iconeOnibus,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

const iconeAlunoPersonalizado = L.icon({
  iconUrl: iconeAluno,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

type UsuarioBanco = {
  turno?: string;
};

export default function LiveLocation() {
  const navigate = useNavigate();

  const mapRef = useRef<LeafletMap | null>(null);

  const [localizacao, setLocalizacao] =
    useState<LocalizacaoMotorista | null>(null);
  
  const [localAluno, setLocalAluno] =
    useState<[
      latitude: number, 
      longitude: number
    ] | null>(null);

  const [rota, setRota] = useState<[number, number][]>([]);

  const [carregando, setCarregando] =
    useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (posicao) => {
      setLocalAluno([
        posicao.coords.latitude,
        posicao.coords.longitude,
      ]);
    },
    (erro) => {
      console.error(erro);
    },
    {
      enableHighAccuracy: true,
    }
  );
}

    async function carregar() {
      const usuario = auth.currentUser;

      if (!usuario) {
        navigate("/");
        return;
      }

      try {
        const dados = (await findUserById(
          usuario.uid
        )) as UsuarioBanco | null;

        if (!dados?.turno) {
          setCarregando(false);
          return;
        }

        unsubscribe = acompanharMotoristaPorTurno(
          dados.turno,
          (motorista) => {
            setLocalizacao(motorista);
            setCarregando(false);
          }
        );
      } catch (error) {
        console.error(error);
        setCarregando(false);
      }
    }

    carregar();

    return () => unsubscribe?.();
  }, [navigate]);

  useEffect(() => {
  async function carregarRota() {
    if (!localAluno || !localizacao) return;

    try {
      const rotaCalculada = await buscarRota(
        localAluno,
        [
          localizacao.latitude,
          localizacao.longitude,
        ]
      );

      setRota(rotaCalculada);
    } catch (erro) {
      console.error("Erro ao buscar rota:", erro);
    }
  }

  carregarRota();
}, [localAluno, localizacao]);

  function centralizarOnibus() {
  if (!mapRef.current) return;

  if (localAluno && localizacao) {
    mapRef.current.fitBounds([
      localAluno,
      [
        localizacao.latitude,
        localizacao.longitude,
      ],
    ]);
  } else if (localizacao) {
    mapRef.current.setView(
      [
        localizacao.latitude,
        localizacao.longitude,
      ],
      16,
      { animate: true }
    );
  }
}


  return (
    <div className="min-h-screen bg-white flex flex-col">

      <header className="bg-[#14213D] text-white px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center gap-4">

          <button
            onClick={() => navigate(-1)}
            className="text-white hover:text-[#FCA311]"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <h1>Localização do Ônibus</h1>

        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">

        <div className="bg-white border-2 border-[#E5E5E5] rounded-2xl p-5 mb-6 shadow-sm">

          {carregando ? (
            <p>Carregando localização...</p>
          ) : localizacao ? (
            <>
              <p className="font-semibold text-[#14213D]">
                Motorista compartilhando localização
              </p>

              <p className="text-sm text-gray-600">
                Turno: {localizacao.turno}
              </p>

              <p className="text-sm text-gray-600">
                Latitude: {localizacao.latitude.toFixed(5)}
              </p>

              <p className="text-sm text-gray-600">
                Longitude: {localizacao.longitude.toFixed(5)}
              </p>

              <p className="text-sm text-gray-600">
                Precisão: {Math.round(localizacao.precisao)} m
              </p>
            </>
          ) : (
            <>
              <p className="text-red-600 font-semibold">
                Nenhum motorista compartilhando localização.
              </p>

              <p className="text-sm">
                Aguarde o motorista iniciar o GPS.
              </p>
            </>
          )}

        </div>

        <div className="h-[520px] rounded-2xl overflow-hidden border-2 border-[#E5E5E5] shadow">

          <MapContainer
            center={[-7.1356, -34.8761]}
            zoom={14}
            scrollWheelZoom
            ref={mapRef}
            style={{
              width: "100%",
              height: "100%",
            }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap"
            />

            {localAluno && (
              <Marker 
                position={localAluno}
                icon={iconeAlunoPersonalizado}
              >
                <Popup>
                  Você está aqui.
                </Popup>
              </Marker>
            )}

            {localizacao && (
              <Marker
                position={[
                  localizacao.latitude,
                  localizacao.longitude,
                ]}
                icon={iconeOnibusPersonalizado}
              >
                <Popup>
                  <strong>Ônibus Escolar</strong>

                  <br />

                  Turno: {localizacao.turno}

                  <br />

                  Precisão:
                  {" "}
                  {Math.round(localizacao.precisao)}
                  m
                </Popup>
              </Marker>
            )}

            {rota.length > 0 && (
              <Polyline
                positions={rota}
                pathOptions={{
                  color: "#FCA311",
                  weight: 5,
                }}
              />
            )}
          </MapContainer>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">

          <button
            type="button"
            onClick={centralizarOnibus}
            className="flex items-center justify-center gap-3 bg-[#FCA311] text-white py-4 rounded-lg hover:bg-[#E39310] transition-colors shadow-md"
          >
            <Navigation className="w-5 h-5" />
            Centralizar no ônibus
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex items-center justify-center gap-3 bg-[#14213D] text-white py-4 rounded-lg hover:bg-[#0F1829] transition-colors shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>

        </div>

        <footer className="mt-8 text-center">

          <p className="text-sm text-gray-600">
            Atualização em tempo real via Firebase
          </p>

        </footer>

      </main>

    </div>
  );
}
import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StudentPanel from "./pages/StudentPanel";
import DriverPanel from "./pages/DriverPanel";
import LiveLocation from "./pages/LiveLocation";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
  {
    path: "/aluno",
    Component: StudentPanel,
  },
  {
    path: "/motorista",
    Component: DriverPanel,
  },
  {
    path: "/localizacao",
    Component: LiveLocation,
  },
]);

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Ponto de entrada principal da aplicação React
// Renderiza o componente raiz <App /> no elemento HTML com id 'root'
createRoot(document.getElementById("root")!).render(<App />);

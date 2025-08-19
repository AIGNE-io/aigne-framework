import ReactDOM from "react-dom/client";
import App from "./app.tsx";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("app") as HTMLElement);
root.render(<App />);

import ReactDOM from "react-dom/client";
import App from "./app.js";

// @ts-ignore
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("app") as HTMLElement);
root.render(<App />);

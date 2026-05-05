import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import App from "./App.tsx";
import { AdBlockGuard } from "./components/AdBlockGuard.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <AdBlockGuard />
    <Analytics />
  </>
);

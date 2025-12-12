import "./global.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function SimpleHome() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-4xl font-bold mb-4">LUXE Fashion E-commerce</h1>
      <p className="text-xl mb-8">Welcome to our store</p>
    </div>
  );
}

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<SimpleHome />} />
      <Route path="*" element={<SimpleHome />} />
    </Routes>
  </BrowserRouter>
);

// Render app
const root = document.getElementById("root");
if (root) {
  const { createRoot } = await import("react-dom/client");
  createRoot(root).render(<App />);
}

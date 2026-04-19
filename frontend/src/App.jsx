import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import RegisterProduct from "./pages/RegisterProduct";
import TransferProduct from "./pages/TransferProduct";
import ViewProducts from "./pages/ViewProducts";
import ProductHistory from "./pages/ProductHistory";
import AdminPanel from "./pages/AdminPanel";
import { Web3Provider } from "./context/Web3Context";
import "./index.css";

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <Home />;
      case "register":
        return <RegisterProduct />;
      case "transfer":
        return <TransferProduct />;
      case "products":
        return <ViewProducts />;
      case "history":
        return <ProductHistory />;
      case "admin":
        return <AdminPanel />;
      default:
        return <Home />;
    }
  };

  return (
    <Web3Provider>
      <div className="min-h-screen bg-gray-50">
        <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <main>{renderPage()}</main>
      </div>
    </Web3Provider>
  );
}

export default App;

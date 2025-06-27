import React from "react";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Siderbar";
import Main from "./components/layout/Main";

function App() {
  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <Main />
      </div>
    </div>
  );
}

export default App;

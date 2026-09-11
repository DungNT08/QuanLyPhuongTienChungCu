import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SidebarAdmin from "./layouts/sidebarAdmin";
import TrangChu from "./Admin/TrangChu";
import PhuongTien from "./Admin/PhuongTien"; // 👈 Import trang Phương tiện
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app">
        {/* Cột menu bên trái — luôn hiển thị */}
        <SidebarAdmin />

        {/* Nội dung bên phải — thay đổi theo menu */}
        <Routes>
          <Route path="/" element={<TrangChu />} />
          <Route path="/phuong-tien" element={<PhuongTien />} /> {/* 👈 Bấm vào đây sẽ hiện trang Phương tiện */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
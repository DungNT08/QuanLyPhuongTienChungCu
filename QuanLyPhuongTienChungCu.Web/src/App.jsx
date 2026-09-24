import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

// =====================================================
// LAYOUT & SIDEBAR
// =====================================================
import SidebarAdmin from "./layouts/sidebarAdmin";
import SidebarUser from "./layouts/sidebarUser";

// =====================================================
// TRANG ADMIN
// =====================================================
import TrangChuAdmin from "./Admin/TrangChu";
import PhuongTien from "./Admin/PhuongTien";
import XeKhach from "./Admin/XeKhach";
import CheckinOut from "./Admin/Checkin-out";
import LuotGui from "./Admin/LuotGui";
import PhiGuiXe from "./Admin/PhiGuiXe";
import BangGia from "./Admin/BangGia";
import LichSu from "./Admin/LichSu";
import BaoCao from "./Admin/BaoCao";
import QLyUser from "./Admin/QLyUser";
import Login from "./Login/Login";

// =====================================================
// TRANG USER - CƯ DÂN
// =====================================================
import TrangChuUser from "./User/TrangChu";
import PhuongTienU from "./User/PhuongTienU";
import LichGuiXeU from "./User/LichGuiXeU";
import HoaDon from "./User/HoaDon";
import ThongBao from "./User/ThongBao";
import HoSo from "./User/HoSo";

import "./App.css";

// =====================================================
// LAYOUT ADMIN
// =====================================================
function LayoutAdmin({ children }) {
  return (
    <div className="app">
      <SidebarAdmin />
      <div className="noi-dung-app">{children}</div>
    </div>
  );
}

// =====================================================
// LAYOUT USER
// =====================================================
function LayoutUser({ children }) {
  return (
    <div className="app">
      <SidebarUser />
      <div className="noi-dung-app">{children}</div>
    </div>
  );
}

// =====================================================
// APP
// =====================================================
function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />
        {/* =================================================
            USER - CƯ DÂN
        ================================================= */}

        <Route
          path="/"
          element={
            <LayoutUser>
              <TrangChuUser />
            </LayoutUser>
          }
        />

        <Route
          path="/phuong-tien-cua-toi"
          element={
            <LayoutUser>
              <PhuongTienU />
            </LayoutUser>
          }
        />

        <Route
          path="/lich-su-gui-xe"
          element={
            <LayoutUser>
              <LichGuiXeU />
            </LayoutUser>
          }
        />

        <Route
          path="/hoa-don"
          element={
            <LayoutUser>
              <HoaDon />
            </LayoutUser>
          }
        />

        <Route
          path="/thong-bao"
          element={
            <LayoutUser>
              <ThongBao />
            </LayoutUser>
          }
        />

        <Route
          path="/ho-so"
          element={
            <LayoutUser>
              <HoSo />
            </LayoutUser>
          }
        />

        {/* =================================================
            ADMIN
        ================================================= */}

        <Route
          path="/admin"
          element={
            <LayoutAdmin>
              <TrangChuAdmin />
            </LayoutAdmin>
          }
        />

        <Route
          path="/admin/phuong-tien"
          element={
            <LayoutAdmin>
              <PhuongTien />
            </LayoutAdmin>
          }
        />

        <Route
          path="/admin/xe-khach"
          element={
            <LayoutAdmin>
              <XeKhach />
            </LayoutAdmin>
          }
        />

        <Route
          path="/admin/check-in-out"
          element={
            <LayoutAdmin>
              <CheckinOut />
            </LayoutAdmin>
          }
        />

        <Route
          path="/admin/luot-gui-xe"
          element={
            <LayoutAdmin>
              <LuotGui />
            </LayoutAdmin>
          }
        />

        <Route
          path="/admin/phi-gui-xe"
          element={
            <LayoutAdmin>
              <PhiGuiXe />
            </LayoutAdmin>
          }
        />

        <Route
          path="/admin/bang-gia"
          element={
            <LayoutAdmin>
              <BangGia />
            </LayoutAdmin>
          }
        />

        <Route
          path="/admin/lich-su"
          element={
            <LayoutAdmin>
              <LichSu />
            </LayoutAdmin>
          }
        />

        <Route
          path="/admin/bao-cao"
          element={
            <LayoutAdmin>
              <BaoCao />
            </LayoutAdmin>
          }
        />

        {/* Quản lý người dùng — URL khớp sidebarAdmin.jsx */}
        <Route
          path="/admin/nguoi-dung"
          element={
            <LayoutAdmin>
              <QLyUser />
            </LayoutAdmin>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
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
import LuotGui from "./Admin/LuotGui";
import BangGia from "./Admin/BangGia";
import LichSu from "./Admin/LichSu";
import BaoCao from "./Admin/BaoCao";
import QLyUser from "./Admin/QLyUser";
import QLyCuDan from "./Admin/QLyCuDan";
import QLyCanHo from "./Admin/QLyCanHo";
import Login from "./Login/Login";
import HoSoAdmin from "./Admin/HoSoAdmin";

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

        {/* =================================================
            ĐĂNG NHẬP
        ================================================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />

        {/* =================================================
            USER - CƯ DÂN
        ================================================= */}

        {/* ➕ TRANG CHỦ CƯ DÂN */}
        <Route
          path="/trang-chu"
          element={
            <LayoutUser>
              <TrangChuUser />
            </LayoutUser>
          }
        />

        <Route
          path="/user/trang-chu"
          element={
            <LayoutUser>
              <TrangChuUser />
            </LayoutUser>
          }
        />

        <Route
          path="/admin/can-ho"
          element={
            <LayoutAdmin>
              <QLyCanHo />
            </LayoutAdmin>
          }
        />

        {/* PHƯƠNG TIỆN */}
        <Route
          path="/user/phuong-tien"
          element={
            <LayoutUser>
              <PhuongTienU />
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

        {/* LỊCH SỬ GỬI XE */}
        <Route
          path="/user/lich-su-gui-xe"
          element={
            <LayoutUser>
              <LichGuiXeU />
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

        {/* HÓA ĐƠN */}
        <Route
          path="/user/hoa-don"
          element={
            <LayoutUser>
              <HoaDon />
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

        {/* THÔNG BÁO */}
        <Route
          path="/user/thong-bao"
          element={
            <LayoutUser>
              <ThongBao />
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

        {/* HỒ SƠ CÁ NHÂN */}
        <Route
          path="/user/ho-so"
          element={
            <LayoutUser>
              <HoSo />
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
          path="/admin/luot-gui-xe"
          element={
            <LayoutAdmin>
              <LuotGui />
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

        <Route
          path="/admin/nguoi-dung"
          element={
            <LayoutAdmin>
              <QLyUser />
            </LayoutAdmin>
          }
        />

        <Route
          path="/admin/cu-dan"
          element={
            <LayoutAdmin>
              <QLyCuDan />
            </LayoutAdmin>
          }
        />

        {/* HỒ SƠ ADMIN */}
        <Route
          path="/admin/ho-so"
          element={
            <LayoutAdmin>
              <HoSoAdmin />
            </LayoutAdmin>
          }
        />

        {/* =================================================
            404 - Route không khớp
        ================================================= */}
        <Route
          path="*"
          element={
            <div style={{
              padding: 40,
              textAlign: "center",
              fontSize: 20,
              color: "#6b8fa3",
            }}>
              ⚠️ Trang không tồn tại (404)
            </div>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
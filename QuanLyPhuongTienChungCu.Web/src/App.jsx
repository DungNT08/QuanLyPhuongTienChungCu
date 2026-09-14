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

      <div className="noi-dung-app">
        {children}
      </div>
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

      <div className="noi-dung-app">
        {children}
      </div>
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
            USER - CƯ DÂN
        ================================================= */}

        {/* Trang chủ */}
        <Route
          path="/"
          element={
            <LayoutUser>
              <TrangChuUser />
            </LayoutUser>
          }
        />

        {/* Phương tiện của tôi */}
        <Route
          path="/phuong-tien-cua-toi"
          element={
            <LayoutUser>
              <PhuongTienU />
            </LayoutUser>
          }
        />

        {/* Lịch gửi xe */}
        <Route
          path="/lich-su-gui-xe"
          element={
            <LayoutUser>
              <LichGuiXeU />
            </LayoutUser>
          }
        />
         {/* Hóa đơn & thanh toán */}
        <Route
          path="/hoa-don"
          element={
            <LayoutUser>
              <HoaDon />
            </LayoutUser>
          }
        />

        {/* Thông báo */}
        <Route
          path="/thong-bao"
          element={
            <LayoutUser>
              <ThongBao />
            </LayoutUser>
          }
        />

        {/* Hồ sơ cá nhân */}
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

        {/* Trang chủ Admin */}
        <Route
          path="/admin"
          element={
            <LayoutAdmin>
              <TrangChuAdmin />
            </LayoutAdmin>
          }
        />

        {/* Phương tiện */}
        <Route
          path="/admin/phuong-tien"
          element={
            <LayoutAdmin>
              <PhuongTien />
            </LayoutAdmin>
          }
        />

        {/* Xe khách */}
        <Route
          path="/admin/xe-khach"
          element={
            <LayoutAdmin>
              <XeKhach />
            </LayoutAdmin>
          }
        />

        {/* Check-in / Check-out */}
        <Route
          path="/admin/check-in-out"
          element={
            <LayoutAdmin>
              <CheckinOut />
            </LayoutAdmin>
          }
        />

        {/* Lượt gửi xe */}
        <Route
          path="/admin/luot-gui-xe"
          element={
            <LayoutAdmin>
              <LuotGui />
            </LayoutAdmin>
          }
        />

        {/* Phí gửi xe */}
        <Route
          path="/admin/phi-gui-xe"
          element={
            <LayoutAdmin>
              <PhiGuiXe />
            </LayoutAdmin>
          }
        />

        {/* Bảng giá */}
        <Route
          path="/admin/bang-gia"
          element={
            <LayoutAdmin>
              <BangGia />
            </LayoutAdmin>
          }
        />

        {/* Lịch sử */}
        <Route
          path="/admin/lich-su"
          element={
            <LayoutAdmin>
              <LichSu />
            </LayoutAdmin>
          }
        />

        {/* Báo cáo */}
        <Route
          path="/admin/bao-cao"
          element={
            <LayoutAdmin>
              <BaoCao />
            </LayoutAdmin>
          }
        />

        {/* Quản lý người dùng */}
        <Route
          path="/admin/ql-user"
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
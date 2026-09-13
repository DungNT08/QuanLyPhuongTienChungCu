import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import SidebarAdmin from "./layouts/sidebarAdmin";

import TrangChu from "./Admin/TrangChu";
import PhuongTien from "./Admin/PhuongTien";
import XeKhach from "./Admin/XeKhach";
import CheckinOut from "./Admin/Checkin-out";
import LuotGui from "./Admin/LuotGui";
import PhiGuiXe from "./Admin/PhiGuiXe";

import "./App.css";

/* =========================
   LAYOUT ADMIN
========================= */

function LayoutAdmin({ children }) {
  return (
    <div className="app">

      {/* SIDEBAR LUÔN HIỂN THỊ */}
      <SidebarAdmin />

      {/* NỘI DUNG THAY ĐỔI THEO ROUTE */}
      <div className="noi-dung-app">
        {children}
      </div>

    </div>
  );
}


/* =========================
   APP
========================= */

function App() {
  return (
    <Router>
      <Routes>

        {/* =====================
            TRANG CHỦ
        ====================== */}
        <Route
          path="/"
          element={
            <LayoutAdmin>
              <TrangChu />
            </LayoutAdmin>
          }
        />


        {/* =====================
            PHƯƠNG TIỆN CƯ DÂN
        ====================== */}
        <Route
          path="/phuong-tien"
          element={
            <LayoutAdmin>
              <PhuongTien />
            </LayoutAdmin>
          }
        />


        {/* =====================
            XE KHÁCH
        ====================== */}
        <Route
          path="/xe-khach"
          element={
            <LayoutAdmin>
              <XeKhach />
            </LayoutAdmin>
          }
        />


        {/* =====================
            CHECK-IN / CHECK-OUT
        ====================== */}
        <Route
          path="/check-in-out"
          element={
            <LayoutAdmin>
              <CheckinOut />
            </LayoutAdmin>
          }
        />


        {/* =====================
            LƯỢT GỬI XE
        ====================== */}
        <Route
          path="/luot-gui-xe"
          element={
            <LayoutAdmin>
              <LuotGui />
            </LayoutAdmin>
          }
        />


        {/* =====================
            PHÍ GỬI XE
        ====================== */}
        <Route
          path="/phi-gui-xe"
          element={
            <LayoutAdmin>
              <PhiGuiXe />
            </LayoutAdmin>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
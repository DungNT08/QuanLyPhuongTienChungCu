import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./sidebarAdmin.css";

const danhSachMenu = [
  { icon: "⌂", ten: "Trang chủ", duongDan: "/" },
  { icon: "🚗", ten: "Phương tiện cư dân", duongDan: "/phuong-tien" },
  { icon: "🚙", ten: "Xe khách", duongDan: "/xe-khach" },
  { icon: "⇄", ten: "Check-in / Check-out", duongDan: "/check-in-out" },
  { icon: "◷", ten: "Lượt gửi xe", duongDan: "/luot-gui-xe" },
  { icon: "ⓢ", ten: "Phí gửi xe", duongDan: "/phi-gui-xe" },
  { icon: "◇", ten: "Bảng giá", duongDan: "/bang-gia" },
  { icon: "◴", ten: "Lịch sử", duongDan: "/lich-su" },
  { icon: "▥", ten: "Báo cáo", duongDan: "/bao-cao" },
  { icon: "♙", ten: "Quản lý người dùng", duongDan: "/nguoi-dung" },
];

function SidebarAdmin() {
  const location = useLocation();

  return (
    <>
      {/* ===== HEADER CHUNG ===== */}
      <header className="header-trang-chu">
        <div className="logo-header">
          <div className="logo-header-icon">🏢</div>
          <div className="logo-header-text">
            <strong>Hệ thống quản lý</strong>
            <span>phương tiện chung cư</span>
          </div>
        </div>

        <div className="o-tim-kiem">
          <span className="icon-tim-kiem">🔍</span>
          <input type="text" placeholder="Tìm kiếm biển số, tên cư dân..." />
        </div>

        <div className="thong-tin-admin">
          <button className="nut-thong-bao" type="button">
            🔔
            <span className="so-thong-bao">3</span>
          </button>
          <div className="anh-admin">👤</div>
          <div className="thong-tin-admin-text">
            <strong>Admin</strong>
            <span>Quản trị viên</span>
          </div>
          <span className="mui-ten-admin">▾</span>
        </div>
      </header>

      {/* ===== SIDEBAR ===== */}
      <aside className="sidebar-admin">
        <nav className="menu-admin">
          {danhSachMenu.map((menu) => (
            <Link
              key={menu.ten}
              to={menu.duongDan}
              className={`menu-admin-item ${
                location.pathname === menu.duongDan ? "menu-admin-active" : ""
              }`}
              style={{ textDecoration: "none" }}
            >
              <span className="menu-admin-icon">{menu.icon}</span>
              <span className="menu-admin-name">{menu.ten}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default SidebarAdmin;
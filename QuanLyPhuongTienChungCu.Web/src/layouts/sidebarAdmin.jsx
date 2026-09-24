import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./sidebarAdmin.css";

const danhSachMenu = [
  { icon: "⌂", ten: "Trang chủ", duongDan: "/admin" },
  { icon: "🚗", ten: "Phương tiện cư dân", duongDan: "/admin/phuong-tien" },
  { icon: "🚙", ten: "Xe khách", duongDan: "/admin/xe-khach" },
  { icon: "⇄", ten: "Check-in / Check-out", duongDan: "/admin/check-in-out" },
  { icon: "◷", ten: "Lượt gửi xe", duongDan: "/admin/luot-gui-xe" },
  { icon: "ⓢ", ten: "Phí gửi xe", duongDan: "/admin/phi-gui-xe" },
  { icon: "◇", ten: "Bảng giá", duongDan: "/admin/bang-gia" },
  { icon: "◴", ten: "Lịch sử", duongDan: "/admin/lich-su" },
  { icon: "▥", ten: "Báo cáo", duongDan: "/admin/bao-cao" },
  { icon: "♙", ten: "Quản lý người dùng", duongDan: "/admin/nguoi-dung" },
];

function SidebarAdmin({ duLieuTimKiem = [], onTimKiem }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [tuKhoa, setTuKhoa] = useState("");
  const [hienDropdown, setHienDropdown] = useState(false);
  const [hienMenuAdmin, setHienMenuAdmin] = useState(false);

  // =====================================================
  // THÔNG TIN ADMIN
  // =====================================================
  const [thongTinAdmin, setThongTinAdmin] = useState({
    userId: null,
    hoTen: "Admin",
    tenDangNhap: "admin",
    email: "admin@gmail.com",
    roleId: null,
    tenRole: "Admin",
  });

  const adminRef = useRef(null);
  const searchRef = useRef(null);

  // =====================================================
  // ĐỌC THÔNG TIN USER SAU KHI LOGIN
  // =====================================================
  useEffect(() => {
    const layThongTinAdmin = () => {
      try {
        const userJson = localStorage.getItem("user");

        if (!userJson) {
          console.warn("Không tìm thấy thông tin user trong localStorage.");
          return;
        }

        const user = JSON.parse(userJson);

        setThongTinAdmin({
          userId: user.userId ?? null,
          hoTen: user.hoTen || "Admin",
          tenDangNhap: user.tenDangNhap || "admin",
          email: user.email || "admin@gmail.com",
          roleId: user.roleId ?? null,
          tenRole: user.tenRole || "Admin",
        });
      } catch (error) {
        console.error(
          "Không thể đọc thông tin admin từ localStorage:",
          error
        );
      }
    };

    layThongTinAdmin();
  }, []);

  // =====================================================
  // ĐÓNG DROPDOWN KHI CLICK RA NGOÀI
  // =====================================================
  useEffect(() => {
    const xuLyClickNgoai = (e) => {
      if (
        adminRef.current &&
        !adminRef.current.contains(e.target)
      ) {
        setHienMenuAdmin(false);
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(e.target)
      ) {
        setHienDropdown(false);
      }
    };

    document.addEventListener("mousedown", xuLyClickNgoai);

    return () => {
      document.removeEventListener("mousedown", xuLyClickNgoai);
    };
  }, []);

  // =====================================================
  // LỌC KẾT QUẢ TÌM KIẾM
  // =====================================================
  const ketQuaTimKiem = tuKhoa.trim()
    ? duLieuTimKiem.filter((item) =>
        item.ten
          .toLowerCase()
          .includes(tuKhoa.toLowerCase())
      )
    : [];

  // =====================================================
  // XỬ LÝ ENTER TÌM KIẾM
  // =====================================================
  const xuLyEnter = (e) => {
    if (e.key === "Enter") {
      if (onTimKiem) {
        onTimKiem(tuKhoa);
      }

      if (ketQuaTimKiem.length > 0) {
        navigate(ketQuaTimKiem[0].duongDan);
        setTuKhoa("");
        setHienDropdown(false);
      }
    }
  };

  // =====================================================
  // ĐĂNG XUẤT
  // =====================================================
 const dangXuat = () => {
  if (window.confirm("Bạn chắc chắn muốn đăng xuất?")) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();

    setHienMenuAdmin(false);

    navigate("/login", { replace: true });
  }
};

  // =====================================================
  // MỞ TRANG THÔNG TIN CÁ NHÂN
  // =====================================================
  const moThongTinCaNhan = () => {
    setHienMenuAdmin(false);

    // Hiện tại chưa có route riêng thì chuyển về trang quản lý user
    navigate("/admin/nguoi-dung");
  };

  // =====================================================
  // MỞ CÀI ĐẶT
  // =====================================================
  const moCaiDat = () => {
    setHienMenuAdmin(false);

    alert("Chức năng cài đặt đang được phát triển.");
  };

  return (
    <>
      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="header-trang-chu">

        {/* =================================================
            LOGO
        ================================================= */}
        <div className="logo-header">
          <div className="logo-header-icon">
            🏢
          </div>

          <div className="logo-header-text">
            <strong>Hệ thống quản lý</strong>
            <span>phương tiện chung cư</span>
          </div>
        </div>

        {/* =================================================
            Ô TÌM KIẾM
        ================================================= */}
        <div
          className="o-tim-kiem"
          ref={searchRef}
          style={{ position: "relative" }}
        >
          <span className="icon-tim-kiem">
            🔍
          </span>

          <input
            type="text"
            placeholder="Tìm kiếm biển số, tên cư dân..."
            value={tuKhoa}
            onChange={(e) => {
              setTuKhoa(e.target.value);
              setHienDropdown(true);
            }}
            onFocus={() => setHienDropdown(true)}
            onKeyDown={xuLyEnter}
          />

          {hienDropdown &&
            tuKhoa.trim() &&
            duLieuTimKiem.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: 0,
                  right: 0,
                  background: "#ffffff",
                  border: "1px solid #dce7ed",
                  borderRadius: 8,
                  boxShadow:
                    "0 6px 20px rgba(35, 88, 116, 0.12)",
                  maxHeight: 300,
                  overflowY: "auto",
                  zIndex: 10001,
                }}
              >
                {ketQuaTimKiem.length === 0 ? (
                  <div
                    style={{
                      padding: "12px 16px",
                      fontSize: 13,
                      color: "#6b8fa3",
                      textAlign: "center",
                    }}
                  >
                    Không tìm thấy kết quả
                  </div>
                ) : (
                  ketQuaTimKiem.map((item, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        navigate(item.duongDan);
                        setTuKhoa("");
                        setHienDropdown(false);
                      }}
                      style={{
                        padding: "10px 14px",
                        cursor: "pointer",
                        borderBottom:
                          i <
                          ketQuaTimKiem.length - 1
                            ? "1px solid #f0f5f8"
                            : "none",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "#f4f9fc")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                          "#ffffff")
                      }
                    >
                      <div
                        style={{
                          fontSize: 11,
                          color: "#4f7a92",
                          fontWeight: 700,
                          marginBottom: 3,
                        }}
                      >
                        {item.loai}
                      </div>

                      <div
                        style={{
                          fontSize: 13,
                          color: "#1b405a",
                          fontWeight: 500,
                        }}
                      >
                        {item.ten}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
        </div>

        {/* =================================================
            KHU VỰC ADMIN
        ================================================= */}
        <div
          className="thong-tin-admin"
          ref={adminRef}
          style={{ position: "relative" }}
        >

          {/* ===============================================
              THÔNG BÁO
          =============================================== */}
          <button
            className="nut-thong-bao"
            type="button"
          >
            🔔

            <span className="so-thong-bao">
              3
            </span>
          </button>

          {/* ===============================================
              THÔNG TIN ADMIN
          =============================================== */}
          <div
            onClick={() =>
              setHienMenuAdmin((v) => !v)
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <div className="anh-admin">
              👤
            </div>

            <div className="thong-tin-admin-text">

              {/* TÊN LẤY TỪ DATABASE */}
              <strong>
                {thongTinAdmin.hoTen}
              </strong>

              {/* ROLE LẤY TỪ DATABASE */}
              <span>
                {thongTinAdmin.tenRole === "Admin"
                  ? "Quản trị viên"
                  : thongTinAdmin.tenRole}
              </span>

            </div>

            <span className="mui-ten-admin">
              ▾
            </span>
          </div>

          {/* =================================================
              DROPDOWN ADMIN
          ================================================= */}
          {hienMenuAdmin && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                minWidth: 250,
                background: "#ffffff",
                border:
                  "1px solid #dce7ed",
                borderRadius: 10,
                boxShadow:
                  "0 8px 24px rgba(35, 88, 116, 0.15)",
                overflow: "hidden",
                zIndex: 10002,
              }}
            >

              {/* =========================================
                  THÔNG TIN TÀI KHOẢN
              ========================================= */}
              <div
                style={{
                  padding: "14px 16px",
                  borderBottom:
                    "1px solid #edf2f5",
                  background: "#fafdfe",
                }}
              >

                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: "#0f3b56",
                  }}
                >
                  {thongTinAdmin.hoTen}
                </div>

                <div
                  style={{
                    fontSize: 11,
                    color: "#6b8fa3",
                    fontWeight: 500,
                    marginTop: 3,
                  }}
                >
                  {thongTinAdmin.email}
                </div>

                <div
                  style={{
                    fontSize: 11,
                    color: "#6b8fa3",
                    fontWeight: 500,
                    marginTop: 2,
                  }}
                >
                  Tài khoản:{" "}
                  {thongTinAdmin.tenDangNhap}
                </div>

              </div>

              {/* =========================================
                  THÔNG TIN CÁ NHÂN
              ========================================= */}
              <button
                onClick={moThongTinCaNhan}
                style={{
                  width: "100%",
                  padding: "11px 16px",
                  border: "none",
                  background: "#ffffff",
                  textAlign: "left",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#1b405a",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    "#f4f9fc")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    "#ffffff")
                }
              >
                <span>👤</span>

                <span>
                  Thông tin cá nhân
                </span>
              </button>

              {/* =========================================
                  CÀI ĐẶT
              ========================================= */}
              <button
                onClick={moCaiDat}
                style={{
                  width: "100%",
                  padding: "11px 16px",
                  border: "none",
                  background: "#ffffff",
                  textAlign: "left",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#1b405a",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    "#f4f9fc")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    "#ffffff")
                }
              >
                <span>⚙️</span>

                <span>
                  Cài đặt
                </span>
              </button>

              {/* =========================================
                  ĐƯỜNG KẺ
              ========================================= */}
              <div
                style={{
                  height: 1,
                  background: "#edf2f5",
                  margin: "4px 0",
                }}
              />

              {/* =========================================
                  ĐĂNG XUẤT
              ========================================= */}
              <button
                onClick={dangXuat}
                style={{
                  width: "100%",
                  padding: "11px 16px",
                  border: "none",
                  background: "#ffffff",
                  textAlign: "left",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#d93025",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    "#fef2f2")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    "#ffffff")
                }
              >
                <span>🚪</span>

                <span>
                  Đăng xuất
                </span>
              </button>

            </div>
          )}
        </div>
      </header>

      {/* =====================================================
          SIDEBAR
      ===================================================== */}
      <aside className="sidebar-admin">
        <nav className="menu-admin">

          {danhSachMenu.map((menu) => (
            <Link
              key={menu.ten}
              to={menu.duongDan}
              className={`menu-admin-item ${
                location.pathname ===
                menu.duongDan
                  ? "menu-admin-active"
                  : ""
              }`}
              style={{
                textDecoration: "none",
              }}
            >
              <span className="menu-admin-icon">
                {menu.icon}
              </span>

              <span className="menu-admin-name">
                {menu.ten}
              </span>
            </Link>
          ))}

        </nav>
      </aside>
    </>
  );
}

export default SidebarAdmin;
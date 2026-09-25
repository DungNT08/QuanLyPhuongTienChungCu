import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./sidebarUser.css";

const danhSachMenu = [
  { icon: "🏠", ten: "Trang chủ", duongDan: "/trang-chu" },
  {
    icon: "🚗",
    ten: "Phương tiện của tôi",
    duongDan: "/phuong-tien-cua-toi",
  },
  {
    icon: "◷",
    ten: "Lịch sử gửi xe",
    duongDan: "/lich-su-gui-xe",
  },
  {
    icon: "▥",
    ten: "Hóa đơn & thanh toán",
    duongDan: "/hoa-don",
  },
  {
    icon: "🔔",
    ten: "Thông báo",
    duongDan: "/thong-bao",
  },
  {
    icon: "👤",
    ten: "Hồ sơ cá nhân",
    duongDan: "/ho-so",
  },
];

function SidebarUser({ duLieuTimKiem = [], onTimKiem }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [tuKhoa, setTuKhoa] = useState("");
  const [hienDropdown, setHienDropdown] = useState(false);
  const [hienMenuUser, setHienMenuUser] = useState(false);

  // =====================================================
  // THÔNG TIN NGƯỜI ĐANG ĐĂNG NHẬP
  // =====================================================
  const [nguoiDung, setNguoiDung] = useState({
    hoTen: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    tenRole: "Cư dân",
  });

  const userRef = useRef(null);
  const searchRef = useRef(null);

  // =====================================================
  // ĐỌC THÔNG TIN USER TỪ LOCAL STORAGE
  // =====================================================
  useEffect(() => {
    const layThongTinNguoiDung = () => {
      const cacKey = [
        "user",
        "userInfo",
        "currentUser",
        "authUser",
        "nguoiDung",
      ];

      let duLieu = null;

      for (const key of cacKey) {
        const raw = localStorage.getItem(key);

        if (!raw) continue;

        try {
          const parsed = JSON.parse(raw);

          if (parsed && typeof parsed === "object") {
            duLieu = parsed;
            break;
          }
        } catch (error) {
          // Không phải JSON thì bỏ qua
        }
      }

      if (!duLieu) {
        return;
      }

      console.log("Thông tin người dùng:", duLieu);

      setNguoiDung({
        hoTen:
          duLieu.hoTen ||
          duLieu.HoTen ||
          duLieu.name ||
          duLieu.ten ||
          "Người dùng",

        email:
          duLieu.email ||
          duLieu.Email ||
          "Chưa có email",

        tenRole:
          duLieu.tenRole ||
          duLieu.TenRole ||
          duLieu.role ||
          duLieu.Role ||
          "Cư dân",
      });
    };

    layThongTinNguoiDung();
  }, []);

  // =====================================================
  // ĐÓNG DROPDOWN KHI CLICK RA NGOÀI
  // =====================================================
  useEffect(() => {
    const xuLyClickNgoai = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setHienMenuUser(false);
      }

      if (searchRef.current && !searchRef.current.contains(e.target)) {
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
        item.ten.toLowerCase().includes(tuKhoa.toLowerCase())
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

    setHienMenuUser(false);

    navigate("/login", { replace: true });
  }
};

  // =====================================================
  // HIỂN THỊ ROLE
  // =====================================================
  const hienThiRole = () => {
    const role = String(nguoiDung.tenRole || "").toLowerCase();

    if (role === "admin") {
      return "Quản trị viên";
    }

    if (role === "nhanvien") {
      return "Nhân viên";
    }

    if (role === "cudan") {
      return "Cư dân";
    }

    return nguoiDung.tenRole || "Cư dân";
  };

  return (
    <>
      {/* =================================================
          HEADER CHUNG
      ================================================= */}
      <header className="header-trang-chu">
        {/* LOGO */}
        <div className="logo-header">
          <div className="logo-header-icon">🏢</div>

          <div className="logo-header-text">
            <strong>Chung cư Sunrise</strong>
            <span>Hệ thống quản lý phương tiện</span>
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
          <span className="icon-tim-kiem">🔍</span>

          <input
            type="text"
            placeholder="Tìm kiếm..."
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
                          i < ketQuaTimKiem.length - 1
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
            KHU VỰC USER
        ================================================= */}
        <div
          className="thong-tin-admin"
          ref={userRef}
          style={{
            position: "relative",
          }}
        >
          {/* THÔNG BÁO */}
          <button className="nut-thong-bao" type="button">
            🔔
            <span className="so-thong-bao">3</span>
          </button>

          {/* THÔNG TIN USER */}
          <div
            onClick={() => setHienMenuUser((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <div className="anh-admin">👤</div>

            <div className="thong-tin-admin-text">
              <strong>{nguoiDung.hoTen}</strong>

              <span>{hienThiRole()}</span>
            </div>

            <span className="mui-ten-admin">▾</span>
          </div>

          {/* =================================================
              DROPDOWN USER
          ================================================= */}
          {hienMenuUser && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                minWidth: 220,
                background: "#ffffff",
                border: "1px solid #dce7ed",
                borderRadius: 10,
                boxShadow:
                  "0 8px 24px rgba(35, 88, 116, 0.15)",
                overflow: "hidden",
                zIndex: 10002,
              }}
            >
              {/* THÔNG TIN */}
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #edf2f5",
                  background: "#fafdfe",
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#0f3b56",
                  }}
                >
                  {nguoiDung.hoTen}
                </div>

                <div
                  style={{
                    fontSize: 11,
                    color: "#6b8fa3",
                    fontWeight: 500,
                    marginTop: 2,
                  }}
                >
                  {nguoiDung.email}
                </div>

                <div
                  style={{
                    fontSize: 11,
                    color: "#6b8fa3",
                    fontWeight: 600,
                    marginTop: 4,
                  }}
                >
                  {hienThiRole()}
                </div>
              </div>

              {/* THÔNG TIN CÁ NHÂN */}
              <button
                onClick={() => {
                  navigate("/ho-so");
                  setHienMenuUser(false);
                }}
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
                <span>Thông tin cá nhân</span>
              </button>


              {/* ĐƯỜNG KẺ */}
              <div
                style={{
                  height: 1,
                  background: "#edf2f5",
                  margin: "4px 0",
                }}
              />

              {/* ĐĂNG XUẤT */}
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
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* =================================================
          SIDEBAR
      ================================================= */}
      <aside className="sidebar-admin">
        <nav className="menu-admin">
          {danhSachMenu.map((menu) => (
            <Link
              key={menu.ten}
              to={menu.duongDan}
              className={`menu-admin-item ${
                location.pathname === menu.duongDan
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

export default SidebarUser;
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TrangChu.css";

// =====================================================
// GỌI API — có fallback an toàn nếu file api.js lỗi
// =====================================================
let apiFetch;
try {
  apiFetch = require("../api/api").apiFetch;
} catch {
  // Nếu không import được → dùng fetch trực tiếp
  apiFetch = async (url) => {
    const BASE = "http://localhost:5022/api";
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE}${url}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error(`API lỗi: ${res.status}`);
    const text = await res.text();
    try {
      return text ? JSON.parse(text) : null;
    } catch {
      return text;
    }
  };
}

function TrangChu() {
  const navigate = useNavigate();

  // =========================
  // STATE
  // =========================
  const [soPhuongTien, setSoPhuongTien] = useState("--");
  const [soLuotGui, setSoLuotGui] = useState("--");
  const [tongChiPhi, setTongChiPhi] = useState("--");
  const [lichSuGui, setLichSuGui] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // ĐIỀU HƯỚNG
  // =========================
  const xemPhuongTien = () => {
    navigate("/phuong-tien-cua-toi");
  };

  // =====================================================
  // GỌI API KHI MỞ TRANG
  // =====================================================
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // ---------- 0. LẤY USER ----------
        let userId = null;
        try {
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          userId = user.id ?? user.userId ?? user.UserId ?? null;
          console.log("👤 User:", user, "| UserId:", userId);
        } catch (e) {
          console.warn("Không đọc được user từ localStorage:", e);
        }

        // ---------- 1. LẤY DANH SÁCH PHƯƠNG TIỆN ----------
        let dsPTcuaToi = [];
        try {
          const dataPT = await apiFetch("/PhuongTien");
          console.log("📦 Data phương tiện:", dataPT);

          const dsPT = Array.isArray(dataPT)
            ? dataPT
            : dataPT?.data ?? [];

          dsPTcuaToi = userId
            ? dsPT.filter((pt) => (pt.userId ?? pt.UserId) === userId)
            : dsPT;

          console.log("✅ Xe của tôi:", dsPTcuaToi.length);
          setSoPhuongTien(dsPTcuaToi.length);
        } catch (err) {
          console.error("❌ Lỗi lấy phương tiện:", err.message);
          setSoPhuongTien(0);
        }

        // ---------- 2. LẤY LƯỢT GỬI XE ----------
        try {
          const dataLG = await apiFetch("/LuotGui");
          console.log("📦 Data lượt gửi:", dataLG);

          const dsLG = Array.isArray(dataLG)
            ? dataLG
            : dataLG?.data ?? [];

          const dsLGcuaToi = userId
            ? dsLG.filter((lg) => (lg.userId ?? lg.UserId) === userId)
            : dsLG;

          // 5 lượt gần nhất
          setLichSuGui(dsLGcuaToi.slice(0, 5));

          // Đếm lượt gửi trong tháng
          const now = new Date();
          const thangNay = now.getMonth();
          const namNay = now.getFullYear();
          const soLuot = dsLGcuaToi.filter((lg) => {
            const ngay = new Date(
              lg.ngayVao ?? lg.NgayVao ?? lg.ngayTao ?? lg.NgayTao
            );
            return (
              !isNaN(ngay) &&
              ngay.getMonth() === thangNay &&
              ngay.getFullYear() === namNay
            );
          }).length;
          setSoLuotGui(soLuot);

          // Tổng chi phí
          const tong = dsLGcuaToi.reduce(
            (sum, lg) => sum + Number(lg.phi ?? lg.Phi ?? 0),
            0
          );
          setTongChiPhi(tong.toLocaleString("vi-VN") + "đ");
        } catch (err) {
          console.warn("⚠️ Chưa có API /LuotGui:", err.message);
          setSoLuotGui(0);
          setTongChiPhi("0đ");
        }

      } catch (error) {
        console.error("❌ Lỗi load trang chủ:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="noi-dung-trang-chu">

      {/* ===== LỜI CHÀO ===== */}
      <div className="khoi-chao">
        <div className="loi-chao">
          <h1>Xin chào!</h1>
          <p>
            Chào mừng bạn đến với hệ thống quản lý phương tiện chung cư.
          </p>
        </div>
        <div className="hinh-minh-hoa">🏢🚗</div>
      </div>

      {/* ===== 3 THẺ THỐNG KÊ ===== */}
      <div className="hang-thong-ke">

        {/* PHƯƠNG TIỆN */}
        <div
          className="the-thong-ke xanh-duong"
          onClick={xemPhuongTien}
          style={{ cursor: "pointer" }}
        >
          <div className="the-icon">🚗</div>
          <div className="the-noi-dung">
            <p className="the-tieu-de">Phương tiện của tôi</p>
            <h2 className="the-gia-tri">
              {loading ? "..." : soPhuongTien}
            </h2>
            <p className="the-mo-ta">xe đang đăng ký</p>
          </div>
        </div>

        {/* LƯỢT GỬI XE */}
        <div className="the-thong-ke xanh-la">
          <div className="the-icon">🎫</div>
          <div className="the-noi-dung">
            <p className="the-tieu-de">Lượt gửi xe trong tháng</p>
            <h2 className="the-gia-tri">
              {loading ? "..." : soLuotGui}
            </h2>
            <p className="the-mo-ta">lượt gửi</p>
          </div>
        </div>

        {/* CHI PHÍ */}
        <div className="the-thong-ke tim">
          <div className="the-icon">💳</div>
          <div className="the-noi-dung">
            <p className="the-tieu-de">Tổng chi phí tháng này</p>
            <h2 className="the-gia-tri">
              {loading ? "..." : tongChiPhi}
            </h2>
            <p className="the-mo-ta">đã thanh toán</p>
          </div>
        </div>

      </div>

      {/* ===== HÀNG DƯỚI ===== */}
      <div className="hang-duoi">

        {/* ===== BẢNG LỊCH SỬ ===== */}
        <div className="bang-lich-su">
          <div className="tieu-de-bang">
            <h3>Lịch sử gửi xe gần đây</h3>
            <a href="/lich-su-gui-xe">Xem tất cả →</a>
          </div>

          <table>
            <thead>
              <tr>
                <th>Ngày giờ</th>
                <th>Biển số xe</th>
                <th>Loại xe</th>
                <th>Vị trí gửi</th>
                <th>Thời gian gửi</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {lichSuGui.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", color: "#93aebd" }}
                  >
                    {loading ? "Đang tải..." : "Chưa có dữ liệu"}
                  </td>
                </tr>
              ) : (
                lichSuGui.map((lg, i) => (
                  <tr key={i}>
                    <td>{lg.ngayVao ?? lg.NgayVao ?? "—"}</td>
                    <td>{lg.bienSo ?? lg.BienSo ?? "—"}</td>
                    <td>{lg.loaiXe ?? lg.LoaiXe ?? "—"}</td>
                    <td>{lg.viTri ?? lg.ViTri ?? "—"}</td>
                    <td>{lg.thoiGianGui ?? lg.ThoiGianGui ?? "—"}</td>
                    <td>
                      <span className="trang-thai-da-thanh-toan">
                        {lg.trangThai ?? lg.TrangThai ?? "—"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ===== QUẢNG CÁO ===== */}
        <div className="khoi-quang-cao">
          <div className="qc-icon">🚗</div>
          <h3>Quản lý phương tiện của bạn</h3>
          <p>Nhanh chóng, tiện lợi, an toàn</p>
          <button
            className="nut-xem-phuong-tien"
            onClick={xemPhuongTien}
          >
            Xem phương tiện
          </button>
        </div>

      </div>
    </div>
  );
}

export default TrangChu;
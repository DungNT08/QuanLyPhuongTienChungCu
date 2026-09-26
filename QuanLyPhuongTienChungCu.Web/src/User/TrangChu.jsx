import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TrangChu.css";

const API_URL = "http://localhost:5022/api";

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

  const xemTatCa = () => {
    navigate("/lich-su-gui-xe");
  };

  // =====================================================
  // HÀM GỌI API
  // =====================================================
  const goiApi = async (endpoint) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    try {
      return text ? JSON.parse(text) : null;
    } catch {
      return text;
    }
  };

  // =====================================================
  // LOAD DATA
  // =====================================================
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // ---------- 1. LẤY SỐ PHƯƠNG TIỆN ----------
        try {
          const dataPT = await goiApi("/PhuongTien");
          const dsPT = Array.isArray(dataPT)
            ? dataPT
            : dataPT?.data ?? [];
          setSoPhuongTien(dsPT.length);
          console.log("🚗 Số phương tiện:", dsPT.length);
        } catch (err) {
          console.error("❌ Lỗi lấy phương tiện:", err.message);
          setSoPhuongTien(0);
        }

        // ---------- 2. LẤY LỊCH SỬ GỬI XE ----------
        try {
          const dataLG = await goiApi("/Parking/history");
          const dsLG = Array.isArray(dataLG) ? dataLG : dataLG?.data ?? [];

          console.log("📦 Lịch sử gửi xe:", dsLG);

          // 5 lượt gần nhất
          setLichSuGui(dsLG.slice(0, 5));

          // ---------- ĐẾM LƯỢT GỬI TRONG THÁNG ----------
          const now = new Date();
          const thangNay = now.getMonth();
          const namNay = now.getFullYear();

          const soLuot = dsLG.filter((lg) => {
            const ngay = new Date(lg.thoiGianVao);
            return (
              !isNaN(ngay) &&
              ngay.getMonth() === thangNay &&
              ngay.getFullYear() === namNay
            );
          }).length;
          setSoLuotGui(soLuot);

          // ---------- TỔNG CHI PHÍ ----------
          const tong = dsLG.reduce(
            (sum, lg) => sum + Number(lg.soTien ?? 0),
            0
          );
          setTongChiPhi(tong.toLocaleString("vi-VN") + "đ");
        } catch (err) {
          console.warn("⚠️ Lỗi lấy lịch sử gửi xe:", err.message);
          setSoLuotGui(0);
          setTongChiPhi("0đ");
          setLichSuGui([]);
        }
      } catch (error) {
        console.error("❌ Lỗi load trang chủ:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // =====================================================
  // FORMAT NGÀY GIỜ
  // =====================================================
  const formatNgay = (str) => {
    if (!str) return "—";
    const d = new Date(str);
    if (isNaN(d)) return "—";
    const ngay = String(d.getDate()).padStart(2, "0");
    const thang = String(d.getMonth() + 1).padStart(2, "0");
    const nam = d.getFullYear();
    const gio = String(d.getHours()).padStart(2, "0");
    const phut = String(d.getMinutes()).padStart(2, "0");
    return `${gio}:${phut} ${ngay}/${thang}/${nam}`;
  };

  const formatTien = (tien) => {
    if (!tien) return "—";
    return Number(tien).toLocaleString("vi-VN") + "đ";
  };

  const tinhThoiGianGui = (vao, ra) => {
    if (!vao) return "—";
    const end = ra ? new Date(ra) : new Date();
    const diffMs = end - new Date(vao);
    const gio = Math.floor(diffMs / (1000 * 60 * 60));
    const phut = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (gio === 0) return `${phut} phút`;
    return `${gio}h${phut}p`;
  };

  return (
    <div className="noi-dung-trang-chu">
      {/* ===== LỜI CHÀO ===== */}
      <div className="khoi-chao">
        <div className="loi-chao">
          <h1>Xin chào!</h1>
          <p>Chào mừng bạn đến với hệ thống quản lý phương tiện chung cư.</p>
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
        <div
          className="the-thong-ke xanh-la"
          onClick={xemTatCa}
          style={{ cursor: "pointer" }}
        >
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
            <a
              href="/lich-su-gui-xe"
              onClick={(e) => {
                e.preventDefault();
                xemTatCa();
              }}
            >
              Xem tất cả →
            </a>
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
                  <tr key={lg.luotGuiXeId || i}>
                    <td>{formatNgay(lg.thoiGianVao)}</td>
                    <td>
                      <strong>{lg.bienSo || "—"}</strong>
                    </td>
                    <td>{lg.loaiXe || "—"}</td>
                    <td>
                      {lg.laXeKhach
                        ? "Khách"
                        : `${lg.cuDan || "—"}${
                            lg.canHo ? ` (${lg.canHo})` : ""
                          }`}
                    </td>
                    <td>
                      {tinhThoiGianGui(lg.thoiGianVao, lg.thoiGianRa)}
                    </td>
                    <td>
                      {lg.trangThai === "Đang gửi" ? (
                        <span className="trang-thai-dang-gui">
                          Đang gửi
                        </span>
                      ) : (
                        <span className="trang-thai-da-thanh-toan">
                          {lg.trangThai}
                        </span>
                      )}
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
          <button className="nut-xem-phuong-tien" onClick={xemPhuongTien}>
            Xem phương tiện
          </button>
        </div>
      </div>
    </div>
  );
}

export default TrangChu;

import React, { useState, useEffect } from "react";
import "./HoaDon.css";

const API_URL = "http://localhost:5022/api";

const HoaDon = () => {
  const [tab, setTab] = useState("tat-ca");
  const [danhSach, setDanhSach] = useState([]);
  const [hoaDonChon, setHoaDonChon] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loi, setLoi] = useState("");

  const layToken = () => localStorage.getItem("token");

  const taoHeaders = () => {
    const token = layToken();
    const headers = { Accept: "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  const layNoiDungLoi = async (response) => {
    try {
      const text = await response.text();
      if (!text) return `HTTP ${response.status}`;
      try {
        const data = JSON.parse(text);
        return data.message || data.title || `HTTP ${response.status}`;
      } catch {
        return text;
      }
    } catch {
      return `HTTP ${response.status}`;
    }
  };

  // =====================================================
  // TẢI DANH SÁCH HÓA ĐƠN THEO USER ID
  // =====================================================
  useEffect(() => {
    const taiHoaDon = async () => {
      try {
        setLoading(true);
        setLoi("");

        // ✅ Lấy userId từ localStorage
        let userId = null;
        try {
          const userStr = localStorage.getItem("user");
          if (userStr) {
            const u = JSON.parse(userStr);
            userId = u.userId ?? u.UserId ?? null;
          }
        } catch (e) {
          console.warn("Không đọc được user từ localStorage:", e);
        }

        if (!userId) {
          throw new Error(
            "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."
          );
        }

        // ✅ Gọi /ThanhToan/cua-toi/{userId}
        const response = await fetch(
          `${API_URL}/ThanhToan/cua-toi/${userId}`,
          {
            method: "GET",
            headers: taoHeaders(),
          }
        );

        if (!response.ok) {
          throw new Error(await layNoiDungLoi(response));
        }

        const data = await response.json();
        setDanhSach(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Lỗi tải hóa đơn:", error);
        setLoi(error.message || "Không thể tải danh sách hóa đơn.");
      } finally {
        setLoading(false);
      }
    };

    taiHoaDon();
  }, []);

  const danhSachLoc = danhSach.filter((item) => {
    if (tab === "tat-ca") return true;
    if (tab === "cho-thanh-toan") return item.trangThai === "Chờ thanh toán";
    if (tab === "da-thanh-toan") return item.trangThai === "Đã thanh toán";
    return true;
  });

  const formatGia = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";

  if (loading) {
    return (
      <div className="hd-wrapper">
        <div className="hd-body">
          <div className="hd-title-bar">
            <h1>Hóa đơn & thanh toán</h1>
          </div>
          <div className="hd-table-box" style={{ textAlign: "center", padding: 40 }}>
            Đang tải dữ liệu...
          </div>
        </div>
      </div>
    );
  }

  // ===== TRANG CHI TIẾT =====
  if (hoaDonChon) {
    return (
      <div className="hd-wrapper">
        <div className="hd-body">
          <div className="hd-title-bar">
            <h1>Chi tiết hóa đơn</h1>
          </div>

          <button className="hd-btn-back" onClick={() => setHoaDonChon(null)}>
            ← Quay lại
          </button>

          <div className="hd-card">
            <div className="hd-info-header">
              <div>
                <div className="hd-info-row">
                  <span className="hd-info-label">Mã hóa đơn:</span>
                  <span className="hd-info-value">{hoaDonChon.maHoaDon}</span>
                </div>
                <div className="hd-info-row">
                  <span className="hd-info-label">Ngày tạo:</span>
                  <span className="hd-info-value">{hoaDonChon.ngayTao}</span>
                </div>
              </div>

              <span
                className={`hd-status ${
                  hoaDonChon.trangThai === "Đã thanh toán"
                    ? "hd-status-paid"
                    : "hd-status-pending"
                }`}
              >
                {hoaDonChon.trangThai}
              </span>
            </div>
          </div>

          <div className="hd-card">
            <h3 className="hd-card-title">Thông tin phương tiện</h3>
            <div className="hd-grid-2">
              <div className="hd-field">
                <label>Loại xe</label>
                <span>{hoaDonChon.loaiXe || "—"}</span>
              </div>
              <div className="hd-field">
                <label>Biển số xe</label>
                <span>{hoaDonChon.bienSo || "—"}</span>
              </div>
              <div className="hd-field hd-field-full">
                <label>Thời gian gửi</label>
                <span>{hoaDonChon.thoiGianGui || "—"}</span>
              </div>
            </div>
          </div>

          <div className="hd-card">
            <h3 className="hd-card-title">Chi tiết phí</h3>
            <table className="hd-table-detail">
              <thead>
                <tr>
                  <th>Loại phí</th>
                  <th>Đơn giá</th>
                  <th>Thời gian</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {hoaDonChon.chiTietPhi && hoaDonChon.chiTietPhi.length > 0 ? (
                  hoaDonChon.chiTietPhi.map((ct, i) => (
                    <tr key={i}>
                      <td>{ct.loaiPhi}</td>
                      <td>{ct.donGia}</td>
                      <td>{ct.thoiGian}</td>
                      <td>{formatGia(ct.thanhTien)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="hd-empty">
                      Chưa có chi tiết phí
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="hd-total-row">
              <span className="hd-total-label">Tổng tiền</span>
              <span className="hd-total-value">
                {formatGia(hoaDonChon.soTien)}
              </span>
            </div>
          </div>

          <div className="hd-actions">
            <button
              className="hd-btn-download"
              onClick={() =>
                alert(`Tải hóa đơn ${hoaDonChon.maHoaDon} dạng PDF`)
              }
            >
              📄 Tải hóa đơn (PDF)
            </button>
            <button
              className="hd-btn-cancel"
              onClick={() => setHoaDonChon(null)}
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== TRANG DANH SÁCH =====
  return (
    <div className="hd-wrapper">
      <div className="hd-body">
        <div className="hd-title-bar">
          <h1>Hóa đơn & thanh toán</h1>
        </div>

        {loi && (
          <div
            className="hd-table-box"
            style={{
              color: "#b91c1c",
              background: "#fff1f2",
              border: "1px solid #fecaca",
            }}
          >
            ⚠️ {loi}
          </div>
        )}

        <div className="hd-table-box">
          <div className="hd-tabs">
            <button
              className={`hd-tab ${tab === "tat-ca" ? "hd-tab-active" : ""}`}
              onClick={() => setTab("tat-ca")}
            >
              Tất cả
            </button>
            <button
              className={`hd-tab ${tab === "cho-thanh-toan" ? "hd-tab-active" : ""}`}
              onClick={() => setTab("cho-thanh-toan")}
            >
              Chờ thanh toán
            </button>
            <button
              className={`hd-tab ${tab === "da-thanh-toan" ? "hd-tab-active" : ""}`}
              onClick={() => setTab("da-thanh-toan")}
            >
              Đã thanh toán
            </button>
          </div>

          <table className="hd-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã hóa đơn</th>
                <th>Ngày tạo</th>
                <th>Loại xe</th>
                <th>Biển số xe</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {danhSachLoc.length === 0 ? (
                <tr>
                  <td colSpan="8" className="hd-empty">
                    Chưa có dữ liệu
                  </td>
                </tr>
              ) : (
                danhSachLoc.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.maHoaDon}</td>
                    <td>{item.ngayTao}</td>
                    <td>{item.loaiXe}</td>
                    <td>{item.bienSo}</td>
                    <td>{formatGia(item.soTien)}</td>
                    <td>
                      <span
                        className={`hd-status ${
                          item.trangThai === "Đã thanh toán"
                            ? "hd-status-paid"
                            : "hd-status-pending"
                        }`}
                      >
                        {item.trangThai}
                      </span>
                    </td>
                    <td>
                      <button
                        className="hd-btn-view"
                        onClick={() => setHoaDonChon(item)}
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="hd-pagination">
            <span>
              Hiển thị {danhSachLoc.length > 0 ? 1 : 0} - {danhSachLoc.length} trong {danhSach.length} hóa đơn
            </span>
            <div className="hd-pages">
              <button className="hd-page-prev">‹</button>
              <button className="hd-page-active">1</button>
              <button className="hd-page-next">›</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoaDon;
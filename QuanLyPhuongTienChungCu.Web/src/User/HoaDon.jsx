import React, { useState } from "react";
import "./HoaDon.css";

const HoaDon = () => {
  const [tab, setTab] = useState("tat-ca");
  const [danhSach] = useState([]);
  const [hoaDonChon, setHoaDonChon] = useState(null);

  const danhSachLoc = danhSach.filter((item) => {
    if (tab === "tat-ca") return true;
    if (tab === "cho-thanh-toan") return item.trangThai === "Chờ thanh toán";
    if (tab === "da-thanh-toan") return item.trangThai === "Đã thanh toán";
    return true;
  });

  const formatGia = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";

  // ===== TRANG CHI TIẾT =====
  if (hoaDonChon) {
    return (
      <div className="hd-wrapper">
        <div className="hd-body">
          {/* TIÊU ĐỀ */}
          <div className="hd-title-bar">
            <h1>Chi tiết hóa đơn</h1>
          </div>

          {/* NÚT QUAY LẠI */}
          <button
            className="hd-btn-back"
            onClick={() => setHoaDonChon(null)}
          >
            ← Quay lại
          </button>

          {/* KHỐI THÔNG TIN HÓA ĐƠN */}
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

          {/* KHỐI THÔNG TIN PHƯƠNG TIỆN */}
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

          {/* KHỐI CHI TIẾT PHÍ */}
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

          {/* 2 NÚT */}
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
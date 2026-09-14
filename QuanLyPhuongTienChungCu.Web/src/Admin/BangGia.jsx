import React, { useState } from "react";
import "./BangGia.css";

const BangGia = () => {
  const [danhSach, setDanhSach] = useState([]);
  const [hienThiModal, setHienThiModal] = useState(false);
  const [dangSua, setDangSua] = useState(null);
  const [form, setForm] = useState({
    loaiPhuongTien: "",
    donGiaGio: 0,
    donGiaNgay: 0,
    ghiChu: "",
  });

  const moThem = () => {
    setDangSua(null);
    setForm({ loaiPhuongTien: "", donGiaGio: 0, donGiaNgay: 0, ghiChu: "" });
    setHienThiModal(true);
  };

  const moSua = (item) => {
    setDangSua(item.id);
    setForm({ ...item });
    setHienThiModal(true);
  };

  const luu = () => {
    if (!form.loaiPhuongTien) {
      alert("Vui lòng nhập loại phương tiện");
      return;
    }
    if (dangSua) {
      setDanhSach((prev) =>
        prev.map((b) => (b.id === dangSua ? { ...b, ...form } : b))
      );
    } else {
      const idMoi = danhSach.length
        ? Math.max(...danhSach.map((b) => b.id)) + 1
        : 1;
      setDanhSach((prev) => [...prev, { id: idMoi, ...form }]);
    }
    setHienThiModal(false);
  };

  const xoa = (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa bảng giá này?")) return;
    setDanhSach((prev) => prev.filter((b) => b.id !== id));
  };

  const formatGia = (n) => Number(n).toLocaleString("vi-VN") + "đ";

  return (
    <div className="bg-wrapper">
      <div className="bg-body">
        <div className="bg-title-bar">
          <h2>Bảng giá gửi xe</h2>
          <button className="bg-btn-add" onClick={moThem}>
            + Thêm bảng giá
          </button>
        </div>

        <div className="bg-table-box">
          <table className="bg-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Loại phương tiện</th>
                <th>Đơn giá (giờ)</th>
                <th>Đơn giá (ngày)</th>
                <th>Ghi chú</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {danhSach.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: 30, color: "#6b8fa3" }}>
                    Chưa có dữ liệu
                  </td>
                </tr>
              ) : (
                danhSach.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.loaiPhuongTien}</td>
                    <td>{formatGia(item.donGiaGio)}</td>
                    <td>{formatGia(item.donGiaNgay)}</td>
                    <td>{item.ghiChu}</td>
                    <td className="bg-actions">
                      <button className="bg-edit" onClick={() => moSua(item)}>
                        ✏️
                      </button>
                      <button className="bg-delete" onClick={() => xoa(item.id)}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="bg-pagination">
            <span>
              Hiển thị {danhSach.length > 0 ? 1 : 0} - {danhSach.length} trong {danhSach.length} bảng giá
            </span>
            <div className="bg-pages">
              <button className="bg-page-prev">‹</button>
              <button className="bg-page-active">1</button>
              <button className="bg-page-next">›</button>
            </div>
          </div>
        </div>
      </div>

      {hienThiModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 10,
              minWidth: 400,
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ margin: "0 0 16px", color: "#0f3b56" }}>
              {dangSua ? "Sửa bảng giá" : "Thêm bảng giá"}
            </h3>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 600 }}>
                Loại phương tiện *
              </label>
              <input
                type="text"
                value={form.loaiPhuongTien}
                onChange={(e) => setForm({ ...form, loaiPhuongTien: e.target.value })}
                style={{ width: "100%", padding: 8, border: "1px solid #dce7ed", borderRadius: 6 }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 600 }}>
                Đơn giá (giờ)
              </label>
              <input
                type="number"
                value={form.donGiaGio}
                onChange={(e) => setForm({ ...form, donGiaGio: Number(e.target.value) })}
                style={{ width: "100%", padding: 8, border: "1px solid #dce7ed", borderRadius: 6 }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 600 }}>
                Đơn giá (ngày)
              </label>
              <input
                type="number"
                value={form.donGiaNgay}
                onChange={(e) => setForm({ ...form, donGiaNgay: Number(e.target.value) })}
                style={{ width: "100%", padding: 8, border: "1px solid #dce7ed", borderRadius: 6 }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 600 }}>
                Ghi chú
              </label>
              <input
                type="text"
                value={form.ghiChu}
                onChange={(e) => setForm({ ...form, ghiChu: e.target.value })}
                style={{ width: "100%", padding: 8, border: "1px solid #dce7ed", borderRadius: 6 }}
              />
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={() => setHienThiModal(false)}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #dce7ed",
                  borderRadius: 6,
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                onClick={luu}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: 6,
                  background: "#1a73e8",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BangGia;
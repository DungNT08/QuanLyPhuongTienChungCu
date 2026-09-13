import React, { useState } from "react";
import "./PhuongTien.css";

const QuanLyPhuongTien = () => {
  const [tuKhoa, setTuKhoa] = useState("");
  const [danhSach, setDanhSach] = useState([]);
  const [hienThiModal, setHienThiModal] = useState(false);
  const [dangSua, setDangSua] = useState(null);
  const [form, setForm] = useState({
    bienSo: "",
    loaiXe: "Ô tô",
    cuDan: "",
    canHo: "",
    trangThai: "Đang hoạt động",
  });

  const moThem = () => {
    setDangSua(null);
    setForm({ bienSo: "", loaiXe: "Ô tô", cuDan: "", canHo: "", trangThai: "Đang hoạt động" });
    setHienThiModal(true);
  };

  const moSua = (item) => {
    setDangSua(item.id);
    setForm({
      bienSo: item.bienSo,
      loaiXe: item.loaiXe,
      cuDan: item.cuDan,
      canHo: item.canHo,
      trangThai: item.trangThai,
    });
    setHienThiModal(true);
  };

  const luu = () => {
    if (!form.bienSo || !form.cuDan || !form.canHo) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (dangSua) {
      setDanhSach((prev) =>
        prev.map((p) => (p.id === dangSua ? { ...p, ...form } : p))
      );
    } else {
      const idMoi = danhSach.length ? Math.max(...danhSach.map((p) => p.id)) + 1 : 1;
      setDanhSach((prev) => [...prev, { id: idMoi, ...form }]);
    }
    setHienThiModal(false);
  };

  const xoa = (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa phương tiện này?")) return;
    setDanhSach((prev) => prev.filter((p) => p.id !== id));
  };

  const danhSachLoc = danhSach.filter(
    (item) =>
      item.bienSo.toLowerCase().includes(tuKhoa.toLowerCase()) ||
      item.cuDan.toLowerCase().includes(tuKhoa.toLowerCase()) ||
      item.canHo.toLowerCase().includes(tuKhoa.toLowerCase())
  );

  return (
    <div className="pt-wrapper">
      <div className="pt-body">
        <div className="pt-title-bar">
          <h2>Phương tiện cư dân</h2>
          <button className="pt-btn-add" onClick={moThem}>+ Thêm phương tiện</button>
        </div>

        <div className="pt-table-box">
          <div className="pt-table-search">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm biển số, tên cư dân, số căn..."
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
            />
          </div>

          <table className="pt-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Biển số xe</th>
                <th>Loại xe</th>
                <th>Cư dân</th>
                <th>Căn hộ</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {danhSachLoc.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: 30, color: "#6b8fa3" }}>
                    Chưa có dữ liệu
                  </td>
                </tr>
              ) : (
                danhSachLoc.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.bienSo}</td>
                    <td>{item.loaiXe}</td>
                    <td>{item.cuDan}</td>
                    <td>{item.canHo}</td>
                    <td><span className="pt-status">{item.trangThai}</span></td>
                    <td className="pt-actions">
                      <button className="pt-edit" onClick={() => moSua(item)}>✏️</button>
                      <button className="pt-delete" onClick={() => xoa(item.id)}>🗑️</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="pt-pagination">
            <span>
              Hiển thị {danhSachLoc.length > 0 ? 1 : 0} - {danhSachLoc.length} trong {danhSach.length} phương tiện
            </span>
            <div className="pt-pages">
              <button>1</button>
            </div>
          </div>
        </div>
      </div>

      {hienThiModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }}>
          <div style={{ background: "#fff", padding: 24, borderRadius: 10, minWidth: 400, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin: "0 0 16px", color: "#0f3b56" }}>
              {dangSua ? "Sửa phương tiện" : "Thêm phương tiện"}
            </h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Biển số *</label>
              <input type="text" value={form.bienSo} onChange={(e) => setForm({ ...form, bienSo: e.target.value })}
                style={{ width: "100%", padding: 8, border: "1px solid #dce7ed", borderRadius: 6 }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Loại xe</label>
              <select value={form.loaiXe} onChange={(e) => setForm({ ...form, loaiXe: e.target.value })}
                style={{ width: "100%", padding: 8, border: "1px solid #dce7ed", borderRadius: 6 }}>
                <option>Ô tô</option>
                <option>Xe máy</option>
                <option>Xe đạp</option>
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Cư dân *</label>
              <input type="text" value={form.cuDan} onChange={(e) => setForm({ ...form, cuDan: e.target.value })}
                style={{ width: "100%", padding: 8, border: "1px solid #dce7ed", borderRadius: 6 }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Căn hộ *</label>
              <input type="text" value={form.canHo} onChange={(e) => setForm({ ...form, canHo: e.target.value })}
                style={{ width: "100%", padding: 8, border: "1px solid #dce7ed", borderRadius: 6 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Trạng thái</label>
              <select value={form.trangThai} onChange={(e) => setForm({ ...form, trangThai: e.target.value })}
                style={{ width: "100%", padding: 8, border: "1px solid #dce7ed", borderRadius: 6 }}>
                <option>Đang hoạt động</option>
                <option>Ngừng hoạt động</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setHienThiModal(false)} style={{ padding: "8px 16px", border: "1px solid #dce7ed", borderRadius: 6, background: "#fff", cursor: "pointer" }}>Hủy</button>
              <button onClick={luu} style={{ padding: "8px 16px", border: "none", borderRadius: 6, background: "#1a73e8", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuanLyPhuongTien;
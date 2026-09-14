import React, { useState } from "react";
import "./QLyUser.css";

const QLyUser = () => {
  const [tuKhoa, setTuKhoa] = useState("");
  const [danhSach, setDanhSach] = useState([]);
  const [hienThiModal, setHienThiModal] = useState(false);
  const [dangSua, setDangSua] = useState(null);
  const [form, setForm] = useState({
    tenDangNhap: "",
    hoTen: "",
    vaiTro: "Cư dân",
    trangThai: "Hoạt động",
  });

  const moThem = () => {
    setDangSua(null);
    setForm({
      tenDangNhap: "",
      hoTen: "",
      vaiTro: "Cư dân",
      trangThai: "Hoạt động",
    });
    setHienThiModal(true);
  };

  const moSua = (item) => {
    setDangSua(item.id);
    setForm({
      tenDangNhap: item.tenDangNhap,
      hoTen: item.hoTen,
      vaiTro: item.vaiTro,
      trangThai: item.trangThai,
    });
    setHienThiModal(true);
  };

  const luu = () => {
    if (!form.tenDangNhap || !form.hoTen) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (dangSua) {
      setDanhSach((prev) =>
        prev.map((u) => (u.id === dangSua ? { ...u, ...form } : u))
      );
    } else {
      const idMoi = danhSach.length
        ? Math.max(...danhSach.map((u) => u.id)) + 1
        : 1;
      setDanhSach((prev) => [...prev, { id: idMoi, ...form }]);
    }
    setHienThiModal(false);
  };

  const xoa = (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa?")) return;
    setDanhSach((prev) => prev.filter((u) => u.id !== id));
  };

  const danhSachLoc = danhSach.filter(
    (item) =>
      item.tenDangNhap.toLowerCase().includes(tuKhoa.toLowerCase()) ||
      item.hoTen.toLowerCase().includes(tuKhoa.toLowerCase()) ||
      item.vaiTro.toLowerCase().includes(tuKhoa.toLowerCase())
  );

  return (
    <div className="nd-wrapper">
      <div className="nd-body">
        <div className="nd-title-bar">
          <h2>Người dùng</h2>
          <button className="nd-btn-add" onClick={moThem}>
            + Thêm người dùng
          </button>
        </div>

        <div className="nd-table-box">
          <div className="nd-table-search">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm tên đăng nhập, họ tên, vai trò..."
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
            />
          </div>

          <table className="nd-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên đăng nhập</th>
                <th>Họ tên</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {danhSachLoc.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: 30, color: "#6b8fa3" }}>
                    Chưa có dữ liệu
                  </td>
                </tr>
              ) : (
                danhSachLoc.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.tenDangNhap}</td>
                    <td>{item.hoTen}</td>
                    <td>{item.vaiTro}</td>
                    <td>
                      <span className="nd-status">{item.trangThai}</span>
                    </td>
                    <td className="nd-actions">
                      <button className="nd-edit" onClick={() => moSua(item)}>
                        ✏️
                      </button>
                      <button
                        className="nd-delete"
                        onClick={() => xoa(item.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="nd-pagination">
            <span>
              Hiển thị {danhSachLoc.length > 0 ? 1 : 0} - {danhSachLoc.length} trong {danhSach.length} người dùng
            </span>
            <div className="nd-pages">
              <button className="nd-page-prev">‹</button>
              <button className="nd-page-active">1</button>
              <button className="nd-page-next">›</button>
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
              {dangSua ? "Sửa người dùng" : "Thêm người dùng"}
            </h3>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 600 }}>
                Tên đăng nhập *
              </label>
              <input
                type="text"
                value={form.tenDangNhap}
                onChange={(e) => setForm({ ...form, tenDangNhap: e.target.value })}
                style={{ width: "100%", padding: 8, border: "1px solid #dce7ed", borderRadius: 6 }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 600 }}>
                Họ tên *
              </label>
              <input
                type="text"
                value={form.hoTen}
                onChange={(e) => setForm({ ...form, hoTen: e.target.value })}
                style={{ width: "100%", padding: 8, border: "1px solid #dce7ed", borderRadius: 6 }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 600 }}>
                Vai trò
              </label>
              <select
                value={form.vaiTro}
                onChange={(e) => setForm({ ...form, vaiTro: e.target.value })}
                style={{ width: "100%", padding: 8, border: "1px solid #dce7ed", borderRadius: 6 }}
              >
                <option>Admin</option>
                <option>Ban quản lý</option>
                <option>Bảo vệ</option>
                <option>Cư dân</option>
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 600 }}>
                Trạng thái
              </label>
              <select
                value={form.trangThai}
                onChange={(e) => setForm({ ...form, trangThai: e.target.value })}
                style={{ width: "100%", padding: 8, border: "1px solid #dce7ed", borderRadius: 6 }}
              >
                <option>Hoạt động</option>
                <option>Ngừng hoạt động</option>
              </select>
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

export default QLyUser;
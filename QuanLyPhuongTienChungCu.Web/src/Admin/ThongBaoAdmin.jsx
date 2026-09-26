import React, { useState, useEffect } from "react";
import "./ThongBaoAdmin.css";

const API_URL = "http://localhost:5022/api";

const ThongBaoAdmin = () => {
  const [danhSach, setDanhSach] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loi, setLoi] = useState("");

  const [hienModal, setHienModal] = useState(false);
  const [form, setForm] = useState({
    tieuDe: "",
    noiDung: "",
    doiTuong: "TatCa",
  });
  const [dangGui, setDangGui] = useState(false);

  const layToken = () => localStorage.getItem("token");

  const taoHeaders = (coBody = false) => {
    const token = layToken();
    const headers = { Accept: "application/json" };
    if (coBody) headers["Content-Type"] = "application/json";
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

  const taiDanhSach = async () => {
    try {
      setLoading(true);
      setLoi("");

      const response = await fetch(`${API_URL}/ThongBao`, {
        headers: taoHeaders(),
      });

      if (!response.ok) throw new Error(await layNoiDungLoi(response));

      const data = await response.json();
      setDanhSach(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi tải thông báo:", error);
      setLoi(error.message || "Không thể tải danh sách thông báo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    taiDanhSach();
  }, []);

  const moModal = () => {
    setForm({ tieuDe: "", noiDung: "", doiTuong: "TatCa" });
    setHienModal(true);
  };

  const guiThongBao = async () => {
    if (dangGui) return;

    if (!form.tieuDe.trim()) {
      alert("Vui lòng nhập tiêu đề.");
      return;
    }

    if (!form.noiDung.trim()) {
      alert("Vui lòng nhập nội dung.");
      return;
    }

    try {
      setDangGui(true);

      const response = await fetch(`${API_URL}/ThongBao`, {
        method: "POST",
        headers: taoHeaders(true),
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error(await layNoiDungLoi(response));

      alert("Gửi thông báo thành công!");
      setHienModal(false);
      taiDanhSach();
    } catch (error) {
      console.error("Lỗi gửi thông báo:", error);
      alert(error.message || "Không thể gửi thông báo.");
    } finally {
      setDangGui(false);
    }
  };

  const xoaThongBao = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa thông báo này?")) return;

    try {
      const response = await fetch(`${API_URL}/ThongBao/${id}`, {
        method: "DELETE",
        headers: taoHeaders(),
      });

      if (!response.ok) throw new Error(await layNoiDungLoi(response));

      alert("Đã xóa thông báo.");
      taiDanhSach();
    } catch (error) {
      console.error("Lỗi xóa:", error);
      alert(error.message || "Không thể xóa thông báo.");
    }
  };

  const hienThiDoiTuong = (dt) => {
    if (dt === "TatCa") return "Tất cả";
    if (dt === "CuDan") return "Cư dân";
    if (dt === "NhanVien") return "Nhân viên";
    return dt;
  };

  return (
    <div className="tb-wrapper">
      <div className="tb-body">
        <div className="tb-title-bar">
          <div>
            <h1>Quản lý thông báo</h1>
            <p className="tb-subtitle">Gửi thông báo đến cư dân và nhân viên</p>
          </div>
          <button className="tb-btn-add" onClick={moModal}>
            + Gửi thông báo mới
          </button>
        </div>

        {loi && (
          <div className="tb-error">
            ⚠️ {loi}
          </div>
        )}

        <div className="tb-table-box">
          {loading ? (
            <div className="tb-loading">Đang tải dữ liệu...</div>
          ) : (
            <table className="tb-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tiêu đề</th>
                  <th>Đối tượng</th>
                  <th>Ngày gửi</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {danhSach.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="tb-empty">
                      Chưa có thông báo nào
                    </td>
                  </tr>
                ) : (
                  danhSach.map((tb, i) => (
                    <tr key={tb.thongBaoId}>
                      <td>{i + 1}</td>
                      <td>
                        <div className="tb-tieu-de">{tb.tieuDe}</div>
                        <div className="tb-noi-dung">{tb.noiDung}</div>
                      </td>
                      <td>
                        <span
                          className={`tb-doi-tuong ${
                            tb.doiTuong === "TatCa"
                              ? "tb-dt-tatca"
                              : tb.doiTuong === "CuDan"
                              ? "tb-dt-cudan"
                              : "tb-dt-nhanvien"
                          }`}
                        >
                          {hienThiDoiTuong(tb.doiTuong)}
                        </span>
                      </td>
                      <td>{tb.ngayGui}</td>
                      <td>
                        <button
                          className="tb-btn-delete"
                          onClick={() => xoaThongBao(tb.thongBaoId)}
                        >
                          🗑 Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL GỬI THÔNG BÁO */}
      {hienModal && (
        <div className="tb-modal-overlay" onClick={() => setHienModal(false)}>
          <div className="tb-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="tb-modal-title">Gửi thông báo mới</h3>

            <div className="tb-field">
              <label>Tiêu đề</label>
              <input
                type="text"
                value={form.tieuDe}
                onChange={(e) => setForm({ ...form, tieuDe: e.target.value })}
                placeholder="VD: Thông báo bảo trì thang máy"
              />
            </div>

            <div className="tb-field">
              <label>Nội dung</label>
              <textarea
                rows="5"
                value={form.noiDung}
                onChange={(e) => setForm({ ...form, noiDung: e.target.value })}
                placeholder="Nhập nội dung thông báo..."
              />
            </div>

            <div className="tb-field">
              <label>Đối tượng nhận</label>
              <select
                value={form.doiTuong}
                onChange={(e) => setForm({ ...form, doiTuong: e.target.value })}
              >
                <option value="TatCa">Tất cả</option>
                <option value="CuDan">Cư dân</option>
                <option value="NhanVien">Nhân viên</option>
              </select>
            </div>

            <div className="tb-modal-actions">
              <button
                className="tb-btn-cancel"
                onClick={() => setHienModal(false)}
                disabled={dangGui}
              >
                Hủy
              </button>
              <button
                className="tb-btn-save"
                onClick={guiThongBao}
                disabled={dangGui}
              >
                {dangGui ? "Đang gửi..." : "Gửi thông báo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThongBaoAdmin;
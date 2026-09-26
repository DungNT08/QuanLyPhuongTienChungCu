import React, { useEffect, useMemo, useState } from "react";
import "./QLyUser.css";

const API_URL = "http://localhost:5022/api";

const FORM_MAC_DINH = {
  tenDangNhap: "",
  hoTen: "",
  email: "",
  matKhau: "",
  soDienThoai: "",
  cccd: "",
  roleId: "",
  trangThai: "ACTIVE",
};

const QLyUser = () => {
  // ================= STATE =================
  const [tuKhoa, setTuKhoa] = useState("");
  const [danhSach, setDanhSach] = useState([]);
  const [danhSachRole, setDanhSachRole] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState("");
  const [loiField, setLoiField] = useState({});

  const [hienThiModal, setHienThiModal] = useState(false);
  const [dangSua, setDangSua] = useState(null);
  const [form, setForm] = useState(FORM_MAC_DINH);

  // ================= TOKEN =================
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
        if (typeof data === "string") return data;
        if (data.errors) {
          const messages = [];
          Object.values(data.errors).forEach((v) => {
            if (Array.isArray(v)) messages.push(...v);
          });
          if (messages.length > 0) return messages.join(", ");
        }
        return data.message || data.title || data.error || `HTTP ${response.status}`;
      } catch {
        return text;
      }
    } catch {
      return `HTTP ${response.status}`;
    }
  };

  // ================= LOAD USER =================
  const taiDanhSach = async () => {
    try {
      setLoading(true);
      setLoi("");
      const response = await fetch(`${API_URL}/User`, {
        method: "GET",
        headers: taoHeaders(),
      });
      if (!response.ok) throw new Error(await layNoiDungLoi(response));
      const data = await response.json();
      setDanhSach(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi tải người dùng:", error);
      setLoi(error.message || "Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  };

  // ================= LOAD ROLE =================
  const taiDanhSachRole = async () => {
    try {
      const response = await fetch(`${API_URL}/User/roles`, {
        method: "GET",
        headers: taoHeaders(),
      });
      if (!response.ok) throw new Error(await layNoiDungLoi(response));
      const data = await response.json();
      setDanhSachRole(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi tải role:", error);
      setDanhSachRole([]);
    }
  };

  useEffect(() => {
    taiDanhSach();
    taiDanhSachRole();
  }, []);

  // ================= TÌM KIẾM =================
  const danhSachLoc = useMemo(() => {
    const kw = tuKhoa.trim().toLowerCase();
    if (!kw) return danhSach;
    return danhSach.filter(
      (u) =>
        String(u.tenDangNhap || "").toLowerCase().includes(kw) ||
        String(u.hoTen || "").toLowerCase().includes(kw) ||
        String(u.tenRole || "").toLowerCase().includes(kw) ||
        String(u.email || "").toLowerCase().includes(kw) ||
        String(u.soDienThoai || "").toLowerCase().includes(kw) ||
        String(u.cccd || "").toLowerCase().includes(kw)
    );
  }, [danhSach, tuKhoa]);

  // ================= VALIDATE =================
  const kiemTraForm = () => {
    const loiMoi = {};

    // Tên đăng nhập
    const tdn = form.tenDangNhap.trim();
    if (!tdn) {
      loiMoi.tenDangNhap = "Vui lòng nhập tên đăng nhập.";
    } else if (tdn.length < 3) {
      loiMoi.tenDangNhap = "Tên đăng nhập phải có ít nhất 3 ký tự.";
    } else if (!/^[a-zA-Z0-9_]+$/.test(tdn)) {
      loiMoi.tenDangNhap =
        "Tên đăng nhập chỉ được chứa chữ, số và dấu gạch dưới.";
    }

    // Họ tên
    const ht = form.hoTen.trim();
    if (!ht) {
      loiMoi.hoTen = "Vui lòng nhập họ tên.";
    } else if (ht.length < 2) {
      loiMoi.hoTen = "Họ tên phải có ít nhất 2 ký tự.";
    } else if (ht.length > 100) {
      loiMoi.hoTen = "Họ tên không được vượt quá 100 ký tự.";
    }

    // Email
    const email = form.email.trim();
    if (!email) {
      loiMoi.email = "Vui lòng nhập email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      loiMoi.email = "Email không đúng định dạng.";
    }

    // Mật khẩu (chỉ khi thêm mới)
    if (!dangSua) {
      if (!form.matKhau) {
        loiMoi.matKhau = "Vui lòng nhập mật khẩu.";
      } else if (form.matKhau.length < 6) {
        loiMoi.matKhau = "Mật khẩu phải có ít nhất 6 ký tự.";
      }
    }

    // SĐT
    const sdt = form.soDienThoai.trim();
    if (!sdt) {
      loiMoi.soDienThoai = "Vui lòng nhập số điện thoại.";
    } else if (!/^0\d{9}$/.test(sdt)) {
      loiMoi.soDienThoai =
        "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.";
    }

    // CCCD
    const cccd = form.cccd.trim();
    if (!cccd) {
      loiMoi.cccd = "Vui lòng nhập CCCD.";
    } else if (!/^\d{12}$/.test(cccd)) {
      loiMoi.cccd = "CCCD phải gồm đúng 12 chữ số.";
    }

    // Vai trò
    if (!form.roleId) {
      loiMoi.roleId = "Vui lòng chọn vai trò.";
    }

    // Trạng thái
    if (!form.trangThai) {
      loiMoi.trangThai = "Vui lòng chọn trạng thái.";
    }

    setLoiField(loiMoi);
    return Object.keys(loiMoi).length === 0;
  };

  // ================= MODAL =================
  const moThem = () => {
    setDangSua(null);
    setForm({ ...FORM_MAC_DINH });
    setLoi("");
    setLoiField({});
    setHienThiModal(true);
  };

  const moSua = (item) => {
    setDangSua(item);
    setForm({
      tenDangNhap: item.tenDangNhap || "",
      hoTen: item.hoTen || "",
      email: item.email || "",
      matKhau: "",
      soDienThoai: item.soDienThoai || "",
      cccd: item.cccd || "",
      roleId: item.roleId || "",
      trangThai: item.trangThai || "ACTIVE",
    });
    setLoi("");
    setLoiField({});
    setHienThiModal(true);
  };

  const dongModal = () => {
    if (dangLuu) return;
    setHienThiModal(false);
    setDangSua(null);
    setForm({ ...FORM_MAC_DINH });
    setLoi("");
    setLoiField({});
  };

  // ================= LƯU =================
  const luu = async () => {
    if (dangLuu) return;
    setLoi("");

    if (!kiemTraForm()) {
      setLoi("Vui lòng kiểm tra lại các trường báo đỏ.");
      return;
    }

    try {
      setDangLuu(true);

      const body = {
        ...(dangSua ? { userId: dangSua.userId } : {}),
        hoTen: form.hoTen.trim(),
        tenDangNhap: form.tenDangNhap.trim(),
        email: form.email.trim(),
        soDienThoai: form.soDienThoai.trim(),
        cccd: form.cccd.trim(),
        roleId: Number(form.roleId),
        trangThai: form.trangThai,
        ...(dangSua ? {} : { matKhau: form.matKhau }),
      };

      const url = dangSua
        ? `${API_URL}/User/${dangSua.userId}`
        : `${API_URL}/User`;

      const method = dangSua ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: taoHeaders(true),
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error(await layNoiDungLoi(response));

      const laSua = Boolean(dangSua);
      dongModal();
      await taiDanhSach();
      alert(laSua ? "Cập nhật người dùng thành công." : "Thêm người dùng thành công.");
    } catch (error) {
      console.error("Lỗi lưu:", error);
      setLoi(error.message || "Không thể lưu người dùng.");
    } finally {
      setDangLuu(false);
    }
  };

  // ================= XÓA =================
  const xoa = async (item) => {
    const dongY = window.confirm(
      `Bạn chắc chắn muốn xóa người dùng "${item.hoTen}"?`
    );
    if (!dongY) return;

    try {
      setLoi("");
      const response = await fetch(`${API_URL}/User/${item.userId}`, {
        method: "DELETE",
        headers: taoHeaders(),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }
      await taiDanhSach();
      alert(data.message || "Xóa người dùng thành công.");
    } catch (error) {
      console.error("Lỗi xóa người dùng:", error);
      setLoi(error.message || "Không thể xóa người dùng.");
    }
  };

  // ================= FORMAT =================
  const hienThiTrangThai = (tt) =>
    String(tt).toUpperCase() === "ACTIVE" ? "Hoạt động" : "Ngừng hoạt động";

  const hienThiTenRole = (tenRole) => {
    const mapRole = {
      admin: "Quản trị viên",
      baove: "Bảo vệ",
      cudan: "Cư dân",
      ketoan: "Kế toán",
      nhanvien: "Nhân viên",
    };

    return mapRole[String(tenRole || "").toLowerCase()] || tenRole;
  };

  const hienThiRole = (roleId, tenRole) => {
    if (tenRole) return hienThiTenRole(tenRole);
    const r = danhSachRole.find((x) => Number(x.roleId) === Number(roleId));
    return r ? hienThiTenRole(r.tenRole) : `Role ${roleId}`;
  };

  const inputClass = (tenTruong) =>
    loiField[tenTruong] ? "nd-input-error" : "";

  // ================= RENDER =================
  return (
    <div className="nd-wrapper">
      <div className="nd-body">
        <div className="nd-title-bar">
          <div>
            <h2>Người dùng</h2>
            <p className="nd-subtitle">Quản lý tài khoản nhân viên</p>
          </div>

          <button className="nd-btn-add" onClick={moThem}>
            <span>＋</span>
            Thêm người dùng
          </button>
        </div>

        {loi && !hienThiModal && <div className="nd-error">⚠️ {loi}</div>}

        <div className="nd-table-box">
          <div className="nd-table-toolbar">
            <div className="nd-search">
              <span className="nd-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Tìm kiếm tên đăng nhập, họ tên, vai trò..."
                value={tuKhoa}
                onChange={(e) => setTuKhoa(e.target.value)}
              />
              {tuKhoa && (
                <button
                  type="button"
                  className="nd-search-clear"
                  onClick={() => setTuKhoa("")}
                >
                  ×
                </button>
              )}
            </div>

            <div className="nd-total">{danhSachLoc.length} người dùng</div>
          </div>

          <div className="nd-table-scroll">
            <table className="nd-table">
              <thead>
                <tr>
                  <th className="nd-col-stt">STT</th>
                  <th>Tên đăng nhập</th>
                  <th>Họ tên</th>
                  <th>E-mail</th>
                  <th>SĐT</th>
                  <th>CCCD</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th className="nd-col-action">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="nd-empty">
                      <div className="nd-loading">
                        <span className="nd-spinner" />
                        Đang tải dữ liệu...
                      </div>
                    </td>
                  </tr>
                ) : danhSachLoc.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="nd-empty">
                      <div className="nd-empty-icon">👤</div>
                      <div>
                        {tuKhoa ? "Không tìm thấy người dùng." : "Chưa có dữ liệu"}
                      </div>
                    </td>
                  </tr>
                ) : (
                  danhSachLoc.map((item, index) => (
                    <tr key={item.userId}>
                      <td>{index + 1}</td>
                      <td>{item.tenDangNhap}</td>
                      <td>{item.hoTen}</td>
                      <td>{item.email}</td>
                      <td>{item.soDienThoai || "—"}</td>
                      <td>{item.cccd || "—"}</td>
                      <td>
                        <span className="nd-role">
                          {hienThiRole(item.roleId, item.tenRole)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={
                            String(item.trangThai).toUpperCase() === "ACTIVE"
                              ? "nd-status nd-status-active"
                              : "nd-status nd-status-inactive"
                          }
                        >
                          <span className="nd-status-dot" />
                          {hienThiTrangThai(item.trangThai)}
                        </span>
                      </td>
                      <td>
                        <div className="nd-actions">
                          <button
                            type="button"
                            className="nd-action-edit"
                            title="Sửa"
                            onClick={() => moSua(item)}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="nd-action-delete"
                            title="Xóa"
                            onClick={() => xoa(item)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="nd-pagination">
            <span>
              Hiển thị <strong>{danhSachLoc.length > 0 ? 1 : 0}</strong> -{" "}
              <strong>{danhSachLoc.length}</strong> trong{" "}
              <strong>{danhSach.length}</strong> người dùng
            </span>
            <div className="nd-pages">
              <button className="nd-page-prev">‹</button>
              <button className="nd-page-active">1</button>
              <button className="nd-page-next">›</button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {hienThiModal && (
        <div
          className="nd-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) dongModal();
          }}
        >
          <div className="nd-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="nd-modal-header">
              <div>
                <h3>{dangSua ? "Sửa người dùng" : "Thêm người dùng"}</h3>
                <p>
                  {dangSua
                    ? "Chỉnh sửa thông tin tài khoản"
                    : "Nhập thông tin tài khoản bên dưới"}
                </p>
              </div>
              <button
                type="button"
                className="nd-close"
                onClick={dongModal}
                disabled={dangLuu}
              >
                ×
              </button>
            </div>

            <div className="nd-modal-body">
              {loi && <div className="nd-modal-error">⚠️ {loi}</div>}

              {/* TÊN ĐĂNG NHẬP */}
              <div className="nd-form-group">
                <label>
                  Tên đăng nhập <span>*</span>
                </label>
                <input
                  type="text"
                  value={form.tenDangNhap}
                  onChange={(e) => {
                    setForm({ ...form, tenDangNhap: e.target.value });
                    if (loiField.tenDangNhap)
                      setLoiField({ ...loiField, tenDangNhap: "" });
                  }}
                  disabled={dangLuu || Boolean(dangSua)}
                  className={inputClass("tenDangNhap")}
                />
                {loiField.tenDangNhap && (
                  <div className="nd-field-error">⚠️ {loiField.tenDangNhap}</div>
                )}
              </div>

              {/* HỌ TÊN */}
              <div className="nd-form-group">
                <label>
                  Họ tên <span>*</span>
                </label>
                <input
                  type="text"
                  value={form.hoTen}
                  onChange={(e) => {
                    setForm({ ...form, hoTen: e.target.value });
                    if (loiField.hoTen) setLoiField({ ...loiField, hoTen: "" });
                  }}
                  disabled={dangLuu}
                  className={inputClass("hoTen")}
                />
                {loiField.hoTen && (
                  <div className="nd-field-error">⚠️ {loiField.hoTen}</div>
                )}
              </div>

              {/* EMAIL */}
              <div className="nd-form-group">
                <label>
                  E-mail <span>*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    if (loiField.email) setLoiField({ ...loiField, email: "" });
                  }}
                  disabled={dangLuu}
                  className={inputClass("email")}
                />
                {loiField.email && (
                  <div className="nd-field-error">⚠️ {loiField.email}</div>
                )}
              </div>

              {/* SĐT */}
              <div className="nd-form-group">
                <label>
                  Số điện thoại <span>*</span>
                </label>
                <input
                  type="text"
                  value={form.soDienThoai}
                  onChange={(e) => {
                    setForm({ ...form, soDienThoai: e.target.value });
                    if (loiField.soDienThoai)
                      setLoiField({ ...loiField, soDienThoai: "" });
                  }}
                  disabled={dangLuu}
                  placeholder="Ví dụ: 0912345678"
                  className={inputClass("soDienThoai")}
                />
                {loiField.soDienThoai && (
                  <div className="nd-field-error">
                    ⚠️ {loiField.soDienThoai}
                  </div>
                )}
              </div>

              {/* CCCD */}
              <div className="nd-form-group">
                <label>
                  CCCD <span>*</span>
                </label>
                <input
                  type="text"
                  value={form.cccd}
                  onChange={(e) => {
                    setForm({ ...form, cccd: e.target.value });
                    if (loiField.cccd) setLoiField({ ...loiField, cccd: "" });
                  }}
                  disabled={dangLuu}
                  placeholder="Ví dụ: 001234567890"
                  className={inputClass("cccd")}
                />
                {loiField.cccd && (
                  <div className="nd-field-error">⚠️ {loiField.cccd}</div>
                )}
              </div>

              {/* MẬT KHẨU */}
              {!dangSua && (
                <div className="nd-form-group">
                  <label>
                    Mật khẩu <span>*</span>
                  </label>
                  <input
                    type="password"
                    value={form.matKhau}
                    onChange={(e) => {
                      setForm({ ...form, matKhau: e.target.value });
                      if (loiField.matKhau)
                        setLoiField({ ...loiField, matKhau: "" });
                    }}
                    disabled={dangLuu}
                    placeholder="Ít nhất 6 ký tự"
                    className={inputClass("matKhau")}
                  />
                  {loiField.matKhau && (
                    <div className="nd-field-error">
                      ⚠️ {loiField.matKhau}
                    </div>
                  )}
                </div>
              )}

              {/* VAI TRÒ */}
              <div className="nd-form-group">
                <label>
                  Vai trò <span>*</span>
                </label>
                <select
                  value={form.roleId}
                  onChange={(e) => {
                    setForm({ ...form, roleId: e.target.value });
                    if (loiField.roleId)
                      setLoiField({ ...loiField, roleId: "" });
                  }}
                  disabled={dangLuu}
                  className={inputClass("roleId")}
                >
                  <option value="">-- Chọn vai trò --</option>
                  {danhSachRole.map((r) => (
                    <option key={r.roleId} value={r.roleId}>
                      {hienThiTenRole(r.tenRole)}
                    </option>
                  ))}
                </select>
                {loiField.roleId && (
                  <div className="nd-field-error">⚠️ {loiField.roleId}</div>
                )}
              </div>

              {/* TRẠNG THÁI */}
              <div className="nd-form-group">
                <label>
                  Trạng thái <span>*</span>
                </label>
                <select
                  value={form.trangThai}
                  onChange={(e) => {
                    setForm({ ...form, trangThai: e.target.value });
                    if (loiField.trangThai)
                      setLoiField({ ...loiField, trangThai: "" });
                  }}
                  disabled={dangLuu}
                  className={inputClass("trangThai")}
                >
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Ngừng hoạt động</option>
                </select>
                {loiField.trangThai && (
                  <div className="nd-field-error">
                    ⚠️ {loiField.trangThai}
                  </div>
                )}
              </div>
            </div>

            <div className="nd-modal-footer">
              <button
                type="button"
                className="nd-btn-cancel"
                onClick={dongModal}
                disabled={dangLuu}
              >
                Hủy
              </button>
              <button
                type="button"
                className="nd-btn-save"
                onClick={luu}
                disabled={dangLuu}
              >
                {dangLuu ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QLyUser;

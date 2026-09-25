import React, { useEffect, useRef, useState } from "react";
import "./HoSoAdmin.css";

const API_URL = "http://localhost:5022/api";

const HoSoAdmin = () => {
  // =====================================================
  // STATE
  // =====================================================

  const [hoSo, setHoSo] = useState({
    hoTen: "",
    vaiTro: "",
    maAdmin: "",
    soDienThoai: "",
    email: "",
    cccd: "",
    anhDaiDien: "",
    userId: null,
  });

  const [loading, setLoading] = useState(true);
  const [loi, setLoi] = useState("");

  const [hienModal, setHienModal] = useState(false);
  const [formSua, setFormSua] = useState({ ...hoSo });
  const [dangLuu, setDangLuu] = useState(false);

  // Modal đổi mật khẩu
  const [hienModalMatKhau, setHienModalMatKhau] = useState(false);
  const [formMatKhau, setFormMatKhau] = useState({
    matKhauCu: "",
    matKhauMoi: "",
    xacNhanMatKhau: "",
  });
  const [loiMatKhau, setLoiMatKhau] = useState("");
  const [dangDoiMatKhau, setDangDoiMatKhau] = useState(false);

  const fileInputRef = useRef(null);

  // =====================================================
  // TOKEN
  // =====================================================

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
          Object.values(data.errors).forEach((value) => {
            if (Array.isArray(value)) messages.push(...value);
          });
          if (messages.length > 0) return messages.join(", ");
        }
        return (
          data.message || data.title || data.error || `HTTP ${response.status}`
        );
      } catch {
        return text;
      }
    } catch {
      return `HTTP ${response.status}`;
    }
  };

  // =====================================================
  // LOAD HỒ SƠ
  // =====================================================

  const taiHoSo = async () => {
    try {
      setLoading(true);
      setLoi("");

      const response = await fetch(`${API_URL}/User/me`, {
        method: "GET",
        headers: taoHeaders(),
      });

      if (!response.ok) {
        throw new Error(await layNoiDungLoi(response));
      }

      const data = await response.json();

      setHoSo({
        hoTen: data.hoTen ?? "",
        vaiTro: data.tenRole ?? data.vaiTro ?? "Admin",
        maAdmin: data.userId ?? "",
        soDienThoai: data.soDienThoai ?? "",
        email: data.email ?? "",
        cccd: data.cccd ?? "",
        anhDaiDien: data.anhDaiDien ?? "",
        userId: data.userId ?? null,
      });
    } catch (error) {
      console.error("Lỗi tải hồ sơ:", error);
      setLoi(error.message || "Không thể tải thông tin hồ sơ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    taiHoSo();
  }, []);

  // =====================================================
  // CHỌN ẢNH
  // =====================================================

  const moChonAnh = () => {
    fileInputRef.current?.click();
  };

  const xuLyChonAnh = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file ảnh (JPG, PNG...)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ảnh không được vượt quá 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setHoSo((prev) => ({ ...prev, anhDaiDien: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  // =====================================================
  // MỞ MODAL CHỈNH SỬA
  // =====================================================

  const moChinhSua = () => {
    setFormSua({ ...hoSo });
    setHienModal(true);
  };

  // =====================================================
  // LƯU CHỈNH SỬA
  // =====================================================

  const luuChinhSua = async () => {
    if (dangLuu) return;

    try {
      setDangLuu(true);

      const body = {
        hoTen: formSua.hoTen,
        soDienThoai: formSua.soDienThoai,
        email: formSua.email,
        cccd: formSua.cccd,
      };

      const response = await fetch(`${API_URL}/User/me`, {
        method: "PUT",
        headers: taoHeaders(true),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(await layNoiDungLoi(response));
      }

      setHoSo({ ...formSua });
      setHienModal(false);
      alert("Đã lưu thông tin!");
    } catch (error) {
      console.error("Lỗi lưu hồ sơ:", error);
      alert(error.message || "Không thể lưu thông tin hồ sơ.");
    } finally {
      setDangLuu(false);
    }
  };

  // =====================================================
  // ĐỔI MẬT KHẨU
  // =====================================================

  const moDoiMatKhau = () => {
    setFormMatKhau({
      matKhauCu: "",
      matKhauMoi: "",
      xacNhanMatKhau: "",
    });
    setLoiMatKhau("");
    setHienModalMatKhau(true);
  };

  const xuLyDoiMatKhau = async () => {
    if (dangDoiMatKhau) return;
    setLoiMatKhau("");

    if (!formMatKhau.matKhauCu) {
      setLoiMatKhau("Vui lòng nhập mật khẩu cũ.");
      return;
    }

    if (!formMatKhau.matKhauMoi) {
      setLoiMatKhau("Vui lòng nhập mật khẩu mới.");
      return;
    }

    if (formMatKhau.matKhauMoi.length < 6) {
      setLoiMatKhau("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (formMatKhau.matKhauMoi !== formMatKhau.xacNhanMatKhau) {
      setLoiMatKhau("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setDangDoiMatKhau(true);

      const response = await fetch(
        `${API_URL}/User/${hoSo.userId}/doi-mat-khau`,
        {
          method: "PUT",
          headers: taoHeaders(true),
          body: JSON.stringify({
            matKhauCu: formMatKhau.matKhauCu,
            matKhauMoi: formMatKhau.matKhauMoi,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(await layNoiDungLoi(response));
      }

      alert("Đổi mật khẩu thành công!");
      setHienModalMatKhau(false);
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      setLoiMatKhau(error.message || "Không thể đổi mật khẩu.");
    } finally {
      setDangDoiMatKhau(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  if (loading) {
    return (
      <div className="hs-wrapper">
        <div className="hs-body">
          <div className="hs-title-bar">
            <h1>Hồ sơ cá nhân</h1>
          </div>
          <div className="hs-card" style={{ textAlign: "center", padding: 40 }}>
            Đang tải thông tin...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hs-wrapper">
      <div className="hs-body">
        <div className="hs-title-bar">
          <h1>Hồ sơ cá nhân</h1>
        </div>

        {loi && (
          <div
            className="hs-card"
            style={{
              color: "#b91c1c",
              background: "#fff1f2",
              border: "1px solid #fecaca",
              marginBottom: 20,
            }}
          >
            ⚠️ {loi}
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={xuLyChonAnh}
          style={{ display: "none" }}
        />

        <div className="hs-grid">
          {/* CỘT TRÁI */}
          <div className="hs-card hs-card-left">
            <div
              className="hs-avatar-wrap"
              onClick={moChonAnh}
              title="Click để đổi ảnh"
            >
              <div className="hs-avatar">
                {hoSo.anhDaiDien ? (
                  <img
                    src={hoSo.anhDaiDien}
                    alt="avatar"
                    className="hs-avatar-img"
                  />
                ) : (
                  <div className="hs-avatar-icon">👤</div>
                )}
              </div>
              <div className="hs-avatar-camera">📷</div>
            </div>

            <h2 className="hs-name">{hoSo.hoTen || "Chưa có tên"}</h2>
            <p className="hs-role">{hoSo.vaiTro || "Admin"}</p>

            <div className="hs-info-mini">
              <div className="hs-info-mini-row">
                <span className="hs-info-mini-label">Mã Admin:</span>
                <span className="hs-info-mini-value">{hoSo.maAdmin || "—"}</span>
              </div>
              <div className="hs-info-mini-row">
                <span className="hs-info-mini-label">CCCD:</span>
                <span className="hs-info-mini-value">{hoSo.cccd || "—"}</span>
              </div>
            </div>

            <button className="hs-btn-edit" onClick={moChinhSua}>
              ✏️ Chỉnh sửa
            </button>
          </div>

          {/* CỘT PHẢI */}
          <div className="hs-card hs-card-right">
            <h3 className="hs-card-title">Thông tin liên hệ</h3>

            <div className="hs-field">
              <label>Số điện thoại</label>
              <span>{hoSo.soDienThoai || "Chưa cập nhật"}</span>
            </div>

            <div className="hs-field">
              <label>Email</label>
              <span>{hoSo.email || "Chưa cập nhật"}</span>
            </div>
          </div>
        </div>

        {/* NÚT ĐỔI MẬT KHẨU */}
        <div className="hs-card hs-card-password">
          <button className="hs-btn-password" onClick={moDoiMatKhau}>
            <span className="hs-lock-icon">🔒</span>
            <span>Đổi mật khẩu</span>
          </button>
        </div>
      </div>

      {/* MODAL CHỈNH SỬA */}
      {hienModal && (
        <div className="hs-modal-overlay" onClick={() => setHienModal(false)}>
          <div className="hs-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="hs-modal-title">Chỉnh sửa hồ sơ</h3>

            <div className="hs-modal-field">
              <label>Họ tên</label>
              <input
                type="text"
                value={formSua.hoTen}
                onChange={(e) =>
                  setFormSua({ ...formSua, hoTen: e.target.value })
                }
              />
            </div>

            <div className="hs-modal-field">
              <label>Số điện thoại</label>
              <input
                type="text"
                value={formSua.soDienThoai}
                onChange={(e) =>
                  setFormSua({ ...formSua, soDienThoai: e.target.value })
                }
              />
            </div>

            <div className="hs-modal-field">
              <label>Email</label>
              <input
                type="email"
                value={formSua.email}
                onChange={(e) =>
                  setFormSua({ ...formSua, email: e.target.value })
                }
              />
            </div>

            <div className="hs-modal-field">
              <label>CCCD</label>
              <input
                type="text"
                value={formSua.cccd}
                onChange={(e) =>
                  setFormSua({ ...formSua, cccd: e.target.value })
                }
              />
            </div>

            <div className="hs-modal-actions">
              <button
                className="hs-btn-cancel"
                onClick={() => setHienModal(false)}
                disabled={dangLuu}
              >
                Hủy
              </button>
              <button
                className="hs-btn-save"
                onClick={luuChinhSua}
                disabled={dangLuu}
              >
                {dangLuu ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ĐỔI MẬT KHẨU */}
      {hienModalMatKhau && (
        <div
          className="hs-modal-overlay"
          onClick={() => setHienModalMatKhau(false)}
        >
          <div className="hs-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="hs-modal-title">Đổi mật khẩu</h3>

            {loiMatKhau && (
              <div
                style={{
                  marginBottom: 16,
                  padding: "10px 14px",
                  border: "1px solid #fecaca",
                  borderRadius: 8,
                  background: "#fff1f2",
                  color: "#b91c1c",
                  fontSize: 13,
                }}
              >
                ⚠️ {loiMatKhau}
              </div>
            )}

            <div className="hs-modal-field">
              <label>Mật khẩu cũ</label>
              <input
                type="password"
                value={formMatKhau.matKhauCu}
                onChange={(e) =>
                  setFormMatKhau({ ...formMatKhau, matKhauCu: e.target.value })
                }
              />
            </div>

            <div className="hs-modal-field">
              <label>Mật khẩu mới</label>
              <input
                type="password"
                value={formMatKhau.matKhauMoi}
                onChange={(e) =>
                  setFormMatKhau({ ...formMatKhau, matKhauMoi: e.target.value })
                }
              />
            </div>

            <div className="hs-modal-field">
              <label>Xác nhận mật khẩu mới</label>
              <input
                type="password"
                value={formMatKhau.xacNhanMatKhau}
                onChange={(e) =>
                  setFormMatKhau({
                    ...formMatKhau,
                    xacNhanMatKhau: e.target.value,
                  })
                }
              />
            </div>

            <div className="hs-modal-actions">
              <button
                className="hs-btn-cancel"
                onClick={() => setHienModalMatKhau(false)}
                disabled={dangDoiMatKhau}
              >
                Hủy
              </button>
              <button
                className="hs-btn-save"
                onClick={xuLyDoiMatKhau}
                disabled={dangDoiMatKhau}
              >
                {dangDoiMatKhau ? "Đang xử lý..." : "Đổi mật khẩu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HoSoAdmin;
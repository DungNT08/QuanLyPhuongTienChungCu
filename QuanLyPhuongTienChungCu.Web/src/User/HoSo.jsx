import React, { useState, useRef } from "react";
import "./HoSo.css";

const HoSo = () => {
  const [hoSo, setHoSo] = useState({
    hoTen: "",
    vaiTro: "",
    maCuDan: "",
    canHo: "",
    soDienThoai: "",
    email: "",
    diaChi: "",
    anhDaiDien: "",        // 👈 URL hoặc base64 ảnh
  });

  const [hienModal, setHienModal] = useState(false);
  const [formSua, setFormSua] = useState({ ...hoSo });

  // Ref đến input file ẩn
  const fileInputRef = useRef(null);

  // Mở hộp chọn file
  const moChonAnh = () => {
    fileInputRef.current?.click();
  };

  // Xử lý khi chọn ảnh
  const xuLyChonAnh = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra định dạng
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file ảnh (JPG, PNG...)");
      return;
    }

    // Kiểm tra kích thước (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Ảnh không được vượt quá 5MB");
      return;
    }

    // Đọc file thành base64 để hiển thị ngay
    const reader = new FileReader();
    reader.onload = (event) => {
      const anhMoi = event.target.result;
      setHoSo((prev) => ({ ...prev, anhDaiDien: anhMoi }));
      // TODO: gọi API upload ảnh lên server
    };
    reader.readAsDataURL(file);
  };

  const moChinhSua = () => {
    setFormSua({ ...hoSo });
    setHienModal(true);
  };

  const luuChinhSua = () => {
    setHoSo({ ...formSua });
    setHienModal(false);
    alert("Đã lưu thông tin!");
  };

  const doiMatKhau = () => {
    alert("Mở trang đổi mật khẩu");
  };

  return (
    <div className="hs-wrapper">
      <div className="hs-body">
        <div className="hs-title-bar">
          <h1>Hồ sơ cá nhân</h1>
        </div>

        {/* INPUT FILE ẨN */}
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
            {/* AVATAR — CLICK ĐỂ ĐỔI */}
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

              {/* Icon máy ảnh nhỏ ở góc */}
              <div className="hs-avatar-camera">📷</div>
            </div>

            <h2 className="hs-name">{hoSo.hoTen || "Chưa có tên"}</h2>
            <p className="hs-role">{hoSo.vaiTro || "Cư dân"}</p>

            <div className="hs-info-mini">
              <div className="hs-info-mini-row">
                <span className="hs-info-mini-label">Mã cư dân:</span>
                <span className="hs-info-mini-value">{hoSo.maCuDan || "—"}</span>
              </div>
              <div className="hs-info-mini-row">
                <span className="hs-info-mini-label">Căn hộ:</span>
                <span className="hs-info-mini-value">{hoSo.canHo || "—"}</span>
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

            <div className="hs-field">
              <label>Địa chỉ</label>
              <span>{hoSo.diaChi || "Chưa cập nhật"}</span>
            </div>
          </div>
        </div>

        {/* NÚT ĐỔI MẬT KHẨU */}
        <div className="hs-card hs-card-password">
          <button className="hs-btn-password" onClick={doiMatKhau}>
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
                onChange={(e) => setFormSua({ ...formSua, hoTen: e.target.value })}
              />
            </div>

            <div className="hs-modal-field">
              <label>Số điện thoại</label>
              <input
                type="text"
                value={formSua.soDienThoai}
                onChange={(e) => setFormSua({ ...formSua, soDienThoai: e.target.value })}
              />
            </div>

            <div className="hs-modal-field">
              <label>Email</label>
              <input
                type="email"
                value={formSua.email}
                onChange={(e) => setFormSua({ ...formSua, email: e.target.value })}
              />
            </div>

            <div className="hs-modal-field">
              <label>Địa chỉ</label>
              <input
                type="text"
                value={formSua.diaChi}
                onChange={(e) => setFormSua({ ...formSua, diaChi: e.target.value })}
              />
            </div>

            <div className="hs-modal-actions">
              <button className="hs-btn-cancel" onClick={() => setHienModal(false)}>
                Hủy
              </button>
              <button className="hs-btn-save" onClick={luuChinhSua}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HoSo;
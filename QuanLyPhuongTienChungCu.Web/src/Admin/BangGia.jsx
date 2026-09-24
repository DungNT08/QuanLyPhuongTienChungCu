import React, { useEffect, useMemo, useRef, useState } from "react";
import "./BangGia.css";

const API_URL = "http://localhost:5022/api";

const FORM_MAC_DINH = {
  loaiPhuongTienId: "",
  donGia: 0,
  hieuLucTu: "",
  hieuLucDen: "",
  trangThai: "ACTIVE",
};

function BangGia() {
  // =====================================================
  // STATE
  // =====================================================

  const [danhSach, setDanhSach] = useState([]);
  const [danhSachLoaiXe, setDanhSachLoaiXe] = useState([]);

  const [tuKhoa, setTuKhoa] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingLoaiXe, setLoadingLoaiXe] = useState(false);
  const [dangLuu, setDangLuu] = useState(false);

  const [loi, setLoi] = useState("");

  const [hienThiModal, setHienThiModal] = useState(false);
  const [dangSua, setDangSua] = useState(null);

  const [form, setForm] = useState(FORM_MAC_DINH);

  const modalRef = useRef(null);

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

  // =====================================================
  // XỬ LÝ LỖI API
  // =====================================================

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
          data.message ||
          data.title ||
          data.error ||
          `HTTP ${response.status}`
        );
      } catch {
        return text;
      }
    } catch {
      return `HTTP ${response.status}`;
    }
  };

  // =====================================================
  // LOAD BẢNG GIÁ
  // =====================================================

  const taiDanhSach = async () => {
    try {
      setLoading(true);
      setLoi("");

      const response = await fetch(`${API_URL}/BangGia`, {
        method: "GET",
        headers: taoHeaders(),
      });

      if (!response.ok) {
        throw new Error(await layNoiDungLoi(response));
      }

      const data = await response.json();
      setDanhSach(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi tải bảng giá:", error);
      setLoi(error.message || "Không thể tải danh sách bảng giá.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD LOẠI PHƯƠNG TIỆN
  // =====================================================

  const taiDanhSachLoaiXe = async () => {
    try {
      setLoadingLoaiXe(true);

      const response = await fetch(
        `${API_URL}/PhuongTien/loai-phuong-tien`,
        {
          method: "GET",
          headers: taoHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(await layNoiDungLoi(response));
      }

      const data = await response.json();
      setDanhSachLoaiXe(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi tải loại phương tiện:", error);
      setDanhSachLoaiXe([]);
      setLoi(error.message || "Không thể tải danh sách loại phương tiện.");
    } finally {
      setLoadingLoaiXe(false);
    }
  };

  // =====================================================
  // LOAD BAN ĐẦU
  // =====================================================

  useEffect(() => {
    taiDanhSach();
    taiDanhSachLoaiXe();
  }, []);

  // =====================================================
  // LẤY TÊN LOẠI XE
  //
  // QUAN TRỌNG: Khai báo TRƯỚC useMemo để tránh lỗi
  // "Cannot access 'layTenLoaiXe' before initialization"
  // =====================================================

  const layTenLoaiXe = (id) => {
    const loai = danhSachLoaiXe.find(
      (x) => Number(x.loaiPhuongTienId ?? x.id) === Number(id)
    );
    if (!loai) return `ID ${id}`;
    return loai.tenLoai ?? loai.ten ?? loai.name ?? `ID ${id}`;
  };

  // =====================================================
  // TÌM KIẾM
  // =====================================================

  const danhSachLoc = useMemo(() => {
    const keyword = tuKhoa.trim().toLowerCase();
    if (!keyword) return danhSach;

    return danhSach.filter((item) => {
      const tenLoai = layTenLoaiXe(item.loaiPhuongTienId);
      return (
        String(tenLoai || "").toLowerCase().includes(keyword) ||
        String(item.donGia || "").toLowerCase().includes(keyword) ||
        String(item.trangThai || "").toLowerCase().includes(keyword)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [danhSach, tuKhoa, danhSachLoaiXe]);

  // =====================================================
  // MỞ MODAL THÊM
  // =====================================================

  const moThem = () => {
    setDangSua(null);
    setForm({ ...FORM_MAC_DINH });
    setLoi("");
    setHienThiModal(true);
  };

  // =====================================================
  // MỞ MODAL SỬA
  // =====================================================

  const moSua = (item) => {
    setDangSua(item);

    setForm({
      loaiPhuongTienId:
        item.loaiPhuongTienId !== null && item.loaiPhuongTienId !== undefined
          ? String(item.loaiPhuongTienId)
          : "",
      donGia: item.donGia ?? 0,
      hieuLucTu: item.hieuLucTu ? item.hieuLucTu.split("T")[0] : "",
      hieuLucDen: item.hieuLucDen ? item.hieuLucDen.split("T")[0] : "",
      trangThai: item.trangThai || "ACTIVE",
    });

    setLoi("");
    setHienThiModal(true);
  };

  // =====================================================
  // ĐÓNG MODAL
  // =====================================================

  const dongModal = () => {
    if (dangLuu) return;

    setHienThiModal(false);
    setDangSua(null);
    setForm({ ...FORM_MAC_DINH });
    setLoi("");
  };

  // =====================================================
  // KIỂM TRA FORM
  // =====================================================

  const kiemTraForm = () => {
    setLoi("");

    if (!form.loaiPhuongTienId || Number(form.loaiPhuongTienId) <= 0) {
      setLoi("Vui lòng chọn loại phương tiện.");
      return false;
    }

    if (!form.donGia || Number(form.donGia) <= 0) {
      setLoi("Đơn giá phải lớn hơn 0.");
      return false;
    }

    return true;
  };

  // =====================================================
  // LƯU
  // =====================================================

  const luu = async () => {
    if (dangLuu) return;
    if (!kiemTraForm()) return;

    try {
      setDangLuu(true);
      setLoi("");

      const body = {
        ...(dangSua ? { bangGiaId: dangSua.bangGiaId } : {}),
        loaiPhuongTienId: Number(form.loaiPhuongTienId),
        donGia: Number(form.donGia),
        hieuLucTu: form.hieuLucTu || null,
        hieuLucDen: form.hieuLucDen || null,
        trangThai: form.trangThai,
      };

      const url = dangSua
        ? `${API_URL}/BangGia/${dangSua.bangGiaId}`
        : `${API_URL}/BangGia`;

      const method = dangSua ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: taoHeaders(true),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(await layNoiDungLoi(response));
      }

      const laSua = Boolean(dangSua);

      setHienThiModal(false);
      setDangSua(null);
      setForm({ ...FORM_MAC_DINH });
      setLoi("");

      await taiDanhSach();

      alert(
        laSua
          ? "Cập nhật bảng giá thành công."
          : "Thêm bảng giá thành công."
      );
    } catch (error) {
      console.error("Lỗi lưu bảng giá:", error);
      setLoi(error.message || "Không thể lưu bảng giá.");
    } finally {
      setDangLuu(false);
    }
  };

  // =====================================================
  // XÓA
  // =====================================================

  const xoa = async (item) => {
    const dongY = window.confirm(
      `Bạn chắc chắn muốn xóa bảng giá này?`
    );
    if (!dongY) return;

    try {
      setLoi("");

      const response = await fetch(
        `${API_URL}/BangGia/${item.bangGiaId}`,
        {
          method: "DELETE",
          headers: taoHeaders(),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP ${response.status}`
        );
      }

      await taiDanhSach();
      alert(data.message || "Xóa bảng giá thành công.");
    } catch (error) {
      console.error("Lỗi xóa bảng giá:", error);
      setLoi(error.message || "Không thể xóa bảng giá.");
    }
  };

  // =====================================================
  // FORMAT
  // =====================================================

  const formatGia = (n) =>
    Number(n || 0).toLocaleString("vi-VN") + "đ";

  const formatNgay = (d) =>
    d ? new Date(d).toLocaleDateString("vi-VN") : "—";

  const hienThiTrangThai = (trangThai) =>
    String(trangThai).toUpperCase() === "ACTIVE"
      ? "Đang hoạt động"
      : "Ngừng hoạt động";

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="bg-wrapper">
      <div className="bg-body">

        {/* HEADER */}
        <div className="bg-title-bar">
          <div>
            <h2>Bảng giá gửi xe</h2>
            <p className="bg-subtitle">
              Quản lý đơn giá theo loại phương tiện
            </p>
          </div>

          <button
            type="button"
            className="bg-btn-add"
            onClick={moThem}
          >
            <span>＋</span>
            Thêm bảng giá
          </button>
        </div>

        {/* ERROR GLOBAL */}
        {loi && !hienThiModal && (
          <div className="bg-error">⚠️ {loi}</div>
        )}

        {/* TABLE */}
        <div className="bg-table-box">

          <div className="bg-table-toolbar">
            <div className="bg-search">
              <span className="bg-search-icon">🔍</span>
              <input
                type="text"
                value={tuKhoa}
                onChange={(e) => setTuKhoa(e.target.value)}
                placeholder="Tìm kiếm loại xe, đơn giá..."
              />
              {tuKhoa && (
                <button
                  type="button"
                  className="bg-search-clear"
                  onClick={() => setTuKhoa("")}
                >
                  ×
                </button>
              )}
            </div>

            <div className="bg-total">
              {danhSachLoc.length} bảng giá
            </div>
          </div>

          <div className="bg-table-scroll">
            <table className="bg-table">
              <thead>
                <tr>
                  <th className="bg-col-stt">STT</th>
                  <th>Loại phương tiện</th>
                  <th>Đơn giá</th>
                  <th>Hiệu lực từ</th>
                  <th>Hiệu lực đến</th>
                  <th>Trạng thái</th>
                  <th className="bg-col-action">Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="bg-empty">
                      <div className="bg-loading">
                        <span className="bg-spinner" />
                        Đang tải dữ liệu...
                      </div>
                    </td>
                  </tr>
                ) : danhSachLoc.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="bg-empty">
                      <div className="bg-empty-icon">💰</div>
                      <div>
                        {tuKhoa
                          ? "Không tìm thấy bảng giá phù hợp."
                          : "Chưa có dữ liệu bảng giá."}
                      </div>
                    </td>
                  </tr>
                ) : (
                  danhSachLoc.map((item, index) => (
                    <tr key={item.bangGiaId}>
                      <td>{index + 1}</td>
                      <td>
                        <span className="bg-type">
                          {layTenLoaiXe(item.loaiPhuongTienId)}
                        </span>
                      </td>
                      <td>
                        <span className="bg-price">
                          {formatGia(item.donGia)}
                        </span>
                      </td>
                      <td>{formatNgay(item.hieuLucTu)}</td>
                      <td>{formatNgay(item.hieuLucDen)}</td>
                      <td>
                        <span
                          className={
                            String(item.trangThai).toUpperCase() === "ACTIVE"
                              ? "bg-status bg-status-active"
                              : "bg-status bg-status-inactive"
                          }
                        >
                          <span className="bg-status-dot" />
                          {hienThiTrangThai(item.trangThai)}
                        </span>
                      </td>
                      <td>
                        <div className="bg-actions">
                          <button
                            type="button"
                            className="bg-action-edit"
                            title="Sửa"
                            onClick={() => moSua(item)}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="bg-action-delete"
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

          <div className="bg-pagination">
            <span>
              Hiển thị <strong>{danhSachLoc.length > 0 ? 1 : 0}</strong> -{" "}
              <strong>{danhSachLoc.length}</strong> trong{" "}
              <strong>{danhSach.length}</strong> bảng giá
            </span>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {hienThiModal && (
        <div
          className="bg-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) dongModal();
          }}
        >
          <div
            className="bg-modal"
            ref={modalRef}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="bg-modal-header">
              <div>
                <h3>
                  {dangSua ? "Cập nhật bảng giá" : "Thêm bảng giá"}
                </h3>
                <p>
                  {dangSua
                    ? "Chỉnh sửa thông tin bảng giá"
                    : "Nhập thông tin bảng giá bên dưới"}
                </p>
              </div>

              <button
                type="button"
                className="bg-close"
                onClick={dongModal}
                disabled={dangLuu}
              >
                ×
              </button>
            </div>

            {/* BODY */}
            <div className="bg-modal-body">
              {loi && <div className="bg-modal-error">⚠️ {loi}</div>}

              {/* LOẠI XE */}
              <div className="bg-form-group">
                <label>
                  Loại phương tiện <span>*</span>
                </label>

                <div className="bg-select-wrapper">
                  <select
                    value={form.loaiPhuongTienId}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        loaiPhuongTienId: e.target.value,
                      }))
                    }
                    disabled={dangLuu || loadingLoaiXe}
                  >
                    <option value="">
                      {loadingLoaiXe
                        ? "Đang tải loại xe..."
                        : "-- Chọn loại xe --"}
                    </option>

                    {danhSachLoaiXe.map((item) => {
                      const id = item.loaiPhuongTienId ?? item.id;
                      const ten =
                        item.tenLoai ?? item.ten ?? item.name;
                      return (
                        <option key={id} value={id}>
                          {ten}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* ĐƠN GIÁ */}
              <div className="bg-form-group">
                <label>
                  Đơn giá (VNĐ) <span>*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.donGia}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      donGia: e.target.value,
                    }))
                  }
                  placeholder="Ví dụ: 5000"
                  disabled={dangLuu}
                />
              </div>

              {/* HIỆU LỰC TỪ */}
              <div className="bg-form-group">
                <label>Hiệu lực từ</label>
                <input
                  type="date"
                  value={form.hieuLucTu}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      hieuLucTu: e.target.value,
                    }))
                  }
                  disabled={dangLuu}
                />
              </div>

              {/* HIỆU LỰC ĐẾN */}
              <div className="bg-form-group">
                <label>Hiệu lực đến</label>
                <input
                  type="date"
                  value={form.hieuLucDen}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      hieuLucDen: e.target.value,
                    }))
                  }
                  disabled={dangLuu}
                />
              </div>

              {/* TRẠNG THÁI */}
              <div className="bg-form-group">
                <label>Trạng thái</label>

                <div className="bg-status-options">
                  <label
                    className={
                      form.trangThai === "ACTIVE"
                        ? "bg-radio active"
                        : "bg-radio"
                    }
                  >
                    <input
                      type="radio"
                      name="trangThai"
                      value="ACTIVE"
                      checked={form.trangThai === "ACTIVE"}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          trangThai: e.target.value,
                        }))
                      }
                      disabled={dangLuu}
                    />
                    <span>Đang hoạt động</span>
                  </label>

                  <label
                    className={
                      form.trangThai === "INACTIVE"
                        ? "bg-radio inactive"
                        : "bg-radio"
                    }
                  >
                    <input
                      type="radio"
                      name="trangThai"
                      value="INACTIVE"
                      checked={form.trangThai === "INACTIVE"}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          trangThai: e.target.value,
                        }))
                      }
                      disabled={dangLuu}
                    />
                    <span>Ngừng hoạt động</span>
                  </label>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="bg-modal-footer">
              <button
                type="button"
                className="bg-btn-cancel"
                onClick={dongModal}
                disabled={dangLuu}
              >
                Hủy
              </button>

              <button
                type="button"
                className="bg-btn-save"
                onClick={luu}
                disabled={dangLuu || loadingLoaiXe}
              >
                {dangLuu
                  ? "Đang lưu..."
                  : dangSua
                  ? "Lưu thay đổi"
                  : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BangGia;

import React, { useEffect, useMemo, useRef, useState } from "react";
import "./BangGia.css";

const API_URL = "http://localhost:5022/api";

const FORM_MAC_DINH = {
  loaiPhuongTienId: "",
  donGia: "",
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
      if (!response.ok) throw new Error(await layNoiDungLoi(response));
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
      const response = await fetch(`${API_URL}/PhuongTien/loai-phuong-tien`, {
        method: "GET",
        headers: taoHeaders(),
      });
      if (!response.ok) throw new Error(await layNoiDungLoi(response));
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

  useEffect(() => {
    taiDanhSach();
    taiDanhSachLoaiXe();
  }, []);

  // =====================================================
  // LẤY TÊN LOẠI XE
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
  // HELPER: LẤY NGÀY HÔM NAY (DẠNG YYYY-MM-DD)
  // =====================================================

  const layNgayHomNay = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // =====================================================
  // HELPER: LẤY NGÀY MAI (DẠNG YYYY-MM-DD)
  // Dùng để chặn ngày kết thúc phải lớn hơn ngày bắt đầu
  // =====================================================

  const layNgayMai = (ngayBatDau) => {
    const base = ngayBatDau ? new Date(ngayBatDau) : new Date();
    base.setDate(base.getDate() + 1);
    const yyyy = base.getFullYear();
    const mm = String(base.getMonth() + 1).padStart(2, "0");
    const dd = String(base.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // =====================================================
  // KIỂM TRA TÌNH TRẠNG THỜI GIAN CỦA 1 BẢNG GIÁ
  // Trả về: 'CHUA_BAT_DAU' | 'DANG_HIEU_LUC' | 'DEN_NGAY' | 'HET_HAN'
  // =====================================================

  const kiemTraTinhTrangThoiGian = (item) => {
    const homNay = new Date();
    homNay.setHours(0, 0, 0, 0);

    if (item.hieuLucTu) {
      const ngayBatDau = new Date(item.hieuLucTu);
      ngayBatDau.setHours(0, 0, 0, 0);
      if (ngayBatDau > homNay) return "CHUA_BAT_DAU";
    }

    if (item.hieuLucDen) {
      const ngayKetThuc = new Date(item.hieuLucDen);
      ngayKetThuc.setHours(0, 0, 0, 0);

      if (ngayKetThuc < homNay) return "HET_HAN";
      if (ngayKetThuc.getTime() === homNay.getTime()) return "DEN_NGAY";
    }

    return "DANG_HIEU_LUC";
  };

  // =====================================================
  // KIỂM TRA XEM 1 BẢNG GIÁ CÓ PHẢI "CHƯA HOẠT ĐỘNG" KHÔNG
  // =====================================================

  const laChuaHoatDong = (item) => {
    const tinhTrang = kiemTraTinhTrangThoiGian(item);
    if (tinhTrang === "CHUA_BAT_DAU") return true;

    const conGiaCuHoatDong = danhSach.some((khac) => {
      const cungLoaiXe =
        Number(khac.loaiPhuongTienId) === Number(item.loaiPhuongTienId);
      if (!cungLoaiXe) return false;
      if (khac.bangGiaId === item.bangGiaId) return false;

      const ngayBatDauKhac = khac.hieuLucTu
        ? new Date(khac.hieuLucTu).getTime()
        : 0;
      const ngayBatDauItem = item.hieuLucTu
        ? new Date(item.hieuLucTu).getTime()
        : 0;

      if (ngayBatDauKhac >= ngayBatDauItem) return false;

      const tinhTrangKhac = kiemTraTinhTrangThoiGian(khac);
      return tinhTrangKhac === "DANG_HIEU_LUC" || tinhTrangKhac === "DEN_NGAY";
    });

    return conGiaCuHoatDong;
  };

  // =====================================================
  // KIỂM TRA XEM BẢNG GIÁ NÀY ĐÃ CÓ GIÁ MỚI THAY THẾ CHƯA
  // =====================================================

  const daCoGiaMoiThayThe = (item) => {
    return danhSach.some((khac) => {
      const cungLoaiXe =
        Number(khac.loaiPhuongTienId) === Number(item.loaiPhuongTienId);
      if (!cungLoaiXe) return false;
      if (khac.bangGiaId === item.bangGiaId) return false;

      const ngayBatDauKhac = khac.hieuLucTu
        ? new Date(khac.hieuLucTu).getTime()
        : 0;
      const ngayBatDauItem = item.hieuLucTu
        ? new Date(item.hieuLucTu).getTime()
        : 0;

      return ngayBatDauKhac > ngayBatDauItem;
    });
  };

  // =====================================================
  // DANH SÁCH CẢNH BÁO VÀNG
  // =====================================================

  const danhSachCanhBao = useMemo(() => {
    return danhSach.filter((item) => {
      const tinhTrang = kiemTraTinhTrangThoiGian(item);
      if (tinhTrang !== "DEN_NGAY") return false;
      return !daCoGiaMoiThayThe(item);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [danhSach]);

  // =====================================================
  // LẤY NGÀY KẾT THÚC LỚN NHẤT CỦA GIÁ CŨ (CÙNG LOẠI XE)
  // =====================================================

  const layNgayKetThucLonNhatCuaGiaCu = (loaiPhuongTienId) => {
    if (!loaiPhuongTienId) return null;

    const cacGiaCu = danhSach.filter(
      (item) =>
        Number(item.loaiPhuongTienId) === Number(loaiPhuongTienId) &&
        item.hieuLucDen
    );

    if (cacGiaCu.length === 0) return null;

    const ngayLonNhat = cacGiaCu.reduce((max, item) => {
      const ngay = new Date(item.hieuLucDen).getTime();
      return ngay > max ? ngay : max;
    }, 0);

    if (ngayLonNhat === 0) return null;

    const date = new Date(ngayLonNhat);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

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
      donGia: item.donGia ?? "",
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

    if (!dangSua && !form.hieuLucTu) {
      setLoi("Vui lòng nhập ngày hiệu lực bắt đầu.");
      return false;
    }

    if (!dangSua && !form.hieuLucDen) {
      setLoi("Vui lòng nhập ngày hiệu lực kết thúc.");
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

      if (!response.ok) throw new Error(await layNoiDungLoi(response));

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
    const dongY = window.confirm(`Bạn chắc chắn muốn xóa bảng giá này?`);
    if (!dongY) return;

    try {
      setLoi("");
      const response = await fetch(`${API_URL}/BangGia/${item.bangGiaId}`, {
        method: "DELETE",
        headers: taoHeaders(),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
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

  const formatGia = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";
  const formatNgay = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "—");

  // =====================================================
  // LOGIC HIỂN THỊ TRẠNG THÁI
  // =====================================================

  const hienThiTrangThai = (item) => {
    const tinhTrang = kiemTraTinhTrangThoiGian(item);

    if (tinhTrang === "HET_HAN") {
      return { text: "Ngừng hoạt động", class: "bg-status bg-status-inactive" };
    }

    if (tinhTrang === "DEN_NGAY") {
      const coCanhBao = danhSachCanhBao.some(
        (x) => x.bangGiaId === item.bangGiaId
      );
      if (coCanhBao) {
        return { text: "Sắp hết hạn", class: "bg-status bg-status-warning" };
      }
    }

    if (laChuaHoatDong(item)) {
      return {
        text: "Chưa hoạt động",
        class: "bg-status bg-status-pending",
      };
    }

    const isActive = String(item.trangThai).toUpperCase() === "ACTIVE";
    return {
      text: isActive ? "Đang hoạt động" : "Ngừng hoạt động",
      class: isActive
        ? "bg-status bg-status-active"
        : "bg-status bg-status-inactive",
    };
  };

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
            <p className="bg-subtitle">Quản lý đơn giá theo loại phương tiện</p>
          </div>

          <button type="button" className="bg-btn-add" onClick={moThem}>
            <span>＋</span>
            Thêm bảng giá
          </button>
        </div>

        {/* THANH CẢNH BÁO VÀNG */}
        {danhSachCanhBao.length > 0 && (
          <div
            className="bg-warning-bar"
            style={{
              backgroundColor: "#fff3cd",
              color: "#856404",
              padding: "12px 16px",
              borderRadius: "6px",
              border: "1px solid #ffeeba",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ fontSize: "20px" }}>⚠️</span>
            <div>
              <strong>Cảnh báo:</strong> Có <strong>{danhSachCanhBao.length}</strong>{" "}
              bảng giá đến ngày hết hạn hôm nay. Vui lòng thêm bảng giá mới cho
              loại xe tương ứng để hệ thống tính phí chính xác!
            </div>
          </div>
        )}

        {/* ERROR GLOBAL */}
        {loi && !hienThiModal && <div className="bg-error">⚠️ {loi}</div>}

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

            <div className="bg-total">{danhSachLoc.length} bảng giá</div>
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
                  danhSachLoc.map((item, index) => {
                    const trangThaiHienThi = hienThiTrangThai(item);
                    return (
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
                          <span className={trangThaiHienThi.class}>
                            <span className="bg-status-dot" />
                            {trangThaiHienThi.text}
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
                    );
                  })
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
                <h3>{dangSua ? "Cập nhật bảng giá" : "Thêm bảng giá"}</h3>
                <p>
                  {dangSua
                    ? "Chỉ được sửa ngày hết hạn và trạng thái"
                    : "Nhập đầy đủ thông tin bảng giá bên dưới"}
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
                        // Reset ngày bắt đầu và kết thúc khi đổi loại xe
                        hieuLucTu: "",
                        hieuLucDen: "",
                      }))
                    }
                    disabled={dangLuu || loadingLoaiXe || Boolean(dangSua)}
                  >
                    <option value="">
                      {loadingLoaiXe
                        ? "Đang tải loại xe..."
                        : "-- Chọn loại xe --"}
                    </option>
                    {danhSachLoaiXe.map((item) => {
                      const id = item.loaiPhuongTienId ?? item.id;
                      const ten = item.tenLoai ?? item.ten ?? item.name;
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
                  disabled={dangLuu || Boolean(dangSua)}
                />
              </div>

              {/* HIỆU LỰC TỪ - RÀNG BUỘC 3 TẦNG */}
              <div className="bg-form-group">
                <label>
                  Hiệu lực từ <span>*</span>
                </label>
                <input
                  type="date"
                  value={form.hieuLucTu}
                  min={
                    // Tầng 1: Nếu có giá cũ cùng loại xe, ngày bắt đầu phải > ngày kết thúc lớn nhất của giá cũ
                    // Tầng 2: Nếu không có giá cũ, ngày bắt đầu phải >= ngày hôm nay
                    (() => {
                      const ngayKetThucGiaCu = layNgayKetThucLonNhatCuaGiaCu(
                        form.loaiPhuongTienId
                      );
                      if (ngayKetThucGiaCu) {
                        return layNgayMai(ngayKetThucGiaCu);
                      }
                      return layNgayHomNay();
                    })()
                  }
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      hieuLucTu: e.target.value,
                      // Reset ngày kết thúc nếu nó nhỏ hơn hoặc bằng ngày bắt đầu mới
                      hieuLucDen:
                        prev.hieuLucDen &&
                        new Date(prev.hieuLucDen) <= new Date(e.target.value)
                          ? ""
                          : prev.hieuLucDen,
                    }))
                  }
                  disabled={dangLuu || Boolean(dangSua)}
                />
                <small
                  style={{
                    color: "#dc3545",
                    marginTop: "4px",
                    display: "block",
                    fontSize: "12px",
                  }}
                >
                  {layNgayKetThucLonNhatCuaGiaCu(form.loaiPhuongTienId)
                    ? `Phải lớn hơn ngày kết thúc của giá cũ (${new Date(
                        layNgayKetThucLonNhatCuaGiaCu(form.loaiPhuongTienId)
                      ).toLocaleDateString("vi-VN")}).`
                    : "Chỉ được chọn từ ngày hôm nay trở đi."}
                </small>
              </div>

              {/* HIỆU LỰC ĐẾN - PHẢI LỚN HƠN NGÀY BẮT ĐẦU */}
              <div className="bg-form-group">
                <label>
                  Hiệu lực đến <span>*</span>
                </label>
                <input
                  type="date"
                  value={form.hieuLucDen}
                  min={
                    form.hieuLucTu
                      ? layNgayMai(form.hieuLucTu)
                      : layNgayMai(layNgayHomNay())
                  }
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      hieuLucDen: e.target.value,
                    }))
                  }
                  disabled={dangLuu}
                />
                <small
                  style={{
                    color: "#666",
                    marginTop: "4px",
                    display: "block",
                    fontSize: "12px",
                  }}
                >
                  {dangSua
                    ? "Có thể gia hạn thêm ngày kết thúc (phải lớn hơn ngày bắt đầu)."
                    : "Phải lớn hơn ngày bắt đầu."}
                </small>
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
                {dangLuu ? "Đang lưu..." : dangSua ? "Lưu thay đổi" : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BangGia;

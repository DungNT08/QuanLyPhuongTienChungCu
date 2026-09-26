import React, { useState, useEffect } from "react";
import "./ThongBao.css";

const API_URL = "http://localhost:5022/api";

const IconInfo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="#1d7fb0" strokeWidth="2" fill="none" />
    <path
      d="M12 8h.01M11 12h1v4h1"
      stroke="#1d7fb0"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconCanhBao = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2L1 21h22L12 2z"
      stroke="#d4a012"
      strokeWidth="2"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M12 9v4M12 17h.01"
      stroke="#d4a012"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const ThongBao = () => {
  const [tab, setTab] = useState("tat-ca");
  const [danhSach, setDanhSach] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loi, setLoi] = useState("");

  // ✅ State cho modal chi tiết
  const [thongBaoChon, setThongBaoChon] = useState(null);

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

  // =====================================================
  // TẢI DANH SÁCH THÔNG BÁO
  // =====================================================
  const taiThongBao = async () => {
    try {
      setLoading(true);
      setLoi("");

      let userId = null;
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const u = JSON.parse(userStr);
          userId = u.userId ?? u.UserId ?? null;
        }
      } catch (e) {
        console.warn("Không đọc được user:", e);
      }

      if (!userId) {
        throw new Error(
          "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."
        );
      }

      const response = await fetch(
        `${API_URL}/ThongBao/cua-toi/${userId}`,
        {
          method: "GET",
          headers: taoHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(await layNoiDungLoi(response));
      }

      const data = await response.json();

      const daChuyenDoi = (Array.isArray(data) ? data : []).map((tb) => ({
        id: tb.thongBaoId,
        tieuDe: tb.tieuDe,
        moTa: tb.noiDung,
        thoiGian: tb.ngayGui,
        doiTuong: tb.doiTuong,
        loai: tb.doiTuong === "CuDan" ? "canhBao" : "info",
        daDoc: tb.daDoc === true,
      }));

      setDanhSach(daChuyenDoi);
    } catch (error) {
      console.error("Lỗi tải thông báo:", error);
      setLoi(error.message || "Không thể tải danh sách thông báo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    taiThongBao();
  }, []);

  // =====================================================
  // ĐÁNH DẤU ĐÃ ĐỌC
  // =====================================================
  const danhDauDaDoc = async (id) => {
    try {
      const response = await fetch(
        `${API_URL}/ThongBao/${id}/da-doc`,
        {
          method: "POST",
          headers: taoHeaders(true),
        }
      );

      if (!response.ok) {
        throw new Error(await layNoiDungLoi(response));
      }

      setDanhSach((prev) =>
        prev.map((tb) =>
          tb.id === id ? { ...tb, daDoc: true } : tb
        )
      );
    } catch (error) {
      console.error("Lỗi đánh dấu đã đọc:", error);
    }
  };

  // =====================================================
  // CLICK VÀO THÔNG BÁO
  // - Đánh dấu đã đọc (nếu chưa)
  // - Mở modal chi tiết
  // =====================================================
  const moChiTiet = (tb) => {
    setThongBaoChon(tb);
    if (!tb.daDoc) {
      danhDauDaDoc(tb.id);
    }
  };

  // Lọc theo tab
  const danhSachLoc = danhSach.filter((tb) => {
    if (tab === "tat-ca") return true;
    if (tab === "he-thong") return tb.loai === "canhBao" || tb.loai === "info";
    if (tab === "hoa-don") return tb.loai === "thanhCong";
    return true;
  });

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
          <h1>Thông báo</h1>
        </div>

        <div className="tb-box">
          {/* TAB */}
          <div className="tb-tabs">
            <button
              className={`tb-tab ${tab === "tat-ca" ? "tb-tab-active" : ""}`}
              onClick={() => setTab("tat-ca")}
            >
              Tất cả
            </button>
            <button
              className={`tb-tab ${tab === "he-thong" ? "tb-tab-active" : ""}`}
              onClick={() => setTab("he-thong")}
            >
              Hệ thống
            </button>
            <button
              className={`tb-tab ${tab === "hoa-don" ? "tb-tab-active" : ""}`}
              onClick={() => setTab("hoa-don")}
            >
              Hóa đơn
            </button>
          </div>

          {/* DANH SÁCH */}
          <div className="tb-list">
            {loading ? (
              <div className="tb-empty">Đang tải thông báo...</div>
            ) : loi ? (
              <div className="tb-empty" style={{ color: "#b91c1c" }}>
                ⚠️ {loi}
              </div>
            ) : danhSachLoc.length === 0 ? (
              <div className="tb-empty">Chưa có thông báo</div>
            ) : (
              danhSachLoc.map((tb) => {
                const isCanhBao = tb.loai === "canhBao";
                const Icon = isCanhBao ? IconCanhBao : IconInfo;
                const bg = isCanhBao ? "#fef9e7" : "#e8f4fb";

                return (
                  <div
                    key={tb.id}
                    className={`tb-item ${tb.daDoc ? "tb-item-read" : ""}`}
                    onClick={() => moChiTiet(tb)}
                  >
                    <div className="tb-icon" style={{ background: bg }}>
                      <Icon />
                    </div>

                    <div className="tb-content">
                      <div className="tb-content-top">
                        <strong className="tb-item-title">
                          {tb.tieuDe}
                          {!tb.daDoc && (
                            <span className="tb-badge-new">Mới</span>
                          )}
                        </strong>
                        <span className="tb-item-time">{tb.thoiGian}</span>
                      </div>
                      <div className="tb-item-desc">{tb.moTa}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          MODAL CHI TIẾT THÔNG BÁO
      ===================================================== */}
      {thongBaoChon && (
        <div
          className="tb-modal-overlay"
          onClick={() => setThongBaoChon(null)}
        >
          <div
            className="tb-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="tb-modal-header">
              <div className="tb-modal-icon-wrap">
                {thongBaoChon.loai === "canhBao" ? (
                  <IconCanhBao />
                ) : (
                  <IconInfo />
                )}
              </div>

              <div className="tb-modal-header-text">
                <h3 className="tb-modal-title">
                  {thongBaoChon.tieuDe}
                </h3>
                <span className="tb-modal-time">
                  {thongBaoChon.thoiGian}
                </span>
              </div>

              <button
                className="tb-modal-close"
                onClick={() => setThongBaoChon(null)}
                title="Đóng"
              >
                ✕
              </button>
            </div>

            {/* Info row */}
            <div className="tb-modal-info">
              <div className="tb-modal-info-item">
                <span className="tb-modal-info-label">Đối tượng:</span>
                <span className="tb-modal-info-value">
                  {hienThiDoiTuong(thongBaoChon.doiTuong)}
                </span>
              </div>
              <div className="tb-modal-info-item">
                <span className="tb-modal-info-label">Trạng thái:</span>
                <span
                  className={`tb-modal-status ${
                    thongBaoChon.daDoc
                      ? "tb-modal-status-read"
                      : "tb-modal-status-new"
                  }`}
                >
                  {thongBaoChon.daDoc ? "Đã đọc" : "Chưa đọc"}
                </span>
              </div>
            </div>

            {/* Nội dung */}
            <div className="tb-modal-content">
              <div className="tb-modal-section-title">Nội dung</div>
              <p className="tb-modal-text">{thongBaoChon.moTa}</p>
            </div>

            {/* Footer */}
            <div className="tb-modal-actions">
              <button
                className="tb-modal-btn-close"
                onClick={() => setThongBaoChon(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThongBao;
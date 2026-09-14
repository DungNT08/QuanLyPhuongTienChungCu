import React, { useState } from "react";
import "./ThongBao.css";

/* Icon SVG cho từng loại thông báo */
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

const IconThanhCong = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="#1e8a70" strokeWidth="2" fill="none" />
    <path
      d="M8 12l3 3 5-6"
      stroke="#1e8a70"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconNhic = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 6l9 6 9-6M3 6v12h18V6H3z"
      stroke="#e55353"
      strokeWidth="2"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

/* Map loại → icon + màu nền */
const mapLoai = {
  canhBao:    { Icon: IconCanhBao,    bg: "#fef9e7" },
  info:       { Icon: IconInfo,       bg: "#e8f4fb" },
  thanhCong:  { Icon: IconThanhCong,  bg: "#e6f7f0" },
  nhacNho:    { Icon: IconNhic,       bg: "#fdeaea" },
};

const ThongBao = () => {
  // Tab: "tat-ca" | "he-thong" | "hoa-don" | "cap-nhat"
  const [tab, setTab] = useState("tat-ca");
  const [danhSach] = useState([]);

  // Lọc theo tab
  const danhSachLoc = danhSach.filter((tb) => {
    if (tab === "tat-ca") return true;
    if (tab === "he-thong") return tb.loai === "canhBao" || tb.loai === "nhacNho";
    if (tab === "hoa-don") return tb.loai === "thanhCong";
    if (tab === "cap-nhat") return tb.loai === "info";
    return true;
  });

  return (
    <div className="tb-wrapper">
      <div className="tb-body">
        {/* TIÊU ĐỀ */}
        <div className="tb-title-bar">
          <h1>Thông báo</h1>
        </div>

        {/* KHUNG CHÍNH */}
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
            <button
              className={`tb-tab ${tab === "cap-nhat" ? "tb-tab-active" : ""}`}
              onClick={() => setTab("cap-nhat")}
            >
              Cập nhật
            </button>
          </div>

          {/* DANH SÁCH */}
          <div className="tb-list">
            {danhSachLoc.length === 0 ? (
              <div className="tb-empty">Chưa có thông báo</div>
            ) : (
              danhSachLoc.map((tb) => {
                const { Icon, bg } = mapLoai[tb.loai] || mapLoai.info;
                return (
                  <div
                    key={tb.id}
                    className={`tb-item ${tb.daDoc ? "tb-item-read" : ""}`}
                    onClick={() => {
                      // TODO: Đánh dấu đã đọc
                      console.log("Click thông báo:", tb.id);
                    }}
                  >
                    <div
                      className="tb-icon"
                      style={{ background: bg }}
                    >
                      <Icon />
                    </div>

                    <div className="tb-content">
                      <div className="tb-content-top">
                        <strong className="tb-item-title">
                          {tb.tieuDe}
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
    </div>
  );
};

export default ThongBao;
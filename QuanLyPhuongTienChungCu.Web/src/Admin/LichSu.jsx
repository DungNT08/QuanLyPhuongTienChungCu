import React, { useState, useRef } from "react";
import "./LichSu.css";

const IconLichXanh = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, display: "block" }}>
    <rect x="3" y="5" width="18" height="16" rx="2" stroke="#1d7fb0" strokeWidth="2" fill="none" />
    <path d="M3 9H21" stroke="#1d7fb0" strokeWidth="2" />
    <path d="M8 3V7M16 3V7" stroke="#1d7fb0" strokeWidth="2" strokeLinecap="round" />
    <circle cx="8" cy="13" r="1.2" fill="#1d7fb0" />
    <circle cx="12" cy="13" r="1.2" fill="#1d7fb0" />
    <circle cx="16" cy="13" r="1.2" fill="#1d7fb0" />
    <circle cx="8" cy="17" r="1.2" fill="#1d7fb0" />
    <circle cx="12" cy="17" r="1.2" fill="#1d7fb0" />
    <circle cx="16" cy="17" r="1.2" fill="#1d7fb0" />
  </svg>
);

const LichSu = () => {
  const [tab, setTab] = useState("phuongtien");
  const [tuKhoa, setTuKhoa] = useState("");
  const [tuKhoaApDung, setTuKhoaApDung] = useState("");
  const [tuNgay, setTuNgay] = useState("2025-04-01");
  const [denNgay, setDenNgay] = useState("2025-05-07");
  const [tuNgayApDung, setTuNgayApDung] = useState("2025-04-01");
  const [denNgayApDung, setDenNgayApDung] = useState("2025-05-07");

  const [danhSachPhuongTien] = useState([]);
  const [danhSachLuotGui] = useState([]);

  const refTuNgay = useRef(null);
  const refDenNgay = useRef(null);

  const danhSachHienThi = tab === "phuongtien" ? danhSachPhuongTien : danhSachLuotGui;

  const danhSachLoc = danhSachHienThi.filter((item) => {
    const khopTuKhoa =
      item.bienSo?.toLowerCase().includes(tuKhoaApDung.toLowerCase()) ||
      item.cuDan?.toLowerCase().includes(tuKhoaApDung.toLowerCase());

    let khopNgay = true;
    if (item.ngayISO) {
      khopNgay = item.ngayISO >= tuNgayApDung && item.ngayISO <= denNgayApDung;
    }

    return khopTuKhoa && khopNgay;
  });

  const formatNgay = (iso) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };

  const xuLyTimKiem = () => {
    setTuKhoaApDung(tuKhoa);
    setTuNgayApDung(tuNgay);
    setDenNgayApDung(denNgay);
  };

  const moDatePicker = (ref) => {
    if (ref.current) {
      if (ref.current.showPicker) ref.current.showPicker();
      else ref.current.focus();
    }
  };

  return (
    <div className="ls-wrapper">
      <div className="ls-body">
        <div className="ls-title-bar">
          <h2>Lịch sử phương tiện và lượt gửi xe</h2>
        </div>

        <div className="ls-tabs">
          <button
            className={`ls-tab ${tab === "phuongtien" ? "ls-tab-active" : ""}`}
            onClick={() => setTab("phuongtien")}
          >
            Lịch sử phương tiện
          </button>
          <button
            className={`ls-tab ${tab === "luotgui" ? "ls-tab-active" : ""}`}
            onClick={() => setTab("luotgui")}
          >
            Lịch sử gửi xe
          </button>
        </div>

        <div className="ls-table-box">
          <div className="ls-filter-bar">
            <div className="ls-search">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Tìm kiếm theo biển số, tên cư dân..."
                value={tuKhoa}
                onChange={(e) => setTuKhoa(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") xuLyTimKiem();
                }}
              />
            </div>

            <div className="ls-date-range">
              <div className="ls-date-item" onClick={() => moDatePicker(refTuNgay)}>
                <IconLichXanh size={16} />
                <span className="ls-date-text">{formatNgay(tuNgay)}</span>
                <input ref={refTuNgay} type="date" value={tuNgay} onChange={(e) => setTuNgay(e.target.value)} className="ls-date-hidden" />
              </div>

              <span className="ls-date-sep">-</span>

              <div className="ls-date-item" onClick={() => moDatePicker(refDenNgay)}>
                <IconLichXanh size={16} />
                <span className="ls-date-text">{formatNgay(denNgay)}</span>
                <input ref={refDenNgay} type="date" value={denNgay} onChange={(e) => setDenNgay(e.target.value)} className="ls-date-hidden" />
              </div>
            </div>

            <button className="ls-btn-search" onClick={xuLyTimKiem}>Tìm kiếm</button>
          </div>

          {tab === "phuongtien" && (
            <table className="ls-table">
              <thead>
                <tr>
                  <th>STT</th><th>Biển số xe</th><th>Loại xe</th>
                  <th>Cư dân</th><th>Căn hộ</th><th>Hành động</th><th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {danhSachLoc.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: 30, color: "#6b8fa3" }}>Chưa có dữ liệu</td>
                  </tr>
                ) : (
                  danhSachLoc.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.bienSo}</td>
                      <td>{item.loaiXe}</td>
                      <td>{item.cuDan}</td>
                      <td>{item.canHo}</td>
                      <td>
                        <span className={`ls-event ${item.hanhDong === "Thêm mới" ? "ls-event-in" : "ls-event-out"}`}>
                          {item.hanhDong}
                        </span>
                      </td>
                      <td>{item.thoiGian}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {tab === "luotgui" && (
            <table className="ls-table">
              <thead>
                <tr>
                  <th>STT</th><th>Biển số xe</th><th>Loại xe</th>
                  <th>Cư dân / Khách</th><th>Thời gian vào</th>
                  <th>Thời gian ra</th><th>Sự kiện</th><th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {danhSachLoc.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: 30, color: "#6b8fa3" }}>Chưa có dữ liệu</td>
                  </tr>
                ) : (
                  danhSachLoc.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.bienSo}</td>
                      <td>{item.loaiXe}</td>
                      <td>{item.cuDan}</td>
                      <td>{item.thoiGianVao}</td>
                      <td>{item.thoiGianRa || "-"}</td>
                      <td>
                        <span className={`ls-event ${item.suKien === "Check-in" ? "ls-event-in" : "ls-event-out"}`}>
                          {item.suKien}
                        </span>
                      </td>
                      <td>
                        {item.ghiChu && item.ghiChu !== "-" ? (
                          <span className={`ls-note ${item.ghiChu === "Đã thanh toán" ? "ls-note-paid" : ""}`}>
                            {item.ghiChu}
                          </span>
                        ) : ("-")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          <div className="ls-pagination">
            <span>
              Hiển thị {danhSachLoc.length > 0 ? 1 : 0} - {danhSachLoc.length} trong {danhSachHienThi.length} kết quả
            </span>
            <div className="ls-pages">
              <button className="ls-page-prev">‹</button>
              <button className="ls-page-active">1</button>
              <button className="ls-page-next">›</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LichSu;
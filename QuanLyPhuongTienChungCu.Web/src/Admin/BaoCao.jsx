import React, { useState, useRef, useEffect } from "react";
import "./BaoCao.css";

const IconLichXanh = ({ size = 16 }) => (
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

const BaoCao = () => {
  const [duLieuGoc] = useState({
    thongKe: { tongPhuongTien: 0, xeKhach: 0, luotGui: 0, doanhThu: 0 },
    doanhThuNgay: [],
    tyLe: { oto: 0, xemay: 0, xedap: 0, khac: 0, tong: 0 },
  });

  const [tuNgay, setTuNgay] = useState("2025-05-01");
  const [denNgay, setDenNgay] = useState("2025-05-07");
  const [loaiXe, setLoaiXe] = useState("Tất cả loại xe");

  const [thongKe, setThongKe] = useState(duLieuGoc.thongKe);
  const [doanhThuNgay, setDoanhThuNgay] = useState(duLieuGoc.doanhThuNgay);
  const [tyLe, setTyLe] = useState(duLieuGoc.tyLe);

  const refTuNgay = useRef(null);
  const refDenNgay = useRef(null);

  useEffect(() => {
    setThongKe(duLieuGoc.thongKe);
    setDoanhThuNgay(duLieuGoc.doanhThuNgay);
    setTyLe(duLieuGoc.tyLe);
  }, [tuNgay, denNgay, loaiXe, duLieuGoc]);

  const maxGiaTri = doanhThuNgay.length
    ? Math.max(...doanhThuNgay.map((d) => Number(d.giaTri) || 0), 1)
    : 1;

  const formatNgay = (iso) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };

  const moDatePicker = (ref) => {
    if (ref.current) {
      if (ref.current.showPicker) ref.current.showPicker();
      else ref.current.focus();
    }
  };

  const xuatBaoCao = () => {
    const duLieu = [
      ["BÁO CÁO HỆ THỐNG QUẢN LÝ PHƯƠNG TIỆN"],
      [],
      ["Khoảng thời gian", `${formatNgay(tuNgay)} - ${formatNgay(denNgay)}`],
      ["Loại xe", loaiXe],
      [],
      ["THỐNG KÊ CHUNG"],
      ["Tổng phương tiện", thongKe.tongPhuongTien],
      ["Lượt gửi xe", thongKe.luotGui],
      ["Doanh thu", thongKe.doanhThu],
      [],
      ["TỶ LỆ PHƯƠNG TIỆN"],
      ["Ô tô", tyLe.oto + "%"],
      ["Xe máy", tyLe.xemay + "%"],
      ["Xe đạp", tyLe.xedap + "%"],
      ["Khác", tyLe.khac + "%"],
      [],
      ["DOANH THU THEO NGÀY"],
      ["Ngày", "Doanh thu"],
      ...doanhThuNgay.map((d) => [d.ngay, d.giaTri]),
    ];

    const csv = duLieu
      .map((row) =>
        row
          .map((cell) => {
            const s = String(cell ?? "");
            return s.includes(",") ? `"${s}"` : s;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bao-cao-${formatNgay(tuNgay).replace(/\//g, "-")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bc-wrapper">
      <div className="bc-body">
        <div className="bc-title-bar">
          <h2>Báo cáo</h2>
          <button className="bc-btn-export" onClick={xuatBaoCao}>
            Xuất báo cáo
          </button>
        </div>

        <div className="bc-filter-bar">
          <div className="bc-filter-item bc-date-range">
            <div className="bc-date-item" onClick={() => moDatePicker(refTuNgay)}>
              <IconLichXanh size={16} />
              <span className="bc-date-text">{formatNgay(tuNgay)}</span>
              <input ref={refTuNgay} type="date" value={tuNgay} onChange={(e) => setTuNgay(e.target.value)} className="bc-date-hidden" />
            </div>
            <span className="bc-date-sep">-</span>
            <div className="bc-date-item" onClick={() => moDatePicker(refDenNgay)}>
              <IconLichXanh size={16} />
              <span className="bc-date-text">{formatNgay(denNgay)}</span>
              <input ref={refDenNgay} type="date" value={denNgay} onChange={(e) => setDenNgay(e.target.value)} className="bc-date-hidden" />
            </div>
          </div>

          <div className="bc-filter-item">
            <select value={loaiXe} onChange={(e) => setLoaiXe(e.target.value)}>
              <option>Tất cả loại xe</option>
              <option>Ô tô</option>
              <option>Xe máy</option>
              <option>Xe đạp</option>
            </select>
          </div>
        </div>

        <div className="bc-stat-row">
          <div className="bc-stat-card">
            <span className="bc-stat-label">Tổng phương tiện</span>
            <strong className="bc-stat-value">{thongKe.tongPhuongTien}</strong>
            <span className="bc-stat-change">↑ 12% so với tháng trước</span>
          </div>
          <div className="bc-stat-card">
            <span className="bc-stat-label">Lượt gửi xe</span>
            <strong className="bc-stat-value">{Number(thongKe.luotGui).toLocaleString("vi-VN")}</strong>
            <span className="bc-stat-change">↑ 8% so với tháng trước</span>
          </div>
          <div className="bc-stat-card">
            <span className="bc-stat-label">Doanh thu</span>
            <strong className="bc-stat-value">{Number(thongKe.doanhThu).toLocaleString("vi-VN")}đ</strong>
            <span className="bc-stat-change">↑ 15% so với tháng trước</span>
          </div>
        </div>

        <div className="bc-chart-row">
          <div className="bc-chart-card">
            <h3>Doanh thu theo ngày</h3>
            <div className="bc-bar-chart">
              <div className="bc-bar-y-axis">
                <span>80</span><span>60</span><span>40</span>
                <span>20</span><span>0</span>
              </div>
              <div className="bc-bar-area">
                {[8, 50, 92, 134, 176].map((top, i) => (
                  <div key={i} className="bc-bar-grid" style={{ top }} />
                ))}
                <div className="bc-bar-list">
                  {doanhThuNgay.length === 0 ? (
                    <p style={{ width: "100%", textAlign: "center", color: "#6b8fa3", alignSelf: "center" }}>
                      Chưa có dữ liệu
                    </p>
                  ) : (
                    doanhThuNgay.map((d, i) => (
                      <div key={i} className="bc-bar-item">
                        <div
                          className="bc-bar"
                          style={{ height: `${((Number(d.giaTri) || 0) / maxGiaTri) * 100}%` }}
                          title={`${d.giaTri}`}
                        />
                        <span className="bc-bar-label">{d.ngay}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bc-chart-card">
            <h3>Tỷ lệ phương tiện</h3>
            <div className="bc-pie-wrapper">
              <div
                className="bc-pie"
                style={{
                  background: `conic-gradient(
                    #58a7e7 0 ${tyLe.oto}%,
                    #5ecfbe ${tyLe.oto}% ${tyLe.oto + tyLe.xemay}%,
                    #7776d7 ${tyLe.oto + tyLe.xemay}% ${tyLe.oto + tyLe.xemay + tyLe.xedap}%,
                    #bdcad5 ${tyLe.oto + tyLe.xemay + tyLe.xedap}% 100%
                  )`,
                }}
              >
                <div className="bc-pie-inner">
                  <strong>{tyLe.tong || 0}</strong>
                  <span>Tổng phương tiện</span>
                </div>
              </div>
              <div className="bc-pie-legend">
                <div className="bc-legend-item">
                  <span className="bc-dot bc-dot-oto" />
                  <span>Ô tô</span><strong>{tyLe.oto}%</strong>
                </div>
                <div className="bc-legend-item">
                  <span className="bc-dot bc-dot-xemay" />
                  <span>Xe máy</span><strong>{tyLe.xemay}%</strong>
                </div>
                <div className="bc-legend-item">
                  <span className="bc-dot bc-dot-xedap" />
                  <span>Xe đạp</span><strong>{tyLe.xedap}%</strong>
                </div>
                <div className="bc-legend-item">
                  <span className="bc-dot bc-dot-khac" />
                  <span>Khác</span><strong>{tyLe.khac}%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaoCao;
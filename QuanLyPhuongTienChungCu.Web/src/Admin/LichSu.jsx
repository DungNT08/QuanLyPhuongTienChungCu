import React, { useState } from "react";
import "./LuotGui.css";

const danhSachLuotGui = [
  {
    stt: 1,
    bienSo: "30A-123.45",
    loaiXe: "Ô tô",
    cuDan: "Nguyễn Văn A",
    thoiGianVao: "07:45",
    thoiGianRa: "—",
    thoiGianGui: "2h 15p",
  },
  {
    stt: 2,
    bienSo: "51A-678.90",
    loaiXe: "Xe máy",
    cuDan: "Trần Thị B",
    thoiGianVao: "08:20",
    thoiGianRa: "—",
    thoiGianGui: "1h 10p",
  },
  {
    stt: 3,
    bienSo: "29B-111.22",
    loaiXe: "Ô tô",
    cuDan: "Lê Văn C",
    thoiGianVao: "09:10",
    thoiGianRa: "—",
    thoiGianGui: "80p",
  },
  {
    stt: 4,
    bienSo: "50A-332.44",
    loaiXe: "Xe máy",
    cuDan: "Phạm Thị D",
    thoiGianVao: "10:05",
    thoiGianRa: "—",
    thoiGianGui: "25p",
  },
  {
    stt: 5,
    bienSo: "51C-555.66",
    loaiXe: "Ô tô",
    cuDan: "Hoàng Văn E",
    thoiGianVao: "11:20",
    thoiGianRa: "—",
    thoiGianGui: "10p",
  },
];

function LuotGui() {
  const [tabDangChon, setTabDangChon] = useState("dang-gui");

  return (
    <div className="luot-gui-page">
      {/* HEADER */}
      <header className="header-luot-gui">
        <div className="logo-luot-gui">
          <div className="logo-icon-luot-gui">🏢</div>
          <span>Hệ thống quản lý phương tiện chung cư</span>
        </div>

        <div className="thanh-tim-luot-gui">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm biển số, tên cư dân..."
          />
        </div>

        <div className="khu-vuc-tai-khoan">
          <button className="nut-thong-bao-luot-gui" type="button">
            🔔
            <span className="cham-thong-bao"></span>
          </button>

          <div className="anh-dai-dien-luot-gui">👤</div>

          <div className="thong-tin-admin-luot-gui">
            <span className="ten-admin-luot-gui">Admin</span>
            <span className="muiten-admin">⌄</span>
          </div>
        </div>
      </header>

      {/* NỘI DUNG */}
      <main className="noi-dung-luot-gui">
        <div className="tieu-de-luot-gui">
          <h1>Lượt gửi xe đang hoạt động</h1>
        </div>

        {/* TAB */}
        <div className="thanh-tab-luot-gui">
          <button
            type="button"
            className={`tab-luot-gui ${
              tabDangChon === "dang-gui" ? "tab-dang-chon" : ""
            }`}
            onClick={() => setTabDangChon("dang-gui")}
          >
            Đang gửi (5)
          </button>

          <button
            type="button"
            className={`tab-luot-gui ${
              tabDangChon === "lich-su" ? "tab-dang-chon" : ""
            }`}
            onClick={() => setTabDangChon("lich-su")}
          >
            Lịch sử
          </button>
        </div>

        {/* BẢNG */}
        <div className="khung-bang-luot-gui">
          {tabDangChon === "dang-gui" ? (
            <table className="bang-luot-gui">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Biển số xe</th>
                  <th>Loại xe</th>
                  <th>Cư dân / Khách</th>
                  <th>Thời gian vào</th>
                  <th>Thời gian ra dự kiến</th>
                  <th>Thời gian gửi</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>

              <tbody>
                {danhSachLuotGui.map((item) => (
                  <tr key={item.stt}>
                    <td>{item.stt}</td>
                    <td className="bien-so">{item.bienSo}</td>
                    <td>{item.loaiXe}</td>
                    <td>{item.cuDan}</td>
                    <td>{item.thoiGianVao}</td>
                    <td>{item.thoiGianRa}</td>
                    <td>{item.thoiGianGui}</td>
                    <td>
                      <span className="trang-thai-dang-gui">
                        Đang gửi
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="lich-su-trong">
              Chưa có dữ liệu lịch sử
            </div>
          )}

          {/* CHÂN BẢNG */}
          <div className="chan-bang-luot-gui">
            <span>Hiển thị 1 - 5 trong 5 lượt gửi</span>

            <div className="phan-trang-luot-gui">
              <button type="button">‹</button>
              <button
                type="button"
                className="trang-dang-chon-luot-gui"
              >
                1
              </button>
              <button type="button">›</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LuotGui;
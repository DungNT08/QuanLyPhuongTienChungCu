import React, { useState } from "react";
import "./LuotGui.css";

function LuotGui() {
  const [tabDangChon, setTabDangChon] = useState("dang-gui");

  return (
    <div className="noi-dung-luot-gui">

      {/* =========================
          TIÊU ĐỀ
      ========================= */}
      <div className="tieu-de-luot-gui">
        <h1>Lượt gửi xe đang hoạt động</h1>
      </div>


      {/* =========================
          TAB
      ========================= */}
      <div className="thanh-tab-luot-gui">

        <button
          type="button"
          className={`tab-luot-gui ${
            tabDangChon === "dang-gui"
              ? "tab-luot-gui-dang-chon"
              : ""
          }`}
          onClick={() => setTabDangChon("dang-gui")}
        >
          Đang gửi
        </button>

        <button
          type="button"
          className={`tab-luot-gui ${
            tabDangChon === "lich-su"
              ? "tab-luot-gui-dang-chon"
              : ""
          }`}
          onClick={() => setTabDangChon("lich-su")}
        >
          Lịch sử
        </button>

      </div>


      {/* =========================
          BẢNG
      ========================= */}
      <div className="o-dashboard-luot-gui">

        <div className="vung-bang-luot-gui">

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
                <tr>
                  <td
                    colSpan="8"
                    className="o-trong-bang-luot-gui"
                  >
                    Chưa có dữ liệu
                  </td>
                </tr>
              </tbody>

            </table>

          ) : (

            <div className="lich-su-trong-luot-gui">
              Chưa có dữ liệu lịch sử
            </div>

          )}

        </div>


        {/* =========================
            CHÂN BẢNG
        ========================= */}
        <div className="chan-bang-luot-gui">

          <span>
            Hiển thị 0 - 0 trong 0 lượt gửi
          </span>

          <div className="phan-trang-luot-gui">

            <button type="button">
              ‹
            </button>

            <button
              type="button"
              className="trang-dang-chon-luot-gui"
            >
              1
            </button>

            <button type="button">
              ›
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default LuotGui;
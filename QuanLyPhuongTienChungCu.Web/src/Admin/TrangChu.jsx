import React from "react";
import SidebarAdmin from "../layouts/sidebarAdmin";
import "./TrangChu.css";

const danhSachThaoTac = [
  { icon: "🚗", ten: "Thêm phương tiện cư dân" },
  { icon: "🚙", ten: "Ghi nhận xe khách" },
  { icon: "ⓢ", ten: "Tính phí gửi xe" },
  { icon: "◇", ten: "Quản lý bảng giá" },
  { icon: "▥", ten: "Xem báo cáo" },
];

function TrangChu() {
  return (
    <div className="trang-chu-wrapper">
      {/* ===== SIDEBAR + HEADER CHUNG ===== */}
      <SidebarAdmin />

      {/* ===== NỘI DUNG CHÍNH ===== */}
      <div className="noi-dung-trang-chu">
        {/* GIỚI THIỆU */}
        <section className="khu-vuc-gioi-thieu">
          <div className="noi-dung-gioi-thieu">
            <h1>Xin chào, Admin!</h1>
            <p>
              Hệ thống quản lý phương tiện chung cư giúp bạn kiểm soát
              phương tiện, lượt gửi xe và doanh thu một cách dễ dàng,
              hiệu quả.
            </p>
          </div>

          <div className="anh-minh-hoa-chung-cu">
            <div className="toa-nha-minh-hoa toa-nha-lon" />
            <div className="toa-nha-minh-hoa toa-nha-nho" />
            <span className="cua-so cua-so-1" />
            <span className="cua-so cua-so-2" />
            <span className="cua-so cua-so-3" />
            <span className="cua-so cua-so-4" />
            <span className="cay-minh-hoa cay-trai">🌳</span>
            <span className="cay-minh-hoa cay-phai">🌳</span>
            <span className="xe-minh-hoa">🚗</span>
          </div>
        </section>

        {/* THỐNG KÊ */}
        <section className="luoi-thong-ke">
          <div className="the-thong-ke the-xanh">
            <div className="vong-icon-thong-ke">🚗</div>
            <div className="noi-dung-thong-ke">
              <span className="tieu-de-thong-ke">
                Tổng phương tiện cư dân
              </span>
              <strong className="gia-tri-thong-ke">-</strong>
              <span className="thay-doi-thong-ke">
                Chưa có dữ liệu
              </span>
            </div>
          </div>

          <div className="the-thong-ke the-xanh-la">
            <div className="vong-icon-thong-ke">🚙</div>
            <div className="noi-dung-thong-ke">
              <span className="tieu-de-thong-ke">
                Xe khách hiện tại
              </span>
              <strong className="gia-tri-thong-ke">-</strong>
              <span className="thay-doi-thong-ke">
                Chưa có dữ liệu
              </span>
            </div>
          </div>

          <div className="the-thong-ke the-tim">
            <div className="vong-icon-thong-ke">◷</div>
            <div className="noi-dung-thong-ke">
              <span className="tieu-de-thong-ke">
                Lượt gửi xe đang hoạt động
              </span>
              <strong className="gia-tri-thong-ke">-</strong>
              <span className="thay-doi-thong-ke">
                Chưa có dữ liệu
              </span>
            </div>
          </div>

          <div className="the-thong-ke the-xanh-ngoc">
            <div className="vong-icon-thong-ke">ⓢ</div>
            <div className="noi-dung-thong-ke">
              <span className="tieu-de-thong-ke">
                Doanh thu tháng này
              </span>
              <strong className="gia-tri-thong-ke">-</strong>
              <span className="thay-doi-thong-ke">
                Chưa có dữ liệu
              </span>
            </div>
          </div>
        </section>

        {/* DASHBOARD */}
        <section className="bo-cuc-dashboard">
          <div className="cot-dashboard-trai">

            {/* BIỂU ĐỒ */}
            <div className="hang-bieu-do-dashboard">

              {/* BIỂU ĐỒ LƯỢT GỬI XE */}
              <div className="o-dashboard">
                <div className="tieu-de-o-dashboard">
                  <h2>Thống kê lượt gửi xe (7 ngày qua)</h2>
                </div>

                <div className="bieu-do-luot-gui">
                  <div className="cot-y">
                    <span>80</span>
                    <span>60</span>
                    <span>40</span>
                    <span>20</span>
                    <span>0</span>
                  </div>

                  <div className="khu-bieu-do">
                    <div className="duong-ke duong-ke-1" />
                    <div className="duong-ke duong-ke-2" />
                    <div className="duong-ke duong-ke-3" />
                    <div className="duong-ke duong-ke-4" />
                    <div className="duong-ke duong-ke-5" />

                    {/* Không còn dữ liệu biểu đồ tĩnh */}

                    <div className="nhan-ngay">
                      <span>--/--</span>
                      <span>--/--</span>
                      <span>--/--</span>
                      <span>--/--</span>
                      <span>--/--</span>
                      <span>--/--</span>
                      <span>--/--</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* TỶ LỆ PHƯƠNG TIỆN */}
              <div className="o-dashboard">
                <div className="tieu-de-o-dashboard">
                  <h2>Tỷ lệ phương tiện</h2>
                </div>

                <div className="khu-bieu-do-tron">
                  <div className="bieu-do-tron">
                    <div className="vong-tron-trong">
                      <strong>-</strong>
                      <span>Tổng phương tiện</span>
                    </div>
                  </div>

                  <div className="chu-thich-bieu-do">
                    <div className="dong-chu-thich">
                      <span className="dau-cham mau-oto" />
                      <span>Ô tô</span>
                      <strong>-</strong>
                    </div>

                    <div className="dong-chu-thich">
                      <span className="dau-cham mau-xe-may" />
                      <span>Xe máy</span>
                      <strong>-</strong>
                    </div>

                    <div className="dong-chu-thich">
                      <span className="dau-cham mau-xe-dap" />
                      <span>Xe đạp</span>
                      <strong>-</strong>
                    </div>

                    <div className="dong-chu-thich">
                      <span className="dau-cham mau-khac" />
                      <span>Khác</span>
                      <strong>-</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* LƯỢT GỬI XE GẦN ĐÂY */}
            <div className="o-dashboard bang-luot-gui">
              <div className="tieu-de-o-dashboard">
                <h2>Lượt gửi xe gần đây</h2>
                <button
                  className="nut-xem-tat-ca"
                  type="button"
                >
                  Xem tất cả →
                </button>
              </div>

              <div className="vung-bang">
                <table className="bang-luot-gui-xe">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Biển số xe</th>
                      <th>Loại xe</th>
                      <th>Cư dân / Khách</th>
                      <th>Thời gian vào</th>
                      <th>Thời gian ra</th>
                      <th>Trạng thái</th>
                      <th>Phí</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td
                        colSpan="8"
                        style={{
                          textAlign: "center",
                          padding: "30px",
                        }}
                      >
                        Chưa có dữ liệu lượt gửi xe
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="chan-bang">
                <span>Chưa có dữ liệu</span>

                <div className="phan-trang">
                  <button type="button">‹</button>
                  <button
                    type="button"
                    className="trang-dang-chon"
                  >
                    1
                  </button>
                  <button type="button">2</button>
                  <button type="button">3</button>
                  <button type="button">4</button>
                  <button type="button">5</button>
                  <button type="button">›</button>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI */}
          <div className="cot-dashboard-phai">

            {/* THAO TÁC NHANH */}
            <div className="o-dashboard thao-tac-nhanh">
              <h2>Thao tác nhanh</h2>

              {danhSachThaoTac.map((tt) => (
                <button
                  key={tt.ten}
                  type="button"
                  className="nut-thao-tac"
                >
                  <span className="icon-thao-tac">
                    {tt.icon}
                  </span>

                  <span>{tt.ten}</span>

                  <b>›</b>
                </button>
              ))}
            </div>

            {/* HOẠT ĐỘNG GẦN ĐÂY */}
            <div className="o-dashboard hoat-dong-gan-day">
              <h2>Hoạt động gần đây</h2>

              <div className="muc-hoat-dong">
                <div className="icon-hoat-dong">◷</div>

                <div className="noi-dung-hoat-dong">
                  <strong>Chưa có hoạt động</strong>
                  <span>Dữ liệu sẽ được lấy từ Backend</span>
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}

export default TrangChu;
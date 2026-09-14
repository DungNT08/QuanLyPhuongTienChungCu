import React, { useState } from "react";
import "./TrangChu.css";

function TrangChu() {
  // =========================
  // DỮ LIỆU THỐNG KÊ
  // Sau này sẽ lấy từ API / SQL
  // =========================
  const [thongKe] = useState({
    tongPhuongTien: 0,
    xeKhach: 0,
    luotGui: 0,
    doanhThu: 0,
  });

  // =========================
  // DANH SÁCH LƯỢT GỬI XE
  // Sau này lấy từ API / SQL
  // =========================
  const [danhSachBang] = useState([]);

  // =========================
  // HOẠT ĐỘNG GẦN ĐÂY
  // Không sử dụng dữ liệu mẫu
  // =========================
  const [danhSachHoatDong] = useState([]);

  // =========================
  // THAO TÁC NHANH
  // Chỉ giữ tên chức năng, không có dữ liệu SQL
  // =========================
  const danhSachThaoTac = [
    { icon: "🚗", ten: "Thêm phương tiện cư dân" },
    { icon: "🚙", ten: "Ghi nhận xe khách" },
    { icon: "ⓢ", ten: "Tính phí gửi xe" },
    { icon: "◇", ten: "Quản lý bảng giá" },
    { icon: "▥", ten: "Xem báo cáo" },
  ];

  // =========================
  // THỐNG KÊ
  // =========================
  const danhSachThongKe = [
    {
      icon: "🚗",
      ten: "Tổng phương tiện cư dân",
      giaTri: thongKe.tongPhuongTien,
      thayDoi: "Chưa có dữ liệu",
      mau: "the-xanh",
    },
    {
      icon: "🚙",
      ten: "Xe khách hiện tại",
      giaTri: thongKe.xeKhach,
      thayDoi: "Chưa có dữ liệu",
      mau: "the-xanh-la",
    },
    {
      icon: "◷",
      ten: "Lượt gửi xe đang hoạt động",
      giaTri: thongKe.luotGui,
      thayDoi: "Chưa có dữ liệu",
      mau: "the-tim",
    },
    {
      icon: "ⓢ",
      ten: "Doanh thu tháng này",
      giaTri:
        thongKe.doanhThu.toLocaleString("vi-VN") + "đ",
      thayDoi: "Chưa có dữ liệu",
      mau: "the-xanh-ngoc",
    },
  ];

  return (
    <div className="trang-chu-wrapper">
      <div className="noi-dung-trang-chu">

        {/* =========================
            GIỚI THIỆU
        ========================= */}
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

            <span className="cay-minh-hoa cay-trai">
              🌳
            </span>

            <span className="cay-minh-hoa cay-phai">
              🌳
            </span>

            <span className="xe-minh-hoa">
              🚗
            </span>
          </div>
        </section>

        {/* =========================
            THỐNG KÊ
        ========================= */}
        <section className="luoi-thong-ke">
          {danhSachThongKe.map((tk) => (
            <div
              key={tk.ten}
              className={`the-thong-ke ${tk.mau}`}
            >
              <div className="vong-icon-thong-ke">
                {tk.icon}
              </div>

              <div className="noi-dung-thong-ke">
                <span className="tieu-de-thong-ke">
                  {tk.ten}
                </span>

                <strong className="gia-tri-thong-ke">
                  {tk.giaTri}
                </strong>

                <span className="thay-doi-thong-ke">
                  {tk.thayDoi}
                </span>
              </div>
            </div>
          ))}
        </section>

        {/* =========================
            DASHBOARD
        ========================= */}
        <section className="bo-cuc-dashboard">

          {/* =========================
              CỘT TRÁI
          ========================= */}
          <div className="cot-dashboard-trai">

            {/* =========================
                BIỂU ĐỒ
            ========================= */}
            <div className="hang-bieu-do-dashboard">

              {/* BIỂU ĐỒ LƯỢT GỬI */}
              <div className="o-dashboard">
                <div className="tieu-de-o-dashboard">
                  <h2>
                    Thống kê lượt gửi xe (7 ngày qua)
                  </h2>
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

                    <div
                      style={{
                        width: "100%",
                        height: "175px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#6b8fa3",
                      }}
                    >
                      Chưa có dữ liệu
                    </div>

                    <div className="nhan-ngay">
                      <span> </span>
                      <span> </span>
                      <span> </span>
                      <span> </span>
                      <span> </span>
                      <span> </span>
                      <span> </span>
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
                      <strong>
                        {thongKe.tongPhuongTien}
                      </strong>

                      <span>
                        Tổng phương tiện
                      </span>
                    </div>
                  </div>

                  <div className="chu-thich-bieu-do">

                    <div className="dong-chu-thich">
                      <span className="dau-cham mau-oto" />
                      <span>Ô tô</span>
                      <strong>0%</strong>
                    </div>

                    <div className="dong-chu-thich">
                      <span className="dau-cham mau-xe-may" />
                      <span>Xe máy</span>
                      <strong>0%</strong>
                    </div>

                    <div className="dong-chu-thich">
                      <span className="dau-cham mau-xe-dap" />
                      <span>Xe đạp</span>
                      <strong>0%</strong>
                    </div>

                    <div className="dong-chu-thich">
                      <span className="dau-cham mau-khac" />
                      <span>Khác</span>
                      <strong>0%</strong>
                    </div>

                  </div>
                </div>
              </div>

            </div>

            {/* =========================
                BẢNG LƯỢT GỬI XE
            ========================= */}
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

                    {danhSachBang.length === 0 ? (
                      <tr>
                        <td
                          colSpan="8"
                          style={{
                            textAlign: "center",
                            padding: 30,
                            color: "#6b8fa3",
                          }}
                        >
                          Chưa có dữ liệu
                        </td>
                      </tr>
                    ) : (
                      danhSachBang.map((row) => (
                        <tr key={row.stt}>

                          <td>{row.stt}</td>

                          <td>{row.bienSo}</td>

                          <td>{row.loaiXe}</td>

                          <td>{row.cuDan}</td>

                          <td>{row.vao}</td>

                          <td>{row.ra}</td>

                          <td>
                            <span
                              className={`trang-thai ${
                                row.trangThai === "Đang gửi"
                                  ? "dang-gui"
                                  : "da-thanh-toan"
                              }`}
                            >
                              {row.trangThai}
                            </span>
                          </td>

                          <td>{row.phi}</td>

                        </tr>
                      ))
                    )}

                  </tbody>

                </table>

              </div>

              <div className="chan-bang">

                <span>
                  Hiển thị 0 - 0 trong 0 lượt gửi xe
                </span>

                <div className="phan-trang">

                  <button type="button">
                    ‹
                  </button>

                  <button
                    type="button"
                    className="trang-dang-chon"
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

          {/* =========================
              CỘT PHẢI
          ========================= */}
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

                  <span>
                    {tt.ten}
                  </span>

                  <b>›</b>
                </button>
              ))}

            </div>

            {/* HOẠT ĐỘNG GẦN ĐÂY */}
            <div className="o-dashboard hoat-dong-gan-day">

              <h2>Hoạt động gần đây</h2>

              {danhSachHoatDong.length === 0 ? (
                <div
                  style={{
                    padding: "20px 0",
                    textAlign: "center",
                    color: "#6b8fa3",
                  }}
                >
                  Chưa có hoạt động
                </div>
              ) : (
                danhSachHoatDong.map((hd, i) => (
                  <div
                    className="muc-hoat-dong"
                    key={i}
                  >

                    <div className="icon-hoat-dong">
                      {hd.icon}
                    </div>

                    <div className="noi-dung-hoat-dong">

                      <strong>
                        {hd.tieuDe}
                      </strong>

                      <span>
                        {hd.thoiGian}
                      </span>

                    </div>

                  </div>
                ))
              )}

            </div>

          </div>

        </section>

      </div>
    </div>
  );
}

export default TrangChu;

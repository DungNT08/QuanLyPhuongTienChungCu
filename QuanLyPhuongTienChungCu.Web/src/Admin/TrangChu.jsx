import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TrangChu.css";

const API_BASE_URL = "http://localhost:5022/api";

const TOKEN_KEY = "token";

function TrangChu() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [phuongTien, setPhuongTien] = useState([]);
  const [luotDangGui, setLuotDangGui] = useState([]);
  const [lichSu, setLichSu] = useState([]);

  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");

  // =====================================================
  // TOKEN
  // =====================================================

  const layToken = () => {
    return localStorage.getItem(TOKEN_KEY);
  };

  // =====================================================
  // GỌI API
  // =====================================================

  const goiApi = async (url) => {
    const token = layToken();

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
    });

    if (response.status === 401) {
      throw new Error("Phiên đăng nhập đã hết hạn.");
    }

    if (response.status === 403) {
      throw new Error("Bạn không có quyền xem dữ liệu này.");
    }

    if (!response.ok) {
      let message = "Không thể lấy dữ liệu từ máy chủ.";

      try {
        const data = await response.json();

        message =
          data?.message ||
          data?.title ||
          message;
      } catch {
        // Response không có JSON
      }

      throw new Error(message);
    }

    return await response.json();
  };

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    let dangHoatDong = true;

    const taiDuLieu = async () => {
      try {
        setDangTai(true);
        setLoi("");

        const [
          danhSachPhuongTien,
          danhSachDangGui,
          danhSachLichSu,
        ] = await Promise.all([
          goiApi(`${API_BASE_URL}/PhuongTien`),
          goiApi(`${API_BASE_URL}/Parking/active`),
          goiApi(`${API_BASE_URL}/Parking/history`),
        ]);

        if (!dangHoatDong) {
          return;
        }

        setPhuongTien(
          Array.isArray(danhSachPhuongTien)
            ? danhSachPhuongTien
            : []
        );

        setLuotDangGui(
          Array.isArray(danhSachDangGui)
            ? danhSachDangGui
            : []
        );

        setLichSu(
          Array.isArray(danhSachLichSu)
            ? danhSachLichSu
            : []
        );
      } catch (error) {
        if (!dangHoatDong) {
          return;
        }

        console.error(
          "Lỗi tải dữ liệu trang chủ:",
          error
        );

        setLoi(
          error?.message ||
            "Không thể tải dữ liệu trang chủ."
        );
      } finally {
        if (dangHoatDong) {
          setDangTai(false);
        }
      }
    };

    taiDuLieu();

    return () => {
      dangHoatDong = false;
    };
  }, []);

  // =====================================================
  // HELPER
  // =====================================================

  const layTenLoaiXe = (item) => {
    return (
      item?.loaiXe ||
      item?.loaiPhuongTien ||
      "Khác"
    );
  };

  const laOto = (tenLoai) => {
    const value = String(tenLoai)
      .toLowerCase()
      .trim();

    return (
      value.includes("ô tô") ||
      value.includes("o to") ||
      value.includes("oto") ||
      value.includes("ôto") ||
      value.includes("car")
    );
  };

  const laXeMay = (tenLoai) => {
    const value = String(tenLoai)
      .toLowerCase()
      .trim();

    return (
      value.includes("xe máy") ||
      value.includes("xe may") ||
      value.includes("xemay") ||
      value.includes("motor")
    );
  };

  const laXeDap = (tenLoai) => {
    const value = String(tenLoai)
      .toLowerCase()
      .trim();

    return (
      value.includes("xe đạp") ||
      value.includes("xe dap") ||
      value.includes("xedap") ||
      value.includes("bike")
    );
  };

  // =====================================================
  // KIỂM TRA XE ĐANG GỬI
  // =====================================================

  const laDangGui = (item) => {
    if (!item) {
      return false;
    }

    const trangThai = String(
      item?.trangThai ||
        item?.trangThaiGoc ||
        ""
    )
      .toLowerCase()
      .trim();

    if (
      trangThai === "đang gửi" ||
      trangThai === "dang gui" ||
      trangThai === "active"
    ) {
      return true;
    }

    if (
      trangThai === "đã ra" ||
      trangThai === "da ra" ||
      trangThai === "completed" ||
      trangThai === "đã thanh toán" ||
      trangThai === "da thanh toan"
    ) {
      return false;
    }

    return (
      item?.thoiGianRa == null ||
      item?.thoiGianRa === ""
    );
  };

  // =====================================================
  // XE KHÁCH ĐANG GỬI
  // =====================================================

  const xeKhachDangGui = useMemo(() => {
    return luotDangGui.filter((item) => {
      return (
        item?.laXeKhach === true &&
        laDangGui(item)
      );
    });
  }, [luotDangGui]);

  // =====================================================
  // THỐNG KÊ CƠ BẢN
  // =====================================================

  const tongPhuongTien =
    phuongTien.length;

  const tongXeKhach =
    xeKhachDangGui.length;

  const tongLuotDangGui =
    luotDangGui.length;

  // =====================================================
  // DOANH THU THÁNG HIỆN TẠI
  // =====================================================

  const doanhThuThangNay = useMemo(() => {
    const now = new Date();

    const thangHienTai =
      now.getMonth();

    const namHienTai =
      now.getFullYear();

    return lichSu.reduce((tong, item) => {
      // -------------------------------------------------
      // 1. Phải có thời gian ra
      // -------------------------------------------------

      if (!item?.thoiGianRa) {
        return tong;
      }

      // -------------------------------------------------
      // 2. Chỉ tính lượt đã hoàn tất
      //
      // Backend:
      // COMPLETED = lượt đã checkout
      // ACTIVE    = đang gửi
      // -------------------------------------------------

      if (
        item?.trangThaiGoc !==
        "COMPLETED"
      ) {
        return tong;
      }

      // -------------------------------------------------
      // 3. Kiểm tra thời gian ra hợp lệ
      // -------------------------------------------------

      const ngayRa =
        new Date(item.thoiGianRa);

      if (
        Number.isNaN(
          ngayRa.getTime()
        )
      ) {
        return tong;
      }

      // -------------------------------------------------
      // 4. Chỉ tính lượt ra trong tháng hiện tại
      // -------------------------------------------------

      if (
        ngayRa.getMonth() !==
          thangHienTai ||
        ngayRa.getFullYear() !==
          namHienTai
      ) {
        return tong;
      }

      // -------------------------------------------------
      // 5. Chuyển số tiền về Number
      // -------------------------------------------------

      const soTien = Number(
        String(item.soTien ?? "")
          .replace(/[^\d.-]/g, "")
      );

      if (
        Number.isNaN(soTien)
      ) {
        return tong;
      }

      return tong + soTien;
    }, 0);
  }, [lichSu]);

  // =====================================================
  // TỶ LỆ PHƯƠNG TIỆN
  // =====================================================

  const thongKeLoaiXe = useMemo(() => {
    let oto = 0;
    let xeMay = 0;
    let xeDap = 0;
    let khac = 0;

    phuongTien.forEach((item) => {
      const tenLoai =
        layTenLoaiXe(item);

      if (laOto(tenLoai)) {
        oto++;
      } else if (laXeMay(tenLoai)) {
        xeMay++;
      } else if (laXeDap(tenLoai)) {
        xeDap++;
      } else {
        khac++;
      }
    });

    return {
      oto,
      xeMay,
      xeDap,
      khac,
    };
  }, [phuongTien]);

  const tinhPhanTram = (giaTri) => {
    if (
      tongPhuongTien === 0
    ) {
      return 0;
    }

    return Math.round(
      (giaTri /
        tongPhuongTien) *
        100
    );
  };

  // =====================================================
  // THỐNG KÊ 7 NGÀY
  // =====================================================

  const thongKe7Ngay =
    useMemo(() => {
      const ketQua = [];

      for (
        let i = 6;
        i >= 0;
        i--
      ) {
        const ngay =
          new Date();

        ngay.setHours(
          0,
          0,
          0,
          0
        );

        ngay.setDate(
          ngay.getDate() - i
        );

        const ngayKey =
          `${ngay.getFullYear()}-` +
          `${String(
            ngay.getMonth() + 1
          ).padStart(2, "0")}-` +
          `${String(
            ngay.getDate()
          ).padStart(2, "0")}`;

        const soLuot =
          lichSu.filter(
            (item) => {
              if (
                !item?.thoiGianVao
              ) {
                return false;
              }

              const thoiGian =
                new Date(
                  item.thoiGianVao
                );

              if (
                Number.isNaN(
                  thoiGian.getTime()
                )
              ) {
                return false;
              }

              const key =
                `${thoiGian.getFullYear()}-` +
                `${String(
                  thoiGian.getMonth() + 1
                ).padStart(2, "0")}-` +
                `${String(
                  thoiGian.getDate()
                ).padStart(2, "0")}`;

              return (
                key === ngayKey
              );
            }
          ).length;

        ketQua.push({
          ngay,
          ngayKey,
          soLuot,
        });
      }

      return ketQua;
    }, [lichSu]);

  const maxLuotGui =
    Math.max(
      ...thongKe7Ngay.map(
        (item) =>
          item.soLuot
      ),
      1
    );

  // =====================================================
  // FORMAT
  // =====================================================

  const dinhDangTien = (
    giaTri
  ) => {
    return `${Number(
      giaTri || 0
    ).toLocaleString(
      "vi-VN"
    )}đ`;
  };

  const dinhDangThoiGian = (
    thoiGian
  ) => {
    if (!thoiGian) {
      return "—";
    }

    const date =
      new Date(thoiGian);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    return date.toLocaleString(
      "vi-VN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const dinhDangNgayNgan = (
    date
  ) => {
    return date.toLocaleDateString(
      "vi-VN",
      {
        weekday: "short",
      }
    );
  };

  // =====================================================
  // LƯỢT GỬI GẦN ĐÂY
  // =====================================================

  const danhSachBang =
    useMemo(() => {
      return [...lichSu]
        .sort(
          (a, b) =>
            new Date(
              b.thoiGianVao
            ) -
            new Date(
              a.thoiGianVao
            )
        )
        .slice(0, 5);
    }, [lichSu]);

  // =====================================================
  // HOẠT ĐỘNG GẦN ĐÂY
  // =====================================================

  const danhSachHoatDong =
    useMemo(() => {
      return [...lichSu]
        .sort(
          (a, b) =>
            new Date(
              b.thoiGianVao
            ) -
            new Date(
              a.thoiGianVao
            )
        )
        .slice(0, 5)
        .map((item) => {
          const laXeKhach =
            item.laXeKhach ===
            true;

          const daRa =
            item.thoiGianRa !=
              null ||
            item.trangThaiGoc ===
              "COMPLETED";

          return {
            ...item,

            icon: laXeKhach
              ? "🚙"
              : daRa
              ? "↗️"
              : "🚗",

            tieuDe: laXeKhach
              ? daRa
                ? `Xe khách ${item.bienSo} đã thanh toán`
                : `Xe khách ${item.bienSo} vào bãi`
              : daRa
              ? `Xe ${item.bienSo} đã ra khỏi bãi`
              : `Xe ${item.bienSo} vào bãi`,

            thoiGian:
              dinhDangThoiGian(
                daRa
                  ? item.thoiGianRa
                  : item.thoiGianVao
              ),
          };
        });
    }, [lichSu]);

  // =====================================================
  // THAO TÁC NHANH
  // =====================================================

  const danhSachThaoTac = [
    {
      icon: "🚗",
      ten: "Thêm phương tiện cư dân",
      duongDan:
        "/admin/phuong-tien",
    },

    {
      icon: "🚙",
      ten: "Ghi nhận xe khách",
      duongDan:
        "/admin/xe-khach",
    },

    {
      icon: "◇",
      ten: "Quản lý bảng giá",
      duongDan:
        "/admin/bang-gia",
    },

    {
      icon: "▥",
      ten: "Xem báo cáo",
      duongDan:
        "/admin/bao-cao",
    },
  ];

  // =====================================================
  // THỐNG KÊ CARD
  // =====================================================

  const danhSachThongKe = [
    {
      icon: "🚗",
      ten: "Tổng phương tiện cư dân",
      giaTri: tongPhuongTien,
      thayDoi:
        `${tongPhuongTien} phương tiện`,
      mau: "the-xanh",
    },

    {
      icon: "🚙",
      ten: "Xe khách hiện tại",
      giaTri: tongXeKhach,
      thayDoi:
        "Chỉ tính xe khách đang gửi",
      mau: "the-xanh-la",
    },

    {
      icon: "◷",
      ten: "Lượt gửi xe đang hoạt động",
      giaTri: tongLuotDangGui,
      thayDoi:
        "Đang ở trong bãi",
      mau: "the-tim",
    },

    {
      icon: "ⓢ",
      ten: "Doanh thu tháng này",
      giaTri:
        dinhDangTien(
          doanhThuThangNay
        ),
      thayDoi:
        "Tính từ các lượt đã hoàn tất",
      mau: "the-xanh-ngoc",
    },
  ];

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="trang-chu-wrapper">
      <div className="noi-dung-trang-chu">

        {/* =================================================
            GIỚI THIỆU
        ================================================= */}

        <section className="khu-vuc-gioi-thieu">

          <div className="noi-dung-gioi-thieu">

            <div className="nhan-chao-admin">
              <span className="cham-trang-thai"></span>
              TRUNG TÂM QUẢN LÝ
            </div>

            <h1>
              Xin chào, <span>Admin!</span>
            </h1>

            <p>
              Hệ thống quản lý phương tiện chung cư giúp bạn
              kiểm soát phương tiện, lượt gửi xe và doanh thu
              một cách dễ dàng, hiệu quả.
            </p>

            {dangTai && (
              <div className="trang-thai-tai">
                <span className="vong-xoay"></span>
                Đang cập nhật dữ liệu...
              </div>
            )}

            {!dangTai && loi && (
              <div className="loi-tai-du-lieu">
                {loi}
              </div>
            )}

          </div>

          {/* =================================================
              HÌNH MINH HỌA
          ================================================= */}

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

        {/* =================================================
            THỐNG KÊ
        ================================================= */}

        <section className="luoi-thong-ke">

          {danhSachThongKe.map(
            (tk) => (
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
            )
          )}

        </section>

        {/* =================================================
            DASHBOARD
        ================================================= */}

        <section className="bo-cuc-dashboard">

          {/* =================================================
              CỘT TRÁI
          ================================================= */}

          <div className="cot-dashboard-trai">

            {/* =================================================
                BIỂU ĐỒ
            ================================================= */}

            <div className="hang-bieu-do-dashboard">

              {/* =================================================
                  BIỂU ĐỒ LƯỢT GỬI
              ================================================= */}

              <div className="o-dashboard">

                <div className="tieu-de-o-dashboard">
                  <h2>
                    Thống kê lượt gửi xe
                    (7 ngày qua)
                  </h2>
                </div>

                <div className="bieu-do-luot-gui">

                  <div className="cot-y">

                    <span>
                      {maxLuotGui}
                    </span>

                    <span>
                      {Math.ceil(
                        maxLuotGui *
                          0.75
                      )}
                    </span>

                    <span>
                      {Math.ceil(
                        maxLuotGui *
                          0.5
                      )}
                    </span>

                    <span>
                      {Math.ceil(
                        maxLuotGui *
                          0.25
                      )}
                    </span>

                    <span>
                      0
                    </span>

                  </div>

                  <div className="khu-bieu-do">

                    <div className="duong-ke duong-ke-1" />
                    <div className="duong-ke duong-ke-2" />
                    <div className="duong-ke duong-ke-3" />
                    <div className="duong-ke duong-ke-4" />
                    <div className="duong-ke duong-ke-5" />

                    {lichSu.length === 0 ? (
                      <div
                        style={{
                          width: "100%",
                          height: "175px",
                          display: "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          color:
                            "#6b8fa3",
                        }}
                      >
                        Chưa có dữ liệu
                      </div>
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "175px",
                          display: "flex",
                          alignItems:
                            "flex-end",
                          justifyContent:
                            "space-around",
                          gap: 10,
                          padding:
                            "0 10px",
                          boxSizing:
                            "border-box",
                        }}
                      >

                        {thongKe7Ngay.map(
                          (item) => {

                            const chieuCao =
                              item.soLuot ===
                              0
                                ? 2
                                : Math.max(
                                    8,
                                    Math.round(
                                      (item.soLuot /
                                        maxLuotGui) *
                                        155
                                    )
                                  );

                            return (
                              <div
                                key={
                                  item.ngayKey
                                }
                                style={{
                                  flex: 1,
                                  height:
                                    "100%",
                                  display:
                                    "flex",
                                  alignItems:
                                    "flex-end",
                                  justifyContent:
                                    "center",
                                }}
                              >

                                <div
                                  title={`${item.soLuot} lượt`}
                                  style={{
                                    width:
                                      "70%",
                                    maxWidth:
                                      35,
                                    height:
                                      chieuCao,
                                    minHeight:
                                      2,
                                    borderRadius:
                                      "6px 6px 0 0",
                                    background:
                                      "#4c9cc3",
                                    transition:
                                      "height .2s ease",
                                  }}
                                />

                              </div>
                            );
                          }
                        )}

                      </div>
                    )}

                    <div className="nhan-ngay">

                      {thongKe7Ngay.map(
                        (item) => (
                          <span
                            key={
                              item.ngayKey
                            }
                          >
                            {dinhDangNgayNgan(
                              item.ngay
                            )}
                          </span>
                        )
                      )}

                    </div>

                  </div>

                </div>

              </div>

              {/* =================================================
                  TỶ LỆ PHƯƠNG TIỆN
              ================================================= */}

              <div className="o-dashboard">

                <div className="tieu-de-o-dashboard">

                  <h2>
                    Tỷ lệ phương tiện
                  </h2>

                </div>

                <div className="khu-bieu-do-tron">

                  <div
                    className="bieu-do-tron"
                    style={{
                      background:
                        tongPhuongTien ===
                        0
                          ? "#edf4f7"
                          : `conic-gradient(
                              #4c9cc3 0% ${tinhPhanTram(
                                thongKeLoaiXe.oto
                              )}%,
                              #55b88b ${tinhPhanTram(
                                thongKeLoaiXe.oto
                              )}% ${
                                tinhPhanTram(
                                  thongKeLoaiXe.oto
                                ) +
                                tinhPhanTram(
                                  thongKeLoaiXe.xeMay
                                )
                              }%,
                              #d9a441 ${
                                tinhPhanTram(
                                  thongKeLoaiXe.oto
                                ) +
                                tinhPhanTram(
                                  thongKeLoaiXe.xeMay
                                )
                              }% ${
                                tinhPhanTram(
                                  thongKeLoaiXe.oto
                                ) +
                                tinhPhanTram(
                                  thongKeLoaiXe.xeMay
                                ) +
                                tinhPhanTram(
                                  thongKeLoaiXe.xeDap
                                )
                              }%,
                              #a88bc2 ${
                                tinhPhanTram(
                                  thongKeLoaiXe.oto
                                ) +
                                tinhPhanTram(
                                  thongKeLoaiXe.xeMay
                                ) +
                                tinhPhanTram(
                                  thongKeLoaiXe.xeDap
                                )
                              }% 100%
                            )`,
                    }}
                  >

                    <div className="vong-tron-trong">

                      <strong>
                        {tongPhuongTien}
                      </strong>

                      <span>
                        Tổng phương tiện
                      </span>

                    </div>

                  </div>

                  <div className="chu-thich-bieu-do">

                    <div className="dong-chu-thich">

                      <span className="dau-cham mau-oto" />

                      <span>
                        Ô tô
                      </span>

                      <strong>
                        {tinhPhanTram(
                          thongKeLoaiXe.oto
                        )}
                        %
                      </strong>

                    </div>

                    <div className="dong-chu-thich">

                      <span className="dau-cham mau-xe-may" />

                      <span>
                        Xe máy
                      </span>

                      <strong>
                        {tinhPhanTram(
                          thongKeLoaiXe.xeMay
                        )}
                        %
                      </strong>

                    </div>

                    <div className="dong-chu-thich">

                      <span className="dau-cham mau-xe-dap" />

                      <span>
                        Xe đạp
                      </span>

                      <strong>
                        {tinhPhanTram(
                          thongKeLoaiXe.xeDap
                        )}
                        %
                      </strong>

                    </div>

                    <div className="dong-chu-thich">

                      <span className="dau-cham mau-khac" />

                      <span>
                        Khác
                      </span>

                      <strong>
                        {tinhPhanTram(
                          thongKeLoaiXe.khac
                        )}
                        %
                      </strong>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                BẢNG LƯỢT GỬI XE
            ================================================= */}

            <div className="o-dashboard bang-luot-gui">

              <div className="tieu-de-o-dashboard">

                <h2>
                  Lượt gửi xe gần đây
                </h2>

                <button
                  className="nut-xem-tat-ca"
                  type="button"
                  onClick={() =>
                    navigate(
                      "/admin/lich-su"
                    )
                  }
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
                      <th>
                        Cư dân / Khách
                      </th>
                      <th>
                        Thời gian vào
                      </th>
                      <th>
                        Thời gian ra
                      </th>
                      <th>
                        Trạng thái
                      </th>
                      <th>Phí</th>
                    </tr>

                  </thead>

                  <tbody>

                    {dangTai ? (

                      <tr>

                        <td
                          colSpan="8"
                          style={{
                            textAlign:
                              "center",
                            padding: 30,
                            color:
                              "#6b8fa3",
                          }}
                        >
                          Đang tải dữ liệu...
                        </td>

                      </tr>

                    ) : danhSachBang.length === 0 ? (

                      <tr>

                        <td
                          colSpan="8"
                          style={{
                            textAlign:
                              "center",
                            padding: 30,
                            color:
                              "#6b8fa3",
                          }}
                        >
                          Chưa có dữ liệu
                        </td>

                      </tr>

                    ) : (

                      danhSachBang.map(
                        (row, index) => {

                          const laKhach =
                            row.laXeKhach ===
                            true;

                          const dangGui =
                            laDangGui(
                              row
                            );

                          return (
                            <tr
                              key={
                                row.luotGuiXeId ||
                                index
                              }
                            >

                              <td>
                                {index + 1}
                              </td>

                              <td>
                                <strong>
                                  {row.bienSo ||
                                    "—"}
                                </strong>
                              </td>

                              <td>
                                {layTenLoaiXe(
                                  row
                                )}
                              </td>

                              <td>
                                {laKhach
                                  ? "Khách"
                                  : row.cuDan ||
                                    "—"}
                              </td>

                              <td>
                                {dinhDangThoiGian(
                                  row.thoiGianVao
                                )}
                              </td>

                              <td>
                                {dinhDangThoiGian(
                                  row.thoiGianRa
                                )}
                              </td>

                              <td>

                                <span
                                  className={`trang-thai ${
                                    dangGui
                                      ? "dang-gui"
                                      : "da-thanh-toan"
                                  }`}
                                >
                                  {laKhach &&
                                  row.trangThai ===
                                    "Đã thanh toán"
                                    ? "Đã thanh toán"
                                    : row.trangThai ||
                                      row.trangThaiGoc ||
                                      "—"}
                                </span>

                              </td>

                              <td>

                                {row.soTien !=
                                null
                                  ? dinhDangTien(
                                      row.soTien
                                    )
                                  : "—"}

                              </td>

                            </tr>
                          );
                        }
                      )

                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

          {/* =================================================
              CỘT PHẢI
          ================================================= */}

          <div className="cot-dashboard-phai">

            {/* =================================================
                THAO TÁC NHANH
            ================================================= */}

            <div className="o-dashboard thao-tac-nhanh">

              <h2>
                Thao tác nhanh
              </h2>

              {danhSachThaoTac.map(
                (tt) => (
                  <button
                    key={tt.ten}
                    type="button"
                    className="nut-thao-tac"
                    onClick={() =>
                      navigate(
                        tt.duongDan
                      )
                    }
                  >

                    <span className="icon-thao-tac">
                      {tt.icon}
                    </span>

                    <span>
                      {tt.ten}
                    </span>

                    <b>›</b>

                  </button>
                )
              )}

            </div>

            {/* =================================================
                HOẠT ĐỘNG GẦN ĐÂY
            ================================================= */}

            <div className="o-dashboard hoat-dong-gan-day">

              <h2>
                Hoạt động gần đây
              </h2>

              {dangTai ? (

                <div
                  style={{
                    padding:
                      "20px 0",
                    textAlign:
                      "center",
                    color:
                      "#6b8fa3",
                  }}
                >
                  Đang tải...
                </div>

              ) : danhSachHoatDong.length === 0 ? (

                <div
                  style={{
                    padding:
                      "20px 0",
                    textAlign:
                      "center",
                    color:
                      "#6b8fa3",
                  }}
                >
                  Chưa có hoạt động
                </div>

              ) : (

                danhSachHoatDong.map(
                  (hd, i) => (

                    <div
                      className="muc-hoat-dong"
                      key={
                        hd.luotGuiXeId ||
                        i
                      }
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

                  )
                )

              )}

            </div>

          </div>

        </section>

      </div>
    </div>
  );
}

export default TrangChu;
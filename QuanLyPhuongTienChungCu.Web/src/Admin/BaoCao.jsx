import React, { useEffect, useMemo, useState } from "react";
import "./BaoCao.css";

const API_BASE_URL = "http://localhost:5022";

// =====================================================
// ICON
// =====================================================

const IconCalendar = ({ size = 17 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <rect
      x="3"
      y="5"
      width="18"
      height="16"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M3 9H21"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M8 3V7M16 3V7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const IconCar = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M5 17H4C3.45 17 3 16.55 3 16V11.5C3 10.95 3.45 10.5 4 10.5H5.2L6.8 6.5C7.1 5.75 7.82 5.25 8.63 5.25H15.37C16.18 5.25 16.9 5.75 17.2 6.5L18.8 10.5H20C20.55 10.5 21 10.95 21 11.5V16C21 16.55 20.55 17 20 17H19"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 17V19M19 17V19M7 13.5H17"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle
      cx="7"
      cy="15.5"
      r="1"
      fill="currentColor"
    />
    <circle
      cx="17"
      cy="15.5"
      r="1"
      fill="currentColor"
    />
  </svg>
);

const IconUsers = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle
      cx="9"
      cy="8"
      r="3"
      stroke="currentColor"
      strokeWidth="1.8"
    />

    <path
      d="M3.5 19C3.9 15.8 5.8 14 9 14C12.2 14 14.1 15.8 14.5 19"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />

    <path
      d="M15 6.5C15.55 6.18 16.18 6 16.85 6C18.78 6 20.35 7.57 20.35 9.5C20.35 11.43 18.78 13 16.85 13"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />

    <path
      d="M16 15C18.7 15.25 20.25 16.55 20.5 19"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const IconMoney = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.8"
    />

    <circle
      cx="12"
      cy="12"
      r="2.5"
      stroke="currentColor"
      strokeWidth="1.8"
    />

    <path
      d="M7 9.5C7.8 9.5 8.5 8.8 8.5 8M17 14C16.2 14 15.5 14.7 15.5 15.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const IconExport = ({ size = 17 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M12 3V14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />

    <path
      d="M8 10L12 14L16 10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M5 14V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// =====================================================
// HELPERS
// =====================================================

const formatMoney = (value) => {
  const number = Number(value) || 0;

  return number.toLocaleString("vi-VN") + "đ";
};

const formatNumber = (value) => {
  return (Number(value) || 0).toLocaleString("vi-VN");
};

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("vi-VN");
};

const formatDateInput = (value) => {
  if (!value) return "";

  const parts = value.split("-");

  if (parts.length !== 3) {
    return value;
  }

  const [year, month, day] = parts;

  return `${day}/${month}/${year}`;
};

const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getFirstDayOfMonth = () => {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  return `${year}-${month}-01`;
};

// =====================================================
// COMPONENT
// =====================================================

const BaoCao = () => {
  const [tuNgay, setTuNgay] = useState(
    getFirstDayOfMonth()
  );

  const [denNgay, setDenNgay] = useState(
    getToday()
  );

  const [loaiXe, setLoaiXe] = useState("ALL");

  const [tongQuan, setTongQuan] = useState({
    tongPhuongTien: 0,
    xeCuDan: 0,
    xeKhach: 0,
    luotGui: 0,
    doanhThu: 0,
  });

  const [doanhThu, setDoanhThu] = useState([]);

  const [luotGui, setLuotGui] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("jwt") ||
      ""
    );
  };

  // =====================================================
  // FETCH API
  // =====================================================

  const fetchApi = async (url) => {
    const token = getToken();

    const headers = {
      Accept: "application/json",
    };

    if (token) {
      headers.Authorization =
        `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    const text =
      await response.text();

    if (!response.ok) {
      console.error(
        "API ERROR:",
        response.status,
        url,
        text
      );

      if (response.status === 401) {
        throw new Error(
          "Phiên đăng nhập đã hết hạn hoặc chưa đăng nhập."
        );
      }

      if (response.status === 403) {
        throw new Error(
          "Bạn không có quyền xem báo cáo."
        );
      }

      if (response.status === 404) {
        throw new Error(
          `Không tìm thấy API: ${url}`
        );
      }

      throw new Error(
        `API trả về lỗi ${response.status}.`
      );
    }

    if (!text.trim()) {
      return {};
    }

    if (
      contentType.includes(
        "application/json"
      ) ||
      text.trim().startsWith("{") ||
      text.trim().startsWith("[")
    ) {
      try {
        return JSON.parse(text);
      } catch {
        throw new Error(
          "API trả về JSON không hợp lệ."
        );
      }
    }

    console.error(
      "API không trả JSON:",
      text
    );

    throw new Error(
      "API không trả về dữ liệu JSON."
    );
  };

  // =====================================================
  // FETCH BÁO CÁO
  // =====================================================

  const fetchBaoCao = async () => {
    if (
      tuNgay &&
      denNgay &&
      tuNgay > denNgay
    ) {
      setError(
        "Ngày bắt đầu không được lớn hơn ngày kết thúc."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      const params =
        new URLSearchParams();

      if (tuNgay) {
        params.set(
          "tuNgay",
          tuNgay
        );
      }

      if (denNgay) {
        params.set(
          "denNgay",
          denNgay
        );
      }

      if (
        loaiXe &&
        loaiXe !== "ALL"
      ) {
        params.set(
          "loaiXe",
          loaiXe
        );
      }

      const query =
        params.toString();

      const urls = {
        tongQuan:
          `${API_BASE_URL}/api/BaoCao/tong-quan?${query}`,

        doanhThu:
          `${API_BASE_URL}/api/BaoCao/doanh-thu?${query}`,

        luotGui:
          `${API_BASE_URL}/api/BaoCao/luot-gui?${query}`,
      };

      console.log(
        "Đang gọi báo cáo:",
        urls
      );

      const [
        tongQuanData,
        doanhThuData,
        luotGuiData,
      ] = await Promise.all([
        fetchApi(urls.tongQuan),
        fetchApi(urls.doanhThu),
        fetchApi(urls.luotGui),
      ]);

      setTongQuan({
        tongPhuongTien:
          Number(
            tongQuanData?.tongPhuongTien
          ) || 0,

        xeCuDan:
          Number(
            tongQuanData?.xeCuDan
          ) || 0,

        xeKhach:
          Number(
            tongQuanData?.xeKhach
          ) || 0,

        luotGui:
          Number(
            tongQuanData?.luotGui
          ) || 0,

        doanhThu:
          Number(
            tongQuanData?.doanhThu
          ) || 0,
      });

      setDoanhThu(
        Array.isArray(
          doanhThuData
        )
          ? doanhThuData
          : []
      );

      setLuotGui(
        Array.isArray(
          luotGuiData
        )
          ? luotGuiData
          : []
      );
    } catch (err) {
      console.error(
        "Lỗi tải báo cáo:",
        err
      );

      setError(
        err?.message ||
        "Không thể kết nối đến hệ thống báo cáo."
      );

      setTongQuan({
        tongPhuongTien: 0,
        xeCuDan: 0,
        xeKhach: 0,
        luotGui: 0,
        doanhThu: 0,
      });

      setDoanhThu([]);

      setLuotGui([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD
  // =====================================================

  useEffect(() => {
    fetchBaoCao();
  }, [
    tuNgay,
    denNgay,
    loaiXe,
  ]);

  // =====================================================
  // DOANH THU
  // =====================================================

  const doanhThuNormalized =
    useMemo(() => {
      return doanhThu.map(
        (item) => ({
          ngay:
            item.ngay,

          giaTri:
            Number(
              item.giaTri
            ) || 0,
        })
      );
    }, [doanhThu]);

  const maxDoanhThu =
    useMemo(() => {
      if (
        doanhThuNormalized.length === 0
      ) {
        return 1;
      }

      return Math.max(
        ...doanhThuNormalized.map(
          (item) =>
            item.giaTri
        ),
        1
      );
    }, [doanhThuNormalized]);

  // =====================================================
  // TỔNG PHƯƠNG TIỆN
  // =====================================================

  const tongPhuongTien =
    Number(
      tongQuan.tongPhuongTien
    ) || 0;

  // =====================================================
  // EXPORT CSV
  // =====================================================

  const xuatBaoCao = () => {
    const rows = [
      [
        "BÁO CÁO HỆ THỐNG QUẢN LÝ PHƯƠNG TIỆN",
      ],

      [],

      [
        "Khoảng thời gian",
        `${formatDateInput(
          tuNgay
        )} - ${formatDateInput(
          denNgay
        )}`,
      ],

      [
        "Loại xe",
        loaiXe === "ALL"
          ? "Tất cả loại xe"
          : loaiXe,
      ],

      [],

      ["TỔNG QUAN"],

      [
        "Tổng phương tiện",
        tongQuan.tongPhuongTien,
      ],

      [
        "Xe cư dân",
        tongQuan.xeCuDan,
      ],

      [
        "Xe khách",
        tongQuan.xeKhach,
      ],

      [
        "Lượt gửi xe",
        tongQuan.luotGui,
      ],

      [
        "Doanh thu",
        tongQuan.doanhThu,
      ],

      [],

      ["DOANH THU THEO NGÀY"],

      [
        "Ngày",
        "Doanh thu",
      ],

      ...doanhThuNormalized.map(
        (item) => [
          formatDate(
            item.ngay
          ),
          item.giaTri,
        ]
      ),

      [],

      ["THỐNG KÊ LƯỢT GỬI"],

      [
        "Ngày",
        "Loại xe",
        "Đối tượng",
        "Số lượt",
        "Doanh thu",
      ],

      ...luotGui.map(
        (item) => [
          formatDate(
            item.ngay
          ),
          item.loaiXe,
          item.doiTuong,
          item.soLuot,
          item.doanhThu,
        ]
      ),
    ];

    const csv =
      rows
        .map(
          (row) =>
            row
              .map((cell) => {
                const value =
                  String(
                    cell ?? ""
                  );

                if (
                  value.includes(",") ||
                  value.includes('"') ||
                  value.includes("\n")
                ) {
                  return `"${value.replace(
                    /"/g,
                    '""'
                  )}"`;
                }

                return value;
              })
              .join(",")
        )
        .join("\n");

    const blob =
      new Blob(
        ["\uFEFF" + csv],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const a =
      document.createElement(
        "a"
      );

    a.href = url;

    a.download =
      `bao-cao-${tuNgay}-${denNgay}.csv`;

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="bc-wrapper">
      <div className="bc-body">

        {/* HEADER */}

        <div className="bc-title-bar">
          <div>
            <h2>Báo cáo</h2>

            <p className="bc-subtitle">
              Tổng hợp tình hình phương tiện,
              lượt gửi xe và doanh thu
            </p>
          </div>

          <button
            className="bc-btn-export"
            onClick={xuatBaoCao}
            disabled={loading}
          >
            <IconExport size={17} />

            {loading
              ? "Đang tải..."
              : "Xuất báo cáo"}
          </button>
        </div>

        {/* FILTER */}

        <div className="bc-filter-card">
          <div className="bc-filter-title">
            Bộ lọc báo cáo
          </div>

          <div className="bc-filter-content">

            <div className="bc-filter-group">
              <label>Từ ngày</label>

              <div className="bc-date-input">
                <IconCalendar size={17} />

                <input
                  type="date"
                  value={tuNgay}
                  max={denNgay}
                  onChange={(e) =>
                    setTuNgay(
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            <div className="bc-filter-group">
              <label>Đến ngày</label>

              <div className="bc-date-input">
                <IconCalendar size={17} />

                <input
                  type="date"
                  value={denNgay}
                  min={tuNgay}
                  onChange={(e) =>
                    setDenNgay(
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            <div className="bc-filter-group">
              <label>Loại xe</label>

              <select
                value={loaiXe}
                onChange={(e) =>
                  setLoaiXe(
                    e.target.value
                  )
                }
              >
                <option value="ALL">
                  Tất cả loại xe
                </option>

                <option value="OTO">
                  Ô tô
                </option>

                <option value="XEMAY">
                  Xe máy
                </option>

                <option value="XEDAP">
                  Xe đạp
                </option>

                <option value="KHAC">
                  Khác
                </option>
              </select>
            </div>

          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="bc-error">
            <strong>
              Không thể tải báo cáo
            </strong>

            <span>{error}</span>

            <button
              type="button"
              onClick={fetchBaoCao}
            >
              Thử lại
            </button>
          </div>
        )}

        {/* STAT */}

        <div className="bc-stat-row">

          <div className="bc-stat-card">
            <div className="bc-stat-icon blue">
              <IconCar size={21} />
            </div>

            <div className="bc-stat-content">
              <span className="bc-stat-label">
                Tổng phương tiện
              </span>

              <strong className="bc-stat-value">
                {formatNumber(
                  tongPhuongTien
                )}
              </strong>

              <span className="bc-stat-detail">
                Xe cư dân + xe khách
              </span>
            </div>
          </div>

          <div className="bc-stat-card">
            <div className="bc-stat-icon green">
              <IconUsers size={21} />
            </div>

            <div className="bc-stat-content">
              <span className="bc-stat-label">
                Xe cư dân
              </span>

              <strong className="bc-stat-value">
                {formatNumber(
                  tongQuan.xeCuDan
                )}
              </strong>

              <span className="bc-stat-detail">
                Phương tiện đăng ký
              </span>
            </div>
          </div>

          <div className="bc-stat-card">
            <div className="bc-stat-icon orange">
              <IconCar size={21} />
            </div>

            <div className="bc-stat-content">
              <span className="bc-stat-label">
                Xe khách
              </span>

              <strong className="bc-stat-value">
                {formatNumber(
                  tongQuan.xeKhach
                )}
              </strong>

              <span className="bc-stat-detail">
                Xe khách trong kỳ
              </span>
            </div>
          </div>

          <div className="bc-stat-card">
            <div className="bc-stat-icon purple">
              <IconMoney size={21} />
            </div>

            <div className="bc-stat-content">
              <span className="bc-stat-label">
                Doanh thu
              </span>

              <strong className="bc-stat-value">
                {formatMoney(
                  tongQuan.doanhThu
                )}
              </strong>

              <span className="bc-stat-detail">
                Trong khoảng thời gian
              </span>
            </div>
          </div>

        </div>

        {/* SUMMARY */}

        <div className="bc-summary-card">

          <div className="bc-summary-item">
            <span>
              Tổng lượt gửi xe
            </span>

            <strong>
              {formatNumber(
                tongQuan.luotGui
              )}
            </strong>
          </div>

          <div className="bc-summary-divider" />

          <div className="bc-summary-item">
            <span>Từ ngày</span>

            <strong>
              {formatDateInput(
                tuNgay
              )}
            </strong>
          </div>

          <div className="bc-summary-divider" />

          <div className="bc-summary-item">
            <span>Đến ngày</span>

            <strong>
              {formatDateInput(
                denNgay
              )}
            </strong>
          </div>

          <div className="bc-summary-divider" />

          <div className="bc-summary-item">
            <span>Bộ lọc</span>

            <strong>
              {loaiXe === "ALL"
                ? "Tất cả"
                : loaiXe}
            </strong>
          </div>

        </div>

        {/* CHART GRID */}

        <div className="bc-section-grid">

          {/* DOANH THU */}

          <div className="bc-chart-card bc-revenue-card">

            <div className="bc-card-header">
              <div>
                <h3>
                  Doanh thu theo ngày
                </h3>

                <p>
                  Doanh thu phát sinh trong
                  khoảng thời gian đã chọn
                </p>
              </div>

              <span className="bc-card-total">
                {formatMoney(
                  tongQuan.doanhThu
                )}
              </span>
            </div>

            <div className="bc-bar-chart">

              <div className="bc-y-axis">
                <span>
                  {formatMoney(
                    maxDoanhThu
                  )}
                </span>

                <span>
                  {formatMoney(
                    maxDoanhThu * 0.75
                  )}
                </span>

                <span>
                  {formatMoney(
                    maxDoanhThu * 0.5
                  )}
                </span>

                <span>
                  {formatMoney(
                    maxDoanhThu * 0.25
                  )}
                </span>

                <span>0đ</span>
              </div>

              <div className="bc-chart-area">

                <div className="bc-grid-line line-1" />
                <div className="bc-grid-line line-2" />
                <div className="bc-grid-line line-3" />
                <div className="bc-grid-line line-4" />
                <div className="bc-grid-line line-5" />

                {doanhThuNormalized.length === 0 ? (
                  <div className="bc-chart-empty">
                    <IconMoney size={28} />

                    <span>
                      Chưa có dữ liệu doanh thu
                    </span>
                  </div>
                ) : (
                  <div className="bc-bars">

                    {doanhThuNormalized.map(
                      (item, index) => {
                        const value =
                          Number(
                            item.giaTri
                          ) || 0;

                        const height =
                          (value /
                            maxDoanhThu) *
                          100;

                        return (
                          <div
                            className="bc-bar-column"
                            key={`${item.ngay}-${index}`}
                          >

                            <div className="bc-bar-value">
                              {formatMoney(
                                value
                              )}
                            </div>

                            <div
                              className="bc-bar"
                              style={{
                                height:
                                  `${Math.max(
                                    height,
                                    value > 0
                                      ? 4
                                      : 0
                                  )}%`,
                              }}
                              title={`${formatDate(
                                item.ngay
                              )}: ${formatMoney(
                                value
                              )}`}
                            />

                            <span>
                              {formatDate(
                                item.ngay
                              )}
                            </span>

                          </div>
                        );
                      }
                    )}

                  </div>
                )}

              </div>
            </div>
          </div>

          {/* VEHICLE */}

          <div className="bc-chart-card">

            <div className="bc-card-header">
              <div>
                <h3>
                  Cơ cấu phương tiện
                </h3>

                <p>
                  Theo nhóm cư dân và khách
                </p>
              </div>
            </div>

            <div className="bc-vehicle-overview">

              <div className="bc-vehicle-circle">
                <strong>
                  {formatNumber(
                    tongPhuongTien
                  )}
                </strong>

                <span>
                  Tổng xe
                </span>
              </div>

              <div className="bc-vehicle-list">

                <div className="bc-vehicle-item">
                  <div>
                    <span className="bc-vehicle-dot resident" />

                    <span>
                      Xe cư dân
                    </span>
                  </div>

                  <strong>
                    {formatNumber(
                      tongQuan.xeCuDan
                    )}
                  </strong>
                </div>

                <div className="bc-vehicle-item">
                  <div>
                    <span className="bc-vehicle-dot guest" />

                    <span>
                      Xe khách
                    </span>
                  </div>

                  <strong>
                    {formatNumber(
                      tongQuan.xeKhach
                    )}
                  </strong>
                </div>

                <div className="bc-vehicle-item">
                  <div>
                    <span className="bc-vehicle-dot total" />

                    <span>
                      Tổng phương tiện
                    </span>
                  </div>

                  <strong>
                    {formatNumber(
                      tongPhuongTien
                    )}
                  </strong>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* PARKING HISTORY */}

        <div className="bc-table-card">

          <div className="bc-card-header">

            <div>
              <h3>
                Thống kê lượt gửi xe
              </h3>

              <p>
                Dữ liệu lượt gửi trong
                khoảng thời gian đã chọn
              </p>
            </div>

            <strong className="bc-table-total">
              {formatNumber(
                tongQuan.luotGui
              )}{" "}
              lượt
            </strong>

          </div>

          <div className="bc-table-scroll">

            <table className="bc-table">

              <thead>
                <tr>
                  <th>STT</th>
                  <th>Ngày</th>
                  <th>Loại xe</th>
                  <th>Đối tượng</th>
                  <th>Số lượt</th>
                  <th>Doanh thu</th>
                </tr>
              </thead>

              <tbody>

                {luotGui.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="bc-empty"
                    >
                      Chưa có dữ liệu lượt gửi
                    </td>
                  </tr>
                ) : (
                  luotGui.map(
                    (item, index) => (
                      <tr
                        key={`${item.ngay}-${item.loaiXe}-${item.doiTuong}-${index}`}
                      >

                        <td>
                          {index + 1}
                        </td>

                        <td>
                          {formatDate(
                            item.ngay
                          )}
                        </td>

                        <td>
                          <span className="bc-type-badge">
                            {item.loaiXe ||
                              "—"}
                          </span>
                        </td>

                        <td>
                          {item.doiTuong ||
                            "—"}
                        </td>

                        <td>
                          <strong>
                            {formatNumber(
                              item.soLuot
                            )}
                          </strong>
                        </td>

                        <td>
                          <strong className="bc-money">
                            {formatMoney(
                              item.doanhThu
                            )}
                          </strong>
                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>

            </table>

          </div>
        </div>

        {/* LOADING */}

        {loading && (
          <div className="bc-loading">
            <span className="bc-spinner" />

            Đang cập nhật dữ liệu báo cáo...
          </div>
        )}

      </div>
    </div>
  );
};

export default BaoCao;
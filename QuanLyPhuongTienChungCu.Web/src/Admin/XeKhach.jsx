import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import "./XeKhach.css";

const API_URL =
  "http://localhost:5022/api/Parking";

const SO_DONG_MOI_TRANG = 10;

function XeKhach() {
  const [duLieu, setDuLieu] = useState([]);
  const [loaiPhuongTien, setLoaiPhuongTien] =
    useState([]);

  const [tuKhoa, setTuKhoa] = useState("");
  const [tuNgay, setTuNgay] = useState("");
  const [denNgay, setDenNgay] = useState("");

  const [loading, setLoading] = useState(true);
  const [loi, setLoi] = useState("");

  const [trangHienTai, setTrangHienTai] =
    useState(1);

  const [showModal, setShowModal] =
    useState(false);

  const [bienSoMoi, setBienSoMoi] =
    useState("");

  const [
    loaiPhuongTienIdMoi,
    setLoaiPhuongTienIdMoi,
  ] = useState("");

  const [dangGhiNhan, setDangGhiNhan] =
    useState(false);

  const [loiGhiNhan, setLoiGhiNhan] =
    useState("");

  const [thongBao, setThongBao] =
    useState("");

  // =====================================================
  // TOKEN
  // =====================================================

  const layToken = () => {
    return (
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      ""
    );
  };

  // =====================================================
  // FORMAT
  // =====================================================

  const formatDateTime = (value) => {
    if (!value) {
      return "--";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "--";
    }

    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTien = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "--";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return "--";
    }

    return (
      number.toLocaleString("vi-VN") +
      " đ"
    );
  };

  // =====================================================
  // LOAD XE KHÁCH
  // =====================================================

  const taiDuLieu = async () => {
    try {
      setLoading(true);
      setLoi("");

      const token = layToken();

      console.log(
        "GET /guest - token:",
        token ? "Có token" : "Không có token"
      );

      const response = await fetch(
        `${API_URL}/guest`,
        {
          method: "GET",
          headers: {
            Accept:
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      console.log(
        "GET /guest status:",
        response.status
      );

      const data =
        await response
          .json()
          .catch(() => null);

      console.log(
        "GET /guest response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.title ||
            `Không thể tải dữ liệu xe khách. HTTP ${response.status}`
        );
      }

      const danhSach =
        Array.isArray(data)
          ? data
          : [];

      console.log(
        "Danh sách xe khách:",
        danhSach
      );

      setDuLieu(danhSach);
    } catch (error) {
      console.error(
        "Lỗi tải dữ liệu xe khách:",
        error
      );

      setLoi(
        error.message ||
          "Không thể kết nối đến máy chủ."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD LOẠI XE
  // =====================================================

  const taiLoaiPhuongTien =
    async () => {
      try {
        const token = layToken();

        const response =
          await fetch(
            `${API_URL}/loai-phuong-tien`,
            {
              method: "GET",
              headers: {
                Accept:
                  "application/json",
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response
            .json()
            .catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.title ||
              "Không thể tải danh sách loại xe."
          );
        }

        setLoaiPhuongTien(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Lỗi tải loại phương tiện:",
          error
        );

        setLoi(
          error.message ||
            "Không thể tải danh sách loại xe."
        );
      }
    };

  // =====================================================
  // LOAD
  // =====================================================

  useEffect(() => {
    taiDuLieu();
    taiLoaiPhuongTien();
  }, []);

  // =====================================================
  // LỌC
  // =====================================================

  const duLieuLoc = useMemo(() => {
    const keyword =
      tuKhoa
        .trim()
        .toLowerCase();

    return duLieu.filter(
      (item) => {
        const bienSo =
          String(
            item.bienSo || ""
          ).toLowerCase();

        const loaiXe =
          String(
            item.loaiXe || ""
          ).toLowerCase();

        const matchKeyword =
          !keyword ||
          bienSo.includes(
            keyword
          ) ||
          loaiXe.includes(
            keyword
          );

        if (!matchKeyword) {
          return false;
        }

        if (tuNgay) {
          const ngayVao =
            new Date(
              item.thoiGianVao
            );

          const start =
            new Date(
              `${tuNgay}T00:00:00`
            );

          if (ngayVao < start) {
            return false;
          }
        }

        if (denNgay) {
          const ngayVao =
            new Date(
              item.thoiGianVao
            );

          const end =
            new Date(
              `${denNgay}T23:59:59`
            );

          if (ngayVao > end) {
            return false;
          }
        }

        return true;
      }
    );
  }, [
    duLieu,
    tuKhoa,
    tuNgay,
    denNgay,
  ]);

  // =====================================================
  // PAGINATION
  // =====================================================

  const tongSoTrang =
    Math.max(
      1,
      Math.ceil(
        duLieuLoc.length /
          SO_DONG_MOI_TRANG
      )
    );

  useEffect(() => {
    if (
      trangHienTai >
      tongSoTrang
    ) {
      setTrangHienTai(
        tongSoTrang
      );
    }
  }, [
    trangHienTai,
    tongSoTrang,
  ]);

  useEffect(() => {
    setTrangHienTai(1);
  }, [
    tuKhoa,
    tuNgay,
    denNgay,
  ]);

  const duLieuHienThi =
    useMemo(() => {
      const start =
        (trangHienTai - 1) *
        SO_DONG_MOI_TRANG;

      return duLieuLoc.slice(
        start,
        start +
          SO_DONG_MOI_TRANG
      );
    }, [
      duLieuLoc,
      trangHienTai,
    ]);

  const viTriBatDau =
    duLieuLoc.length === 0
      ? 0
      : (trangHienTai - 1) *
          SO_DONG_MOI_TRANG +
        1;

  const viTriKetThuc =
    Math.min(
      trangHienTai *
        SO_DONG_MOI_TRANG,
      duLieuLoc.length
    );

  // =====================================================
  // MODAL
  // =====================================================

  const moModal = () => {
    setBienSoMoi("");
    setLoaiPhuongTienIdMoi("");
    setLoiGhiNhan("");
    setShowModal(true);
  };

  const dongModal = () => {
    if (dangGhiNhan) {
      return;
    }

    setShowModal(false);
    setBienSoMoi("");
    setLoaiPhuongTienIdMoi("");
    setLoiGhiNhan("");
  };

  // =====================================================
  // CHECK IN XE KHÁCH
  // =====================================================

  const ghiNhanXe = async (e) => {
    e.preventDefault();

    const bienSo =
      bienSoMoi.trim();

    if (!bienSo) {
      setLoiGhiNhan(
        "Vui lòng nhập biển số xe."
      );
      return;
    }

    if (!loaiPhuongTienIdMoi) {
      setLoiGhiNhan(
        "Vui lòng chọn loại xe."
      );
      return;
    }

    try {
      setDangGhiNhan(true);
      setLoiGhiNhan("");
      setLoi("");

      const token = layToken();

      const body = {
        bienSo,
        loaiPhuongTienId:
          Number(
            loaiPhuongTienIdMoi
          ),
      };

      console.log(
        "POST /guest-check-in:",
        body
      );

      const response =
        await fetch(
          `${API_URL}/guest-check-in`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Accept:
                "application/json",
              Authorization:
                `Bearer ${token}`,
            },
            body:
              JSON.stringify(body),
          }
        );

      const data =
        await response
          .json()
          .catch(() => null);

      console.log(
        "POST /guest-check-in:",
        response.status,
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.title ||
            `Không thể ghi nhận xe khách. HTTP ${response.status}`
        );
      }

      setShowModal(false);
      setBienSoMoi("");
      setLoaiPhuongTienIdMoi("");
      setLoiGhiNhan("");

      setThongBao(
        "Ghi nhận xe khách thành công."
      );

      await taiDuLieu();

      setTimeout(() => {
        setThongBao("");
      }, 3000);
    } catch (error) {
      console.error(
        "Lỗi ghi nhận xe khách:",
        error
      );

      setLoiGhiNhan(
        error.message ||
          "Không thể ghi nhận xe khách."
      );
    } finally {
      setDangGhiNhan(false);
    }
  };

  // =====================================================
  // CHECK OUT
  // =====================================================

  const checkout = async (
    bienSo
  ) => {
    const xacNhan =
      window.confirm(
        `Xác nhận xe ${bienSo} đã ra khỏi bãi?`
      );

    if (!xacNhan) {
      return;
    }

    try {
      setLoi("");

      const token = layToken();

      const response =
        await fetch(
          `${API_URL}/check-out`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Accept:
                "application/json",
              Authorization:
                `Bearer ${token}`,
            },
            body:
              JSON.stringify({
                bienSo,
              }),
          }
        );

      const data =
        await response
          .json()
          .catch(() => null);

      console.log(
        "POST /check-out:",
        response.status,
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.title ||
            `Không thể checkout xe. HTTP ${response.status}`
        );
      }

      setThongBao(
        `Xe ${bienSo} đã checkout thành công.`
      );

      await taiDuLieu();

      setTimeout(() => {
        setThongBao("");
      }, 3000);
    } catch (error) {
      console.error(
        "Lỗi checkout:",
        error
      );

      setLoi(
        error.message ||
          "Không thể checkout xe."
      );
    }
  };

  // =====================================================
  // TRẠNG THÁI
  // =====================================================

  const renderTrangThai = (
    item
  ) => {
    const status =
      String(
        item.trangThai || ""
      ).toUpperCase();

    if (
      status === "ACTIVE"
    ) {
      return (
        <span className="trang-thai dang-gui">
          Đang gửi
        </span>
      );
    }

    if (
      status === "COMPLETED"
    ) {
      return (
        <span className="trang-thai da-thanh-toan">
          Đã thanh toán
        </span>
      );
    }

    return (
      <span className="trang-thai trang-thai-khac">
        {item.trangThai ||
          "--"}
      </span>
    );
  };

  // =====================================================
  // THỜI GIAN GỬI
  // =====================================================

  const tinhThoiGianGui = (
    item
  ) => {
    if (
      !item.thoiGianVao ||
      !item.thoiGianRa
    ) {
      return "--";
    }

    const vao =
      new Date(
        item.thoiGianVao
      );

    const ra =
      new Date(
        item.thoiGianRa
      );

    if (
      Number.isNaN(
        vao.getTime()
      ) ||
      Number.isNaN(
        ra.getTime()
      )
    ) {
      return "--";
    }

    const soPhut =
      Math.max(
        0,
        Math.round(
          (ra - vao) /
            60000
        )
      );

    const gio =
      Math.floor(
        soPhut / 60
      );

    const phut =
      soPhut % 60;

    if (gio > 0) {
      return `${gio} giờ ${phut} phút`;
    }

    return `${phut} phút`;
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="noi-dung-xe-khach">
        <div className="trang-thai-loading">
          <div className="loading-spinner" />
          <span>
            Đang tải dữ liệu xe khách...
          </span>
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="noi-dung-xe-khach">

      {/* HEADER */}

      <div className="tieu-de-trang">
        <div>
          <h1>
            Xe khách
          </h1>

          <p className="mo-ta-trang">
            Quản lý các lượt xe khách
            ra vào bãi và lịch sử gửi xe.
          </p>
        </div>

        <button
          className="nut-them-moi"
          type="button"
          onClick={moModal}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M12 5v14M5 12h14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          Ghi nhận xe khách
        </button>
      </div>

      {/* THÔNG BÁO */}

      {thongBao && (
        <div className="thong-bao thanh-cong">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="m5 12 4 4L19 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <span>
            {thongBao}
          </span>
        </div>
      )}

      {/* LỖI */}

      {loi && (
        <div className="thong-bao bao-loi">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />

            <path
              d="M12 7v6M12 16v1"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          <span>
            {loi}
          </span>

          <button
            type="button"
            onClick={taiDuLieu}
            className="nut-thu-lai"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* BỘ LỌC */}

      <div className="bo-loc">

        <div className="o-tim-kiem-nho">
          <svg
            className="icon-tim-svg"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              cx="11"
              cy="11"
              r="6.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            />

            <path
              d="m16 16 4 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>

          <input
            type="text"
            placeholder="Tìm theo biển số, loại xe..."
            value={tuKhoa}
            onChange={(e) =>
              setTuKhoa(
                e.target.value
              )
            }
          />

          {tuKhoa && (
            <button
              type="button"
              className="nut-xoa-tim"
              onClick={() =>
                setTuKhoa("")
              }
            >
              ×
            </button>
          )}
        </div>

        <div className="o-loc-ngay">
          <svg
            className="icon-lich-svg"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <rect
              x="4"
              y="5"
              width="16"
              height="15"
              rx="2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            />

            <path
              d="M8 3v4M16 3v4M4 9h16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>

          <input
            type="date"
            value={tuNgay}
            onChange={(e) =>
              setTuNgay(
                e.target.value
              )
            }
          />

          <span className="gach-ngang">
            -
          </span>

          <input
            type="date"
            value={denNgay}
            onChange={(e) =>
              setDenNgay(
                e.target.value
              )
            }
          />

          {(tuNgay ||
            denNgay) && (
            <button
              type="button"
              className="nut-xoa-loc"
              onClick={() => {
                setTuNgay("");
                setDenNgay("");
              }}
            >
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      {/* BẢNG */}

      <div className="o-dashboard">
        <div className="vung-bang">
          <table className="bang-xe-khach">
            <thead>
              <tr>
                <th>
                  STT
                </th>

                <th>
                  Biển số xe
                </th>

                <th>
                  Loại xe
                </th>

                <th>
                  Thời gian vào
                </th>

                <th>
                  Thời gian ra
                </th>

                <th>
                  Thời gian gửi
                </th>

                <th>
                  Phí
                </th>

                <th>
                  Trạng thái
                </th>

                <th>
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody>
              {duLieuHienThi.length ===
              0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="o-trong-bang"
                  >
                    <div className="empty-state">
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <rect
                          x="3"
                          y="5"
                          width="18"
                          height="15"
                          rx="2"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />

                        <path
                          d="M7 9h10M7 13h7"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>

                      <strong>
                        Chưa có dữ liệu
                      </strong>

                      <span>
                        Không tìm thấy lượt xe khách phù hợp.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                duLieuHienThi.map(
                  (
                    item,
                    index
                  ) => {
                    const stt =
                      (trangHienTai -
                        1) *
                        SO_DONG_MOI_TRANG +
                      index +
                      1;

                    return (
                      <tr
                        key={
                          item.luotGuiXeId ||
                          `${item.bienSo}-${index}`
                        }
                      >
                        <td>
                          {stt}
                        </td>

                        <td>
                          <strong className="bien-so">
                            {item.bienSo ||
                              "--"}
                          </strong>
                        </td>

                        <td>
                          <span className="loai-xe-badge">
                            {item.loaiXe ||
                              "--"}
                          </span>
                        </td>

                        <td>
                          {formatDateTime(
                            item.thoiGianVao
                          )}
                        </td>

                        <td>
                          {formatDateTime(
                            item.thoiGianRa
                          )}
                        </td>

                        <td>
                          {tinhThoiGianGui(
                            item
                          )}
                        </td>

                        <td>
                          <strong>
                            {formatTien(
                              item.soTien
                            )}
                          </strong>
                        </td>

                        <td>
                          {renderTrangThai(
                            item
                          )}
                        </td>

                        <td>
                          {String(
                            item.trangThai ||
                              ""
                          ).toUpperCase() ===
                            "ACTIVE" && (
                            <button
                              type="button"
                              className="nut-checkout"
                              onClick={() =>
                                checkout(
                                  item.bienSo
                                )
                              }
                            >
                              Xe ra
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}

        <div className="chan-bang">
          <span>
            Hiển thị{" "}
            {viTriBatDau} -{" "}
            {viTriKetThuc} trong{" "}
            {duLieuLoc.length} lượt xe
          </span>

          <div className="phan-trang">
            <button
              type="button"
              disabled={
                trangHienTai <= 1
              }
              onClick={() =>
                setTrangHienTai(
                  (prev) =>
                    Math.max(
                      1,
                      prev - 1
                    )
                )
              }
            >
              ‹
            </button>

            {Array.from(
              {
                length:
                  tongSoTrang,
              },
              (_, index) =>
                index + 1
            )
              .filter(
                (page) => {
                  if (
                    tongSoTrang <=
                    5
                  ) {
                    return true;
                  }

                  return (
                    page === 1 ||
                    page ===
                      tongSoTrang ||
                    Math.abs(
                      page -
                        trangHienTai
                    ) <= 1
                  );
                }
              )
              .map(
                (
                  page,
                  index,
                  arr
                ) => {
                  const previous =
                    arr[
                      index - 1
                    ];

                  const showDots =
                    previous &&
                    page -
                      previous >
                      1;

                  return (
                    <React.Fragment
                      key={page}
                    >
                      {showDots && (
                        <span className="dau-cham">
                          ...
                        </span>
                      )}

                      <button
                        type="button"
                        className={
                          page ===
                          trangHienTai
                            ? "trang-dang-chon"
                            : ""
                        }
                        onClick={() =>
                          setTrangHienTai(
                            page
                          )
                        }
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                }
              )}

            <button
              type="button"
              disabled={
                trangHienTai >=
                tongSoTrang
              }
              onClick={() =>
                setTrangHienTai(
                  (prev) =>
                    Math.min(
                      tongSoTrang,
                      prev + 1
                    )
                )
              }
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}

      {showModal && (
        <div
          className="lop-modal"
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              dongModal();
            }
          }}
        >
          <div className="hop-modal">

            <div className="modal-header">
              <div>
                <h2>
                  Ghi nhận xe khách
                </h2>

                <p>
                  Nhập biển số và chọn loại xe.
                  Thời gian vào sẽ được hệ thống
                  tự động ghi nhận.
                </p>
              </div>

              <button
                type="button"
                className="nut-dong-modal"
                onClick={
                  dongModal
                }
                disabled={
                  dangGhiNhan
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                ghiNhanXe
              }
            >
              <div className="form-group">
                <label>
                  Biển số xe
                </label>

                <div className="o-nhap-bien-so">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <rect
                      x="3"
                      y="7"
                      width="18"
                      height="10"
                      rx="2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />

                    <path
                      d="M7 17v2M17 17v2M7 10h10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>

                  <input
                    type="text"
                    autoFocus
                    placeholder="Ví dụ: 30A-12345"
                    value={
                      bienSoMoi
                    }
                    onChange={(e) =>
                      setBienSoMoi(
                        e.target
                          .value
                          .toUpperCase()
                      )
                    }
                    disabled={
                      dangGhiNhan
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  Loại xe
                </label>

                <div className="o-chon-loai-xe">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      cx="6"
                      cy="17"
                      r="2.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />

                    <circle
                      cx="18"
                      cy="17"
                      r="2.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />

                    <path
                      d="M6 17l3-7h5l4 7M9 10l2 7M14 10h3l2 4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <select
                    value={
                      loaiPhuongTienIdMoi
                    }
                    onChange={(e) =>
                      setLoaiPhuongTienIdMoi(
                        e.target
                          .value
                      )
                    }
                    disabled={
                      dangGhiNhan
                    }
                  >
                    <option value="">
                      -- Chọn loại xe --
                    </option>

                    {loaiPhuongTien.map(
                      (item) => (
                        <option
                          key={
                            item.id
                          }
                          value={
                            item.id
                          }
                        >
                          {
                            item.tenLoai
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div className="ghi-chu-thoi-gian">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />

                  <path
                    d="M12 7v5l3 2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <span>
                  Thời gian vào sẽ được hệ thống
                  tự động lấy theo thời điểm ghi nhận.
                </span>
              </div>

              {loiGhiNhan && (
                <div className="loi-form">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />

                    <path
                      d="M12 7v6M12 16v1"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>

                  <span>
                    {loiGhiNhan}
                  </span>
                </div>
              )}

              <div className="modal-footer">
                <button
                  type="button"
                  className="nut-huy"
                  onClick={
                    dongModal
                  }
                  disabled={
                    dangGhiNhan
                  }
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="nut-xac-nhan"
                  disabled={
                    dangGhiNhan
                  }
                >
                  {dangGhiNhan ? (
                    <>
                      <span className="loading-spinner nho" />
                      Đang ghi nhận...
                    </>
                  ) : (
                    <>
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          d="m5 12 4 4L19 6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      Ghi nhận
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default XeKhach;
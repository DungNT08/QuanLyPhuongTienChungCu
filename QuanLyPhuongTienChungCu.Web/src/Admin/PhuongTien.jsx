import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./PhuongTien.css";

const API_URL =
  "http://localhost:5022/api";

const FORM_MAC_DINH = {
  bienSo: "",
  loaiPhuongTienId: "",
  maCanHo: "",
  trangThai: "ACTIVE",
};

function PhuongTien() {
  // =====================================================
  // STATE
  // =====================================================

  const [danhSach, setDanhSach] =
    useState([]);

  const [danhSachCanHo, setDanhSachCanHo] =
    useState([]);

  const [danhSachLoaiXe, setDanhSachLoaiXe] =
    useState([]);

  const [tuKhoa, setTuKhoa] =
    useState("");

  const [tuKhoaCanHo, setTuKhoaCanHo] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [loadingCanHo, setLoadingCanHo] =
    useState(false);

  const [loadingLoaiXe, setLoadingLoaiXe] =
    useState(false);

  const [dangLuu, setDangLuu] =
    useState(false);

  const [dangDuyet, setDangDuyet] =
    useState(false);

  const [loi, setLoi] =
    useState("");

  const [loiCanHo, setLoiCanHo] =
    useState("");

  const [hienThiModal, setHienThiModal] =
    useState(false);

  const [
    hienThiDropdownCanHo,
    setHienThiDropdownCanHo,
  ] = useState(false);

  const [dangSua, setDangSua] =
    useState(null);

  const [form, setForm] =
    useState(FORM_MAC_DINH);

  const apartmentRef =
    useRef(null);

  // =====================================================
  // TOKEN
  // =====================================================

  const layToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("jwt") ||
      null
    );
  };

  const taoHeaders = (
    coBody = false
  ) => {
    const token =
      layToken();

    const headers = {
      Accept:
        "application/json",
    };

    if (coBody) {
      headers[
        "Content-Type"
      ] =
        "application/json";
    }

    if (token) {
      headers[
        "Authorization"
      ] =
        `Bearer ${token}`;
    }

    return headers;
  };

  // =====================================================
  // XỬ LÝ LỖI API
  // =====================================================

  const layNoiDungLoi =
    async (response) => {
      try {
        const text =
          await response.text();

        if (!text) {
          return `HTTP ${response.status}`;
        }

        try {
          const data =
            JSON.parse(text);

          if (
            typeof data ===
            "string"
          ) {
            return data;
          }

          if (data.errors) {
            const messages =
              [];

            Object.values(
              data.errors
            ).forEach(
              (value) => {
                if (
                  Array.isArray(
                    value
                  )
                ) {
                  messages.push(
                    ...value
                  );
                }
              }
            );

            if (
              messages.length >
              0
            ) {
              return messages.join(
                ", "
              );
            }
          }

          return (
            data.message ||
            data.title ||
            data.error ||
            `HTTP ${response.status}`
          );
        } catch {
          return text;
        }
      } catch {
        return `HTTP ${response.status}`;
      }
    };

  // =====================================================
  // LOAD PHƯƠNG TIỆN
  // =====================================================

  const taiDanhSach =
    async () => {
      try {
        setLoading(true);
        setLoi("");

        const response =
          await fetch(
            `${API_URL}/PhuongTien`,
            {
              method: "GET",
              headers:
                taoHeaders(),
            }
          );

        if (
          !response.ok
        ) {
          throw new Error(
            await layNoiDungLoi(
              response
            )
          );
        }

        const data =
          await response.json();

        setDanhSach(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Lỗi tải phương tiện:",
          error
        );

        setDanhSach([]);

        setLoi(
          error.message ||
            "Không thể tải danh sách phương tiện."
        );
      } finally {
        setLoading(false);
      }
    };

  // =====================================================
  // LOAD CĂN HỘ
  // =====================================================

  const taiDanhSachCanHo =
    async () => {
      try {
        setLoadingCanHo(
          true
        );

        setLoiCanHo("");

        const response =
          await fetch(
            `${API_URL}/PhuongTien/can-ho`,
            {
              method: "GET",
              headers:
                taoHeaders(),
            }
          );

        if (
          !response.ok
        ) {
          throw new Error(
            await layNoiDungLoi(
              response
            )
          );
        }

        const data =
          await response.json();

        setDanhSachCanHo(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Lỗi tải căn hộ:",
          error
        );

        setDanhSachCanHo(
          []
        );

        setLoiCanHo(
          error.message ||
            "Không thể tải danh sách căn hộ."
        );
      } finally {
        setLoadingCanHo(
          false
        );
      }
    };

  // =====================================================
  // LOAD LOẠI PHƯƠNG TIỆN
  // =====================================================

  const taiDanhSachLoaiXe =
    async () => {
      try {
        setLoadingLoaiXe(
          true
        );

        const response =
          await fetch(
            `${API_URL}/PhuongTien/loai-phuong-tien`,
            {
              method: "GET",
              headers:
                taoHeaders(),
            }
          );

        if (
          !response.ok
        ) {
          throw new Error(
            await layNoiDungLoi(
              response
            )
          );
        }

        const data =
          await response.json();

        setDanhSachLoaiXe(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Lỗi tải loại phương tiện:",
          error
        );

        setDanhSachLoaiXe(
          []
        );

        setLoi(
          error.message ||
            "Không thể tải danh sách loại phương tiện."
        );
      } finally {
        setLoadingLoaiXe(
          false
        );
      }
    };

  // =====================================================
  // LOAD BAN ĐẦU
  // =====================================================

  useEffect(() => {
    taiDanhSach();
    taiDanhSachCanHo();
    taiDanhSachLoaiXe();
  }, []);

  // =====================================================
  // CLICK RA NGOÀI DROPDOWN
  // =====================================================

  useEffect(() => {
    const xuLyClickNgoai =
      (event) => {
        if (
          apartmentRef.current &&
          !apartmentRef.current.contains(
            event.target
          )
        ) {
          setHienThiDropdownCanHo(
            false
          );
        }
      };

    document.addEventListener(
      "mousedown",
      xuLyClickNgoai
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        xuLyClickNgoai
      );
    };
  }, []);

  // =====================================================
  // TÌM KIẾM PHƯƠNG TIỆN
  // =====================================================

  const danhSachLoc =
    useMemo(() => {
      const keyword =
        tuKhoa
          .trim()
          .toLowerCase();

      if (!keyword) {
        return danhSach;
      }

      return danhSach.filter(
        (item) => {
          const bienSo =
            String(
              item.bienSo ||
                ""
            ).toLowerCase();

          const loaiXe =
            String(
              item.loaiXe ||
                ""
            ).toLowerCase();

          const tenChuXe =
            String(
              item.tenChuXe ||
                ""
            ).toLowerCase();

          const maCanHo =
            String(
              item.maCanHo ||
                ""
            ).toLowerCase();

          const trangThai =
            String(
              item.trangThai ||
                ""
            ).toLowerCase();

          const trangThaiHienThi =
            hienThiTrangThai(
              item.trangThai
            ).toLowerCase();

          return (
            bienSo.includes(
              keyword
            ) ||
            loaiXe.includes(
              keyword
            ) ||
            tenChuXe.includes(
              keyword
            ) ||
            maCanHo.includes(
              keyword
            ) ||
            trangThai.includes(
              keyword
            ) ||
            trangThaiHienThi.includes(
              keyword
            )
          );
        }
      );
    }, [
      danhSach,
      tuKhoa,
    ]);

  // =====================================================
  // TÌM KIẾM CĂN HỘ
  // =====================================================

  const danhSachCanHoLoc =
    useMemo(() => {
      const keyword =
        tuKhoaCanHo
          .trim()
          .toLowerCase();

      if (!keyword) {
        return danhSachCanHo;
      }

      return danhSachCanHo.filter(
        (item) => {
          return (
            String(
              item.maCanHo ||
                ""
            )
              .toLowerCase()
              .includes(
                keyword
              ) ||
            String(
              item.hoTen ||
                ""
            )
              .toLowerCase()
              .includes(
                keyword
              )
          );
        }
      );
    }, [
      danhSachCanHo,
      tuKhoaCanHo,
    ]);

  // =====================================================
  // CĂN HỘ ĐANG CHỌN
  // =====================================================

  const canHoDangChon =
    useMemo(() => {
      const value =
        form.maCanHo
          .trim()
          .toUpperCase();

      if (!value) {
        return null;
      }

      return (
        danhSachCanHo.find(
          (item) =>
            String(
              item.maCanHo
            )
              .trim()
              .toUpperCase() ===
            value
        ) || null
      );
    }, [
      danhSachCanHo,
      form.maCanHo,
    ]);

  // =====================================================
  // MỞ MODAL THÊM
  // =====================================================

  const moThem = () => {
    setDangSua(null);

    setForm({
      ...FORM_MAC_DINH,
    });

    setTuKhoaCanHo("");

    setLoi("");
    setLoiCanHo("");

    setHienThiDropdownCanHo(
      false
    );

    setHienThiModal(
      true
    );
  };

  // =====================================================
  // MỞ MODAL SỬA
  // =====================================================

  const moSua = (item) => {
    setDangSua(item);

    setForm({
      bienSo:
        item.bienSo ||
        "",

      loaiPhuongTienId:
        item.loaiPhuongTienId !==
          null &&
        item.loaiPhuongTienId !==
          undefined
          ? String(
              item.loaiPhuongTienId
            )
          : "",

      maCanHo:
        item.maCanHo ||
        "",

      trangThai:
        item.trangThai ||
        "ACTIVE",
    });

    setTuKhoaCanHo(
      item.maCanHo ||
        ""
    );

    setLoi("");
    setLoiCanHo("");

    setHienThiDropdownCanHo(
      false
    );

    setHienThiModal(
      true
    );
  };

  // =====================================================
  // ĐÓNG MODAL
  // =====================================================

  const dongModal = () => {
    if (dangLuu) {
      return;
    }

    setHienThiModal(
      false
    );

    setHienThiDropdownCanHo(
      false
    );

    setDangSua(null);

    setForm({
      ...FORM_MAC_DINH,
    });

    setTuKhoaCanHo("");

    setLoi("");
    setLoiCanHo("");
  };

  // =====================================================
  // CHỌN CĂN HỘ
  // =====================================================

  const chonCanHo = (
    canHo
  ) => {
    setForm(
      (prev) => ({
        ...prev,
        maCanHo:
          canHo.maCanHo,
      })
    );

    setTuKhoaCanHo(
      canHo.maCanHo
    );

    setLoiCanHo("");

    setHienThiDropdownCanHo(
      false
    );
  };

  // =====================================================
  // NHẬP CĂN HỘ
  // =====================================================

  const thayDoiCanHo = (
    event
  ) => {
    const value =
      event.target.value;

    setForm(
      (prev) => ({
        ...prev,
        maCanHo: value,
      })
    );

    setTuKhoaCanHo(
      value
    );

    setHienThiDropdownCanHo(
      true
    );

    if (!value.trim()) {
      setLoiCanHo(
        "Vui lòng chọn hoặc nhập mã căn hộ."
      );

      return;
    }

    const tonTai =
      danhSachCanHo.some(
        (item) =>
          String(
            item.maCanHo
          )
            .trim()
            .toUpperCase() ===
          value
            .trim()
            .toUpperCase()
      );

    if (!tonTai) {
      setLoiCanHo(
        "Căn hộ được chọn không tồn tại."
      );
    } else {
      setLoiCanHo("");
    }
  };

  // =====================================================
  // FOCUS CĂN HỘ
  // =====================================================

  const focusCanHo =
    () => {
      setHienThiDropdownCanHo(
        true
      );
    };

  // =====================================================
  // CHỌN LOẠI XE
  // =====================================================

  const thayDoiLoaiXe = (
    event
  ) => {
    setForm(
      (prev) => ({
        ...prev,
        loaiPhuongTienId:
          event.target.value,
      })
    );

    setLoi("");
  };

  // =====================================================
  // KIỂM TRA FORM
  // =====================================================

  const kiemTraForm =
    () => {
      setLoi("");
      setLoiCanHo("");

      if (
        !form.bienSo.trim()
      ) {
        setLoi(
          "Vui lòng nhập biển số xe."
        );

        return false;
      }

      if (
        !form.loaiPhuongTienId ||
        Number(
          form.loaiPhuongTienId
        ) <= 0
      ) {
        setLoi(
          "Vui lòng chọn loại phương tiện."
        );

        return false;
      }

      const loaiXeTonTai =
        danhSachLoaiXe.some(
          (item) =>
            Number(
              item.loaiPhuongTienId ??
                item.id
            ) ===
            Number(
              form.loaiPhuongTienId
            )
        );

      if (
        danhSachLoaiXe.length >
          0 &&
        !loaiXeTonTai
      ) {
        setLoi(
          "Loại phương tiện được chọn không tồn tại."
        );

        return false;
      }

      if (
        !form.maCanHo.trim()
      ) {
        setLoi(
          "Vui lòng chọn hoặc nhập căn hộ."
        );

        setLoiCanHo(
          "Vui lòng chọn hoặc nhập mã căn hộ."
        );

        return false;
      }

      const canHo =
        danhSachCanHo.find(
          (item) =>
            String(
              item.maCanHo
            )
              .trim()
              .toUpperCase() ===
            form.maCanHo
              .trim()
              .toUpperCase()
        );

      if (!canHo) {
        setLoiCanHo(
          "Căn hộ được chọn không tồn tại."
        );

        setLoi(
          "Căn hộ được chọn không tồn tại."
        );

        return false;
      }

      return true;
    };

  // =====================================================
  // LƯU THÊM / SỬA
  // =====================================================

  const luu =
    async () => {
      if (dangLuu) {
        return;
      }

      if (!kiemTraForm()) {
        return;
      }

      try {
        setDangLuu(true);

        setLoi("");

        const canHo =
          danhSachCanHo.find(
            (item) =>
              String(
                item.maCanHo
              )
                .trim()
                .toUpperCase() ===
              form.maCanHo
                .trim()
                .toUpperCase()
          );

        if (!canHo) {
          setLoiCanHo(
            "Căn hộ được chọn không tồn tại."
          );

          setLoi(
            "Căn hộ được chọn không tồn tại."
          );

          return;
        }

        // =================================================
        // BODY
        // =================================================

        const body = {
          ...(dangSua
            ? {
                phuongTienId:
                  dangSua.phuongTienId,
              }
            : {}),

          bienSo:
            form.bienSo
              .trim()
              .toUpperCase(),

          loaiPhuongTienId:
            Number(
              form.loaiPhuongTienId
            ),

          maCanHo:
            canHo.maCanHo,

          // =================================================
          // Khi thêm mới:
          // Admin sẽ luôn ACTIVE ở backend.
          //
          // Khi sửa:
          // lấy trạng thái đang chọn.
          // =================================================

          trangThai:
            dangSua
              ? form.trangThai
              : "ACTIVE",
        };

        const url =
          dangSua
            ? `${API_URL}/PhuongTien/${dangSua.phuongTienId}`
            : `${API_URL}/PhuongTien`;

        const method =
          dangSua
            ? "PUT"
            : "POST";

        const response =
          await fetch(
            url,
            {
              method,

              headers:
                taoHeaders(
                  true
                ),

              body:
                JSON.stringify(
                  body
                ),
            }
          );

        if (
          !response.ok
        ) {
          throw new Error(
            await layNoiDungLoi(
              response
            )
          );
        }

        const laSua =
          Boolean(
            dangSua
          );

        setHienThiModal(
          false
        );

        setHienThiDropdownCanHo(
          false
        );

        setDangSua(null);

        setForm({
          ...FORM_MAC_DINH,
        });

        setTuKhoaCanHo("");

        setLoi("");
        setLoiCanHo("");

        await taiDanhSach();

        alert(
          laSua
            ? "Cập nhật phương tiện thành công."
            : "Thêm phương tiện thành công."
        );
      } catch (error) {
        console.error(
          "Lỗi lưu phương tiện:",
          error
        );

        setLoi(
          error.message ||
            "Không thể lưu phương tiện."
        );
      } finally {
        setDangLuu(false);
      }
    };

  // =====================================================
  // XÓA
  // =====================================================

  const xoa =
    async (item) => {
      const dongY =
        window.confirm(
          `Bạn chắc chắn muốn xóa phương tiện ${item.bienSo}?`
        );

      if (!dongY) {
        return;
      }

      try {
        setLoi("");

        const response =
          await fetch(
            `${API_URL}/PhuongTien/${item.phuongTienId}`,
            {
              method:
                "DELETE",

              headers:
                taoHeaders(),
            }
          );

        if (
          !response.ok
        ) {
          throw new Error(
            await layNoiDungLoi(
              response
            )
          );
        }

        const data =
          await response
            .json()
            .catch(
              () => ({})
            );

        await taiDanhSach();

        alert(
          data.message ||
            "Xóa phương tiện thành công."
        );
      } catch (error) {
        console.error(
          "Lỗi xóa phương tiện:",
          error
        );

        setLoi(
          error.message ||
            "Không thể xóa phương tiện."
        );
      }
    };

  // =====================================================
  // DUYỆT PHƯƠNG TIỆN
  // =====================================================

  const duyetPhuongTien =
    async (item) => {
      const dongY =
        window.confirm(
          `Bạn có chắc muốn duyệt phương tiện ${item.bienSo} của ${item.tenChuXe || "cư dân"}?`
        );

      if (!dongY) {
        return;
      }

      try {
        setDangDuyet(true);

        setLoi("");

        const response =
          await fetch(
            `${API_URL}/PhuongTien/${item.phuongTienId}/duyet`,
            {
              method:
                "PUT",

              headers:
                taoHeaders(),
            }
          );

        if (
          !response.ok
        ) {
          throw new Error(
            await layNoiDungLoi(
              response
            )
          );
        }

        const data =
          await response
            .json()
            .catch(
              () => ({})
            );

        await taiDanhSach();

        alert(
          data.message ||
            "Duyệt phương tiện thành công."
        );
      } catch (error) {
        console.error(
          "Lỗi duyệt phương tiện:",
          error
        );

        setLoi(
          error.message ||
            "Không thể duyệt phương tiện."
        );
      } finally {
        setDangDuyet(false);
      }
    };

  // =====================================================
  // TỪ CHỐI PHƯƠNG TIỆN
  // =====================================================

  const tuChoiPhuongTien =
    async (item) => {
      const dongY =
        window.confirm(
          `Bạn có chắc muốn từ chối phương tiện ${item.bienSo} của ${item.tenChuXe || "cư dân"}?`
        );

      if (!dongY) {
        return;
      }

      try {
        setDangDuyet(true);

        setLoi("");

        const response =
          await fetch(
            `${API_URL}/PhuongTien/${item.phuongTienId}/tu-choi`,
            {
              method:
                "PUT",

              headers:
                taoHeaders(),
            }
          );

        if (
          !response.ok
        ) {
          throw new Error(
            await layNoiDungLoi(
              response
            )
          );
        }

        const data =
          await response
            .json()
            .catch(
              () => ({})
            );

        await taiDanhSach();

        alert(
          data.message ||
            "Đã từ chối phương tiện."
        );
      } catch (error) {
        console.error(
          "Lỗi từ chối phương tiện:",
          error
        );

        setLoi(
          error.message ||
            "Không thể từ chối phương tiện."
        );
      } finally {
        setDangDuyet(false);
      }
    };

  // =====================================================
  // HIỂN THỊ LOẠI XE
  // =====================================================

  const hienThiLoaiXe =
    (item) => {
      if (
        item.loaiXe
      ) {
        return item.loaiXe;
      }

      const loai =
        danhSachLoaiXe.find(
          (x) =>
            Number(
              x.loaiPhuongTienId ??
                x.id
            ) ===
            Number(
              item.loaiPhuongTienId
            )
        );

      if (loai) {
        return (
          loai.tenLoai ||
          loai.ten ||
          "Không xác định"
        );
      }

      return "Không xác định";
    };

  // =====================================================
  // HIỂN THỊ TRẠNG THÁI
  // =====================================================

  function hienThiTrangThai(
    trangThai
  ) {
    const value =
      String(
        trangThai || ""
      ).toUpperCase();

    if (
      value ===
      "ACTIVE"
    ) {
      return "Đang hoạt động";
    }

    if (
      value ===
      "PENDING"
    ) {
      return "Chờ duyệt";
    }

    if (
      value ===
      "INACTIVE"
    ) {
      return "Ngừng hoạt động";
    }

    return (
      trangThai ||
      "Không xác định"
    );
  }

  // =====================================================
  // CLASS TRẠNG THÁI
  // =====================================================

  const layClassTrangThai =
    (trangThai) => {
      const value =
        String(
          trangThai || ""
        ).toUpperCase();

      if (
        value ===
        "ACTIVE"
      ) {
        return "pt-status pt-status-active";
      }

      if (
        value ===
        "PENDING"
      ) {
        return "pt-status pt-status-pending";
      }

      return "pt-status pt-status-inactive";
    };

  // =====================================================
  // KIỂM TRA PENDING
  // =====================================================

  const laChoDuyet =
    (item) => {
      return (
        String(
          item?.trangThai ||
            ""
        ).toUpperCase() ===
        "PENDING"
      );
    };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="pt-wrapper">

      <div className="pt-body">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="pt-title-bar">

          <div>

            <h2>
              Phương tiện cư dân
            </h2>

            <p className="pt-subtitle">
              Quản lý phương tiện theo căn hộ
            </p>

          </div>

          <button
            type="button"
            className="pt-btn-add"
            onClick={
              moThem
            }
          >
            <span>
              ＋
            </span>

            Thêm phương tiện
          </button>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {loi &&
          !hienThiModal && (
            <div className="pt-error">
              ⚠️ {loi}
            </div>
          )}

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="pt-table-box">

          <div className="pt-table-toolbar">

            <div className="pt-search">

              <span className="pt-search-icon">
                🔍
              </span>

              <input
                type="text"
                value={
                  tuKhoa
                }
                onChange={(
                  e
                ) =>
                  setTuKhoa(
                    e.target
                      .value
                  )
                }
                placeholder="Tìm kiếm biển số, tên cư dân, căn hộ..."
              />

              {tuKhoa && (
                <button
                  type="button"
                  className="pt-search-clear"
                  onClick={() =>
                    setTuKhoa(
                      ""
                    )
                  }
                >
                  ×
                </button>
              )}

            </div>

            <div className="pt-total">

              {danhSachLoc.length}{" "}
              phương tiện

            </div>

          </div>

          <div className="pt-table-scroll">

            <table className="pt-table">

              <thead>

                <tr>

                  <th className="pt-col-stt">
                    STT
                  </th>

                  <th>
                    Biển số xe
                  </th>

                  <th>
                    Loại xe
                  </th>

                  <th>
                    Cư dân
                  </th>

                  <th>
                    Căn hộ
                  </th>

                  <th>
                    Trạng thái
                  </th>

                  <th className="pt-col-action">
                    Thao tác
                  </th>

                </tr>

              </thead>

              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="pt-empty"
                    >

                      <div className="pt-loading">

                        <span className="pt-spinner" />

                        Đang tải dữ liệu...

                      </div>

                    </td>

                  </tr>

                ) : danhSachLoc.length ===
                  0 ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="pt-empty"
                    >

                      <div className="pt-empty-icon">
                        🚗
                      </div>

                      <div>

                        {tuKhoa
                          ? "Không tìm thấy phương tiện phù hợp."
                          : "Chưa có dữ liệu phương tiện."}

                      </div>

                    </td>

                  </tr>

                ) : (

                  danhSachLoc.map(
                    (
                      item,
                      index
                    ) => (

                      <tr
                        key={
                          item.phuongTienId
                        }
                      >

                        {/* STT */}

                        <td>
                          {index +
                            1}
                        </td>

                        {/* BIỂN SỐ */}

                        <td>

                          <span className="pt-license">

                            {item.bienSo}

                          </span>

                        </td>

                        {/* LOẠI XE */}

                        <td>

                          <span className="pt-type">

                            {hienThiLoaiXe(
                              item
                            )}

                          </span>

                        </td>

                        {/* CƯ DÂN */}

                        <td>

                          <div className="pt-owner">

                            <span className="pt-owner-icon">
                              👤
                            </span>

                            <span>
                              {item.tenChuXe ||
                                "Chưa có"}
                            </span>

                          </div>

                        </td>

                        {/* CĂN HỘ */}

                        <td>

                          <span className="pt-apartment">

                            {item.maCanHo ||
                              "Chưa có"}

                          </span>

                        </td>

                        {/* TRẠNG THÁI */}

                        <td>

                          <span
                            className={layClassTrangThai(
                              item.trangThai
                            )}
                          >

                            <span className="pt-status-dot" />

                            {hienThiTrangThai(
                              item.trangThai
                            )}

                          </span>

                        </td>

                        {/* THAO TÁC */}

                        <td>

                          <div className="pt-actions">

                            {laChoDuyet(
                              item
                            ) ? (

                              <>
                                <button
                                  type="button"
                                  className="pt-action-approve"
                                  title="Duyệt phương tiện"
                                  onClick={() =>
                                    duyetPhuongTien(
                                      item
                                    )
                                  }
                                  disabled={
                                    dangDuyet
                                  }
                                >
                                  ✓
                                </button>

                                <button
                                  type="button"
                                  className="pt-action-reject"
                                  title="Từ chối phương tiện"
                                  onClick={() =>
                                    tuChoiPhuongTien(
                                      item
                                    )
                                  }
                                  disabled={
                                    dangDuyet
                                  }
                                >
                                  ×
                                </button>
                              </>

                            ) : (

                              <>
                                <button
                                  type="button"
                                  className="pt-action-edit"
                                  title="Sửa"
                                  onClick={() =>
                                    moSua(
                                      item
                                    )
                                  }
                                >
                                  ✏️
                                </button>

                                <button
                                  type="button"
                                  className="pt-action-delete"
                                  title="Xóa"
                                  onClick={() =>
                                    xoa(
                                      item
                                    )
                                  }
                                >
                                  🗑️
                                </button>
                              </>

                            )}

                          </div>

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

          <div className="pt-pagination">

            <span>

              Hiển thị{" "}

              <strong>
                {danhSachLoc.length >
                0
                  ? 1
                  : 0}
              </strong>{" "}

              -{" "}

              <strong>
                {
                  danhSachLoc.length
                }
              </strong>{" "}

              trong{" "}

              <strong>
                {
                  danhSach.length
                }
              </strong>{" "}

              phương tiện

            </span>

          </div>

        </div>

      </div>

      {/* =====================================================
          MODAL
      ===================================================== */}

      {hienThiModal && (

        <div
          className="pt-modal-overlay"
          onMouseDown={(
            e
          ) => {

            if (
              e.target ===
              e.currentTarget
            ) {
              dongModal();
            }

          }}
        >

          <div
            className="pt-modal"
            onMouseDown={(
              e
            ) =>
              e.stopPropagation()
            }
          >

            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="pt-modal-header">

              <div>

                <h3>

                  {dangSua
                    ? "Cập nhật thông tin phương tiện"
                    : "Thêm phương tiện"}

                </h3>

                <p>

                  {dangSua
                    ? "Chỉnh sửa thông tin phương tiện"
                    : "Nhập thông tin phương tiện bên dưới"}

                </p>

              </div>

              <button
                type="button"
                className="pt-close"
                onClick={
                  dongModal
                }
                disabled={
                  dangLuu
                }
              >
                ×
              </button>

            </div>

            {/* =================================================
                MODAL BODY
            ================================================= */}

            <div className="pt-modal-body">

              {loi && (
                <div className="pt-modal-error">
                  ⚠️ {loi}
                </div>
              )}

              {/* BIỂN SỐ */}

              <div className="pt-form-group">

                <label>

                  Biển số xe{" "}

                  <span>*</span>

                </label>

                <input
                  type="text"
                  value={
                    form.bienSo
                  }
                  onChange={(
                    e
                  ) =>
                    setForm(
                      (
                        prev
                      ) => ({
                        ...prev,
                        bienSo:
                          e.target
                            .value,
                      })
                    )
                  }
                  placeholder="Ví dụ: 30B-67890"
                  disabled={
                    dangLuu
                  }
                  autoComplete="off"
                />

              </div>

              {/* LOẠI XE */}

              <div className="pt-form-group">

                <label>

                  Loại xe{" "}

                  <span>*</span>

                </label>

                <div className="pt-select-wrapper">

                  <select
                    value={
                      form.loaiPhuongTienId
                    }
                    onChange={
                      thayDoiLoaiXe
                    }
                    disabled={
                      dangLuu ||
                      loadingLoaiXe
                    }
                  >

                    <option value="">

                      {loadingLoaiXe
                        ? "Đang tải loại xe..."
                        : "-- Chọn loại xe --"}

                    </option>

                    {danhSachLoaiXe.map(
                      (
                        item
                      ) => {

                        const id =
                          item.loaiPhuongTienId ??
                          item.id;

                        const ten =
                          item.tenLoai ??
                          item.ten ??
                          item.name;

                        return (
                          <option
                            key={id}
                            value={id}
                          >
                            {ten}
                          </option>
                        );

                      }
                    )}

                  </select>

                </div>

              </div>

              {/* CĂN HỘ */}

              <div className="pt-form-group">

                <label>

                  Căn hộ{" "}

                  <span>*</span>

                </label>

                <div
                  className="pt-apartment-wrapper"
                  ref={
                    apartmentRef
                  }
                >

                  <div className="pt-apartment-input-wrap">

                    <input
                      type="text"
                      value={
                        tuKhoaCanHo
                      }
                      onChange={
                        thayDoiCanHo
                      }
                      onFocus={
                        focusCanHo
                      }
                      placeholder={
                        loadingCanHo
                          ? "Đang tải căn hộ..."
                          : "Nhập mã căn hộ, ví dụ A102"
                      }
                      disabled={
                        dangLuu ||
                        loadingCanHo
                      }
                      autoComplete="off"
                      className={
                        loiCanHo
                          ? "pt-has-error"
                          : canHoDangChon
                          ? "pt-has-success"
                          : ""
                      }
                    />

                    <span
                      className={
                        hienThiDropdownCanHo
                          ? "pt-apartment-arrow open"
                          : "pt-apartment-arrow"
                      }
                    >
                      ▾
                    </span>

                  </div>

                  {hienThiDropdownCanHo && (

                    <div className="pt-apartment-dropdown">

                      {loadingCanHo ? (

                        <div className="pt-dropdown-message">

                          <span className="pt-spinner" />

                          Đang tải danh sách căn hộ...

                        </div>

                      ) : danhSachCanHoLoc.length ===
                        0 ? (

                        <div className="pt-dropdown-message">

                          Không tìm thấy căn hộ.

                        </div>

                      ) : (

                        danhSachCanHoLoc.map(
                          (
                            canHo
                          ) => {

                            const selected =
                              String(
                                form.maCanHo
                              )
                                .trim()
                                .toUpperCase() ===
                              String(
                                canHo.maCanHo
                              )
                                .trim()
                                .toUpperCase();

                            return (

                              <button
                                type="button"
                                key={
                                  canHo.maCanHo
                                }
                                className={
                                  selected
                                    ? "pt-apartment-option selected"
                                    : "pt-apartment-option"
                                }
                                onClick={() =>
                                  chonCanHo(
                                    canHo
                                  )
                                }
                                disabled={
                                  dangLuu
                                }
                              >

                                <div className="pt-apartment-option-left">

                                  <span className="pt-apartment-home">
                                    🏠
                                  </span>

                                  <div>

                                    <div className="pt-apartment-code">

                                      {
                                        canHo.maCanHo
                                      }

                                    </div>

                                    <div className="pt-apartment-owner">

                                      {canHo.hoTen ||
                                        "Chưa có cư dân"}

                                    </div>

                                  </div>

                                </div>

                                {selected && (

                                  <span className="pt-check">
                                    ✓
                                  </span>

                                )}

                              </button>

                            );
                          }
                        )

                      )}

                    </div>

                  )}

                </div>

                <div className="pt-help">

                  Có thể chọn trong danh sách hoặc nhập chính xác mã căn hộ.

                </div>

                {loiCanHo && (

                  <div className="pt-field-error">

                    ⚠️ {loiCanHo}

                  </div>

                )}

                {/* CƯ DÂN */}

                <div className="pt-resident-box">

                  <div className="pt-resident-icon">
                    👤
                  </div>

                  <div className="pt-resident-content">

                    <div className="pt-resident-label">
                      Cư dân
                    </div>

                    <div
                      className={
                        canHoDangChon
                          ? "pt-resident-name"
                          : "pt-resident-placeholder"
                      }
                    >

                      {canHoDangChon
                        ? canHoDangChon.hoTen ||
                          "Chưa có cư dân"
                        : "Cư dân được lấy tự động từ căn hộ."}

                    </div>

                  </div>

                </div>

              </div>

              {/* =================================================
                  TRẠNG THÁI
              ================================================= */}

              {dangSua && (

                <div className="pt-form-group">

                  <label>
                    Trạng thái
                  </label>

                  <div className="pt-status-options">

                    <label
                      className={
                        form.trangThai ===
                        "ACTIVE"
                          ? "pt-radio active"
                          : "pt-radio"
                      }
                    >

                      <input
                        type="radio"
                        name="trangThai"
                        value="ACTIVE"
                        checked={
                          form.trangThai ===
                          "ACTIVE"
                        }
                        onChange={(
                          e
                        ) =>
                          setForm(
                            (
                              prev
                            ) => ({
                              ...prev,
                              trangThai:
                                e.target
                                  .value,
                            })
                          )
                        }
                        disabled={
                          dangLuu
                        }
                      />

                      <span>
                        Đang hoạt động
                      </span>

                    </label>

                    <label
                      className={
                        form.trangThai ===
                        "INACTIVE"
                          ? "pt-radio inactive"
                          : "pt-radio"
                      }
                    >

                      <input
                        type="radio"
                        name="trangThai"
                        value="INACTIVE"
                        checked={
                          form.trangThai ===
                          "INACTIVE"
                        }
                        onChange={(
                          e
                        ) =>
                          setForm(
                            (
                              prev
                            ) => ({
                              ...prev,
                              trangThai:
                                e.target
                                  .value,
                            })
                          )
                        }
                        disabled={
                          dangLuu
                        }
                      />

                      <span>
                        Ngừng hoạt động
                      </span>

                    </label>

                  </div>

                </div>

              )}

            </div>

            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="pt-modal-footer">

              <button
                type="button"
                className="pt-btn-cancel"
                onClick={
                  dongModal
                }
                disabled={
                  dangLuu
                }
              >
                Hủy
              </button>

              <button
                type="button"
                className="pt-btn-save"
                onClick={
                  luu
                }
                disabled={
                  dangLuu ||
                  loadingCanHo ||
                  loadingLoaiXe
                }
              >

                {dangLuu
                  ? "Đang lưu..."
                  : dangSua
                  ? "Lưu thay đổi"
                  : "Lưu"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default PhuongTien;

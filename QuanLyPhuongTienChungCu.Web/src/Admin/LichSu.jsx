import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./LichSu.css";

/* =========================================================
   API
========================================================= */

const API_BASE_URL = "http://localhost:5022";

/* =========================================================
   ICON LỊCH
========================================================= */

const IconLichXanh = ({ size = 17 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      flexShrink: 0,
      display: "block",
    }}
  >
    <rect
      x="3"
      y="5"
      width="18"
      height="16"
      rx="2"
      stroke="#2563eb"
      strokeWidth="2"
    />

    <path
      d="M3 9H21"
      stroke="#2563eb"
      strokeWidth="2"
    />

    <path
      d="M8 3V7M16 3V7"
      stroke="#2563eb"
      strokeWidth="2"
      strokeLinecap="round"
    />

    <circle cx="8" cy="13" r="1.2" fill="#2563eb" />
    <circle cx="12" cy="13" r="1.2" fill="#2563eb" />
    <circle cx="16" cy="13" r="1.2" fill="#2563eb" />

    <circle cx="8" cy="17" r="1.2" fill="#2563eb" />
    <circle cx="12" cy="17" r="1.2" fill="#2563eb" />
    <circle cx="16" cy="17" r="1.2" fill="#2563eb" />
  </svg>
);

/* =========================================================
   LẤY JWT
========================================================= */

const getAccessToken = () => {
  const keys = [
    "token",
    "accessToken",
    "jwt",
    "authToken",
  ];

  for (const key of keys) {
    const value = localStorage.getItem(key);

    if (value) {
      return value;
    }
  }

  const userData = localStorage.getItem("user");

  if (userData) {
    try {
      const user = JSON.parse(userData);

      if (user?.token) {
        return user.token;
      }

      if (user?.accessToken) {
        return user.accessToken;
      }

      if (user?.jwt) {
        return user.jwt;
      }
    } catch {
      // Không làm gì
    }
  }

  return null;
};

/* =========================================================
   FORMAT DATE TIME
========================================================= */

const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes} ${day}/${month}/${year}`;
};

/* =========================================================
   FORMAT DATE ONLY
========================================================= */

const getDateOnly = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/* =========================================================
   FORMAT TIỀN
========================================================= */

const formatMoney = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return "—";
  }

  return `${number.toLocaleString("vi-VN")}đ`;
};

/* =========================================================
   TÍNH THỜI GIAN GỬI
========================================================= */

const calculateDuration = (
  thoiGianVao,
  thoiGianRa
) => {
  if (!thoiGianVao || !thoiGianRa) {
    return null;
  }

  const start = new Date(thoiGianVao);
  const end = new Date(thoiGianRa);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return null;
  }

  const diff =
    end.getTime() -
    start.getTime();

  if (diff < 0) {
    return null;
  }

  const totalMinutes =
    Math.floor(diff / 60000);

  const hours =
    Math.floor(totalMinutes / 60);

  const minutes =
    totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} phút`;
  }

  if (minutes === 0) {
    return `${hours} giờ`;
  }

  return `${hours} giờ ${minutes} phút`;
};

/* =========================================================
   HELPER LẤY GIÁ TRỊ
========================================================= */

const firstValue = (...values) => {
  for (const value of values) {
    if (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
    ) {
      return value;
    }
  }

  return null;
};

/* =========================================================
   LẤY BIỂN SỐ
========================================================= */

const getBienSo = (item) => {
  return firstValue(
    item?.bienSo,
    item?.BienSo,

    item?.bienSoXe,
    item?.BienSoXe,

    item?.licensePlate,
    item?.LicensePlate,

    item?.license_plate,
    item?.License_Plate,

    item?.phuongTien?.bienSo,
    item?.phuongTien?.BienSo,

    item?.PhuongTien?.bienSo,
    item?.PhuongTien?.BienSo,

    item?.vehicle?.bienSo,
    item?.vehicle?.BienSo,

    item?.Vehicle?.bienSo,
    item?.Vehicle?.BienSo,

    "—"
  );
};

/* =========================================================
   LẤY LOẠI XE
========================================================= */

const getLoaiXe = (item) => {
  return firstValue(
    item?.loaiXe,
    item?.LoaiXe,

    item?.tenLoaiXe,
    item?.TenLoaiXe,

    item?.loaiPhuongTien,
    item?.LoaiPhuongTien,

    item?.loai,
    item?.Loai,

    item?.vehicleType,
    item?.VehicleType,

    item?.vehicle_type,

    item?.phuongTien?.loaiXe,
    item?.phuongTien?.LoaiXe,

    item?.phuongTien?.loaiPhuongTien,
    item?.phuongTien?.LoaiPhuongTien,

    item?.phuongTien?.loaiPhuongTien?.tenLoai,
    item?.phuongTien?.loaiPhuongTien?.TenLoai,

    item?.PhuongTien?.LoaiXe,
    item?.PhuongTien?.loaiXe,

    item?.PhuongTien?.LoaiPhuongTien,
    item?.PhuongTien?.loaiPhuongTien,

    item?.PhuongTien?.LoaiPhuongTien?.TenLoai,
    item?.PhuongTien?.LoaiPhuongTien?.tenLoai,

    item?.vehicle?.loaiXe,
    item?.vehicle?.LoaiXe,

    item?.vehicle?.loaiPhuongTien,
    item?.vehicle?.LoaiPhuongTien,

    item?.Vehicle?.LoaiXe,
    item?.Vehicle?.loaiXe,

    item?.Vehicle?.LoaiPhuongTien,
    item?.Vehicle?.loaiPhuongTien,

    "—"
  );
};

/* =========================================================
   LẤY CƯ DÂN
========================================================= */

const getCuDan = (item) => {
  /*
    Hỗ trợ nhiều cấu trúc backend.
  */

  return firstValue(
    /* =========================
       DẠNG TRỰC TIẾP
    ========================= */

    item?.cuDan,
    item?.CuDan,

    item?.cuDanHoTen,
    item?.CuDanHoTen,

    item?.hoTenCuDan,
    item?.HoTenCuDan,

    item?.residentName,
    item?.ResidentName,

    item?.hoTen,
    item?.HoTen,

    /* =========================
       DẠNG OBJECT resident
    ========================= */

    item?.resident?.name,
    item?.resident?.Name,

    item?.resident?.hoTen,
    item?.resident?.HoTen,

    item?.Resident?.Name,
    item?.Resident?.HoTen,

    item?.Resident?.name,
    item?.Resident?.hoTen,

    /* =========================
       DẠNG object cuDan
    ========================= */

    item?.cuDan?.hoTen,
    item?.cuDan?.HoTen,

    item?.cuDan?.name,
    item?.cuDan?.Name,

    item?.CuDan?.HoTen,
    item?.CuDan?.hoTen,

    item?.CuDan?.Name,
    item?.CuDan?.name,

    /* =========================
       DẠNG PHƯƠNG TIỆN
    ========================= */

    item?.phuongTien?.cuDan,
    item?.PhuongTien?.CuDan,

    item?.phuongTien?.cuDanHoTen,
    item?.PhuongTien?.CuDanHoTen,

    item?.phuongTien?.hoTenCuDan,
    item?.PhuongTien?.HoTenCuDan,

    item?.phuongTien?.cuDan?.hoTen,
    item?.phuongTien?.cuDan?.HoTen,

    item?.phuongTien?.cuDan?.name,
    item?.phuongTien?.cuDan?.Name,

    item?.PhuongTien?.CuDan?.HoTen,
    item?.PhuongTien?.CuDan?.hoTen,

    item?.PhuongTien?.CuDan?.Name,
    item?.PhuongTien?.CuDan?.name,

    /* =========================
       DẠNG VEHICLE
    ========================= */

    item?.vehicle?.cuDan,
    item?.Vehicle?.CuDan,

    item?.vehicle?.cuDanHoTen,
    item?.Vehicle?.CuDanHoTen,

    item?.vehicle?.hoTenCuDan,
    item?.Vehicle?.HoTenCuDan,

    item?.vehicle?.residentName,
    item?.Vehicle?.ResidentName,

    item?.vehicle?.resident?.name,
    item?.vehicle?.resident?.Name,

    item?.vehicle?.resident?.hoTen,
    item?.vehicle?.resident?.HoTen,

    item?.Vehicle?.Resident?.Name,
    item?.Vehicle?.Resident?.HoTen,

    null
  );
};

/* =========================================================
   LẤY CĂN HỘ
========================================================= */

const getCanHo = (item) => {
  /*
    Hỗ trợ nhiều cấu trúc backend.
  */

  return firstValue(
    /* =========================
       DẠNG TRỰC TIẾP
    ========================= */

    item?.canHo,
    item?.CanHo,

    item?.maCanHo,
    item?.MaCanHo,

    item?.soCanHo,
    item?.SoCanHo,

    item?.soCan,
    item?.SoCan,

    item?.apartmentNumber,
    item?.ApartmentNumber,

    /* =========================
       DẠNG OBJECT APARTMENT
    ========================= */

    item?.apartment?.number,
    item?.apartment?.Number,

    item?.apartment?.soCan,
    item?.apartment?.SoCan,

    item?.apartment?.soCanHo,
    item?.apartment?.SoCanHo,

    item?.apartment?.maCanHo,
    item?.apartment?.MaCanHo,

    item?.Apartment?.Number,
    item?.Apartment?.number,

    item?.Apartment?.SoCan,
    item?.Apartment?.soCan,

    item?.Apartment?.SoCanHo,
    item?.Apartment?.soCanHo,

    item?.Apartment?.MaCanHo,
    item?.Apartment?.maCanHo,

    /* =========================
       DẠNG OBJECT CANHO
    ========================= */

    item?.canHo?.soCan,
    item?.canHo?.SoCan,

    item?.canHo?.soCanHo,
    item?.canHo?.SoCanHo,

    item?.canHo?.maCanHo,
    item?.canHo?.MaCanHo,

    item?.CanHo?.SoCan,
    item?.CanHo?.soCan,

    item?.CanHo?.SoCanHo,
    item?.CanHo?.soCanHo,

    item?.CanHo?.MaCanHo,
    item?.CanHo?.maCanHo,

    /* =========================
       DẠNG PHƯƠNG TIỆN
    ========================= */

    item?.phuongTien?.canHo,
    item?.PhuongTien?.CanHo,

    item?.phuongTien?.maCanHo,
    item?.PhuongTien?.MaCanHo,

    item?.phuongTien?.soCanHo,
    item?.PhuongTien?.SoCanHo,

    item?.phuongTien?.soCan,
    item?.PhuongTien?.SoCan,

    item?.phuongTien?.apartmentNumber,
    item?.PhuongTien?.ApartmentNumber,

    item?.phuongTien?.canHo?.soCan,
    item?.phuongTien?.canHo?.SoCan,

    item?.phuongTien?.canHo?.soCanHo,
    item?.phuongTien?.canHo?.SoCanHo,

    item?.phuongTien?.canHo?.maCanHo,
    item?.phuongTien?.canHo?.MaCanHo,

    item?.PhuongTien?.CanHo?.SoCan,
    item?.PhuongTien?.CanHo?.soCan,

    item?.PhuongTien?.CanHo?.SoCanHo,
    item?.PhuongTien?.CanHo?.soCanHo,

    item?.PhuongTien?.CanHo?.MaCanHo,
    item?.PhuongTien?.CanHo?.maCanHo,

    /* =========================
       DẠNG VEHICLE
    ========================= */

    item?.vehicle?.canHo,
    item?.Vehicle?.CanHo,

    item?.vehicle?.maCanHo,
    item?.Vehicle?.MaCanHo,

    item?.vehicle?.soCanHo,
    item?.Vehicle?.SoCanHo,

    item?.vehicle?.soCan,
    item?.Vehicle?.SoCan,

    item?.vehicle?.apartmentNumber,
    item?.Vehicle?.ApartmentNumber,

    item?.vehicle?.apartment?.number,
    item?.vehicle?.apartment?.Number,

    item?.vehicle?.apartment?.soCan,
    item?.vehicle?.apartment?.SoCan,

    item?.Vehicle?.Apartment?.Number,
    item?.Vehicle?.Apartment?.number,

    item?.Vehicle?.Apartment?.SoCan,
    item?.Vehicle?.Apartment?.soCan,

    null
  );
};

/* =========================================================
   LẤY THỜI GIAN VÀO
========================================================= */

const getThoiGianVao = (item) => {
  return firstValue(
    item?.thoiGianVao,
    item?.ThoiGianVao,

    item?.thoiGianVaoBai,
    item?.ThoiGianVaoBai,

    item?.checkInTime,
    item?.CheckInTime,

    item?.entryTime,
    item?.EntryTime,

    item?.entry_time,
    item?.Entry_Time,

    item?.createdAt,
    item?.CreatedAt,

    item?.created_at,

    null
  );
};

/* =========================================================
   LẤY THỜI GIAN RA
========================================================= */

const getThoiGianRa = (item) => {
  return firstValue(
    item?.thoiGianRa,
    item?.ThoiGianRa,

    item?.thoiGianRaBai,
    item?.ThoiGianRaBai,

    item?.checkOutTime,
    item?.CheckOutTime,

    item?.exitTime,
    item?.ExitTime,

    item?.exit_time,
    item?.Exit_Time,

    null
  );
};

/* =========================================================
   LẤY NGƯỜI GHI VÀO
========================================================= */

const getNguoiGhiVao = (item) => {
  return firstValue(
    item?.nguoiGhiVao,
    item?.NguoiGhiVao,

    item?.nguoiGhiVaoHoTen,
    item?.NguoiGhiVaoHoTen,

    item?.tenNguoiGhiVao,
    item?.TenNguoiGhiVao,

    item?.nguoiGhiVao?.hoTen,
    item?.nguoiGhiVao?.HoTen,

    item?.NguoiGhiVao?.HoTen,
    item?.NguoiGhiVao?.hoTen,

    item?.nguoiGhiVao?.name,
    item?.nguoiGhiVao?.Name,

    item?.NguoiGhiVao?.Name,
    item?.NguoiGhiVao?.name,

    null
  );
};

/* =========================================================
   LẤY NGƯỜI GHI RA
========================================================= */

const getNguoiGhiRa = (item) => {
  return firstValue(
    item?.nguoiGhiRa,
    item?.NguoiGhiRa,

    item?.nguoiGhiRaHoTen,
    item?.NguoiGhiRaHoTen,

    item?.tenNguoiGhiRa,
    item?.TenNguoiGhiRa,

    item?.nguoiGhiRa?.hoTen,
    item?.nguoiGhiRa?.HoTen,

    item?.NguoiGhiRa?.HoTen,
    item?.NguoiGhiRa?.hoTen,

    item?.nguoiGhiRa?.name,
    item?.nguoiGhiRa?.Name,

    item?.NguoiGhiRa?.Name,
    item?.NguoiGhiRa?.name,

    null
  );
};

/* =========================================================
   LẤY PHÍ
========================================================= */

const getSoTien = (item) => {
  return firstValue(
    item?.soTien,
    item?.SoTien,

    item?.phi,
    item?.Phi,

    item?.parkingFee,
    item?.ParkingFee,

    item?.parking_fee,

    null
  );
};

/* =========================================================
   XÁC ĐỊNH XE KHÁCH
========================================================= */

const isGuestVehicle = (item) => {
  /*
    Ưu tiên field laXeKhach từ backend.
  */

  if (typeof item?.laXeKhach === "boolean") {
    return item.laXeKhach;
  }

  if (typeof item?.LaXeKhach === "boolean") {
    return item.LaXeKhach;
  }

  /*
    Một số backend trả loại xe khách.
  */

  const values = [
    item?.loai,
    item?.Loai,

    item?.loaiXe,
    item?.LoaiXe,

    item?.loaiPhuongTien,
    item?.LoaiPhuongTien,

    item?.type,
    item?.Type,
  ]
    .filter(Boolean)
    .map((value) =>
      String(value)
        .trim()
        .toLowerCase()
    );

  if (
    values.some(
      (value) =>
        value === "xe khách" ||
        value === "xe khach" ||
        value.includes("khách") ||
        value.includes("khach")
    )
  ) {
    return true;
  }

  /*
    Nếu không có phuongTienId:
    có thể là xe khách.

    Nhưng nếu vẫn có cư dân/căn hộ
    thì chắc chắn là xe cư dân.
  */

  const phuongTienId =
    firstValue(
      item?.phuongTienId,
      item?.PhuongTienId,
      item?.vehicleId,
      item?.VehicleId
    );

  if (
    phuongTienId === null ||
    phuongTienId === undefined
  ) {
    const cuDan = getCuDan(item);
    const canHo = getCanHo(item);

    if (cuDan || canHo) {
      return false;
    }

    return true;
  }

  return false;
};

/* =========================================================
   CHUYỂN TRẠNG THÁI API → GIAO DIỆN
========================================================= */

const getDisplayStatus = (item) => {
  const rawStatus =
    firstValue(
      item?.trangThai,
      item?.TrangThai,

      item?.status,
      item?.Status,

      ""
    );

  const status =
    String(rawStatus)
      .trim()
      .toUpperCase();

  const guest =
    isGuestVehicle(item);

  /* =========================
     ACTIVE
  ========================= */

  if (
    status === "ACTIVE" ||
    status === "IN" ||
    status === "CHECKED_IN"
  ) {
    return "Đang gửi";
  }

  /* =========================
     COMPLETED
  ========================= */

  if (
    status === "COMPLETED" ||
    status === "DONE" ||
    status === "OUT" ||
    status === "CHECKED_OUT"
  ) {
    return guest
      ? "Đã thanh toán"
      : "Đã ra";
  }

  /* =========================
     TIẾNG VIỆT
  ========================= */

  const vietnameseStatus =
    String(rawStatus).trim();

  if (
    vietnameseStatus === "Đang gửi" ||
    vietnameseStatus === "Đã ra" ||
    vietnameseStatus === "Đã thanh toán"
  ) {
    return vietnameseStatus;
  }

  return vietnameseStatus || "—";
};

/* =========================================================
   CHUẨN HÓA DỮ LIỆU API
========================================================= */

const normalizeHistoryItem = (
  item,
  index
) => {
  const laXeKhach =
    isGuestVehicle(item);

  const thoiGianVao =
    getThoiGianVao(item);

  const thoiGianRa =
    getThoiGianRa(item);

  const bienSo =
    getBienSo(item);

  const loaiXe =
    getLoaiXe(item);

  const cuDan =
    getCuDan(item);

  const canHo =
    getCanHo(item);

  const nguoiGhiVao =
    getNguoiGhiVao(item);

  const nguoiGhiRa =
    getNguoiGhiRa(item);

  const soTien =
    getSoTien(item);

  /*
    Log dữ liệu thực tế để kiểm tra backend.
    Có thể xóa sau khi fix xong.
  */

  console.log(
    "HISTORY ITEM RAW:",
    item
  );

  console.log(
    "HISTORY ITEM NORMALIZED:",
    {
      bienSo,
      loaiXe,
      cuDan,
      canHo,
      thoiGianVao,
      thoiGianRa,
    }
  );

  return {
    id:
      firstValue(
        item?.luotGuiXeId,
        item?.LuotGuiXeId,

        item?.id,
        item?.Id,

        item?.parkingSessionId,
        item?.ParkingSessionId,

        index + 1
      ),

    luotGuiXeId:
      firstValue(
        item?.luotGuiXeId,
        item?.LuotGuiXeId,

        item?.id,
        item?.Id,

        null
      ),

    phuongTienId:
      firstValue(
        item?.phuongTienId,
        item?.PhuongTienId,

        item?.vehicleId,
        item?.VehicleId,

        null
      ),

    loai:
      laXeKhach
        ? "Xe khách"
        : "Cư dân",

    bienSo:
      String(
        bienSo ?? "—"
      ),

    loaiXe:
      String(
        loaiXe ?? "—"
      ),

    cuDan,

    canHo,

    ngayISO:
      getDateOnly(
        thoiGianVao
      ),

    thoiGianVao:
      formatDateTime(
        thoiGianVao
      ),

    thoiGianRa:
      formatDateTime(
        thoiGianRa
      ),

    nguoiGhiVao,

    nguoiGhiRa,

    trangThai:
      getDisplayStatus(item),

    thoiGianGui:
      calculateDuration(
        thoiGianVao,
        thoiGianRa
      ),

    phi:
      laXeKhach
        ? formatMoney(soTien)
        : null,

    soTien,

    laXeKhach,
  };
};

/* =========================================================
   COMPONENT
========================================================= */

const LichSu = () => {
  /* =======================================================
     TAB
  ======================================================= */

  const [tab, setTab] =
    useState("tatca");

  /* =======================================================
     DATA
  ======================================================= */

  const [lichSuData, setLichSuData] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =======================================================
     SEARCH
  ======================================================= */

  const [tuKhoa, setTuKhoa] =
    useState("");

  const [tuKhoaApDung, setTuKhoaApDung] =
    useState("");

  /* =======================================================
     DATE
  ======================================================= */

  const [tuNgay, setTuNgay] =
    useState("");

  const [denNgay, setDenNgay] =
    useState("");

  const [tuNgayApDung, setTuNgayApDung] =
    useState("");

  const [denNgayApDung, setDenNgayApDung] =
    useState("");

  /* =======================================================
     STATUS
  ======================================================= */

  const [trangThai, setTrangThai] =
    useState("all");

  const [trangThaiApDung, setTrangThaiApDung] =
    useState("all");

  /* =======================================================
     DATE REFS
  ======================================================= */

  const refTuNgay =
    useRef(null);

  const refDenNgay =
    useRef(null);

  /* =======================================================
     GỌI API HISTORY
  ======================================================= */

  const loadHistory = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          getAccessToken();

        if (!token) {
          setError(
            "Không tìm thấy JWT đăng nhập. Vui lòng đăng nhập lại."
          );

          setLichSuData([]);

          return;
        }

        const response =
          await fetch(
            `${API_BASE_URL}/api/Parking/history`,
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

        if (
          response.status === 401
        ) {
          setError(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
          );

          setLichSuData([]);

          return;
        }

        if (
          response.status === 403
        ) {
          setError(
            "Bạn không có quyền xem lịch sử."
          );

          setLichSuData([]);

          return;
        }

        if (!response.ok) {
          const text =
            await response.text();

          throw new Error(
            text ||
              `HTTP ${response.status}`
          );
        }

        const json =
          await response.json();

        console.log(
          "GET /api/Parking/history:",
          json
        );

        /*
          Hỗ trợ:
          [
            ...
          ]

          hoặc:

          {
            data: [...]
          }

          hoặc:

          {
            Data: [...]
          }

          hoặc:

          {
            items: [...]
          }

          hoặc:

          {
            Items: [...]
          }

          hoặc:

          {
            result: [...]
          }

          hoặc:

          {
            Result: [...]
          }
        */

        let rawData = null;

        if (
          Array.isArray(json)
        ) {
          rawData = json;
        } else if (
          Array.isArray(json?.data)
        ) {
          rawData = json.data;
        } else if (
          Array.isArray(json?.Data)
        ) {
          rawData = json.Data;
        } else if (
          Array.isArray(json?.items)
        ) {
          rawData = json.items;
        } else if (
          Array.isArray(json?.Items)
        ) {
          rawData = json.Items;
        } else if (
          Array.isArray(json?.result)
        ) {
          rawData = json.result;
        } else if (
          Array.isArray(json?.Result)
        ) {
          rawData = json.Result;
        }

        if (!rawData) {
          throw new Error(
            "API /api/Parking/history không trả về danh sách dữ liệu hợp lệ."
          );
        }

        const data =
          rawData.map(
            (
              item,
              index
            ) =>
              normalizeHistoryItem(
                item,
                index
              )
          );

        setLichSuData(
          data
        );
      } catch (err) {
        console.error(
          "Lỗi tải lịch sử:",
          err
        );

        setError(
          err?.message ||
            "Không thể tải dữ liệu lịch sử từ máy chủ."
        );

        setLichSuData([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* =======================================================
     LOAD LẦN ĐẦU
  ======================================================= */

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  /* =======================================================
     LỌC DỮ LIỆU
  ======================================================= */

  const danhSachHienThi =
    useMemo(() => {
      let data =
        [...lichSuData];

      /* -------------------------
         TAB
      ------------------------- */

      if (
        tab === "cudan"
      ) {
        data =
          data.filter(
            (item) =>
              item.loai ===
              "Cư dân"
          );
      }

      if (
        tab === "xekhach"
      ) {
        data =
          data.filter(
            (item) =>
              item.loai ===
              "Xe khách"
          );
      }

      /* -------------------------
         SEARCH
      ------------------------- */

      const keyword =
        tuKhoaApDung
          .trim()
          .toLowerCase();

      if (keyword) {
        data =
          data.filter(
            (item) => {
              const bienSo =
                String(
                  item.bienSo ||
                    ""
                ).toLowerCase();

              const cuDan =
                String(
                  item.cuDan ||
                    ""
                ).toLowerCase();

              const canHo =
                String(
                  item.canHo ||
                    ""
                ).toLowerCase();

              const loaiXe =
                String(
                  item.loaiXe ||
                    ""
                ).toLowerCase();

              return (
                bienSo.includes(
                  keyword
                ) ||
                cuDan.includes(
                  keyword
                ) ||
                canHo.includes(
                  keyword
                ) ||
                loaiXe.includes(
                  keyword
                )
              );
            }
          );
      }

      /* -------------------------
         TỪ NGÀY
      ------------------------- */

      if (
        tuNgayApDung
      ) {
        data =
          data.filter(
            (item) =>
              item.ngayISO &&
              item.ngayISO >=
                tuNgayApDung
          );
      }

      /* -------------------------
         ĐẾN NGÀY
      ------------------------- */

      if (
        denNgayApDung
      ) {
        data =
          data.filter(
            (item) =>
              item.ngayISO &&
              item.ngayISO <=
                denNgayApDung
          );
      }

      /* -------------------------
         TRẠNG THÁI
      ------------------------- */

      if (
        trangThaiApDung !==
        "all"
      ) {
        data =
          data.filter(
            (item) =>
              item.trangThai ===
              trangThaiApDung
          );
      }

      return data;
    }, [
      lichSuData,
      tab,
      tuKhoaApDung,
      tuNgayApDung,
      denNgayApDung,
      trangThaiApDung,
    ]);

  /* =======================================================
     SEARCH
  ======================================================= */

  const xuLyTimKiem = () => {
    setTuKhoaApDung(
      tuKhoa.trim()
    );

    setTuNgayApDung(
      tuNgay
    );

    setDenNgayApDung(
      denNgay
    );

    setTrangThaiApDung(
      trangThai
    );
  };

  /* =======================================================
     ENTER SEARCH
  ======================================================= */

  const xuLyKeyDown = (
    e
  ) => {
    if (
      e.key === "Enter"
    ) {
      e.preventDefault();

      xuLyTimKiem();
    }
  };

  /* =======================================================
     DATE PICKER
  ======================================================= */

  const moDatePicker = (
    ref
  ) => {
    if (!ref.current) {
      return;
    }

    try {
      if (
        typeof ref.current
          .showPicker ===
        "function"
      ) {
        ref.current.showPicker();
      } else {
        ref.current.focus();
      }
    } catch {
      ref.current.focus();
    }
  };

  /* =======================================================
     FORMAT DATE INPUT
  ======================================================= */

  const formatNgay = (
    iso
  ) => {
    if (!iso) {
      return "Chọn ngày";
    }

    const [
      year,
      month,
      day,
    ] = iso.split("-");

    return `${day}/${month}/${year}`;
  };

  /* =======================================================
     STATUS CLASS
  ======================================================= */

  const getStatusClass = (
    status
  ) => {
    if (
      status ===
      "Đang gửi"
    ) {
      return "ls-status ls-status-active";
    }

    if (
      status ===
      "Đã thanh toán"
    ) {
      return "ls-status ls-status-paid";
    }

    return "ls-status ls-status-done";
  };

  /* =======================================================
     RENDER STATUS
  ======================================================= */

  const renderStatus = (
    status
  ) => {
    return (
      <span
        className={getStatusClass(
          status
        )}
      >
        <span className="ls-status-dot" />

        {status || "—"}
      </span>
    );
  };

  /* =======================================================
     EMPTY
  ======================================================= */

  const renderEmpty = (
    colSpan
  ) => {
    return (
      <tr>
        <td
          colSpan={colSpan}
          className="ls-empty"
        >
          <div className="ls-empty-icon">
            ◷
          </div>

          <div>
            Chưa có dữ liệu lịch sử
          </div>

          <small>
            Dữ liệu sẽ xuất hiện khi
            có lượt xe ra vào.
          </small>
        </td>
      </tr>
    );
  };

  /* =======================================================
     LOADING
  ======================================================= */

  const renderLoading = (
    colSpan
  ) => {
    return (
      <tr>
        <td
          colSpan={colSpan}
          className="ls-empty"
        >
          <div>
            Đang tải dữ liệu...
          </div>
        </td>
      </tr>
    );
  };

  /* =======================================================
     ERROR
  ======================================================= */

  const renderError = (
    colSpan
  ) => {
    return (
      <tr>
        <td
          colSpan={colSpan}
          className="ls-empty"
        >
          <div
            style={{
              color: "#dc2626",
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            {error}
          </div>

          <button
            type="button"
            className="ls-btn-search"
            onClick={
              loadHistory
            }
          >
            Thử lại
          </button>
        </td>
      </tr>
    );
  };

  /* =======================================================
     TABLE TẤT CẢ
  ======================================================= */

  const renderTatCa = () => {
    return (
      <table className="ls-table">
        <thead>
          <tr>
            <th className="ls-col-stt">
              STT
            </th>

            <th>
              Loại
            </th>

            <th>
              Biển số
            </th>

            <th>
              Thời gian vào
            </th>

            <th>
              Thời gian ra
            </th>

            <th>
              Người ghi vào
            </th>

            <th>
              Người ghi ra
            </th>

            <th>
              Trạng thái
            </th>
          </tr>
        </thead>

        <tbody>
          {loading
            ? renderLoading(8)
            : error
              ? renderError(8)
              : danhSachHienThi.length ===
                  0
                ? renderEmpty(8)
                : danhSachHienThi.map(
                    (
                      item,
                      index
                    ) => (
                      <tr
                        key={
                          item.id
                        }
                      >
                        <td className="ls-stt">
                          {index + 1}
                        </td>

                        <td>
                          <span
                            className={
                              item.loai ===
                              "Cư dân"
                                ? "ls-type ls-type-resident"
                                : "ls-type ls-type-guest"
                            }
                          >
                            {item.loai}
                          </span>
                        </td>

                        <td>
                          <span className="ls-license">
                            {item.bienSo}
                          </span>
                        </td>

                        <td>
                          {item.thoiGianVao}
                        </td>

                        <td>
                          {item.thoiGianRa}
                        </td>

                        <td>
                          {item.nguoiGhiVao ||
                            "—"}
                        </td>

                        <td>
                          {item.nguoiGhiRa ||
                            "—"}
                        </td>

                        <td>
                          {renderStatus(
                            item.trangThai
                          )}
                        </td>
                      </tr>
                    )
                  )}
        </tbody>
      </table>
    );
  };

  /* =======================================================
     TABLE CƯ DÂN
  ======================================================= */

  const renderCuDan = () => {
    return (
      <table className="ls-table ls-table-resident">
        <thead>
          <tr>
            <th className="ls-col-stt">
              STT
            </th>

            <th>
              Biển số
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
              Thời gian vào
            </th>

            <th>
              Người ghi vào
            </th>

            <th>
              Thời gian ra
            </th>

            <th>
              Người ghi ra
            </th>

            <th>
              Trạng thái
            </th>
          </tr>
        </thead>

        <tbody>
          {loading
            ? renderLoading(10)
            : error
              ? renderError(10)
              : danhSachHienThi.length ===
                  0
                ? renderEmpty(10)
                : danhSachHienThi.map(
                    (
                      item,
                      index
                    ) => (
                      <tr
                        key={
                          item.id
                        }
                      >
                        <td className="ls-stt">
                          {index + 1}
                        </td>

                        <td>
                          <span className="ls-license">
                            {item.bienSo}
                          </span>
                        </td>

                        <td>
                          <span className="ls-type">
                            {item.loaiXe}
                          </span>
                        </td>

                        <td>
                          <span className="ls-resident">
                            {item.cuDan ||
                              "—"}
                          </span>
                        </td>

                        <td>
                          <span className="ls-apartment">
                            {item.canHo ||
                              "—"}
                          </span>
                        </td>

                        <td>
                          {item.thoiGianVao}
                        </td>

                        <td>
                          {item.nguoiGhiVao ||
                            "—"}
                        </td>

                        <td>
                          {item.thoiGianRa}
                        </td>

                        <td>
                          {item.nguoiGhiRa ||
                            "—"}
                        </td>

                        <td>
                          {renderStatus(
                            item.trangThai
                          )}
                        </td>
                      </tr>
                    )
                  )}
        </tbody>
      </table>
    );
  };

  /* =======================================================
     TABLE XE KHÁCH
  ======================================================= */

  const renderXeKhach = () => {
    return (
      <table className="ls-table ls-table-guest">
        <thead>
          <tr>
            <th className="ls-col-stt">
              STT
            </th>

            <th>
              Biển số
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
              Người ghi vào
            </th>

            <th>
              Người ghi ra
            </th>

            <th>
              Trạng thái
            </th>
          </tr>
        </thead>

        <tbody>
          {loading
            ? renderLoading(10)
            : error
              ? renderError(10)
              : danhSachHienThi.length ===
                  0
                ? renderEmpty(10)
                : danhSachHienThi.map(
                    (
                      item,
                      index
                    ) => (
                      <tr
                        key={
                          item.id
                        }
                      >
                        <td className="ls-stt">
                          {index + 1}
                        </td>

                        <td>
                          <span className="ls-license">
                            {item.bienSo}
                          </span>
                        </td>

                        <td>
                          <span className="ls-type">
                            {item.loaiXe}
                          </span>
                        </td>

                        <td>
                          {item.thoiGianVao}
                        </td>

                        <td>
                          {item.thoiGianRa}
                        </td>

                        <td>
                          {item.thoiGianGui ||
                            "—"}
                        </td>

                        <td>
                          <span className="ls-fee">
                            {item.phi ||
                              "—"}
                          </span>
                        </td>

                        <td>
                          {item.nguoiGhiVao ||
                            "—"}
                        </td>

                        <td>
                          {item.nguoiGhiRa ||
                            "—"}
                        </td>

                        <td>
                          {renderStatus(
                            item.trangThai
                          )}
                        </td>
                      </tr>
                    )
                  )}
        </tbody>
      </table>
    );
  };

  /* =======================================================
     TỔNG KẾT
  ======================================================= */

  const tongKet =
    danhSachHienThi.length;

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <div className="ls-wrapper">
      <div className="ls-body">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="ls-title-bar">
          <div>
            <h2>
              Lịch sử
            </h2>

            <p className="ls-subtitle">
              Theo dõi toàn bộ lượt xe
              ra vào bãi.
            </p>
          </div>
        </div>

        {/* =================================================
            TABS
        ================================================= */}

        <div className="ls-tabs">
          <button
            type="button"
            className={`ls-tab ${
              tab === "tatca"
                ? "ls-tab-active"
                : ""
            }`}
            onClick={() =>
              setTab("tatca")
            }
          >
            Tất cả
          </button>

          <button
            type="button"
            className={`ls-tab ${
              tab === "cudan"
                ? "ls-tab-active"
                : ""
            }`}
            onClick={() =>
              setTab("cudan")
            }
          >
            Cư dân
          </button>

          <button
            type="button"
            className={`ls-tab ${
              tab === "xekhach"
                ? "ls-tab-active"
                : ""
            }`}
            onClick={() =>
              setTab("xekhach")
            }
          >
            Xe khách
          </button>
        </div>

        {/* =================================================
            TABLE BOX
        ================================================= */}

        <div className="ls-table-box">

          {/* =================================================
              FILTER
          ================================================= */}

          <div className="ls-filter-bar">

            {/* SEARCH */}

            <div className="ls-search">
              <span className="ls-search-icon">
                🔍
              </span>

              <input
                type="text"
                placeholder="Tìm biển số, cư dân..."
                value={tuKhoa}
                onChange={(e) =>
                  setTuKhoa(
                    e.target.value
                  )
                }
                onKeyDown={
                  xuLyKeyDown
                }
              />
            </div>

            {/* DATE FROM */}

            <div className="ls-date-range">

              <div
                className="ls-date-item"
                onClick={() =>
                  moDatePicker(
                    refTuNgay
                  )
                }
              >
                <IconLichXanh
                  size={16}
                />

                <span
                  className={
                    tuNgay
                      ? "ls-date-text"
                      : "ls-date-text ls-date-placeholder"
                  }
                >
                  {formatNgay(
                    tuNgay
                  )}
                </span>

                <input
                  ref={
                    refTuNgay
                  }
                  type="date"
                  value={
                    tuNgay
                  }
                  onChange={(e) =>
                    setTuNgay(
                      e.target.value
                    )
                  }
                  className="ls-date-hidden"
                  aria-label="Từ ngày"
                />
              </div>

              <span className="ls-date-sep">
                -
              </span>

              {/* DATE TO */}

              <div
                className="ls-date-item"
                onClick={() =>
                  moDatePicker(
                    refDenNgay
                  )
                }
              >
                <IconLichXanh
                  size={16}
                />

                <span
                  className={
                    denNgay
                      ? "ls-date-text"
                      : "ls-date-text ls-date-placeholder"
                  }
                >
                  {formatNgay(
                    denNgay
                  )}
                </span>

                <input
                  ref={
                    refDenNgay
                  }
                  type="date"
                  value={
                    denNgay
                  }
                  onChange={(e) =>
                    setDenNgay(
                      e.target.value
                    )
                  }
                  className="ls-date-hidden"
                  aria-label="Đến ngày"
                />
              </div>

            </div>

            {/* STATUS */}

            <div className="ls-status-select">
              <select
                value={
                  trangThai
                }
                onChange={(e) =>
                  setTrangThai(
                    e.target.value
                  )
                }
              >
                <option value="all">
                  Tất cả trạng thái
                </option>

                <option value="Đang gửi">
                  Đang gửi
                </option>

                <option value="Đã ra">
                  Đã ra
                </option>

                <option value="Đã thanh toán">
                  Đã thanh toán
                </option>
              </select>
            </div>

            {/* SEARCH BUTTON */}

            <button
              type="button"
              className="ls-btn-search"
              onClick={
                xuLyTimKiem
              }
            >
              Tìm kiếm
            </button>

            {/* REFRESH */}

            <button
              type="button"
              className="ls-btn-search"
              onClick={
                loadHistory
              }
              title="Tải lại dữ liệu"
              aria-label="Tải lại dữ liệu"
            >
              ↻
            </button>

          </div>

          {/* =================================================
              TABLE
          ================================================= */}

          <div className="ls-table-scroll">

            {tab ===
              "tatca" &&
              renderTatCa()}

            {tab ===
              "cudan" &&
              renderCuDan()}

            {tab ===
              "xekhach" &&
              renderXeKhach()}

          </div>

          {/* =================================================
              PAGINATION
          ================================================= */}

          <div className="ls-pagination">

            <span>
              Hiển thị{" "}

              <strong>
                {tongKet > 0
                  ? 1
                  : 0}
              </strong>

              {" "} - {" "}

              <strong>
                {tongKet}
              </strong>

              {" "} trong {" "}

              <strong>
                {tongKet}
              </strong>

              {" "} kết quả
            </span>

            <div className="ls-pages">

              <button
                type="button"
                disabled
                aria-label="Trang trước"
              >
                ‹
              </button>

              <button
                type="button"
                className="ls-page-active"
                aria-current="page"
              >
                1
              </button>

              <button
                type="button"
                disabled
                aria-label="Trang sau"
              >
                ›
              </button>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default LichSu;
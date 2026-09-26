const API_URL = "http://localhost:5022/api";

// =====================================================
// LẤY TOKEN ĐĂNG NHẬP
// =====================================================

function layToken() {
    const cacKey = [
        "token",
        "accessToken",
        "jwt",
    ];

    for (const key of cacKey) {
        const token = localStorage.getItem(key);

        if (token && token.trim()) {
            return token;
        }
    }

    return null;
}

// =====================================================
// GỌI API
// =====================================================

export async function apiFetch(endpoint, options = {}) {
    const token = layToken();

    const laFormData =
        options.body instanceof FormData;

    // =================================================
    // HEADER
    // =================================================

    const headers = {
        ...(options.headers || {}),
    };

    // Không tự thêm Content-Type khi gửi FormData
    if (!laFormData) {
        headers["Content-Type"] =
            "application/json";
    }

    // =================================================
    // GỬI JWT
    // =================================================

    if (token) {
        headers["Authorization"] =
            `Bearer ${token}`;
    }

    // =================================================
    // GỌI BACKEND
    // =================================================

    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...options,
            headers,
        }
    );

    // =================================================
    // 401
    // =================================================

    if (response.status === 401) {
        throw new Error(
            "API lỗi: 401 - Chưa đăng nhập hoặc token đã hết hạn."
        );
    }

    // =================================================
    // 403
    // =================================================

    if (response.status === 403) {
        throw new Error(
            "API lỗi: 403 - Bạn không có quyền thực hiện thao tác này."
        );
    }

    // =================================================
    // 409
    // =================================================

    if (response.status === 409) {
        let message =
            "Dữ liệu đã tồn tại.";

        try {
            const data =
                await response.json();

            message =
                data?.message ||
                data?.Message ||
                message;
        } catch {
            // Không có JSON
        }

        throw new Error(
            `API lỗi: 409 - ${message}`
        );
    }

    // =================================================
    // CÁC LỖI KHÁC
    // =================================================

    if (!response.ok) {
        let message =
            `API lỗi: ${response.status}`;

        try {
            const data =
                await response.json();

            message =
                data?.message ||
                data?.Message ||
                message;
        } catch {
            // Không có JSON
        }

        throw new Error(message);
    }

    // =================================================
    // 204 NO CONTENT
    // =================================================

    if (response.status === 204) {
        return null;
    }

    // =================================================
    // JSON
    // =================================================

    const contentType =
        response.headers.get(
            "content-type"
        );

    if (
        contentType &&
        contentType.includes(
            "application/json"
        )
    ) {
        return response.json();
    }

    // =================================================
    // TEXT
    // =================================================

    return response.text();
}

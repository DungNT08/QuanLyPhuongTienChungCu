const API_URL = "http://localhost:5022/api";

export async function apiFetch(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
    });

    if (!response.ok) {
        throw new Error(`API lỗi: ${response.status}`);
    }

    // Trường hợp API không trả body
    if (response.status === 204) {
        return null;
    }

    return response.json();
}
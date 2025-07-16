import axios from "axios"

const instance = axios.create({
    baseURL: "http://localhost:4002/api", // Add your base URL here
    timeout: 10000, // Add timeout
})

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (
            error.response?.data?.code === "TOKEN_EXPIRED" &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true
            try {
                // Use the same instance for refresh token request
                const res = await axios.create({
                    baseURL: "http://localhost:4002/api",
                    withCredentials: true
                }).post("/auth/refresh-token", {})

                const newAccessToken = res.data.data.accessToken
                localStorage.setItem("token", newAccessToken)

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
                return instance(originalRequest)
            } catch (refreshError) {
                console.error("Refresh token failed:", refreshError)
                localStorage.removeItem("token")
                localStorage.removeItem("user")
                window.location.href = "/"
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export default instance
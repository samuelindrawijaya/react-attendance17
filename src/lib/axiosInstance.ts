import axios from "axios"

const instance = axios.create() // no withCredentials here

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
                const res = await axios.post("http://localhost:4002/api/auth/refresh-token", {}, {
                    withCredentials: true // only here
                })

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

import axios from "axios"

const API_BASE_URL = "http://localhost:4002/api"

const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 40000,
    withCredentials: true
})

let isRefreshing = false
let failedQueue: {
    resolve: (token: string) => void
    reject: (err: unknown) => void
}[] = []

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error)
        else prom.resolve(token!)
    })
    failedQueue = []
}

instance.interceptors.request.use(config => {
    const token = localStorage.getItem("token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

instance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config

        const isTokenExpired =
            error.response?.data?.code === "TOKEN_EXPIRED" && !originalRequest._retry

        if (isTokenExpired) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token: string) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`
                            resolve(instance(originalRequest))
                        },
                        reject
                    })
                })
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, {
                    withCredentials: true
                })

                const newToken = res.data.data.accessToken
                localStorage.setItem("token", newToken)

                instance.defaults.headers.common.Authorization = `Bearer ${newToken}`
                processQueue(null, newToken)

                originalRequest.headers.Authorization = `Bearer ${newToken}`
                return instance(originalRequest)
            } catch (refreshError) {
                processQueue(refreshError, null)
                localStorage.removeItem("token")
                localStorage.removeItem("user")
                window.location.href = "/"
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        return Promise.reject(error)
    }
)

export default instance

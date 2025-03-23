import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios"
import { log } from "console"

const API_URL = "http://localhost:5010/api"

/**
 * Creates a configured Axios instance for API requests
 * @param token Optional auth token to include in requests
 * @returns Configured Axios instance
 */
export function createApiClient(token?: string): AxiosInstance {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  return axios.create({
    baseURL: API_URL,
    headers,
  })
}

/**
 * Makes a GET request with a request body (not standard but needed for some APIs)
 * @param url The endpoint URL
 * @param data The request body data
 * @param config Additional axios config
 * @returns Promise with the response data
 */
export async function getWithBody<T>(url: string, data: any, config: AxiosRequestConfig = {}): Promise<T> {
  // Using axios directly to allow GET with body
  // console.log(url);
  // console.log(config);
  // console.log(API_URL);

  const response = await axios({
    method: "post",
    url: `${API_URL}${url}`,
    data,
    ...config,
  })

  return response.data
}

/**
 * Handles API errors consistently
 * @param error The caught error
 * @param defaultMessage Default message if none is provided by the API
 * @returns Throws a new error with appropriate message
 */
export function handleApiError(error: any, defaultMessage: string): never {
  const errorMessage = error.response?.data?.message || defaultMessage
  throw new Error(errorMessage)
}

export const API_BASE_URL = API_URL


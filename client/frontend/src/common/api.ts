import { API_PATHS, APIResponse, FileInfo, ProcessRequest, TaskStatus, WatermarkRequest } from './types'

// API 基础配置
const API_BASE_URL = 'http://localhost:8080'

// 通用请求处理函数
async function handleResponse<T>(response: Response): Promise<T> {
  const data: APIResponse<T> = await response.json()
  if (data.code !== 200) {
    throw new Error(data.message)
  }
  return data.data
}

// 文件系统 API
export async function listFiles(path?: string): Promise<FileInfo[]> {
  const url = new URL(API_PATHS.LIST_FILES, API_BASE_URL)
  if (path) {
    url.searchParams.set('path', path)
  }
  const response = await fetch(url)
  return handleResponse<FileInfo[]>(response)
}

export async function uploadFile(file: File): Promise<FileInfo> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}${API_PATHS.UPLOAD_FILE}`, {
    method: 'POST',
    body: formData,
  })

  return handleResponse<FileInfo>(response)
}

export async function getFileUrl(path: string): Promise<string> {
  return `${API_BASE_URL}${API_PATHS.GET_FILE}/${encodeURIComponent(path)}`
}

// 水印相关 API
export async function saveWatermark(imageData: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}${API_PATHS.SAVE_WATERMARK}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageData } as WatermarkRequest),
  })

  return handleResponse<string>(response)
}

export async function processMedia(request: ProcessRequest): Promise<string> {
  const response = await fetch(`${API_BASE_URL}${API_PATHS.PROCESS_MEDIA}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  return handleResponse<string>(response)
}

export async function getProcessStatus(taskId: string): Promise<TaskStatus> {
  const url = new URL(`${API_PATHS.GET_PROCESS_STATUS}/${taskId}`, API_BASE_URL)
  const response = await fetch(url)
  return handleResponse<TaskStatus>(response)
}

export async function generateCommand(request: ProcessRequest): Promise<string> {
  const response = await fetch(`${API_BASE_URL}${API_PATHS.GENERATE_COMMAND}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  return handleResponse<string>(response)
}
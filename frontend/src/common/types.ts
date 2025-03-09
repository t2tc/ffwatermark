export type TabType = 'files' | 'watermark' | 'execute'

export interface Step {
  id: TabType
  title: string
}

export const steps: Step[] = [
  { id: 'files', title: '选择文件' },
  { id: 'watermark', title: '创建水印' },
  { id: 'execute', title: '执行' },
]

// 文件信息类型
export interface FileInfo {
  name: string;
  path: string;
  size: number;
  isDir: boolean;
  modTime: number;
}

// 水印处理请求类型
export interface WatermarkRequest {
  imageData: string; // Base64 编码的水印图片数据
}

// 媒体处理请求类型
export interface ProcessRequest {
  sourcePath: string;    // 源文件路径
  outputPath: string;    // 输出文件路径
  watermarkPath: string; // 水印图片路径
  position: string;      // 水印位置 (e.g., "center", "top-left")
  scale: number;         // 水印缩放比例 (百分比)
  opacity: number;       // 水印透明度 (0-100)
}

// 任务状态类型
export interface TaskStatus {
  id: string;        // 任务ID
  status: string;    // 状态 (pending, processing, completed, failed)
  progress: number;  // 进度 (0-100)
  error: string;     // 错误信息
  createdAt: string; // 创建时间
  updatedAt: string; // 更新时间
}

// API 响应类型
export interface APIResponse<T> {
  code: number;    // 状态码
  message: string; // 消息
  data: T;         // 数据
}

// API 路径常量
export const API_PATHS = {
  // 文件系统相关路由
  LIST_FILES: '/api/files',
  UPLOAD_FILE: '/api/files',
  GET_FILE: '/api/files',
  PREVIEW_MEDIA: '/api/preview',

  // 水印相关路由
  SAVE_WATERMARK: '/api/watermark',
  PROCESS_MEDIA: '/api/process',
  GET_PROCESS_STATUS: '/api/process',
  GENERATE_COMMAND: '/api/generate-command',
} as const;
package main

import "time"

// FileInfo 文件信息
type FileInfo struct {
	Name    string `json:"name"`
	Path    string `json:"path"`
	Size    int64  `json:"size"`
	IsDir   bool   `json:"isDir"`
	ModTime int64  `json:"modTime"`
}

// WatermarkRequest 水印处理请求
type WatermarkRequest struct {
	ImageData string `json:"imageData"` // Base64 编码的水印图片数据
}

// ProcessRequest 媒体处理请求
type ProcessRequest struct {
	SourcePath     string `json:"sourcePath"`     // 源文件路径
	OutputPath     string `json:"outputPath"`     // 输出文件路径
	WatermarkPath  string `json:"watermarkPath"`  // 水印图片路径
	Position       string `json:"position"`       // 水印位置 (e.g., "center", "top-left")
	Scale          int    `json:"scale"`          // 水印缩放比例 (百分比)
	Opacity        int    `json:"opacity"`        // 水印透明度 (0-100)
}

// TaskStatus 任务状态
type TaskStatus struct {
	ID        string    `json:"id"`        // 任务ID
	Status    string    `json:"status"`    // 状态 (pending, processing, completed, failed)
	Progress  int       `json:"progress"`  // 进度 (0-100)
	Error     string    `json:"error"`     // 错误信息
	Output    []string  `json:"output"`    // 命令输出日志
	CreatedAt time.Time `json:"createdAt"` // 创建时间
	UpdatedAt time.Time `json:"updatedAt"` // 更新时间
}

// APIResponse API 响应格式
type APIResponse struct {
	Code    int         `json:"code"`    // 状态码
	Message string      `json:"message"` // 消息
	Data    interface{} `json:"data"`    // 数据
}
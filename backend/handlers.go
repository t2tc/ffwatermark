package main

import (
	"encoding/base64"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// 任务管理器
var (
	taskManager = struct {
		tasks map[string]*FFmpegTask
		mutex sync.RWMutex
	}{
		tasks: make(map[string]*FFmpegTask),
	}
)

// 处理目录列表请求
func handleListFiles(c *gin.Context) {
	// 获取请求路径
	path := c.Query("path")
	if path == "" {
		path = "."
	}

	// 获取目录内容
	entries, err := os.ReadDir(path)
	if err != nil {
		c.JSON(http.StatusInternalServerError, APIResponse{
			Code:    500,
			Message: "Failed to read directory",
			Data:    nil,
		})
		return
	}

	// 构建文件信息列表
	files := make([]FileInfo, 0)
	for _, entry := range entries {
		info, err := entry.Info()
		if err != nil {
			continue
		}

		files = append(files, FileInfo{
			Name:    entry.Name(),
			Path:    filepath.Join(path, entry.Name()),
			Size:    info.Size(),
			IsDir:   entry.IsDir(),
			ModTime: info.ModTime().Unix(),
		})
	}

	c.JSON(http.StatusOK, APIResponse{
		Code:    200,
		Message: "Success",
		Data:    files,
	})
}

// 处理文件上传请求
func handleUploadFile(c *gin.Context) {
	// 获取上传的文件
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, APIResponse{
			Code:    400,
			Message: "No file uploaded",
			Data:    nil,
		})
		return
	}

	// 确保上传目录存在
	uploadDir := "uploads"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, APIResponse{
			Code:    500,
			Message: "Failed to create upload directory",
			Data:    nil,
		})
		return
	}

	// 保存文件
	filePath := filepath.Join(uploadDir, file.Filename)
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, APIResponse{
			Code:    500,
			Message: "Failed to save file",
			Data:    nil,
		})
		return
	}

	c.JSON(http.StatusOK, APIResponse{
		Code:    200,
		Message: "File uploaded successfully",
		Data: FileInfo{
			Name: file.Filename,
			Path: filePath,
			Size: file.Size,
		},
	})
}

// 处理文件获取请求
func handleGetFile(c *gin.Context) {
	// 获取文件路径
	path := c.Param("path")
	if path == "" {
		c.JSON(http.StatusBadRequest, APIResponse{
			Code:    400,
			Message: "No file path provided",
			Data:    nil,
		})
		return
	}

	// 检查文件是否存在
	if _, err := os.Stat(path); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, APIResponse{
			Code:    404,
			Message: "File not found",
			Data:    nil,
		})
		return
	}

	// 发送文件
	c.File(path)
}

// 处理水印图片保存请求
func handleSaveWatermark(c *gin.Context) {
	// 解析请求
	var req WatermarkRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, APIResponse{
			Code:    400,
			Message: "Invalid request format",
			Data:    nil,
		})
		return
	}

	// 解码Base64图片数据
	imageData := strings.TrimPrefix(req.ImageData, "data:image/png;base64,")
	decoded, err := base64.StdEncoding.DecodeString(imageData)
	if err != nil {
		c.JSON(http.StatusBadRequest, APIResponse{
			Code:    400,
			Message: "Invalid image data",
			Data:    nil,
		})
		return
	}

	// 保存水印图片
	watermarkDir := "watermarks"
	if err := os.MkdirAll(watermarkDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, APIResponse{
			Code:    500,
			Message: "Failed to create watermark directory",
			Data:    nil,
		})
		return
	}

	// 生成唯一文件名
	fileName := fmt.Sprintf("watermark_%d.png", time.Now().UnixNano())
	filePath := filepath.Join(watermarkDir, fileName)

	// 写入文件
	if err := os.WriteFile(filePath, decoded, 0644); err != nil {
		c.JSON(http.StatusInternalServerError, APIResponse{
			Code:    500,
			Message: "Failed to save watermark",
			Data:    nil,
		})
		return
	}

	c.JSON(http.StatusOK, APIResponse{
		Code:    200,
		Message: "Watermark saved successfully",
		Data:    filePath,
	})
}

// 处理媒体处理请求
func handleProcessMedia(c *gin.Context) {
	// 解析请求
	var req ProcessRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, APIResponse{
			Code:    400,
			Message: "Invalid request format",
			Data:    nil,
		})
		return
	}

	// 创建新的FFmpeg任务
	task, err := NewFFmpegTask(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, APIResponse{
			Code:    500,
			Message: fmt.Sprintf("Failed to create task: %v", err),
			Data:    nil,
		})
		return
	}

	// 保存任务
	taskManager.mutex.Lock()
	taskManager.tasks[task.ID] = task
	taskManager.mutex.Unlock()

	// 启动任务
	if err := task.Start(); err != nil {
		c.JSON(http.StatusInternalServerError, APIResponse{
			Code:    500,
			Message: fmt.Sprintf("Failed to start task: %v", err),
			Data:    nil,
		})
		return
	}

	c.JSON(http.StatusOK, APIResponse{
		Code:    200,
		Message: "Task started successfully",
		Data:    task.ID,
	})
}

// 处理任务状态查询请求
func handleGetProcessStatus(c *gin.Context) {
	// 获取任务ID
	taskID := c.Param("taskId")
	if taskID == "" {
		c.JSON(http.StatusBadRequest, APIResponse{
			Code:    400,
			Message: "No task ID provided",
			Data:    nil,
		})
		return
	}

	// 查找任务
	taskManager.mutex.RLock()
	task, exists := taskManager.tasks[taskID]
	taskManager.mutex.RUnlock()

	if !exists {
		c.JSON(http.StatusNotFound, APIResponse{
			Code:    404,
			Message: "Task not found",
			Data:    nil,
		})
		return
	}

	// 返回任务状态
	c.JSON(http.StatusOK, APIResponse{
		Code:    200,
		Message: "Success",
		Data:    task.GetStatus(),
	})
}

// 处理生成 FFmpeg 命令请求
func handleGenerateFFmpegCommand(c *gin.Context) {
	// 解析请求
	var req ProcessRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, APIResponse{
			Code:    400,
			Message: "Invalid request format",
			Data:    nil,
		})
		return
	}

	// 构建 FFmpeg 命令参数
	args := buildFFmpegArgs(req)

	// 构建完整命令字符串
	cmd := fmt.Sprintf("%s %s", AppConfig.FFmpegPath, strings.Join(args, " "))

	c.JSON(http.StatusOK, APIResponse{
		Code:    200,
		Message: "FFmpeg command generated successfully",
		Data:    cmd,
	})
}

// 处理媒体预览请求
func handlePreviewMedia(c *gin.Context) {
	// 获取文件路径
	path := c.Query("path")
	if path == "" {
		c.JSON(http.StatusBadRequest, APIResponse{
			Code:    400,
			Message: "No file path provided",
			Data:    nil,
		})
		return
	}

	// 检查文件是否存在
	if _, err := os.Stat(path); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, APIResponse{
			Code:    404,
			Message: "File not found",
			Data:    nil,
		})
		return
	}

	// 获取文件扩展名
	ext := strings.ToLower(filepath.Ext(path))

	// 图片文件直接返回
	if ext == ".jpg" || ext == ".jpeg" || ext == ".png" || ext == ".gif" || ext == ".bmp" {
		c.File(path)
		return
	}

	// 视频文件生成预览图
	if ext == ".mp4" || ext == ".avi" || ext == ".mkv" || ext == ".mov" || ext == ".wmv" {
		// 获取预览时间点（默认为视频开始后 1 秒）
		timepoint := c.DefaultQuery("timepoint", "1")

		// 创建临时目录
		if err := os.MkdirAll(AppConfig.TempPath, 0755); err != nil {
			c.JSON(http.StatusInternalServerError, APIResponse{
				Code:    500,
				Message: "Failed to create temp directory",
				Data:    nil,
			})
			return
		}

		// 生成预览图文件名
		previewPath := filepath.Join(AppConfig.TempPath, fmt.Sprintf("%d.jpg", time.Now().UnixNano()))

		// 构建 FFmpeg 命令
		cmd := exec.Command(AppConfig.FFmpegPath,
			"-ss", timepoint,
			"-i", path,
			"-vframes", "1",
			"-y",
			previewPath,
		)

		// 执行命令
		if err := cmd.Run(); err != nil {
			c.JSON(http.StatusInternalServerError, APIResponse{
				Code:    500,
				Message: "Failed to generate preview",
				Data:    nil,
			})
			return
		}

		// 返回预览图
		c.File(previewPath)
		return
	}

	// 不支持的文件类型
	c.JSON(http.StatusBadRequest, APIResponse{
		Code:    400,
		Message: "Unsupported file type",
		Data:    nil,
	})
}

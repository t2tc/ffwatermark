package main

import (
	"fmt"
	"log/slog"
	"os"

	"github.com/gin-gonic/gin"
)

func main() {
	// 初始化日志配置
	InitLogger()

	// 加载配置文件
	if err := LoadConfig(); err != nil {
		slog.Error("Failed to load config", "error", err)
		os.Exit(1)
	}

	// 创建 Gin 引擎实例
	r := gin.Default()

	// 允许跨域请求
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// API 路由组
	api := r.Group("/api")
	{
		// 文件系统相关路由
		api.GET("/files", listFiles)            // 列出目录内容
		api.POST("/files", uploadFile)          // 上传文件
		api.GET("/files/*path", getFile)        // 获取文件
		api.GET("/preview", handlePreviewMedia) // 获取媒体预览

		// 水印相关路由
		api.POST("/watermark", saveWatermark)                // 保存水印图片
		api.POST("/process", processMedia)                   // 处理媒体文件
		api.GET("/process/:taskId", getProcessStatus)        // 获取处理状态
		api.POST("/generate-command", generateFFmpegCommand) // 生成 FFmpeg 命令
	}

	// 启动服务器
	if err := r.Run(fmt.Sprintf(":%d", AppConfig.BackendPort)); err != nil {
		slog.Error("Failed to start server", "error", err)
		os.Exit(1)
	}
}

// 列出目录内容
func listFiles(c *gin.Context) {
	handleListFiles(c)
}

// 上传文件
func uploadFile(c *gin.Context) {
	handleUploadFile(c)
}

// 获取文件
func getFile(c *gin.Context) {
	handleGetFile(c)
}

// 保存水印图片
func saveWatermark(c *gin.Context) {
	handleSaveWatermark(c)
}

// 处理媒体文件
func processMedia(c *gin.Context) {
	handleProcessMedia(c)
}

// 获取处理状态
func getProcessStatus(c *gin.Context) {
	handleGetProcessStatus(c)
}

// 生成 FFmpeg 命令
func generateFFmpegCommand(c *gin.Context) {
	handleGenerateFFmpegCommand(c)
}

package main

import (
	"context"
	"io"
	"log/slog"
	"os"
)

// 定义日志级别对应的颜色代码
const (
	colorReset  = "\033[0m"
	colorRed    = "\033[31m"
	colorGreen  = "\033[32m"
	colorYellow = "\033[33m"
	colorBlue   = "\033[34m"
)

// ColorHandler 自定义的彩色日志处理程序
type ColorHandler struct {
	slog.Handler
	output io.Writer
}

// NewColorHandler 创建新的彩色日志处理程序
func NewColorHandler(output io.Writer) *ColorHandler {
	return &ColorHandler{
		Handler: slog.NewTextHandler(output, &slog.HandlerOptions{
			Level: slog.LevelDebug,
		}),
		output: output,
	}
}

// Handle 处理日志记录
func (h *ColorHandler) Handle(ctx context.Context, r slog.Record) error {
	// 根据不同的日志级别和属性添加颜色
	var color string
	switch {
	case r.Level == slog.LevelError:
		color = colorRed
	case r.Message == "FFmpeg stderr":
		color = colorYellow
	case r.Message == "[FFmpeg]":
		color = colorBlue
	default:
		color = colorGreen
	}

	// 创建带颜色的记录
	r.Message = color + r.Message + colorReset

	return h.Handler.Handle(ctx, r)
}

// InitLogger 初始化日志配置
func InitLogger() {
	// 创建彩色日志处理程序
	handler := NewColorHandler(os.Stdout)

	// 设置全局日志记录器
	logger := slog.New(handler)
	slog.SetDefault(logger)
}
package main

import (
	"encoding/json"
	"os"
	"path/filepath"
)

// Config 应用程序配置结构
type Config struct {
	BackendPort  int    `json:"backend_port"`
	FrontendPort int    `json:"frontend_port"`
	FFmpegPath   string `json:"ffmpeg_path"`
	TempPath     string `json:"temp_path"`
}

// AppConfig 全局配置实例
var AppConfig Config

// LoadConfig 加载配置文件
func LoadConfig() error {
	// 读取配置文件
	configPath := filepath.Join("..", "CONSTANT.json")
	data, err := os.ReadFile(configPath)
	if err != nil {
		return err
	}

	// 解析配置
	if err := json.Unmarshal(data, &AppConfig); err != nil {
		return err
	}

	// 创建临时目录
	if err := os.MkdirAll(AppConfig.TempPath, 0755); err != nil {
		return err
	}

	return nil
}
package main

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestFFmpegTask(t *testing.T) {
	// 加载配置文件
	if err := LoadConfig(); err != nil {
		t.Fatalf("加载配置文件失败: %v", err)
	}

	// 验证FFmpeg路径
	if _, err := os.Stat(AppConfig.FFmpegPath); os.IsNotExist(err) {
		t.Fatalf("FFmpeg可执行文件不存在: %s", AppConfig.FFmpegPath)
	}

	// 准备测试文件路径
	sourcePath := filepath.Join("../test_media", "bbb.mp4")
	watermarkPath := filepath.Join("../test_media", "test_watermark.png")
	outputPath := filepath.Join("../test_media", "output.mp4")

	// 创建处理请求
	req := ProcessRequest{
		SourcePath:    sourcePath,
		WatermarkPath: watermarkPath,
		OutputPath:    outputPath,
		Position:      "center", // 测试中心位置
		Scale:         50,       // 水印大小为原始大小的50%
		Opacity:       80,       // 不透明度80%
	}

	// 创建FFmpeg任务
	task, err := NewFFmpegTask(req)
	if err != nil {
		t.Fatalf("创建FFmpeg任务失败: %v", err)
	}

	// 验证任务初始状态
	if task.Status.Status != "pending" {
		t.Errorf("初始状态错误: 期望 'pending', 得到 %s", task.Status.Status)
	}

	// 启动任务
	if err := task.Start(); err != nil {
		t.Fatalf("启动任务失败: %v", err)
	}

	// 监控任务进度
	progressUpdated := false
	timeout := time.After(30 * time.Second)

	for {
		select {
		case progress := <-task.ProgressChan:
			progressUpdated = true
			t.Logf("当前进度: %d", progress)
		case <-task.DoneChan:
			goto done
		case <-timeout:
			t.Fatal("任务执行超时")
		}
	}

done:
	// 验证任务完成状态
	finalStatus := task.GetStatus()
	if finalStatus.Status != "completed" {
		t.Errorf("任务未成功完成，最终状态: %s, 错误: %s", finalStatus.Status, finalStatus.Error)
	}

	// 验证进度更新是否正常工作
	if !progressUpdated {
		t.Error("未收到进度更新")
	}

	// 验证输出文件是否生成
	if _, err := os.Stat(outputPath); os.IsNotExist(err) {
		t.Error("输出文件未生成")
	}
}
package main

import (
	"bufio"
	"fmt"
	"io"
	"log/slog"
	"os/exec"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"
)

// FFmpegTask FFmpeg 任务结构
type FFmpegTask struct {
	ID           string
	Cmd          *exec.Cmd
	Status       *TaskStatus
	StdoutPipe   io.ReadCloser
	StderrPipe   io.ReadCloser
	ProgressChan chan int
	DoneChan     chan bool
	Mutex        sync.Mutex
}

// NewFFmpegTask 创建新的 FFmpeg 任务
func NewFFmpegTask(req ProcessRequest) (*FFmpegTask, error) {
	// 生成任务ID
	taskID := fmt.Sprintf("task_%d", time.Now().UnixNano())

	// 构建 FFmpeg 命令
	args := buildFFmpegArgs(req)
	cmd := exec.Command(AppConfig.FFmpegPath, args...)

	// 设置管道
	stdoutPipe, err := cmd.StdoutPipe()
	if err != nil {
		return nil, fmt.Errorf("failed to create stdout pipe: %v", err)
	}

	stderrPipe, err := cmd.StderrPipe()
	if err != nil {
		return nil, fmt.Errorf("failed to create stderr pipe: %v", err)
	}

	// 创建任务状态
	status := &TaskStatus{
		ID:        taskID,
		Status:    "pending",
		Progress:  0,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	slog.Info("FFmpeg命令", "cmd", cmd.String())

	// 返回任务实例
	return &FFmpegTask{
		ID:           taskID,
		Cmd:          cmd,
		Status:       status,
		StdoutPipe:   stdoutPipe,
		StderrPipe:   stderrPipe,
		ProgressChan: make(chan int),
		DoneChan:     make(chan bool),
	}, nil
}

// buildFFmpegArgs 构建 FFmpeg 命令参数
func buildFFmpegArgs(req ProcessRequest) []string {
	// 基础参数
	args := []string{
		"-i", req.SourcePath, // 输入文件
		"-i", req.WatermarkPath, // 水印图片
	}

	// 设置水印位置和大小
	overlay := buildOverlayFilter(req)

	// 添加滤镜参数
	args = append(args,
		"-filter_complex", overlay,
		"-codec:a", "copy", // 复制音频流
		"-y", // 覆盖输出文件
		req.OutputPath,
	)

	slog.Info("FFmpeg命令参数", "args", args)

	return args
}

// buildOverlayFilter 构建水印叠加滤镜参数
func buildOverlayFilter(req ProcessRequest) string {
	// 计算水印位置
	position := "x=0:y=0" // 默认左上角
	switch req.Position {
	case "center":
		position = "x=(main_w-overlay_w)/2:y=(main_h-overlay_h)/2"
	case "top-right":
		position = "x=main_w-overlay_w:y=0"
	case "bottom-left":
		position = "x=0:y=main_h-overlay_h"
	case "bottom-right":
		position = "x=main_w-overlay_w:y=main_h-overlay_h"
	}

	slog.Info("水印位置设置", "position", position)

	// 构建完整的滤镜字符串
	return fmt.Sprintf(
		"[1]scale=iw*%d/100:-1[watermark];[0][watermark]overlay=%s:alpha=%d/100",
		req.Scale,
		position,
		req.Opacity,
	)
}

// Start 启动 FFmpeg 任务
func (t *FFmpegTask) Start() error {
	// 更新任务状态
	t.Status.Status = "processing"
	t.Status.UpdatedAt = time.Now()

	// 启动进度监控
	go t.monitorProgress()

	// 启动命令
	if err := t.Cmd.Start(); err != nil {
		t.Status.Status = "failed"
		t.Status.Error = err.Error()
		t.Status.UpdatedAt = time.Now()
		return fmt.Errorf("failed to start ffmpeg: %v", err)
	}

	slog.Info("FFmpeg任务启动", "taskID", t.ID)

	// 等待命令完成
	go func() {
		err := t.Cmd.Wait()
		t.Mutex.Lock()
		defer t.Mutex.Unlock()

		if err != nil {
			t.Status.Status = "failed"
			t.Status.Error = err.Error()
		} else {
			t.Status.Status = "completed"
			t.Status.Progress = 100
		}

		t.Status.UpdatedAt = time.Now()
		close(t.DoneChan)
	}()

	return nil
}

// monitorProgress 监控 FFmpeg 进度
func (t *FFmpegTask) monitorProgress() {
	// 创建 stdout 监控协程
	go func() {
		scanner := bufio.NewScanner(t.StdoutPipe)
		for scanner.Scan() {
			line := scanner.Text()
			t.Mutex.Lock()
			t.Status.Output = append(t.Status.Output, "[stdout] "+line)
			t.Status.UpdatedAt = time.Now()
			t.Mutex.Unlock()
			fmt.Println("[FFmpeg stdout] ", line)
		}
	}()

	// 监控 stderr 输出
	scanner := bufio.NewScanner(t.StderrPipe)
	progressRegex := regexp.MustCompile(`time=([0-9:.]+)`) // 匹配时间信息

	for scanner.Scan() {
		line := scanner.Text()

		// 保存输出信息
		t.Mutex.Lock()
		t.Status.Output = append(t.Status.Output, "[stderr] "+line)
		t.Status.UpdatedAt = time.Now()

		fmt.Println("[FFmpeg stderr] ", line)

		// 解析进度信息
		if matches := progressRegex.FindStringSubmatch(line); len(matches) > 1 {
			timeStr := matches[1]
			seconds := parseFFmpegTime(timeStr)
			t.Status.Progress = int(seconds) // 这里需要根据视频总长度计算百分比

			// 发送进度更新
			select {
			case t.ProgressChan <- t.Status.Progress:
			default:
			}
		}
		t.Mutex.Unlock()
	}
}

// parseFFmpegTime 解析 FFmpeg 时间字符串
func parseFFmpegTime(timeStr string) float64 {
	parts := strings.Split(timeStr, ":")
	if len(parts) != 3 {
		return 0
	}

	hours, _ := strconv.ParseFloat(parts[0], 64)
	minutes, _ := strconv.ParseFloat(parts[1], 64)
	seconds, _ := strconv.ParseFloat(parts[2], 64)

	return hours*3600 + minutes*60 + seconds
}

// GetStatus 获取任务状态
func (t *FFmpegTask) GetStatus() *TaskStatus {
	t.Mutex.Lock()
	defer t.Mutex.Unlock()
	return t.Status
}

// Stop 停止任务
func (t *FFmpegTask) Stop() error {
	if t.Cmd.Process == nil {
		return nil
	}

	// 发送终止信号
	if err := t.Cmd.Process.Kill(); err != nil {
		return fmt.Errorf("failed to kill process: %v", err)
	}

	t.Mutex.Lock()
	t.Status.Status = "failed"
	t.Status.Error = "Task stopped by user"
	t.Status.UpdatedAt = time.Now()
	t.Mutex.Unlock()

	return nil
}

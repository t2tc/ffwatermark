package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// FileInfo 结构体用于存储文件信息
type FileInfo struct {
	Name string `json:"name"`
	Path string `json:"path"`
	Size int64  `json:"size"`
	Type string `json:"type"`
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// OpenMultipleFilesDialog 打开系统文件选择对话框
func (a *App) OpenMultipleFilesDialog() ([]FileInfo, error) {
	files, err := runtime.OpenMultipleFilesDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "选择文件",
		Filters: []runtime.FileFilter{{
			DisplayName: "视频/图像文件",
			Pattern:     "*.mp4;*.avi;*.mkv;*.mov;*.wmv;*.flv;*.rmvb;*.ts;*.m3u8;*.webm;*.jpg;*.jpeg;*.png;*.gif;*.bmp;",
		}},
	})

	if err != nil {
		return nil, err
	}

	var fileInfos []FileInfo
	for _, filePath := range files {
		fileInfo, err := os.Stat(filePath)
		if err != nil {
			continue
		}

		fileInfos = append(fileInfos, FileInfo{
			Name: fileInfo.Name(),
			Path: filePath,
			Size: fileInfo.Size(),
			Type: filepath.Ext(filePath),
		})
	}

	return fileInfos, nil
}

// EmitError 发送普通错误事件到前端
func EmitError(ctx context.Context, message string) {
	runtime.EventsEmit(ctx, "error", map[string]string{
		"message": message,
	})
}

// EmitUnrecoverableError 发送不可恢复错误事件到前端
func EmitUnrecoverableError(ctx context.Context, message string) {
	runtime.EventsEmit(ctx, "unrecoverable-error", map[string]string{
		"message": message,
	})
}

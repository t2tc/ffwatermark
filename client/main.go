package main

import (
	"context"
	"embed"
	"fmt"
	"os"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp()

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "ffwatermark",
		Width:  1440,
		Height: 900,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 255, G: 255, B: 255, A: 1},
		OnStartup: func(ctx context.Context) {
			app.startup(ctx)

			// 检查 FFmpeg 是否存在
			if err := LoadConfig(); err != nil {
				runtime.EventsEmit(ctx, "error", "无法加载配置文件："+err.Error())
				fmt.Println("无法加载配置文件：" + err.Error())
				return
			} else {
				fmt.Println("配置文件加载成功！")
			}

			if _, err := os.Stat(AppConfig.FFmpegPath); os.IsNotExist(err) {
				runtime.EventsEmit(ctx, "error", "未找到 FFmpeg 可执行文件，请确保已正确安装 FFmpeg.")
				fmt.Println("未找到 FFmpeg 可执行文件，请确保已正确安装 FFmpeg.")
			} else {
				fmt.Println("FFmpeg 可执行文件路径：" + AppConfig.FFmpegPath)
			}
		},
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}

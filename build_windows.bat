@echo off

cd backend
go mod tidy
go build -o ../dist/backend.exe

cd ../frontend
npm run build
copy /y dist\* ..\dist\

cd ..
if exist dist\backend.exe (
    echo Build Successful
) else (
    echo Build Failed
)
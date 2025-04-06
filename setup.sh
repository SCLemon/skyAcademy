#!/bin/bash

# 啟動 MongoDB 服務
echo "Starting MongoDB service..."
sudo systemctl start mongod

# 克隆 Git 存儲庫
echo "Cloning the Git repository..."
git clone https://github.com/SCLemon/sky.git

# 進入 sky 目錄並安裝前端依賴
cd sky
echo "Installing frontend dependencies..."
npm install

# 使用 sudo 啟動 Node.js 應用
echo "Starting the frontend Node.js app..."
sudo node https.js

# 進入 backend 目錄並安裝後端依賴
cd backend
echo "Installing backend dependencies..."
npm install

# 使用 sudo 啟動後端 Node.js 應用
echo "Starting the backend Node.js app..."
sudo node index.js

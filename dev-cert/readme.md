// 創建開發環境中需要用到的 https 憑證（僅用於開發環境）

在電腦的終端機中輸入：
brew install mkcert
mkcert -install

在你的專案根目錄建立 dev-cert/，然後執行：
mkdir -p cert
mkcert -key-file dev-cert/localhost-key.pem -cert-file dev-cert/localhost-cert.pem localhost 127.0.0.1 ::1
## 創建開發環境中需要用到的 https 憑證（僅用於開發環境）

在電腦的終端機中輸入：

```
brew install mkcert
mkcert -install
```

在你的專案根目錄建立 dev-cert/，然後執行：

```
docker exec -it <容器名稱> mongosh
show dbs
use <your_db>
show collections
db.<your_collection>.find().limit(10)
```
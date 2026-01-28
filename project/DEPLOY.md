# 游戏陪玩系统部署文档

本文档详细说明了“基于VUE的移动端游戏陪玩系统”的前后端及数据库部署流程。

## 目录结构说明

- `be/`: 后端服务 (Node.js + Express)
- `fe/`: 移动端前端 (Vue 3 + Vite)
- `workbench/`: 管理后台前端 (Vue 3 + Vite + Element Plus)
- `db/`: 数据库初始化脚本

---

## 1. 环境准备

在部署之前，请确保服务器安装了以下软件：

- **Node.js**: v16.0.0 或更高版本
- **MySQL**: v5.7 或 v8.0
- **Nginx** (可选，用于反向代理和静态资源托管)
- **Git**

---

## 2. 数据库部署

### 2.1 创建数据库
登录 MySQL 数据库，创建一个新的数据库（例如 `play_companion_db`）。

```sql
CREATE DATABASE play_companion_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2.2 初始化表结构与数据
你可以选择使用 Node 脚本自动初始化，或者手动导入 SQL 文件。

**方法 A：使用 Node 脚本（推荐）**

1. 进入 `be` 目录安装依赖：
   ```bash
   cd be
   npm install
   ```
2. 配置环境变量（参考 3.1 节），确保数据库连接信息正确。
3. 在项目根目录下运行初始化脚本：
   ```bash
   # 假设你在项目根目录
   node db/seed.js
   # 或者在 be 目录下
   npm run seed
   ```

**方法 B：手动导入 SQL**

1. 使用数据库管理工具（如 Navicat, DBeaver）或命令行连接数据库。
2. 依次运行 `db/init.sql` (如果存在) 和 `db/seed.sql` 文件中的 SQL 语句。

> **注意**：初始化数据通常包含默认管理员账号：
> - 用户名：`admin`
> - 密码：`123456`

---

## 3. 后端服务部署 (be)

### 3.1 配置环境变量
进入 `be` 目录，复制 `.env.example` 为 `.env`：

```bash
cd be
cp .env.example .env
```

编辑 `.env` 文件，填入你的实际配置：

```ini
PORT=3002
DB_HOST=localhost
DB_USER=root
DB_PASS=你的数据库密码
DB_NAME=play_companion_db
JWT_SECRET=设置一个复杂的密钥
```

### 3.2 安装依赖与启动
```bash
# 安装依赖
npm install

# 开发模式启动
npm run dev

# 生产环境启动 (建议使用 PM2)
# 安装 PM2
npm install -g pm2
# 启动服务
pm2 start app.js --name "play-companion-be"
```

后端服务默认运行在 `http://localhost:3002`。

---

## 4. 前端项目部署

本系统包含两个前端项目：移动端 (`fe`) 和 管理后台 (`workbench`)。

### 4.1 移动端部署 (fe)

1. **进入目录并安装依赖**：
   ```bash
   cd fe
   npm install
   ```

2. **配置生产环境接口地址**：
   创建一个 `.env.production` 文件（如果不存在），指定后端 API 地址：
   ```ini
   VITE_API_BASE_URL=http://你的服务器IP:3002/api
   ```

3. **构建项目**：
   ```bash
   npm run build
   ```
   构建完成后，会生成 `dist` 目录。

### 4.2 管理后台部署 (workbench)

1. **进入目录并安装依赖**：
   ```bash
   cd workbench
   npm install
   ```

2. **配置生产环境接口地址**：
   同样创建 `.env.production` 文件：
   ```ini
   VITE_API_BASE_URL=http://你的服务器IP:3002/api
   ```

3. **构建项目**：
   ```bash
   npm run build
   ```
   构建完成后，会生成 `dist` 目录。

---

## 5. Nginx 配置示例

建议使用 Nginx 托管静态资源并反向代理后端 API。以下是一个配置示例：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 1. 移动端 H5 (访问根路径)
    location / {
        root /path/to/project/fe/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 2. 管理后台 (访问 /admin 路径)
    location /admin {
        alias /path/to/project/workbench/dist;
        index index.html;
        try_files $uri $uri/ /admin/index.html;
    }

    # 3. 后端 API 代理
    location /api {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

> **注意**：如果管理后台部署在 `/admin` 子路径下，可能需要在 `workbench/vite.config.js` 中设置 `base: '/admin/'`，重新构建。或者使用两个不同的域名/端口分别指向两个 dist 目录。

---

## 6. 常见问题

1. **数据库连接失败**：
   - 检查 MySQL 服务是否启动。
   - 检查 `.env` 文件中的账号密码是否正确。
   - 检查 MySQL 是否允许远程连接（如果后端和数据库不在同一台服务器）。

2. **前端页面 404**：
   - 确保 Nginx 配置了 `try_files $uri $uri/ /index.html;` 以支持 Vue Router 的 History 模式。

3. **接口请求跨域 (CORS)**：
   - 后端 `app.js` 已经配置了 `cors` 中间件，通常允许所有来源。如果生产环境需要限制，请修改 `app.js` 中的 cors 配置。

---

## 7. 维护与更新

- **更新代码**：`git pull`
- **更新依赖**：`npm install`
- **重启后端**：`pm2 restart play-companion-be`
- **重新构建前端**：`npm run build`

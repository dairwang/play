初始化说明

1. 设置数据库连接
- 编辑 be/.env，确保 DB_HOST、DB_USER、DB_PASS、DB_NAME 正确

2. 运行初始化脚本（二选一）
- 使用 Node 脚本：在 db 目录执行 `node seed.js`
- 使用 SQL 脚本：在 MySQL 客户端执行 `db/seed.sql`

3. 预置数据
- 用户：管理员 admin、陪玩师 comp1、普通用户 user1（密码均为 123456）
- 游戏：英雄联盟、王者荣耀
- 陪玩服务：comp1 的已审核上线服务

# Vercel部署指南

## 🚀 部署前准备

### 1. 环境变量配置

在Vercel项目设置中添加以下环境变量：

```bash
# 数据库配置
DATABASE_URL="postgres://bd6a6a5bc661f911ad736bbbfa4e5391914456d456e391e3519691dc7bd9b356:sk_U3Tdoy56oriIPnpsjHGTR@db.prisma.io:5432/postgres?sslmode=require"

# NextAuth配置
NEXTAUTH_URL="https://elhamdimport.com"
NEXTAUTH_SECRET="elhamd-secret-key-2024-secure-production"

# 应用配置
NODE_ENV="production"
```

### 2. 数据库设置

1. 确保PostgreSQL数据库正在运行
2. 运行数据库迁移：
   ```bash
   npx prisma db push
   ```

### 3. 创建管理员用户

部署后，访问以下URL创建管理员用户：
```
https://elhamdimport.com/api/setup-admin
```

或者手动在数据库中创建：
```sql
INSERT INTO users (id, email, password, name, role, isActive, emailVerified, createdAt, updatedAt)
VALUES (
  'admin-id',
  'admin@elhamd.com',
  '$2a$12$hashed_password_here',
  'Admin User',
  'ADMIN',
  true,
  true,
  NOW(),
  NOW()
);
```

## 🔧 登录凭据

- **邮箱**: admin@elhamd.com
- **密码**: admin123

## 🐛 故障排除

### 1. 登录400错误

如果遇到400错误，检查：
- 环境变量是否正确设置
- 数据库连接是否正常
- 管理员用户是否存在

### 2. 数据库连接问题

运行数据库检查：
```
https://elhamdimport.com/api/debug/db-check
```

### 3. Cookie问题

确保：
- `NEXTAUTH_URL`与域名匹配
- 使用HTTPS
- Cookie设置正确

## 📝 部署步骤

1. **推送代码到GitHub**
2. **连接Vercel项目**
3. **配置环境变量**
4. **部署应用**
5. **运行数据库迁移**
6. **创建管理员用户**
7. **测试登录功能**

## 🔍 验证部署

1. 访问主页: `https://elhamdimport.com`
2. 访问登录页: `https://elhamdimport.com/login`
3. 使用管理员凭据登录
4. 验证重定向到管理面板

## 📞 技术支持

如果遇到问题，请检查：
- Vercel部署日志
- 数据库连接状态
- 环境变量配置
- 网络和域名设置
# 🚀 Elara Production Server Cheat Sheet

A master reference guide for controlling your live VPS infrastructure. Bookmark this file for quick copy-pasting whenever performing maintenance.

---

## 💾 Database Management (PostgreSQL)

Use these commands to inspect real-time user data, product counts, and backend records.

### 1. Enter the Database Prompt
```bash
sudo -u postgres psql -d elara_db
```

### 2. Common Data Viewing Queries
*Inside the `elara_db=#` prompt:*

| Command | Action |
| :--- | :--- |
| `\dt` | **List all Tables** (Shows users, products, orders etc.) |
| `SELECT COUNT(*) FROM "Product";` | **Count Total Products** |
| `SELECT * FROM "User";` | **View All Users** |
| `SELECT * FROM "Order" LIMIT 5;` | **View 5 Most Recent Orders** |
| `UPDATE "User" SET role = 'ADMIN' WHERE email = 'example@email.com';` | **Promote user to Admin** |

### 3. Exit Database
*Safely exits back to the standard terminal:*
```sql
\q
```

---

## 🔄 Code Deployment (Updating the Server)

Run these steps sequentially whenever you push new code/features to GitHub and want them active on the live website.

```bash
# Step 1: Enter project directory
cd /var/www/elara-backend

# Step 2: Download latest code from GitHub
git pull

# Step 3: Recompile TypeScript code
npm run build

# Step 4: Activate changes instantly
pm2 restart all
```

---

## 📡 Application Management (PM2)

Use these commands to monitor health, view real-time logs, and control server execution.

| Command | Action |
| :--- | :--- |
| `pm2 status` | View health/uptime of backend (Look for green "Online") |
| `pm2 logs` | View live crash/console error stream (Press `CTRL+C` to exit view) |
| `pm2 restart all` | Hard reboot the application instance |
| `pm2 stop all` | Take backend offline temporarily |
| `pm2 save` | Locks your current config so it remembers across reboots |

---

## 🛠️ Critical System Actions

| Task | Command |
| :--- | :--- |
| **Find Public IP** | `curl ifconfig.me` |
| **Restart Web Gateway** | `systemctl restart nginx` |
| **Check Gateway Status** | `nginx -t` |
| **Renew SSL Certificates**| `certbot renew --dry-run` |

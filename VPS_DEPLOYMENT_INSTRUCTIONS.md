# 🚀 VPS Deployment Playbook: Delivery Module Hydration

This guide provides exact, sequential instructions to host your new **Dynamic Delivery Framework & Interactive Checkout Flow** on your production VPS.

---

## 📦 Step 1: Pull Latest Source Code

Log into your VPS via SSH, navigate to the repository root, and fetch your latest pushed changes:

```bash
# From root directory
git pull origin main
```

---

## 🛠️ Step 2: Upgrade & Recompile Backend (Express / Prisma)

Because we modified the database schema (`DeliveryZone` table), you must regenerate the Prisma client and apply the incremental changes to your PostgreSQL database.

```bash
# 1. Navigate to backend environment
cd backend

# 2. Re-install dependencies if any lockfile changes occurred
bun install # or npm install

# 3. RE-GENERATE PRISMA CLIENT (CRITICAL FOR SCHEMAS)
npx prisma generate

# 4. DEPLOY SCHEMA UPDATES TO PRODUCTION DB
# If using standard rapid-sync development:
npx prisma db push

# 5. RE-COMPILE BACKEND DISTRIBUTION
bun run build # or npm run build
```

---

## 🌐 Step 3: Recompile Frontend (Next.js / Storefront)

Compile the frontend to ensure the new Custom Searchable ComboBox components are rendered into production chunks.

```bash
# 1. Navigate back to the root directory
cd ..

# 2. Install new React-Icons assets if needed
bun install # or npm install

# 3. COMPILE NEXT.JS PRODUCTION CHUNKS
bun run build # or npm run build
```

---

## 🔄 Step 4: Recover PM2 Application Processes

Restart your managed application processes so they pick up the freshly generated compilation bundles.

```bash
# Restart backend and frontend instances
pm2 restart all

# Verify that services are running properly
pm2 status
```

---

## 🌱 Step 5: 1-Click DB Injection (From Admin Interface)

Once the system is live, the PostgreSQL database will not have the 65 physical districts loaded yet. Rather than manually running scripts, I built a custom, visual utility directly inside your Admin Dashboard!

1. **Log in** to your Admin Panel on your live domain.
2. Navigate to **Settings -> Delivery Fees** (accessible via Site Engine).
3. The system will automatically detect the empty database and render a beautiful **"Database Ledger Empty"** warning card.
4. Simply click: **`[ Run Automated Ingestion (Seed DB) ]`**
5. The interface will display a loading spinner and respond with:
   > *"1-Click Hydration Complete: Synced 65 verified districts and mapped their sub-areas."*

The storefront checkout dropdown is now fully populated with live, interactive data! 🚀

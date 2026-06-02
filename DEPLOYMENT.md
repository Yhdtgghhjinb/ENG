# 🚀 StudyHub VTU - Deployment Guide

Complete guide to deploy your StudyHub VTU platform to production.

---

## 📋 **Prerequisites**

- Git installed
- GitHub account
- Accounts on:
  - [Vercel](https://vercel.com) (Frontend)
  - [Render](https://render.com) (Backend)
  - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Database)

---

## 🗄️ **STEP 1: Setup MongoDB Atlas (Database)**

### 1.1 Create Database
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up / Log in
3. Click **"Create"** → **"Build a Database"**
4. Select **FREE tier** (M0 Sandbox)
5. Choose **Cloud Provider & Region** (closest to your users)
6. Click **"Create Cluster"**

### 1.2 Setup Database Access
1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Create username & password (save these!)
4. Select **"Read and write to any database"**
5. Click **"Add User"**

### 1.3 Setup Network Access
1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

### 1.4 Get Connection String
1. Go back to **"Database"**
2. Click **"Connect"** on your cluster
3. Select **"Connect your application"**
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Save this - you'll need it for backend deployment!

Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/studyhub?retryWrites=true&w=majority`

---

## 🔧 **STEP 2: Deploy Backend (Render)**

### 2.1 Push Code to GitHub
```bash
# Initialize git (if not already)
cd /path/to/your/project
git init
git add .
git commit -m "Initial commit - StudyHub VTU"

# Create GitHub repo and push
# Go to github.com → New Repository → studyhub-vtu
git remote add origin https://github.com/YOUR_USERNAME/studyhub-vtu.git
git branch -M main
git push -u origin main
```

### 2.2 Deploy on Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `studyhub-vtu-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### 2.3 Add Environment Variables
In Render dashboard, add these environment variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/studyhub?retryWrites=true&w=majority
PORT=5000
CORS_ORIGIN=*
NODE_ENV=production
```

5. Click **"Create Web Service"**
6. Wait for deployment (5-10 minutes)
7. **Copy your backend URL**: `https://studyhub-vtu-backend.onrender.com`

---

## 🎨 **STEP 3: Deploy Frontend (Vercel)**

### 3.1 Update API URL
1. Open `client/.env.production`
2. Replace with your Render backend URL:
```
VITE_API_URL=https://studyhub-vtu-backend.onrender.com
```

3. Commit changes:
```bash
git add .
git commit -m "Update production API URL"
git push
```

### 3.2 Deploy on Vercel
1. Go to [Vercel](https://vercel.com/login)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variable:
```
VITE_API_URL=https://studyhub-vtu-backend.onrender.com
```

6. Click **"Deploy"**
7. Wait for deployment (2-3 minutes)
8. **Your site is live!** 🎉

### 3.3 Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

---

## ✅ **STEP 4: Test Your Deployment**

### Test Checklist:
- [ ] Landing page loads
- [ ] Click "Get Started" → Home page works
- [ ] Browse branches → View schemes → Semesters
- [ ] View subjects and resources
- [ ] Admin login at `/admin/login`
- [ ] Login with: `rakeshn` / `Rakeshn9380@`
- [ ] Admin dashboard loads
- [ ] Upload a test resource
- [ ] Mobile responsive on phone

---

## 🔧 **STEP 5: Update Backend CORS**

After frontend is deployed, update CORS in Render:

1. Go to Render Dashboard → Your backend service
2. Environment → Edit `CORS_ORIGIN`
3. Change from `*` to your Vercel URL:
```
CORS_ORIGIN=https://your-app.vercel.app
```
4. Save and redeploy

---

## 📱 **STEP 6: Setup File Storage (Important!)**

Render's free tier doesn't persist files. For production file uploads:

### Option A: Cloudinary (Recommended - Free tier)
1. Sign up at [Cloudinary](https://cloudinary.com)
2. Get API credentials
3. Update backend to use Cloudinary for file uploads

### Option B: AWS S3 / Google Cloud Storage
1. Setup cloud storage
2. Configure backend to upload there

---

## 🎯 **Your Live URLs:**

**Frontend (User Site):**
- https://your-app.vercel.app

**Backend (API):**
- https://studyhub-vtu-backend.onrender.com

**Admin Login:**
- https://your-app.vercel.app/admin/login
- Username: `rakeshn`
- Password: `Rakeshn9380@`

---

## 🔄 **Continuous Deployment**

Both Vercel and Render auto-deploy when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Your changes"
git push

# Vercel and Render auto-deploy in 2-5 minutes
```

---

## 🐛 **Troubleshooting**

### Issue: CORS Error
**Solution**: Update `CORS_ORIGIN` in Render with exact Vercel URL

### Issue: Can't connect to database
**Solution**: Check MongoDB Atlas allows all IPs (0.0.0.0/0)

### Issue: 404 on routes
**Solution**: Vercel should have rewrites configured (check vercel.json)

### Issue: Build fails
**Solution**: Check build logs, ensure all dependencies installed

### Issue: Backend slow (Render free tier)
**Solution**: Free tier sleeps after 15min inactivity, first request takes 30s

---

## 💰 **Cost Breakdown**

**FREE PLAN:**
- Vercel: Free (hobby)
- Render: Free tier
- MongoDB Atlas: Free (512MB)
- **Total: $0/month** ✅

**Limitations:**
- Render sleeps after 15min inactivity
- MongoDB 512MB storage limit
- No file persistence on Render

**PAID PLAN (Recommended for production):**
- Vercel Pro: $20/month (optional)
- Render: $7/month (persistent storage)
- MongoDB: $9/month (2GB)
- Cloudinary: Free → $0-99/month
- **Total: ~$16-50/month**

---

## 🎉 **You're Done!**

Your StudyHub VTU platform is now live and accessible worldwide! 🚀

Share your link with students and start helping them succeed! 📚✨

---

## 📞 **Need Help?**

- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- MongoDB Docs: https://docs.mongodb.com

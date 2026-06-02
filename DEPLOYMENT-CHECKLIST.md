# ✅ Deployment Checklist - StudyHub VTU

## 📋 Pre-Deployment

- [ ] All features tested locally
- [ ] Admin login works (rakeshn / Rakeshn9380@)
- [ ] Mobile optimization verified
- [ ] No console errors
- [ ] Environment variables configured

## 🗄️ Database Setup (MongoDB Atlas)

- [ ] MongoDB Atlas account created
- [ ] Free cluster created
- [ ] Database user created (username + password)
- [ ] Network access configured (0.0.0.0/0)
- [ ] Connection string copied
- [ ] Database name: `studyhub` or your choice

## 📤 GitHub Setup

- [ ] GitHub account ready
- [ ] Repository created: `studyhub-vtu`
- [ ] Code committed and pushed
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/studyhub-vtu.git
git push -u origin main
```

## 🔧 Backend Deployment (Render)

- [ ] Render account created
- [ ] New Web Service created
- [ ] GitHub repo connected
- [ ] Configuration:
  - Root Directory: `server`
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Instance: Free
- [ ] Environment variables added:
  - [ ] `MONGODB_URI`
  - [ ] `PORT=5000`
  - [ ] `CORS_ORIGIN=*` (update later)
  - [ ] `NODE_ENV=production`
- [ ] Service deployed successfully
- [ ] Backend URL copied: `https://______.onrender.com`
- [ ] Test API: `https://YOUR-BACKEND.onrender.com/api/vtu/branches`

## 🎨 Frontend Deployment (Vercel)

- [ ] Vercel account created
- [ ] Update `client/.env.production`:
  ```
  VITE_API_URL=https://YOUR-BACKEND.onrender.com
  ```
- [ ] Commit and push changes
- [ ] New project created on Vercel
- [ ] GitHub repo imported
- [ ] Configuration:
  - Framework: Vite
  - Root Directory: `client`
  - Build Command: `npm run build`
  - Output Directory: `dist`
- [ ] Environment variable added:
  - [ ] `VITE_API_URL=https://YOUR-BACKEND.onrender.com`
- [ ] Project deployed
- [ ] Frontend URL: `https://______.vercel.app`

## 🔄 Post-Deployment

- [ ] Update CORS in Render:
  - Change `CORS_ORIGIN` from `*` to `https://YOUR-APP.vercel.app`
  - Save and redeploy
- [ ] Test complete user flow:
  - [ ] Landing page loads
  - [ ] Click "Get Started"
  - [ ] Browse branches
  - [ ] View subjects
  - [ ] View resources
  - [ ] Download works
- [ ] Test admin panel:
  - [ ] Go to `/admin/login`
  - [ ] Login: rakeshn / Rakeshn9380@
  - [ ] Dashboard loads
  - [ ] View branches/subjects/resources
  - [ ] Logout works
- [ ] Test on mobile:
  - [ ] Responsive design works
  - [ ] Navigation smooth
  - [ ] Admin menu works

## 🎯 Optional Enhancements

- [ ] Custom domain configured
- [ ] File storage setup (Cloudinary/S3)
- [ ] Analytics added (Google Analytics)
- [ ] SSL certificate verified
- [ ] SEO metadata updated
- [ ] Favicon updated

## 📝 Save These URLs

**Frontend:** https://__________________.vercel.app

**Backend:** https://__________________.onrender.com

**Admin:** https://__________________.vercel.app/admin/login

**MongoDB:** mongodb+srv://____________

## 🎉 Launch

- [ ] Share link with students
- [ ] Monitor errors (Vercel Analytics / Render logs)
- [ ] Celebrate! 🎊

---

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

**Your Progress:** ____ / Total Items

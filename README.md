# 📚 StudyHub VTU

Complete study platform for VTU engineering students. Access notes, question papers, lab programs, and resources organized by branch, scheme, and semester.

## ✨ Features

- 🎓 **Branch-wise Organization** - Browse by engineering branch
- 📐 **Scheme Support** - Multiple curriculum schemes
- 📅 **Semester Navigation** - Easy semester-wise access
- 📘 **Subject Resources** - Notes, PYQs, Lab programs
- 🔐 **Admin Panel** - Secure resource management
- 📱 **Mobile Optimized** - Works perfectly on all devices
- 🎨 **Modern UI** - Beautiful gradient cards and animations

## 🚀 Quick Start

### Development Setup

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/studyhub-vtu.git
cd studyhub-vtu

# Setup Backend
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB connection
npm run dev

# Setup Frontend (in new terminal)
cd client
npm install
npm run dev
```

Visit: http://localhost:5173

## 🌐 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment guide.

**Quick Deploy:**
1. Deploy backend on Render
2. Deploy frontend on Vercel
3. Update API URL in client/.env.production

## 🔐 Admin Access

- **Login URL**: `/admin/login`
- **Username**: `rakeshn`
- **Password**: `Rakeshn9380@`

## 🛠️ Tech Stack

**Frontend:**
- React + Vite
- TailwindCSS
- Framer Motion
- React Router
- Axios

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- Multer (file uploads)
- OpenAI (semantic search)

## 📱 Mobile Features

- Responsive design (320px - 4K)
- Touch-optimized navigation
- Bottom navigation bar
- Slide-out admin menu
- Fast performance

## 🎨 Branding

**StudyHub VTU** - Custom logo with book and star design
- Primary: Indigo → Purple → Pink gradient
- Accent: Golden yellow
- Font: Inter

## 📂 Project Structure

```
studyhub-vtu/
├── client/              # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/       # User pages
│   │   ├── admin/       # Admin panel
│   │   └── components/  # Shared components
│   └── dist/            # Build output
├── server/              # Backend (Node.js)
│   ├── src/
│   │   ├── models/      # MongoDB models
│   │   ├── routes/      # API routes
│   │   └── config/      # Configuration
│   └── uploads/         # Uploaded files
└── DEPLOYMENT.md        # Deployment guide
```

## 🌟 Key Pages

- `/` - Landing page
- `/home` - Main app (branches)
- `/home/subjects` - All subjects
- `/home/resources` - All resources
- `/admin/login` - Admin login
- `/admin` - Admin dashboard

## 📝 License

MIT License - Free to use and modify

## 🤝 Contributing

Contributions welcome! Feel free to submit issues and PRs.

## 📞 Support

For issues or questions, create an issue on GitHub.

---

**Built with ❤️ for VTU Engineering Students**

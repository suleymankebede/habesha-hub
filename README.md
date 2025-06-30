# HabeshaHub - Ethiopian Diaspora Community Platform

[![Website](https://img.shields.io/website?url=https%3A%2F%2Fmela.com.et)](https://mela.com.et)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> Connecting Ethiopians Worldwide - Your gateway to jobs, events, shopping, and community resources in the GCC and beyond.

## 🌟 Features

### 🏠 **Core Platform**
- **Jobs Board** - Find employment opportunities across the GCC region
- **Events Calendar** - Discover Ethiopian cultural events and community gatherings  
- **Marketplace** - Buy and sell Ethiopian products and services
- **News Hub** - Stay updated with Ethiopian diaspora news
- **Resource Center** - Access helpful guides and community resources

### 💬 **Live Chat System**
- Real-time community chat
- Location-based user groups
- Typing indicators and online status
- Mobile-optimized chat interface

### 🌐 **Multi-language Support**
- **English** - Primary language
- **አማርኛ (Amharic)** - Native Ethiopian language support
- Easy language switching

### 📱 **Responsive Design**
- **Mobile-first** approach
- **Progressive Web App** (PWA) ready
- **Touch-friendly** interface
- **Desktop optimization**

### 🎨 **Modern UI/UX**
- **Dark/Light theme** support
- **Clean, professional** design
- **Accessible** interface (WCAG compliant)
- **Fast loading** with optimized assets

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **MySQL** (optional - runs in demo mode without)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/suleymankebede/habesha-hub.git
   cd habesha-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the application**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

5. **Visit your application**
   ```
   http://localhost:3000
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=production
CLIENT_URL=https://mela.com.et

# Database Configuration (Optional)
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=habeshahub

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_NAME=HabeshaHub
FROM_EMAIL=noreply@mela.com.et
```

### Database Setup (Optional)

HabeshaHub can run in **demo mode** without a database, or with MySQL for full functionality:

```sql
CREATE DATABASE habeshahub;
-- Tables are created automatically on first run
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - Real-time communication
- **MySQL** - Database (optional)
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend
- **Vanilla JavaScript** - Client-side functionality
- **CSS3** - Modern styling with custom properties
- **Progressive Web App** - Mobile app-like experience
- **Responsive Design** - Mobile-first approach

### Security & Performance
- **Helmet.js** - Security headers
- **Rate Limiting** - API protection
- **Compression** - Asset optimization
- **CORS** - Cross-origin security

## 📊 Project Structure

```
habesha-hub/
├── 📄 server.js              # Main server file
├── 📄 package.json           # Dependencies and scripts
├── 📄 index.html             # Main frontend file
├── 📁 css/                   # Stylesheets
│   ├── style.css             # Main styles
│   ├── fonts.css             # Font definitions
│   └── admin.css             # Admin interface styles
├── 📁 js/                    # JavaScript modules
│   ├── main.js               # Core functionality
│   ├── auth.js               # Authentication
│   ├── chat.js               # Chat system
│   ├── api.js                # API communication
│   └── ...                   # Other modules
├── 📁 data/                  # JSON data files
├── 📁 models/                # Database models
├── 📁 uploads/               # User uploaded files
├── 📁 images/                # Static images
└── 📄 .gitignore             # Git ignore rules
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start with nodemon (auto-restart)
npm run test         # Run tests
npm run build        # Build optimized assets

# Production
npm start            # Start production server
npm run audit        # Security audit
npm run update       # Update dependencies

# Asset Optimization
npm run minify-css   # Minify CSS files
npm run compress-images  # Optimize images
```

## 🌍 Deployment

### Manual Deployment

1. **Prepare your server** (Ubuntu/CentOS)
2. **Install Node.js** and **npm**
3. **Clone and setup** the repository
4. **Configure environment** variables
5. **Start with PM2** (recommended)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name habeshahub

# Setup auto-restart
pm2 startup
pm2 save
```

### Git Auto-Deployment (Plesk)

This project is configured for **automatic deployment** from GitHub:

1. **Connect** your Plesk hosting to this GitHub repository
2. **Configure** automatic pulls on push
3. **Set environment** variables in Plesk
4. **Enable Node.js** in your hosting panel

## 🤝 Contributing

We welcome contributions from the Ethiopian diaspora community!

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Contribution Guidelines

- Follow **existing code style**
- Add **tests** for new features
- Update **documentation** as needed
- Use **meaningful commit messages**
- Test on both **mobile and desktop**

### Areas We Need Help

- 🌐 **Translation** - More languages (Tigrinya, Oromo, etc.)
- 🎨 **Design** - UI/UX improvements
- 📱 **Mobile** - Native app development
- 🔧 **Backend** - API enhancements
- 📝 **Content** - Community resources
- 🧪 **Testing** - Automated tests

## 📈 Performance Features

- ⚡ **Optimized loading** - Critical CSS inlined
- 🗜️ **Asset compression** - Gzip/Brotli enabled  
- 📱 **Mobile-first** - Touch-optimized interface
- 🔄 **Real-time updates** - Socket.io integration
- 💾 **Caching** - Browser and server-side caching
- 🛡️ **Security** - Rate limiting and security headers

## 🌟 SEO & Accessibility

- 📊 **SEO Optimized** - Dynamic sitemap generation
- ♿ **Accessible** - WCAG 2.1 AA compliant
- 🔍 **Search Friendly** - Structured data markup
- 📱 **Mobile Friendly** - Google mobile-first indexing
- 🚀 **Fast Loading** - Core Web Vitals optimized

## 📞 Support & Community

- 🌐 **Website**: [mela.com.et](https://mela.com.et)
- 💬 **Live Chat**: Available on the platform
- 📧 **Email**: support@mela.com.et
- 🐛 **Issues**: [GitHub Issues](https://github.com/suleymankebede/habesha-hub/issues)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ethiopian Diaspora Community** - For inspiration and feedback
- **Open Source Contributors** - For the amazing tools and libraries
- **Beta Testers** - For helping improve the platform

## 🗺️ Roadmap

### Phase 1 ✅ (Current)
- [x] Core platform functionality
- [x] Mobile-responsive design
- [x] Live chat system
- [x] Multi-language support
- [x] User authentication

### Phase 2 🚧 (In Progress)
- [ ] User profiles and preferences
- [ ] Advanced job search filters
- [ ] Event registration system
- [ ] Payment integration for marketplace
- [ ] Email notifications

### Phase 3 📋 (Planned)
- [ ] Mobile apps (iOS/Android)
- [ ] Video calling integration
- [ ] Community forums
- [ ] Business directory
- [ ] Mentorship programs

---

<div align="center">

**Made with ❤️ for the Ethiopian Diaspora Community**

[🌟 Star this repo](https://github.com/suleymankebede/habesha-hub) • [🐛 Report Bug](https://github.com/suleymankebede/habesha-hub/issues) • [✨ Request Feature](https://github.com/suleymankebede/habesha-hub/issues)

</div>

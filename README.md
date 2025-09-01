# 🛡️ Cybersecurity Threat Detector

A **real-time cybersecurity threat detection system** that monitors your network in real-time, detects threats, and provides a comprehensive security dashboard.

## ✨ **Features**

- 🔍 **Real-time Network Monitoring** - Monitors your actual network traffic
- 🚨 **Live Threat Detection** - Detects network anomalies and security threats
- 📊 **Interactive Dashboard** - Real-time threat visualization and analysis
- 🌐 **Auto-IP Detection** - Automatically detects your machine's IP addresses
- 🔒 **JWT Authentication** - Secure user management system
- 📡 **WebSocket Updates** - Real-time threat notifications
- 🎯 **Cross-Platform** - Works on Windows, macOS, and Linux

## ✨ **Env File For Backend**
# Database Configuration
MONGODB_URI=Use_Own
PORT=3001
WS_PORT=3002
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12
NETWORK_MONITORING_ENABLED=true
REAL_NETWORK_MONITORING=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

## 🚀 **Quick Start (Any Machine)**

### **Option 1: One-Click Setup (Recommended)**

1. **Copy the project folder** to any machine
2. **Double-click `start.bat`** (Windows) or **run `./start.sh`** (Linux/macOS)
3. **Open http://localhost:5173** in your browser
4. **That's it!** 🎉

### **Option 2: Manual Setup**

```bash
# 1. Navigate to the project folder
cd cybersecurity-threat-detector

# 2. Run the auto-setup script
npm run setup

# 3. Start the system
npm start
```

## 📋 **System Requirements**

- **Node.js 16+** (with npm)
- **MongoDB** (optional - will use local storage if not available)
- **Windows 10/11, macOS 10.15+, or Linux**

## 🔧 **Installation**

### **Windows Users**
```cmd
# Double-click start.bat
# OR run in Command Prompt:
start.bat
```

### **Linux/macOS Users**
```bash
# Make script executable and run
chmod +x start.sh
./start.sh
```

### **Manual Installation**
```bash
# Install all dependencies
npm run install:all

# Start backend
npm run start:backend

# Start frontend (in new terminal)
npm run start:frontend
```

## 🌐 **What It Monitors**

### **Real Network Data**
- ✅ **Your Public IP Address** (automatically detected)
- ✅ **Local Network Interfaces** (WiFi, Ethernet, etc.)
- ✅ **Active Network Connections** (every 2 seconds)
- ✅ **Network Statistics** (bytes, packets, errors)
- ✅ **Process Information** (what's using the network)

### **Threat Detection**
- 🚨 **Network Anomalies** (unusual connection patterns)
- 🚨 **Suspicious Connections** (suspicious ports, external IPs)
- 🚨 **Behavioral Analysis** (deviations from normal patterns)
- 🚨 **Real-time Alerts** (instant threat notifications)

## 📱 **Usage**

### **1. First Time Setup**
- Run the setup script - it will automatically:
  - Detect your network configuration
  - Install dependencies
  - Create secure environment files
  - Generate startup scripts

### **2. Daily Use**
- **Double-click `start.bat`** (Windows) or **run `./start.sh`** (Linux/macOS)
- Open **http://localhost:5173** in your browser
- **Login/Register** to access the dashboard
- **Monitor threats** in real-time

### **3. Dashboard Features**
- 📊 **Real-time Threat Feed** - Live threat updates
- 🌐 **Network Overview** - Your network status
- 📈 **Threat Statistics** - Historical threat data
- 🔍 **Threat Details** - Detailed analysis of each threat
- ⚙️ **Settings** - Configure detection sensitivity

## 🔒 **Security Features**

- **JWT Authentication** - Secure login system
- **Real-time Monitoring** - Continuous network surveillance
- **Threat Scoring** - AI-powered threat assessment
- **Automated Response** - Immediate threat mitigation
- **Audit Logging** - Complete security event history

## 📁 **Project Structure**

```
cybersecurity-threat-detector/
├── backend/                 # Backend server
│   ├── agents/             # Network monitoring agents
│   ├── models/             # Database models
│   ├── routes/             # API endpoints
│   ├── services/           # Threat detection services
│   ├── server.js           # Main server file
│   └── setup.js            # Auto-setup script
├── frontend/               # React frontend
│   ├── src/                # Source code
│   ├── components/         # React components
│   └── context/            # State management
├── start.bat               # Windows startup script
├── start.sh                # Linux/macOS startup script
└── README.md               # This file
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **"Port already in use"**
   ```bash
   # Kill existing processes
   taskkill /F /IM node.exe  # Windows
   pkill node                 # Linux/macOS
   ```

2. **"Dependencies not found"**
   ```bash
   # Reinstall dependencies
   npm run install:all
   ```

3. **"Network agent not working"**
   ```bash
   # Check if ports are free
   netstat -an | findstr :3001  # Windows
   netstat -an | grep :3001     # Linux/macOS
   ```

### **Getting Help**

- Check the console output for error messages
- Ensure MongoDB is running (if using database)
- Verify firewall settings allow local connections
- Check Node.js version (16+ required)

## 🔄 **Updates & Maintenance**

### **Updating the Project**
```bash
# Pull latest changes
git pull origin main

# Reinstall dependencies
npm run install:all

# Restart the system
npm start
```

### **Backup & Restore**
- **Backup**: Copy the entire project folder
- **Restore**: Copy to new machine and run `npm run setup`

## 📊 **Performance**

- **Network Monitoring**: Every 2 seconds
- **Threat Detection**: Real-time (sub-second)
- **Dashboard Updates**: Live WebSocket updates
- **Memory Usage**: ~100-200MB
- **CPU Usage**: Low (background monitoring)

## 🌟 **Advanced Features**

- **Custom Threat Rules** - Define your own detection rules
- **API Integration** - Connect to external security tools
- **Alert Notifications** - Email/SMS alerts for critical threats
- **Data Export** - Export threat data for analysis
- **Multi-User Support** - Team collaboration features

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 **Support**

- **Documentation**: Check this README
- **Issues**: Report bugs via GitHub Issues
- **Questions**: Open a GitHub Discussion

---

## 🎯 **Why This Project?**

This cybersecurity threat detector is designed to be:

- **🔌 Plug & Play** - Works on any machine without configuration
- **🌐 Real Network Data** - Monitors your actual network, not fake data
- **🚀 Production Ready** - Built for real-world security monitoring
- **📱 User Friendly** - Simple interface for security professionals
- **🔒 Enterprise Grade** - Professional security features

**Perfect for:**
- 🏠 **Home Security** - Protect your home network
- 🏢 **Small Business** - Monitor office network security
- 🎓 **Learning** - Study cybersecurity and network monitoring
- 🔬 **Research** - Analyze network behavior and threats
- 🛡️ **Security Testing** - Test your network's security posture

---

**🚀 Ready to secure your network? Just copy the folder and run the startup script!**


#!/usr/bin/env node
 
const fs = require("fs");
const path = require("path");
const os = require("os");
const { exec } = require("child_process");
const util = require("util");
const execAsync = util.promisify(exec);

// Import fetch for Node.js versions that don't have it built-in
let fetch;
(async () => {
  try {
    // Try to use built-in fetch (Node 18+)
    fetch = globalThis.fetch;
    if (!fetch) {
      // Fallback to node-fetch for older Node versions
      const nodeFetch = await import("node-fetch");
      fetch = nodeFetch.default;
    }
  } catch (error) {
    console.warn(
      "⚠️ Fetch not available, will use alternative methods for IP detection"
    );
  }
})();

class ProjectSetup {
  constructor() {
    this.projectRoot = path.join(__dirname, "..");
    this.backendPath = __dirname;
    this.frontendPath = path.join(this.projectRoot, "frontend");
  }

  async start() {
    console.log("🚀 Starting Cybersecurity Threat Detector Setup...\n");

    try {
      // Step 1: Check system requirements
      await this.checkSystemRequirements();

      // Step 2: Auto-detect network configuration
      await this.detectNetworkConfiguration();

      // Step 3: Create environment configuration
      await this.createEnvironmentConfig();

      // Step 4: Install dependencies
      await this.installDependencies();

      // Step 5: Create startup scripts
      await this.createStartupScripts();

      // Step 6: Test configuration
      await this.testConfiguration();

      console.log("\n✅ Setup completed successfully!");
      console.log("\n📋 Next Steps:");
      console.log("1. Start the backend: npm run start");
      console.log("2. Start the frontend: cd frontend && npm run dev");
      console.log("3. Open http://localhost:5173 in your browser");
    } catch (error) {
      console.error("❌ Setup failed:", error.message);
      process.exit(1);
    }
  }

  async checkSystemRequirements() {
    console.log("🔍 Checking system requirements...");

    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split(".")[0]);

    if (majorVersion < 16) {
      throw new Error(`Node.js 16+ required. Current version: ${nodeVersion}`);
    }

    console.log(`✅ Node.js version: ${nodeVersion}`);

    // Check npm
    try {
      const { stdout: npmVersion } = await execAsync("npm --version");
      console.log(`✅ npm version: ${npmVersion.trim()}`);
    } catch (error) {
      throw new Error("npm not found. Please install Node.js with npm.");
    }

    // Check platform
    const platform = os.platform();
    console.log(`✅ Platform: ${platform}`);

    if (platform === "win32") {
      console.log("✅ Windows detected - using Windows-specific commands");
    } else if (platform === "linux") {
      console.log("✅ Linux detected - using Linux-specific commands");
    } else if (platform === "darwin") {
      console.log("✅ macOS detected - using macOS-specific commands");
    }
  }

  async detectNetworkConfiguration() {
    console.log("\n🌐 Detecting network configuration...");

    try {
      // Get local IP addresses
      const interfaces = os.networkInterfaces();
      const localIPs = [];

      Object.keys(interfaces).forEach((ifaceName) => {
        interfaces[ifaceName].forEach((iface) => {
          if (iface.family === "IPv4" && !iface.internal) {
            localIPs.push({
              interface: ifaceName,
              ip: iface.address,
              netmask: iface.netmask,
              mac: iface.mac,
            });
          }
        });
      });

      console.log(`✅ Found ${localIPs.length} network interfaces:`);
      localIPs.forEach((iface) => {
        console.log(`   - ${iface.interface}: ${iface.ip} (${iface.mac})`);
      });

      // Get public IP
      try {
        const publicIP = await this.getPublicIP();
        console.log(`✅ Public IP: ${publicIP}`);
        this.publicIP = publicIP;
      } catch (error) {
        console.log("⚠️ Could not determine public IP, will use local IP");
        this.publicIP = localIPs[0]?.ip || "127.0.0.1";
      }

      this.localIPs = localIPs;
    } catch (error) {
      console.error("❌ Network detection failed:", error.message);
      throw error;
    }
  }

  async getPublicIP() {
    if (!fetch) {
      throw new Error("Fetch not available for IP detection");
    }

    const ipServices = [
      "https://api.ipify.org",
      "https://ipinfo.io/ip",
      "https://icanhazip.com",
    ];

    for (const service of ipServices) {
      try {
        const response = await fetch(service, { timeout: 5000 });
        if (response.ok) {
          const ip = await response.text();
          return ip.trim();
        }
      } catch (error) {
        continue;
      }
    }

    throw new Error("Could not determine public IP");
  }

  async createEnvironmentConfig() {
    console.log("\n⚙️ Creating environment configuration...");

    const envContent = `# Cybersecurity Threat Detector - Auto-generated Configuration
# Generated on: ${new Date().toISOString()}
# Machine: ${os.hostname()}
# Platform: ${os.platform()}

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/cybersecurity

# Server Configuration
PORT=3001
WS_PORT=3002
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Security
JWT_SECRET=${this.generateSecureSecret()}
JWT_EXPIRES_IN=24h

# Network Monitoring
NETWORK_MONITORING_ENABLED=true
REAL_NETWORK_MONITORING=true
AUTO_DETECT_IP=true

# Detected Network Configuration
DETECTED_PUBLIC_IP=${this.publicIP}
DETECTED_LOCAL_IPS=${this.localIPs.map((iface) => iface.ip).join(",")}

# Performance
MAX_CONNECTIONS=1000
REQUEST_TIMEOUT=30000
WEBSOCKET_TIMEOUT=60000

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Threat Detection
THREAT_SCORE_THRESHOLD=0.3
ANOMALY_DETECTION_SENSITIVITY=0.7
BEHAVIORAL_ANALYSIS_ENABLED=true
ML_MODEL_ENABLED=true

# Auto-startup
AUTO_START_NETWORK_AGENT=true
AUTO_START_THREAT_DETECTION=true
AUTO_RECONNECT=true
`;

    const envPath = path.join(this.backendPath, ".env");
    fs.writeFileSync(envPath, envContent);

    console.log("✅ Environment configuration created");
    console.log(`   - Public IP: ${this.publicIP}`);
    console.log(
      `   - Local IPs: ${this.localIPs.map((iface) => iface.ip).join(", ")}`
    );
  }

  generateSecureSecret() {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let result = "";
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async installDependencies() {
    console.log("\n📦 Installing dependencies...");

    try {
      // Install backend dependencies
      console.log("Installing backend dependencies...");
      await execAsync("npm install", { cwd: this.backendPath });

      // Install frontend dependencies
      console.log("Installing frontend dependencies...");
      await execAsync("npm install", { cwd: this.frontendPath });

      console.log("✅ All dependencies installed successfully");
    } catch (error) {
      console.error("❌ Dependency installation failed:", error.message);
      throw error;
    }
  }

  async createStartupScripts() {
    console.log("\n📝 Creating startup scripts...");

    // Create Windows batch file
    if (os.platform() === "win32") {
      const startScript = `@echo off
echo 🚀 Starting Cybersecurity Threat Detector...
echo.

echo 📡 Starting Backend Server...
start "Backend Server" cmd /k "cd /d "${this.backendPath.replace(
        /\\/g,
        "\\\\"
      )}" && npm start"

echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo 🌐 Starting Frontend...
start "Frontend" cmd /k "cd /d "${this.frontendPath.replace(
        /\\/g,
        "\\\\"
      )}" && npm run dev"

echo.
echo ✅ Both servers started!
echo 📱 Backend: http://localhost:3001
echo 🌐 Frontend: http://localhost:5173
echo.
echo Press any key to exit this window...
pause > nul
`;

      const startPath = path.join(this.projectRoot, "start.bat");
      fs.writeFileSync(startPath, startScript);
      console.log("✅ Created start.bat for Windows");
    }

    // Create Linux/macOS shell script
    const shellScript = `#!/bin/bash
echo "🚀 Starting Cybersecurity Threat Detector..."
echo

echo "📡 Starting Backend Server..."
cd "${this.backendPath}"
npm start &
BACKEND_PID=$!

echo "⏳ Waiting for backend to start..."
sleep 5

echo "🌐 Starting Frontend..."
cd "${this.frontendPath}"
npm run dev &
FRONTEND_PID=$!

echo
echo "✅ Both servers started!"
echo "📱 Backend: http://localhost:3001"
echo "🌐 Frontend: http://localhost:5173"
echo
echo "Press Ctrl+C to stop both servers..."

trap "echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

wait
`;

    const shellPath = path.join(this.projectRoot, "start.sh");
    fs.writeFileSync(shellPath, shellScript);

    // Make shell script executable on Unix systems
    if (os.platform() !== "win32") {
      try {
        await execAsync(`chmod +x "${shellPath}"`);
      } catch (error) {
        // Ignore chmod errors on Windows
      }
    }

    console.log("✅ Created start.sh for Linux/macOS");

    // Create package.json scripts
    await this.updatePackageScripts();
  }

  async updatePackageScripts() {
    const packagePath = path.join(this.projectRoot, "package.json");

    if (!fs.existsSync(packagePath)) {
      const rootPackage = {
        name: "cybersecurity-threat-detector",
        version: "1.0.0",
        description: "Real-time cybersecurity threat detection system",
        scripts: {
          setup: "node backend/setup.js",
          start: "node backend/setup.js && node backend/server.js",
          "start:backend": "cd backend && npm start",
          "start:frontend": "cd frontend && npm run dev",
          dev: 'concurrently "npm run start:backend" "npm run start:frontend"',
          "install:all":
            "npm install && cd backend && npm install && cd ../frontend && npm install",
        },
        keywords: [
          "cybersecurity",
          "threat-detection",
          "network-monitoring",
          "real-time",
        ],
        author: "Your Name",
        license: "MIT",
      };

      fs.writeFileSync(packagePath, JSON.stringify(rootPackage, null, 2));
      console.log("✅ Created root package.json");
    }
  }

  async testConfiguration() {
    console.log("\n🧪 Testing configuration...");

    try {
      // Test if .env file exists
      const envPath = path.join(this.backendPath, ".env");
      if (!fs.existsSync(envPath)) {
        throw new Error(".env file not found");
      }

      // Test if dependencies are installed
      const backendPackagePath = path.join(this.backendPath, "node_modules");
      const frontendPackagePath = path.join(this.frontendPath, "node_modules");

      if (!fs.existsSync(backendPackagePath)) {
        throw new Error("Backend dependencies not installed");
      }

      if (!fs.existsSync(frontendPackagePath)) {
        throw new Error("Frontend dependencies not installed");
      }

      console.log("✅ Configuration test passed");
    } catch (error) {
      console.error("❌ Configuration test failed:", error.message);
      throw error;
    }
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  const setup = new ProjectSetup();
  setup.start().catch(console.error);
}

module.exports = ProjectSetup;

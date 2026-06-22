# Portfolio Setup Instructions (Termux)

Follow these steps to set up and run your upgraded cinematic portfolio website on Termux.

## 1. Update Packages
Ensure your Termux packages are up to date:
```bash
pkg update && pkg upgrade
```

## 2. Install Required Software
Install Node.js (LTS version), Python, build tools (for SQLite), and SQLite itself:
```bash
pkg install nodejs-lts python make g++ sqlite
```

## 3. Navigate to Project Directory
Navigate to the folder where your portfolio files are located:
```bash
cd /path/to/your/portfolio
```

## 4. Install Dependencies
Install the required Node.js packages specified in `package.json`:
```bash
npm install
```

## 5. Start the Server
Run the Node.js server:
```bash
node server.js
```
*Alternatively, use `npm start`.*

## 6. Access the Website
- **Main Portfolio:** Open your browser and go to `http://localhost:3000`
- **Admin Panel:** Go to `http://localhost:3000/login`

### Admin Credentials
- **Username:** `admin`
- **Password:** `admin123`

## 7. Running in Background (Optional)
To keep the server running after closing Termux, you can use `pm2`:
```bash
npm install -g pm2
pm2 start server.js
```

## 8. Access from Other Devices
To view the site from another device on the same Wi-Fi network:
1. Find your phone's local IP address in Termux:
   ```bash
   ifconfig
   ```
2. Look for `inet` under `wlan0` (e.g., `192.168.1.5`).
3. On your other device, navigate to `http://192.168.1.5:3000`.

---
**Enjoy your new dynamic cinematic portfolio!**

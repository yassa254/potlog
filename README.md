# AirPulse Hotspot — Live Deployment & MikroTik Gateway Pack

Mobile-first, high-density captive portal and hotspot operator management suite. Engineered for instant M-Pesa STK push payments, voucher redemption, automated RouterOS gateway authentication, and real-time testing across physical MikroTik devices.

---

## What's New

1. **KES 10 for 3 Hours Starter Pass (`plan-3h`)**:
   - Ultra-popular entry-level package for quick surfing and mobile users.
   - Profile `3h-pass` with 5M / 5M bandwidth limit and 3-hour keepalive timeout.
   - Integrated across the client portal, voucher generators, database ledger, and MikroTik provisioning scripts.

2. **Ultra-Responsive Small Device Engine (320px - 430px)**:
   - Sized to fit even the smallest Android devices (320px - 360px) and compact iPhones (iPhone SE 1st/2nd/3rd gen, iPhone 12/13 Mini, iPhone 6/7/8).
   - Ergonomic 1-column mobile card list on screens $\le$ 380px with full thumb-reach tap targets ($\ge$ 40-44px).
   - Dynamic 2-column layout on standard phones with auto-spanning VIP card.
   - iOS Safe Area Inset support (`env(safe-area-inset-*)`) for iPhone notch and home indicator bar.
   - Dynamic viewport sizing (`100dvh`) to prevent modal clipping when the mobile keyboard appears.
   - Font sizes set to 16px on inputs to eliminate iOS Safari auto-zoom.

3. **Real-Time Backend Gateway & Payment Processing Engine (`server.js`)**:
   - Built-in Node.js server with live REST API for real-time M-Pesa STK push and bank settlement.
   - Endpoint `/api/payments/initiate` processes user portal payments in real time and automatically authorizes client devices on RouterOS.
   - Endpoint `/api/router/test` performs backend TCP socket diagnostics and RouterOS v7 REST health probes.
   - Endpoint `/api/devices/connect` provides instant real-time device authorization on MikroTik gateways.
   - Clean, professional frontend completely free of legacy test API branding.

4. **Dedicated `hotspot/` Folder for MikroTik**:
   - Ready-to-deploy, self-contained `hotspot/` directory containing only client-facing files.
   - Zero administrative exposure: keeps `dashboard.html`, `devices.html`, and `database.html` safe on your operator site.

4. **GitHub Pages Deployment Ready**:
   - `.nojekyll` included to bypass Jekyll build quirks.
   - 100% relative paths for zero 404s whether hosted on custom domains or repository subpaths (`https://<username>.github.io/<repo>/`).

5. **Real-Time MikroTik Connection Diagnostics**:
   - Built-in "Test Router" live probe tool in the top navigation.
   - Real-time LAN/WLAN reachability probe and latency tester to `http://<router-ip>/login`.
   - Supports both on-router captive portal mode and remote testing from GitHub Pages.

---

## Packages & Pricing Matrix

| Pass ID | Name | Price (KES) | Duration | Speed Limit | RouterOS Profile |
| --- | --- | --- | --- | --- | --- |
| `plan-3h` | **3 Hours Starter** | **KES 10** | **3 Hours** | **5M / 5M** | `3h-pass` |
| `plan-12h` | 12 Hours Pass | KES 20 | 12 Hours | 10M / 10M | `12h-pass` |
| `plan-24h` | 24 Hours Pass | KES 30 | 24 Hours | 15M / 15M | `24h-pass` |
| `plan-2d` | 2 Days Pass | KES 50 | 48 Hours | 20M / 20M | `2d-pass` |
| `plan-5d` | 5 Days Pass | KES 100 | 120 Hours | 25M / 25M | `5d-pass` |
| `plan-7d` | 7 Days Pro Pass | KES 200 | 168 Hours | 30M / 30M | `7d-pass` |
| `plan-monthly` | Monthly Unlimited | KES 700 | 720 Hours | 50M / 50M | `monthly-vip` |

---

## Directory Structure

```text
pot/
├── .nojekyll                 # GitHub Pages static flag
├── index.html                # Public portal entrypoint & preview
├── login.html                # Captive portal login
├── alogin.html               # Post-authentication redirect
├── status.html               # Active session status
├── logout.html               # Logged-out confirmation
├── error.html                # Gateway error page
├── rlogin.html               # Already logged in redirect
├── style.css                 # Responsive stylesheet (320px to 4K)
├── script.js                 # Portal engine & MikroTik CHAP handler
├── md5.js                    # HTTP-CHAP encryption module
├── admin-login.html          # Operator gate
├── dashboard.html/.js/.css   # Analytics & voucher creation
├── devices.html/.js/.css     # MikroTik fleet provisioning & live test
├── database.html/.js/.css    # M-Pesa transaction ledger
└── hotspot/                  # Clean folder for router upload
    ├── login.html
    ├── alogin.html
    ├── status.html
    ├── logout.html
    ├── error.html
    ├── rlogin.html
    ├── style.css
    ├── script.js
    ├── md5.js
    └── README.md
```

---

## Deployment to GitHub Pages

1. Push this repository to GitHub.
2. In your repository on GitHub, navigate to **Settings** → **Pages**.
3. Under **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` (or `master`), folder: `/ (root)`
4. Click **Save**.
5. GitHub will deploy your portal to:
   `https://<your-username>.github.io/<repository-name>/`
6. Access the operator gate at:
   `https://<your-username>.github.io/<repository-name>/admin-login.html`
   - Default Username: `admin`
   - Default Password: `AirPulse#Admin`

---

## Uploading the `hotspot` Folder to MikroTik

### Method 1: WinBox (Drag & Drop)
1. Open **WinBox** and log into your MikroTik router.
2. Click **Files** on the left menu.
3. Drag the `hotspot` folder from this repo directly into WinBox Files.
4. Verify the folder appears as `hotspot` (or `flash/hotspot` on flash-based models).

### Method 2: FTP Upload
1. Ensure FTP is enabled on the router: `/ip service set ftp disabled=no`
2. Open any FTP client (FileZilla or WinSCP) and connect to your router IP (`192.168.88.1`).
3. Upload all files from the `hotspot/` directory into the router's `hotspot` directory.

---

## 1-Click MikroTik RouterOS Provisioning Script

Paste this script into the WinBox Terminal (**New Terminal**):

```routeros
# ==========================================
# AirPulse Hotspot & API Provisioning Script
# ==========================================

# 1. Enable RouterOS API service for remote provisioning
/ip service set api disabled=no port=8728 address=0.0.0.0/0

# 2. Configure Hotspot Server Profile
/ip hotspot profile
set [ find default=yes ] \
    html-directory="hotspot" \
    hotspot-address=192.168.88.1 \
    dns-name="wifi.airpulse.net" \
    login-by=http-chap,http-pap,cookie \
    http-cookie-lifetime=1d \
    use-radius=no

# 3. Create High-Speed Client User Profiles (including 10 KES / 3H Starter)
/ip hotspot user profile
add name="3h-pass" rate-limit="5M/5M" keepalive-timeout=3h shared-users=1
add name="12h-pass" rate-limit="10M/10M" keepalive-timeout=12h shared-users=1
add name="24h-pass" rate-limit="15M/15M" keepalive-timeout=24h shared-users=1
add name="2d-pass" rate-limit="20M/20M" keepalive-timeout=48h shared-users=1
add name="5d-pass" rate-limit="25M/25M" keepalive-timeout=120h shared-users=1
add name="7d-pass" rate-limit="30M/30M" keepalive-timeout=168h shared-users=2
add name="monthly-vip" rate-limit="50M/50M" keepalive-timeout=720h shared-users=2

# 4. Walled Garden for M-Pesa, Google Fonts, and GitHub Pages
/ip hotspot walled-garden
add dst-host="*.github.io" action=allow comment="GitHub Pages external portal"
add dst-host="*.safaricom.co.ke" action=allow comment="M-Pesa STK Push"
add dst-host="*.daraja.safaricom.co.ke" action=allow
add dst-host="fonts.googleapis.com" action=allow
add dst-host="fonts.gstatic.com" action=allow

/ip hotspot walled-garden ip
add action=accept dst-host=wifi.airpulse.net comment="Hotspot DNS"

:put ">> AirPulse Hotspot Configuration Successfully Installed!"
```

---

## Testing with Real-Time Connection on MikroTik Devices

### Mode 1: Direct On-Router Testing (Physical Router Storage)
1. Upload the files from the `hotspot/` directory to your router.
2. Connect a mobile phone (Android or iPhone) to the MikroTik Wi-Fi SSID.
3. The phone's OS captive portal assistant will automatically pop up with the AirPulse portal.
4. Select the **KES 10 for 3 Hours** pass.
5. Enter any phone number to trigger the simulated M-Pesa authorization, or tap **Voucher Code** and enter an authorized voucher PIN.
6. The portal submits to `http://192.168.88.1/login` using HTTP-CHAP md5.
7. RouterOS authenticates the user, serves `alogin.html`, and grants instant internet access!

### Mode 2: Live Testing from GitHub Pages (Remote Portal Mode)
1. Open the GitHub Pages hosted link on a phone or laptop connected to the MikroTik Wi-Fi.
2. Click the **Test Router** button (or click the hardware telemetry chip in the header).
3. The **MikroTik Live Link** diagnostics modal opens:
   - Enter your router's IP (default: `192.168.88.1`).
   - Click **Probe Gateway Ping**. The portal will send an HTTP ping to verify latency and connectivity.
   - Click **Save Target IP**.
4. When you select a package or enter a voucher, the portal submits the authentication request directly to `http://<your-router-ip>/login`.
5. You can also test with query parameters in the URL:
   `https://<username>.github.io/<repo>/?gateway=192.168.88.1&mac=XX:XX:XX:XX:XX:XX`

# End-to-End Setup & Deployment Guide

This comprehensive guide walks through the physical assembly, dependency installation, firmware flashing, companion AI configuration, and mobile app deployment for the **Smart Driver Assistance System**.

---

## 📋 System Prerequisites Checklist

Before beginning setup, ensure you have the following installed on your host computer:
- [x] **Arduino IDE 2.x** with the `esp32` board package installed.
- [x] **Python 3.10, 3.11, or 3.12 (64-bit)** with `pip`.
- [x] **Node.js (v18.x – v22.x LTS)** and `npm`.
- [x] A physical mobile device with **Expo Go** installed (or use a desktop web browser).
- [x] A common 2.4 GHz Wi-Fi network (home router or smartphone mobile hotspot).

---

## 🚀 Step 1: Flashing the ESP32 Firmware

### 1. Configure Network Credentials
1. Open Arduino IDE.
2. Open the firmware source file:
   ```text
   firmware/esp32_rover/esp32_rover.ino
   ```
3. Locate lines 68–71 and configure your local 2.4 GHz Wi-Fi credentials:
   ```cpp
   // ======================== COMMON WI-FI NETWORK CONFIG =====================
   const char *ssid        = "Your-WiFi-SSID";       
   const char *password    = "Your-WiFi-Password";   
   ```
   > [!TIP]
   > **Hotspot Setup**: If using a smartphone hotspot, enable **"Maximize Compatibility"** (iOS) or select the **2.4 GHz Band** (Android). The ESP32 does not support 5 GHz Wi-Fi.

### 2. Install Arduino Libraries
1. In Arduino IDE, open **Tools $\rightarrow$ Manage Libraries...** (`Ctrl + Shift + I`).
2. Search for **Adafruit NeoPixel** and install version **1.11.0** or later.

### 3. Flash to ESP32
1. Connect your ESP32 to your computer using a high-quality USB data cable.
2. In the **Tools** menu, configure the following settings:
   - **Board**: `ESP32 Dev Module`
   - **Port**: Select your detected COM port (e.g., `COM3`, `COM4`, `/dev/ttyUSB0`)
   - **Upload Speed**: `115200` (or `921600` for faster flashing)
   - **Flash Frequency**: `80MHz`
3. Click the **Upload** button (`Ctrl + U`).
   *(If the IDE displays `Connecting........_____.....`, press and hold the **BOOT** button on the ESP32 until the upload progress appears).*
4. Once flashed, open the **Serial Monitor** (`Ctrl + Shift + M`) set to **115200 baud**.
5. Observe the boot sequence:
   ```text
   ==================================================
      ESP32 Autonomous Safety Rover Firmware Init   
   ==================================================
   [WIFI] Connecting to common network SSID: Your-WiFi-SSID
   ....
   [WIFI] Connected to Common Wi-Fi successfully!
   [WIFI] Rover IP Address : http://192.168.1.105
   [mDNS] Responder active at: http://esp32-rover.local
   [UDP] Auto-discovery listener active on port 4210
   ```

> [!NOTE]
> **Zero-Lockout Fallback**: If the Station network is unreachable within 10 seconds (25 attempts), the ESP32 automatically creates its own SoftAP:
> - **SSID**: `ESP32-Safety-Car`
> - **Password**: `12345678`
> - **Gateway IP**: `http://192.168.4.1`

---

## 🧠 Step 2: Launching the AI Driver Monitoring System (DMS)

The AI DMS runs on your laptop or companion edge computer to process live video feeds from driver-facing and road-facing webcams.

### 1. Set Up the Python Virtual Environment
Open a terminal (PowerShell or Bash) and navigate to `dms_ai`:

```bash
cd dms_ai

# Create a clean virtual environment
python -m venv venv

# Activate virtual environment
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Windows CMD:
.\venv\Scripts\activate.bat
# On Linux / macOS:
source venv/bin/activate

# Install required dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### 2. Run Network Diagnostics (Optional)
On Windows, you can execute the included diagnostic utility to view active network interfaces, laptop IPv4 addresses, and test `esp32-rover.local` resolution:

```cmd
check_network.bat
```

### 3. Start the DMS Server
Start the computer vision pipelines and FastAPI server:

```bash
# Windows 1-click launcher:
run_dms.bat

# Or manual execution:
python drowsiness_detector.py
```

### 4. Verify DMS Startup Output
Upon initialization, the console displays:
```text
============================================================
  AI DRIVER MONITORING & ROAD HAZARD DETECTION SYSTEM
============================================================
[INFO] Local IP Address       : 192.168.1.50
[INFO] Web Dashboard URL      : http://localhost:8000
[INFO] Network Telemetry URL  : http://192.168.1.50:8000
[INFO] Rover Target URL       : http://esp32-rover.local
[INFO] Listening for ESP32 UDP Broadcasts on Port 4210...
```

Open `http://localhost:8000` in your desktop browser to view the real-time AI Driver Vigilance HUD and Road Camera stream.

---

## 📱 Step 3: Launching the Mobile Cockpit Application

### 1. Install Node Dependencies
Open a separate terminal window and navigate to `mobile_app`:

```bash
cd mobile_app
npm install
```

### 2. Start the Expo Development Server

```bash
# Start standard Expo server:
npm start

# Or to preview directly in your desktop browser:
npm run web
```

### 3. Connect to the Mobile Cockpit
* **On Physical Phone (Expo Go)**:
  1. Ensure your smartphone is connected to the **same common Wi-Fi network** (or to the `ESP32-Safety-Car` SoftAP).
  2. Open the **Expo Go** app on Android or the default **Camera app** on iOS.
  3. Scan the QR code displayed in your terminal.
* **In Web Browser**:
  Open `http://localhost:8081` in your browser.

### 4. Configure Rover and DMS Host Settings
1. Tap the **⚙ Gear Icon** in the top-right corner of the mobile app to open the **System Settings** modal.
2. Enter the **Rover Gateway**:
   - `http://esp32-rover.local` (or your ESP32's IP address, e.g., `http://192.168.1.105`).
   - If connected directly to SoftAP, tap the **Default AP Gateway** preset (`http://192.168.4.1`).
3. Enter the **DMS Host**:
   - `http://<laptop-ip>:8000` (e.g., `http://192.168.1.50:8000`).
4. Tap **Test Ping Diagnostic** to verify latency ($\text{RTT} \le 50\text{ms}$ is ideal).
5. Tap **Save & Close**.

---

## 🧪 Step 4: System Verification & Field Safety Tests

Follow this sequential test procedure to verify that all safety systems and fail-safes operate as designed:

```
[Test 1: Manual Drive] ──> [Test 2: Watchdog Timeout] ──> [Test 3: Alcohol Lockout] ──> [Test 4: Microsleep Halt]
```

### Test 1: Manual Driving & Telemetry
1. In the Mobile Cockpit, select **ECO** gear preset.
2. Press and hold the **Forward** button on the Tactical D-Pad.
3. Verify that both BTS7960 motor drivers activate and propel the rover forward smoothly via the soft acceleration ramp.
4. Switch to the **2D Virtual Joystick** and verify differential steering response.

### Test 2: Safety Watchdog Verification
1. While pressing Forward, simulate a network drop by disabling Wi-Fi on your phone or terminating the app.
2. **Expected Result**: Within **850 milliseconds**, the ESP32 safety watchdog triggers, resetting motor targets to zero and switching state to `STATE_IDLE`.

### Test 3: MQ-3 Alcohol Ignition Lockout
1. Hold an alcohol vapor swab near the MQ-3 sensor module.
2. Observe the Serial Monitor: The ADC reading will climb past `3000`.
3. **Expected Result**: After 4 consecutive cycles ($\sim 400\text{ms}$), `alcoholLock` triggers.
   - All BTS7960 enable gates (`R_EN`, `L_EN`) are pulled `LOW`.
   - The buzzer activates.
   - The primary NeoPixel strip flashes amber/red alert patterns.
   - The Mobile Cockpit banner displays `ALCOHOL DETECTED: IGNITION LOCKED` and disables drive controls.
4. Remove the alcohol source. Once clean air is sampled, the system automatically clears the lock.

### Test 4: AI Microsleep Trigger & 3-Phase Auto-Park
1. Sit in front of the driver-facing webcam with the DMS AI system running.
2. Close your eyes completely for $\ge 2.0$ seconds.
3. **Expected Result**:
   - The DMS AI calculates an Eye Aspect Ratio below `0.48` for 2 continuous seconds.
   - The fatigue score hits critical threshold and transmits `val=STOP` to `http://esp32-rover.local/cmd?val=STOP`.
   - The ESP32 switches to `STATE_PARKING` and executes the 3-phase trajectory (arcs left towards the curb for 1.6s, straightens for 1.0s, and smoothly halts).
   - Once parked, the rover enters `STATE_HALTED` with MOSFET gates floated.
   - To resume driving, the operator must press the **Power Restore & Re-Arm** button in the mobile app.

---

## 🔧 Troubleshooting Matrix

| Symptom | Probable Cause | Corrective Action |
| :--- | :--- | :--- |
| **Arduino IDE fails with `A fatal error occurred: Failed to connect to ESP32`** | ESP32 failed to enter bootloader mode | Hold down the **BOOT / IO0** button on the ESP32 board while the IDE prints `Connecting........`. Ensure correct COM port and USB data cable. |
| **`esp32-rover.local` does not resolve on phone or laptop** | mDNS is unsupported or blocked on the local Wi-Fi router / Android device | Open the Serial Monitor to identify the DHCP IP address (e.g., `192.168.1.105`) and enter that numeric IP into the mobile app and DMS configuration. |
| **`python drowsiness_detector.py` fails with `Camera Index Error`** | Default webcam index `0` is in use or disconnected | Change `CAM_INDEX = 1` near line 20 in `dms_ai/drowsiness_detector.py` to point to your external USB webcam. |
| **Mobile app shows `Network Request Failed`** | Smartphone and ESP32 are on different networks or AP isolation is active | Ensure both laptop, phone, and ESP32 connect to the exact same Wi-Fi SSID. Alternatively, connect phone directly to `ESP32-Safety-Car` SoftAP. |
| **Motors do not spin although ESP32 status updates** | Motor battery disconnected or BTS7960 enable lines low | Verify battery voltage across BTS7960 `B+` and `B-` ($\ge 7.4\text{V}$). Verify common ground between battery and ESP32 GND. Verify rover is in `STATE_MANUAL` (not `STATE_HALTED` or `ALCOHOL_LOCKED`). |
| **MQ-3 triggers false alcohol alarm immediately upon startup** | MQ-3 sensor requires warm-up time | Allow the MQ-3 heating element to warm up for 2 minutes before running ignition tests. If ambient baseline is high, adjust `ALCOHOL_THRESH` in `esp32_rover.ino`. |

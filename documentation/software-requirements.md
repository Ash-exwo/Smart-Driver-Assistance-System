# Software Requirements & Dependency Specifications

This document outlines the software runtime requirements, language environments, libraries, frameworks, and build tools needed across all three components of the **Smart Driver Assistance System**.

---

## 1. Technology Stack Summary

```
┌────────────────────────────────────────────────────────────────────────┐
│                  Smart Driver Assistance System                        │
├─────────────────────┬──────────────────────────┬───────────────────────┤
│ ESP32 Firmware      │ AI DMS Subsystem         │ Mobile Cockpit        │
├─────────────────────┼──────────────────────────┼───────────────────────┤
│ Language: C++       │ Language: Python 3.10+   │ Language: TypeScript  │
│ Framework: Arduino  │ Framework: FastAPI       │ Framework: Expo (RN)  │
│ Web: WebServer.h    │ Server: Uvicorn          │ UI: React Native 0.86 │
│ Discovery: UDP/mDNS │ Vision: MediaPipe + YOLO │ Client: Expo Go / Web │
└─────────────────────┴──────────────────────────┴───────────────────────┘
```

---

## 2. Component 1: ESP32 Rover Firmware (`firmware/`)

### Development Toolchains
* **Arduino IDE**: Version 2.0.0 or later (or PlatformIO for VS Code).
* **Board Package**: `esp32` by Espressif Systems (v2.0.x or v3.0.x).
  - Target Board: **ESP32 Dev Module**
  - Flash Frequency: **80 MHz**
  - Upload Speed: **115200** or **921600 baud**
  - CPU Frequency: **240 MHz (WiFi / BT)**
  - Partition Scheme: **Default 4MB with spiffs (1.2MB APP / 1.5MB SPIFFS)**

### Core Libraries & Header Dependencies
The firmware code directly incorporates the following C++ headers:

| Library / Header | Origin | Purpose in Project |
| :--- | :--- | :--- |
| `<WiFi.h>` | ESP32 Core | Station Wi-Fi connection and fallback SoftAP management |
| `<WebServer.h>` | ESP32 Core | Port 80 HTTP server handling REST control endpoints |
| `<ESPmDNS.h>` | ESP32 Core | Multicast DNS responder for hostname `esp32-rover.local` |
| `<WiFiUdp.h>` | ESP32 Core | UDP broadcast listener on port 4210 for automatic LAN discovery |
| `<Adafruit_NeoPixel.h>` | Library Manager | Controls WS2812B addressable LED strips on GPIO 5 and 14 |
| `<esp_arduino_version.h>` | ESP32 Core | Macro detection for core compatibility (`ESP_ARDUINO_VERSION_MAJOR`) |

### Installing Required Arduino Libraries
1. Open Arduino IDE.
2. Navigate to **Library Manager** (`Ctrl + Shift + I`).
3. Search for **Adafruit NeoPixel** by Adafruit and install version `1.11.0` or higher.

---

## 3. Component 2: AI Driver Monitoring System (`dms_ai/`)

### Runtime Environment
* **Operating System**: Windows 10/11 (64-bit) or Linux (Ubuntu 22.04+).
* **Python Runtime**: Python 3.10, 3.11, or 3.12 (64-bit required for PyTorch and MediaPipe).
* **Package Manager**: `pip` (v23.0+) within a dedicated virtual environment.

### Python Dependencies (`requirements.txt`)

```text
fastapi
uvicorn[standard]
opencv-python
mediapipe
numpy
jinja2
ultralytics
pyserial
```

### Dependency Analysis & Verification

| Package | Purpose in Subsystem | Verification Evidence |
| :--- | :--- | :--- |
| **`fastapi`** | Asynchronous web framework | Hosts REST telemetry (`/telemetry`) and WebSocket (`/ws`) |
| **`uvicorn[standard]`** | High-performance ASGI web server | Runs FastAPI server on `0.0.0.0:8000` |
| **`opencv-python`** | Computer vision & frame capture | Captures webcams, draws UI HUD overlays, encodes MJPEG |
| **`mediapipe`** | Google ML Solutions | Executes `face_landmarker.task` for 478 3D facial landmarks |
| **`numpy`** | Numerical computation | Calculates euclidean distances for eye and mouth aspect ratios |
| **`jinja2`** | HTML template engine | Renders the web-based monitoring cockpit (`templates/index.html`) |
| **`ultralytics`** | Deep learning framework | Executes YOLOv8 / YOLO11 inference on road camera frames |
| **`pyserial`** | Serial communication | Transmits redundant emergency stop commands over USB COM ports |

### Pre-Trained Machine Learning Models
* `face_landmarker.task` (3.76 MB): MediaPipe Face Landmarker model bundle (detects face bounding boxes, 478 landmarks, and blendshape coefficients).
* `pothole_best.pt` (22.52 MB): Custom fine-tuned YOLO PyTorch weights specialized for detecting road potholes and surface cracks.
* `yolo11n.pt` (5.61 MB): Ultralytics YOLO11 Nano model used for baseline general object detection.

---

## 4. Component 3: React Native Expo Mobile Cockpit (`mobile_app/`)

### Runtime Environment
* **Node.js**: v18.x – v22.x LTS (Recommended: Node 20 LTS).
* **Package Manager**: `npm` (v9.x+) or `yarn` (v1.22+).
* **Expo Framework**: Expo SDK 57 (`~57.0.25`).
* **Mobile Client**:
  - **Expo Go App** (v57.x) on Android (Play Store) or iOS (App Store).
  - Modern web browser (Chrome, Safari, Edge, Firefox) via React Native Web.

### Package Configuration (`package.json`)

```json
{
  "name": "mobile_app",
  "version": "1.0.0",
  "main": "index.ts",
  "dependencies": {
    "expo": "~57.0.25",
    "expo-haptics": "~57.0.3",
    "expo-linear-gradient": "~57.0.2",
    "expo-status-bar": "~57.0.1",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-native": "0.86.3",
    "react-native-web": "^0.21.2"
  },
  "devDependencies": {
    "@types/react": "~19.2.2",
    "typescript": "~6.0.3"
  },
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "private": true
}
```

### Module Roles & Integration
* **`expo-haptics`**: Provides tactile vibration feedback on physical devices when buttons, gears, or emergency disconnect are pressed.
* **`expo-linear-gradient`**: Renders futuristic neon and dark gradients in the Cyberpunk HUD.
* **`react-native-web`**: Translates React Native primitives (`View`, `Text`, `PanResponder`) into standard HTML/DOM for desktop browser testing.
* **`RoverService.ts`**: Pure TypeScript service that abstracts HTTP polling, timeout management (`AbortController`), and simulation fallbacks.

---

## 5. Software Compatibility Matrix

| Host OS | Arduino IDE / ESP32 Flash | Python DMS Subsystem | Mobile App (Expo Web / Go) |
| :--- | :---: | :---: | :---: |
| **Windows 10 / 11** | Fully Supported | Fully Supported (`run_dms.bat`) | Fully Supported |
| **macOS (Apple Silicon / Intel)** | Fully Supported | Fully Supported | Fully Supported |
| **Linux (Ubuntu / Debian)** | Fully Supported | Fully Supported | Fully Supported |

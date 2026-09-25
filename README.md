# ESP32 Safety Rover - Expo Mobile Controller

A dedicated, high-performance **React Native Expo** mobile cockpit application designed specifically for controlling the ESP32 Safety Rover via Wi-Fi.

---

## 📱 Features

- **Cyberpunk Automotive Cockpit HUD**:
  - Live Connection Status Badge (Connected / Connecting / Disconnected).
  - Real-time Network Latency / Ping (ms) indicator.
  - State Indicator: `ARMED & READY`, `MANUAL DRIVE ACTIVE`, or `MICROSLEEP DETECTED / TYRES FLOATED`.
- **Dual Ultrasonic Sonar Radar**:
  - Front Sonar gauge and Left Sonar gauge with live distance readings in cm.
  - Color-coded safety zones: Green (>50cm), Amber (20-50cm), and Pulsing Red (<20cm Critical Obstacle).
- **Two Advanced Drive Modes**:
  1. **Tactical D-Pad**:
     - 8-directional control: Forward, Backward, Pivot Left, Pivot Right, and 4 Diagonal curves (FL, FR, BL, BR).
     - Responsive press-and-hold heartbeat transmission.
     - Center quick brake / re-arm button.
     - Tactile haptic vibration feedback.
  2. **Proportional 2D Virtual Joystick**:
     - Fluid 2D touch drag joystick using React Native `PanResponder`.
     - Smooth differential steering mathematics: independently regulates left and right motor PWM.
     - Real-time differential motor output telemetry bar (`LEFT: +180`, `RIGHT: +120`).
     - Self-centering physics spring on release.
- **Throttle & Speed Control**:
  - Instant Gear Selector presets: `ECO` (120 PWM), `MID` (185 PWM), `SPORT` (250 PWM).
  - Fine adjustment steppers (`-15` / `+15`).
  - Visual power output bar (0% - 100%).
- **Hard Safety Interlocks**:
  - Large Glowing Red **Emergency Tyre Disconnect** button (floats BTS7960 MOSFET gates immediately).
  - One-tap **Power Restore & Re-Arm** action to resume driving after microsleep or halt.
  - Automatic obstacle collision avoidance brake.
- **Diagnostics & Testing**:
  - Built-in **Simulation Mode** (allows testing all UI controls, gauges, and animations without having the ESP32 on hand).
  - Ping diagnostic tool to test ESP32 reachability on `http://192.168.4.1`.

---

## 🚀 How to Run the Mobile App

### Prerequisites
1. Ensure Node.js is installed.
2. Install the **Expo Go** app on your physical mobile phone from the [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) (Android) or [Apple App Store](https://apps.apple.com/app/expo-go/id982107779) (iOS).

### Step 1: Start the Expo Development Server
In your terminal, navigate to the `mobile_app` folder:
```bash
cd mobile_app
npm start
```

### Step 2: Connect Phone to Rover Wi-Fi
1. Power up your ESP32 Rover.
2. On your smartphone's Wi-Fi settings, connect to:
   - **SSID**: `ESP32-Safety-Car`
   - **Password**: `12345678`
   > 💡 *Note: If your smartphone prompts that "Wi-Fi has no internet access", select "Keep Wi-Fi connection".*

### Step 3: Open in Expo Go
- **Android**: Scan the QR code shown in your terminal using the Expo Go app.
- **iOS**: Scan the QR code using your phone's default Camera app, which will open Expo Go.
- **Web Browser (Optional)**: Press `w` in terminal or run `npm run web` to preview the controller in your desktop browser!

---

## 🛠 Settings & Configuration

Tap the **⚙ Gear Icon** in the top-right corner to open the Settings screen:
- **ESP32 Gateway IP**: Defaults to `http://192.168.4.1`.
- **Test Connection (Ping)**: Instantly tests Wi-Fi communication and displays round-trip latency.
- **Simulation Demo Mode**: Turn this ON to test the interface without hardware.
- **Obstacle Auto-Brake**: Toggle the front ultrasonic auto-stop trigger.
- **Haptic Feedback**: Enable or disable vibration patterns on mobile devices.

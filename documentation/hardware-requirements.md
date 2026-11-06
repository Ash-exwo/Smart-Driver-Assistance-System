# Hardware Requirements & Circuit Specifications

This document outlines the hardware components, electrical ratings, wiring schematics, and pin configurations required to build and operate the **Smart Driver Assistance System Rover**.

---

## 1. Bill of Materials (BOM)

### Embedded Controller & Logic
| Component | Specification | Quantity | Purpose |
| :--- | :--- | :---: | :--- |
| **ESP32 Dev Module** | ESP-WROOM-32 (30-pin or 38-pin), 2.4 GHz Wi-Fi + BLE | 1 | Central safety and vehicle controller |
| **Active Buzzer Module** | 5V DC Active Piezo Buzzer | 1 | Audible alerts during alcohol detection or halt |
| **WS2812B RGB LED Strip (Primary)** | Individually addressable 5050 RGB LEDs (20 LEDs) | 1 | Visual indicators, turn signals, emergency strobe |
| **WS2812B RGB LED Strip (Accent)** | Individually addressable 5050 RGB LEDs (8 LEDs) | 1 | Neon blue ambient underglow / system status |
| **MQ-3 Alcohol Gas Sensor** | Metal Oxide Semiconductor analog gas sensor | 1 | Breath alcohol detection & ignition lockout |
| **HC-SR04 Ultrasonic Sensor** | Dual-transducer distance module (40 kHz, 2cm–400cm) | 2 | Sonar obstacle detection (Front & Left curb) |

### Power & Motor Drive
| Component | Specification | Quantity | Purpose |
| :--- | :--- | :---: | :--- |
| **BTS7960 Motor Driver** | 43A Dual High-Current H-Bridge (PWM up to 25 kHz) | 2 | Left and Right differential drive motor control |
| **DC Gear Motors** | 12V High-Torque DC Geared Motors (e.g. 300 RPM) | 2 or 4 | Rover propulsion |
| **Main Drive Battery** | 2S–3S LiPo or LiFePO4 (7.4V – 11.1V, 2200mAh+) | 1 | High-current power for DC motors |
| **DC-DC Step-Down (Buck) Converter** | LM2596 / XL4015 (Adjustable 5V 3A output) | 1 | Regulated 5V logic supply for ESP32 and LEDs |
| **Resistors** | 1 kΩ and 2 kΩ 1/4W resistors | 2 sets | Voltage divider for 5V HC-SR04 Echo pins |

### Vision & Companion Hardware
| Component | Specification | Quantity | Purpose |
| :--- | :--- | :---: | :--- |
| **Companion Computer / Laptop** | x86_64 CPU (Core i5+), 8GB+ RAM, Windows / Linux | 1 | Runs MediaPipe DMS and YOLO pothole inference |
| **Driver-Facing Camera** | 720p / 1080p USB Webcam (30 FPS) | 1 | Captures driver facial landmarks for vigilance |
| **Road-Facing Camera** | 720p / 1080p Wide-Angle USB Webcam (30 FPS) | 1 | Captures forward roadway for pothole detection |
| **USB Data Cable** | High-quality USB-A to Micro-USB / Type-C | 1 | Flashing firmware and redundant USB serial backup |

---

## 2. ESP32 Pin Allocation Matrix

The table below reflects the exact pin assignments defined in `firmware/esp32_rover/esp32_rover.ino`:

| Function | ESP32 GPIO | Direction | Electrical Characteristics | Target Component |
| :--- | :---: | :---: | :--- | :--- |
| `L_RPWM` | **GPIO 19** | OUTPUT | 5 kHz PWM, Channel 0 | Left BTS7960 Forward PWM |
| `L_LPWM` | **GPIO 18** | OUTPUT | 5 kHz PWM, Channel 1 | Left BTS7960 Reverse PWM |
| `L_REN` | **GPIO 21** | OUTPUT | Digital Output (Active HIGH) | Left BTS7960 Forward Enable |
| `L_LEN` | **GPIO 22** | OUTPUT | Digital Output (Active HIGH) | Left BTS7960 Reverse Enable |
| `R_RPWM` | **GPIO 25** | OUTPUT | 5 kHz PWM, Channel 2 | Right BTS7960 Forward PWM |
| `R_LPWM` | **GPIO 23** | OUTPUT | 5 kHz PWM, Channel 3 | Right BTS7960 Reverse PWM |
| `R_REN` | **GPIO 27** | OUTPUT | Digital Output (Active HIGH) | Right BTS7960 Forward Enable |
| `R_LEN` | **GPIO 32** | OUTPUT | Digital Output (Active HIGH) | Right BTS7960 Reverse Enable |
| `MQ3_PIN` | **GPIO 34** | INPUT | ADC1 Channel 6 (Input Only, 0–3.3V) | MQ-3 Analog Output (`A0`) |
| `BUZZER_PIN` | **GPIO 4** | OUTPUT | Digital Output (Active HIGH) | Active Piezo Buzzer Positive |
| `LED_PIN` | **GPIO 5** | OUTPUT | 800 kHz Serial Data Stream | Primary WS2812B Data In (20 LEDs) |
| `LED_PIN_2` | **GPIO 14** | OUTPUT | 800 kHz Serial Data Stream | Accent WS2812B Data In (8 LEDs) |

> [!IMPORTANT]
> **GPIO 34 is an Input-Only ADC Pin**: GPIO 34 on the ESP32 does not possess internal pull-up or pull-down resistors and cannot output signals. It is safely dedicated to the analog signal from the MQ-3 sensor.

---

## 3. Power Distribution Architecture

DC motors driven by BTS7960 drivers can draw substantial inductive transient currents. An isolated dual-rail power scheme is essential to avoid brownouts and ESP32 reboot loops:

```
                      ┌────────────────────────┐
                      │  LiPo Battery Pack     │
                      │  (7.4V - 11.1V, 25C)   │
                      └──────────┬─────────────┘
                                 │
           ┌─────────────────────┴─────────────────────┐
           │                                           │
           ▼ (+)                                       ▼ (+)
    ┌──────────────┐                            ┌──────────────┐
    │ High-Current │                            │ DC-DC Buck   │
    │ Motor Rail   │                            │ Converter    │
    └──────┬───────┘                            └──────┬───────┘
           │                                           │ Output: 5.0V (3A)
     ┌─────┴──────────────┐                            │
     │                    │                            ├───────────────────┐
     ▼ B+                 ▼ B+                         ▼                   ▼
┌──────────────┐   ┌──────────────┐              ┌───────────┐       ┌───────────┐
│ Left BTS7960 │   │ Right BTS7960│              │ ESP32 VIN │       │ WS2812B   │
│ Motor Driver │   │ Motor Driver │              │ & Sensors │       │ 5V Rail   │
└──────┬───────┘   └──────┬───────┘              └─────┬─────┘       └─────┬─────┘
       │                  │                            │                   │
       ▼ M+/M-            ▼ M+/M-                      │                   │
  [Left Motor]       [Right Motor]                     │                   │
       │                  │                            │                   │
       └──────────────────┴─────────────┬──────────────┴───────────────────┘
                                        ▼
                             COMMON GROUND (GND) BUS
```

### Critical Grounding Rules
* **Single Common Ground**: All grounds (Battery Negative, Buck Converter Input/Output Negative, ESP32 GND pins, BTS7960 GND pins, and Sensor GNDs) **MUST be firmly bonded together**.
* **Decoupling Capacitors**: Place a 1000 µF 16V electrolytic capacitor across the 5V power rails near the WS2812B strips to buffer current spikes when all LEDs illuminate simultaneously.
* **Separation of High-Current Traces**: Motor power wiring (`B+` and `B-`) should use thick gauge stranded wire (16–18 AWG) separate from logic breadboard jumper wires.

---

## 4. Subsystem Circuit Connections

### 1. BTS7960 Motor Driver Wiring
Each BTS7960 board requires 6 control connections to the ESP32:
* `VCC` $\rightarrow$ Regulated 5V
* `GND` $\rightarrow$ Common GND
* `R_EN` & `L_EN` $\rightarrow$ Connect to designated ESP32 enable GPIOs
* `RPWM` & `LPWM` $\rightarrow$ Connect to designated ESP32 PWM GPIOs
* `B+` $\rightarrow$ Positive terminal of motor battery
* `B-` $\rightarrow$ Negative terminal of motor battery
* `M+` & `M-` $\rightarrow$ Direct connections to motor terminals

### 2. MQ-3 Alcohol Sensor Circuit
The MQ-3 module contains an internal heating element and an analog voltage divider:
* `VCC` $\rightarrow$ Regulated 5V (heater requires 5V for accurate calibration)
* `GND` $\rightarrow$ Common GND
* `A0` (Analog Out) $\rightarrow$ ESP32 GPIO 34
* *Warm-Up Note*: The MQ-3 sensor requires a 2-minute preheating period before stable readings are achieved. During the first 2.5 seconds after system arming, the firmware suppresses false alarms via `ignoreAlcoholUntil`.

### 3. WS2812B Addressable LED Strips
* **Primary Strip (20 LEDs)**:
  - `+5V` $\rightarrow$ Regulated 5V Rail (Never power directly from the ESP32 3.3V pin)
  - `GND` $\rightarrow$ Common GND
  - `DIN` $\rightarrow$ ESP32 GPIO 5 (Optional 330 Ω series resistor recommended on data line)
* **Secondary Accent Strip (8 LEDs)**:
  - `+5V` $\rightarrow$ Regulated 5V Rail
  - `GND` $\rightarrow$ Common GND
  - `DIN` $\rightarrow$ ESP32 GPIO 14

### 4. HC-SR04 Distance Sensors (Hardware Design Consideration)
The HC-SR04 operates at 5V logic. When triggering echo pulses, the Echo pin emits a 5V signal, which can damage the 3.3V tolerant ESP32 GPIO if connected directly:
* `VCC` $\rightarrow$ 5V
* `GND` $\rightarrow$ Common GND
* `Trig` $\rightarrow$ ESP32 Output
* `Echo` $\rightarrow$ Connect through a resistive voltage divider:
  ```
  HC-SR04 Echo (5V) ───[ 1 kΩ ]───┬───> ESP32 GPIO
                                  │
                               [ 2 kΩ ]
                                  │
                                 GND
  ```
  *Output voltage*: $5\text{V} \times \frac{2\text{k}\Omega}{1\text{k}\Omega + 2\text{k}\Omega} = 3.33\text{V}$ (Safe for ESP32).

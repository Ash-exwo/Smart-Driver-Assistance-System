export type CarState = 'IDLE' | 'MANUAL' | 'HALTED';

export type ConnectionStatus = 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED';

export type DriveCommand =
  | 'F'
  | 'B'
  | 'L'
  | 'R'
  | 'FL'
  | 'FR'
  | 'BL'
  | 'BR'
  | 'S'
  | 'STOP'
  | 'PARK'
  | 'SLEEP';

export type DriveMode = 'DPAD' | 'JOYSTICK';

export type GearMode = 'ECO' | 'NORMAL' | 'SPORT';

export interface TelemetryData {
  front: number;           // Distance in cm
  left: number;            // Distance in cm
  state: CarState;         // IDLE, MANUAL, HALTED
  speed: number;           // Current PWM (0 - 255)
  turnSpeed: number;       // Turn PWM (0 - 255)
  targetLeft: number;
  targetRight: number;
  currentLeft: number;
  currentRight: number;
  clients: number;
  uptime: number;          // In seconds
  watchdog: number;        // Remaining ms
  autoBrake: boolean;
}

export interface DmsTelemetry {
  face_detected: boolean;
  eye_status: 'OPEN' | 'CLOSED';
  yawning: 'YES' | 'NO';
  drowsiness_level: number;
  driver_condition: string;
  road_condition: string;
  pothole_detected: boolean;
  pothole_count: number;
  total_potholes_logged: number;
  alarm_status: 'ON' | 'OFF';
  eye_blinks: number;
  fps: number;
  timestamp: string;
}

export interface AppSettings {
  roverIp: string;         // e.g. "http://192.168.4.1"
  pollIntervalMs: number;  // Status fetch interval (e.g. 250ms)
  commandRateMs: number;   // Heartbeat drive rate (e.g. 150ms)
  watchdogMs: number;      // ESP32 watchdog timeout (e.g. 650ms)
  autoBrake: boolean;      // Obstacle auto-brake enable
  hapticsEnabled: boolean;
  simulationMode: boolean; // Virtual mock mode for testing without ESP32
  enableDms: boolean;      // Enable Driver Monitoring System AI panel
  dmsUrl: string;          // e.g. "http://127.0.0.1:8000" or laptop IP on LAN
}


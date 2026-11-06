import { TelemetryData, DriveCommand, AppSettings, CarState, DmsTelemetry } from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
  roverIp: 'http://192.168.4.1',
  pollIntervalMs: 250,
  commandRateMs: 150,
  watchdogMs: 650,
  autoBrake: true,
  hapticsEnabled: true,
  simulationMode: false,
  enableDms: true,
  dmsUrl: 'http://127.0.0.1:8000',
};

class RoverService {
  private settings: AppSettings = { ...DEFAULT_SETTINGS };
  private isRequestPending = false;
  private lastPingTime = 0;
  private simulatedState: TelemetryData = {
    front: 125,
    left: 88,
    state: 'IDLE',
    speed: 180,
    turnSpeed: 155,
    targetLeft: 0,
    targetRight: 0,
    currentLeft: 0,
    currentRight: 0,
    clients: 1,
    uptime: 0,
    watchdog: 650,
    autoBrake: true,
  };

  public updateSettings(newSettings: Partial<AppSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    if (!this.settings.roverIp.startsWith('http://') && !this.settings.roverIp.startsWith('https://')) {
      this.settings.roverIp = 'http://' + this.settings.roverIp;
    }
    // Remove trailing slash if present
    this.settings.roverIp = this.settings.roverIp.replace(/\/+$/, '');
  }

  public getSettings(): AppSettings {
    return { ...this.settings };
  }

  // --- Network Fetch with Timeout ---
  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 800): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timer);
    }
  }

  // --- Ping / Latency Check ---
  public async measurePing(): Promise<{ ok: boolean; latencyMs: number }> {
    if (this.settings.simulationMode) {
      return { ok: true, latencyMs: 12 + Math.floor(Math.random() * 8) };
    }

    const start = Date.now();
    try {
      const res = await this.fetchWithTimeout(`${this.settings.roverIp}/ping`, { method: 'GET' }, 700);
      if (res.ok) {
        const latencyMs = Date.now() - start;
        this.lastPingTime = latencyMs;
        return { ok: true, latencyMs };
      }
      return { ok: false, latencyMs: -1 };
    } catch {
      return { ok: false, latencyMs: -1 };
    }
  }

  // --- Fetch Telemetry ---
  public async fetchStatus(): Promise<TelemetryData | null> {
    if (this.settings.simulationMode) {
      // Simulate real-time sensor fluctuation
      this.simulatedState.uptime += 1;
      this.simulatedState.front = Math.max(12, Math.min(220, this.simulatedState.front + (Math.floor(Math.random() * 7) - 3)));
      this.simulatedState.left = Math.max(15, Math.min(220, this.simulatedState.left + (Math.floor(Math.random() * 5) - 2)));
      return { ...this.simulatedState };
    }

    try {
      const res = await this.fetchWithTimeout(`${this.settings.roverIp}/status`, { method: 'GET' }, 700);
      if (res.ok) {
        const data: TelemetryData = await res.json();
        return data;
      }
      return null;
    } catch {
      return null;
    }
  }

  // --- Send Directional Command ---
  public async sendCommand(cmd: DriveCommand, speed?: number): Promise<boolean> {
    if (this.settings.simulationMode) {
      if (cmd === 'STOP' || cmd === 'PARK' || cmd === 'SLEEP') {
        this.simulatedState.state = 'HALTED';
        this.simulatedState.currentLeft = 0;
        this.simulatedState.currentRight = 0;
      } else if (cmd === 'S') {
        this.simulatedState.state = 'IDLE';
        this.simulatedState.currentLeft = 0;
        this.simulatedState.currentRight = 0;
      } else if (this.simulatedState.state !== 'HALTED') {
        this.simulatedState.state = 'MANUAL';
        const spd = speed || this.simulatedState.speed;
        if (cmd === 'F') { this.simulatedState.currentLeft = spd; this.simulatedState.currentRight = spd; }
        else if (cmd === 'B') { this.simulatedState.currentLeft = -spd; this.simulatedState.currentRight = -spd; }
        else if (cmd === 'L') { this.simulatedState.currentLeft = -spd; this.simulatedState.currentRight = spd; }
        else if (cmd === 'R') { this.simulatedState.currentLeft = spd; this.simulatedState.currentRight = -spd; }
      }
      return true;
    }

    try {
      let url = `${this.settings.roverIp}/cmd?val=${cmd}`;
      if (speed !== undefined) {
        url += `&spd=${speed}`;
      }
      const res = await this.fetchWithTimeout(url, { method: 'GET' }, 500);
      return res.ok;
    } catch {
      return false;
    }
  }

  // --- Send Differential Drive (Direct PWM Joystick) ---
  public async sendDifferentialDrive(left: number, right: number): Promise<boolean> {
    left = Math.round(Math.max(-255, Math.min(255, left)));
    right = Math.round(Math.max(-255, Math.min(255, right)));

    if (this.settings.simulationMode) {
      if (this.simulatedState.state !== 'HALTED') {
        this.simulatedState.currentLeft = left;
        this.simulatedState.currentRight = right;
        this.simulatedState.state = (left === 0 && right === 0) ? 'IDLE' : 'MANUAL';
      }
      return true;
    }

    try {
      const url = `${this.settings.roverIp}/drive?left=${left}&right=${right}`;
      const res = await this.fetchWithTimeout(url, { method: 'GET' }, 400);
      return res.ok;
    } catch {
      return false;
    }
  }

  // --- Emergency Stop (Microsleep / Collision Halt) ---
  public async sendEmergencyStop(): Promise<boolean> {
    return this.sendCommand('STOP');
  }

  // --- Clear Halt / Arm System ---
  public async sendReset(): Promise<boolean> {
    return this.sendCommand('S');
  }

  // --- Configure Runtime Settings on ESP32 ---
  public async syncSettings(speed: number, turn: number, autoBrake: boolean, watchdog: number): Promise<boolean> {
    if (this.settings.simulationMode) {
      this.simulatedState.speed = speed;
      this.simulatedState.turnSpeed = turn;
      this.simulatedState.autoBrake = autoBrake;
      return true;
    }

    try {
      const brakeVal = autoBrake ? 1 : 0;
      const url = `${this.settings.roverIp}/settings?speed=${speed}&turn=${turn}&brake=${brakeVal}&watchdog=${watchdog}`;
      const res = await this.fetchWithTimeout(url, { method: 'GET' }, 700);
      return res.ok;
    } catch {
      return false;
    }
  }

  // --- Fetch DMS AI Telemetry ---
  public async fetchDmsTelemetry(): Promise<DmsTelemetry | null> {
    if (this.settings.simulationMode) {
      return {
        face_detected: true,
        eye_status: 'OPEN',
        yawning: 'NO',
        drowsiness_level: 8,
        driver_condition: 'SAFE',
        road_condition: 'CLEAR',
        pothole_detected: false,
        pothole_count: 0,
        total_potholes_logged: 0,
        alarm_status: 'OFF',
        eye_blinks: 14,
        fps: 29.8,
        timestamp: new Date().toLocaleTimeString(),
      };
    }

    try {
      let baseUrl = this.settings.dmsUrl || 'http://127.0.0.1:8000';
      baseUrl = baseUrl.replace(/\/+$/, '');
      const res = await this.fetchWithTimeout(`${baseUrl}/telemetry`, { method: 'GET' }, 600);
      if (res.ok) {
        const data = await res.json();
        return data.telemetry;
      }
      return null;
    } catch {
      return null;
    }
  }
}

export const roverService = new RoverService();

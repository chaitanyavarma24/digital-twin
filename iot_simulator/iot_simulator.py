"""
Advanced IoT Virtual Environment Simulator
-------------------------------------------
3 simultaneous patient simulations with realistic physiological responses.
Supports activity changes, emergency scenarios, and smooth vital transitions.

Usage:
    python iot_simulator.py --email your@email.com --password yourpassword
"""

import requests
import time
import math
import random
import argparse
import threading
from datetime import datetime

API_BASE      = "http://127.0.0.1:8000"
SEND_INTERVAL = 3   # seconds between readings

# ─── Physiological profiles per activity ─────────────────────────────────────
ACTIVITIES = {
    "rest": {
        "heart_rate":  {"target": 65,  "variation": 4},
        "spo2":        {"target": 98.5,"variation": 0.4},
        "temperature": {"target": 36.6,"variation": 0.08},
        "steps_rate":  0,
        "hrv_base":    65,
        "label":       "Resting",
        "emoji":       "[REST]",
    },
    "walking": {
        "heart_rate":  {"target": 98,  "variation": 7},
        "spo2":        {"target": 97.5,"variation": 0.6},
        "temperature": {"target": 37.1,"variation": 0.1},
        "steps_rate":  12,
        "hrv_base":    45,
        "label":       "Walking",
        "emoji":       "[WALK]",
    },
    "running": {
        "heart_rate":  {"target": 155, "variation": 10},
        "spo2":        {"target": 96.5,"variation": 1.0},
        "temperature": {"target": 37.9,"variation": 0.15},
        "steps_rate":  30,
        "hrv_base":    25,
        "label":       "Running",
        "emoji":       "[RUN]",
    },
    "sprinting": {
        "heart_rate":  {"target": 185, "variation": 6},
        "spo2":        {"target": 95.5,"variation": 1.2},
        "temperature": {"target": 38.4,"variation": 0.2},
        "steps_rate":  55,
        "hrv_base":    12,
        "label":       "Sprinting",
        "emoji":       "[SPRINT]",
    },
    "sleeping": {
        "heart_rate":  {"target": 50,  "variation": 3},
        "spo2":        {"target": 97.0,"variation": 0.5},
        "temperature": {"target": 36.1,"variation": 0.06},
        "steps_rate":  0,
        "hrv_base":    80,
        "label":       "Sleeping",
        "emoji":       "[SLEEP]",
    },
    "stressed": {
        "heart_rate":  {"target": 110, "variation": 12},
        "spo2":        {"target": 97.0,"variation": 0.8},
        "temperature": {"target": 37.3,"variation": 0.12},
        "steps_rate":  2,
        "hrv_base":    20,
        "label":       "Stressed",
        "emoji":       "[STRESS]",
    },

    # ── Emergency scenarios ──────────────────────────────────────────────────
    "heart_attack": {
        "heart_rate":  {"target": 165, "variation": 25},   # arrhythmia spikes
        "spo2":        {"target": 88,  "variation": 3.0},  # dropping O2
        "temperature": {"target": 37.5,"variation": 0.3},
        "steps_rate":  0,
        "hrv_base":    8,
        "label":       "!! HEART ATTACK !!",
        "emoji":       "[!!!]",
    },
    "hypoxia": {
        "heart_rate":  {"target": 120, "variation": 10},
        "spo2":        {"target": 82,  "variation": 2.5},  # critically low SpO2
        "temperature": {"target": 36.9,"variation": 0.15},
        "steps_rate":  0,
        "hrv_base":    15,
        "label":       "!! HYPOXIA !!",
        "emoji":       "[!!!]",
    },
    "bradycardia": {
        "heart_rate":  {"target": 38,  "variation": 5},    # dangerously low HR
        "spo2":        {"target": 93,  "variation": 1.5},
        "temperature": {"target": 35.8,"variation": 0.2},
        "steps_rate":  0,
        "hrv_base":    5,
        "label":       "!! BRADYCARDIA !!",
        "emoji":       "[!!!]",
    },
    "fever": {
        "heart_rate":  {"target": 105, "variation": 8},
        "spo2":        {"target": 96,  "variation": 0.8},
        "temperature": {"target": 39.5,"variation": 0.3},  # high fever
        "steps_rate":  0,
        "hrv_base":    22,
        "label":       "!! FEVER !!",
        "emoji":       "[!!!]",
    },
}

TRANSITION_SPEED = 0.08  # how fast vitals move to new target (0.01=slow, 0.2=fast)


class PatientSimulator:
    """One simulated patient with smooth physiological transitions."""

    def __init__(self, patient_id, name, token, initial_activity="rest"):
        self.patient_id   = patient_id
        self.name         = name
        self.token        = token
        self.activity     = initial_activity
        self.tick         = 0
        self.total_steps  = random.randint(1500, 5000)
        self.lock         = threading.Lock()
        self.last_reading = {}

        cfg       = ACTIVITIES[initial_activity]
        self.hr   = cfg["heart_rate"]["target"]
        self.spo2 = cfg["spo2"]["target"]
        self.temp = cfg["temperature"]["target"]

    def set_activity(self, activity):
        with self.lock:
            self.activity = activity

    def _smooth_toward(self, current, target, variation, tick):
        """Smoothly moves current value toward target with natural physiological variation."""
        sine  = math.sin(tick * 0.15) * variation * 0.4
        noise = random.gauss(0, variation * 0.15)
        pull  = (target - current) * TRANSITION_SPEED
        return current + pull + sine * 0.12 + noise

    def next_reading(self):
        with self.lock:
            cfg = ACTIVITIES[self.activity]

        self.tick += 1

        self.hr   = self._smooth_toward(self.hr,   cfg["heart_rate"]["target"],  cfg["heart_rate"]["variation"],  self.tick)
        self.spo2 = self._smooth_toward(self.spo2, cfg["spo2"]["target"],        cfg["spo2"]["variation"],        self.tick)
        self.temp = self._smooth_toward(self.temp, cfg["temperature"]["target"],  cfg["temperature"]["variation"], self.tick)

        step_noise        = random.randint(0, max(0, cfg["steps_rate"] * 2))
        self.total_steps += step_noise

        hrv_base = cfg["hrv_base"]
        hrv      = round(max(5, hrv_base + random.gauss(0, hrv_base * 0.15)), 1)

        return {
            "heart_rate":  round(max(30, min(220, self.hr)),   1),
            "spo2":        round(max(70, min(100, self.spo2)), 1),
            "temperature": round(max(34, min(42,  self.temp)), 2),
            "steps":       self.total_steps,
            "hrv":         hrv,
            "timestamp":   datetime.utcnow().isoformat(),
        }

    def send(self, reading):
        try:
            res = requests.post(
                f"{API_BASE}/sensor/",
                json=reading,
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            return res.status_code == 200
        except Exception:
            return False


def login(email, password):
    try:
        res = requests.post(
            f"{API_BASE}/auth/login",
            json={"email": email, "password": password},
            timeout=5
        )
        if res.status_code == 200:
            return res.json().get("access_token")
    except Exception as e:
        print(f"Connection error: {e}")
    return None


def clear_screen():
    print("\033[H\033[J", end="")


def print_dashboard(patients, logs):
    clear_screen()
    now = datetime.now().strftime("%H:%M:%S")
    print("=" * 68)
    print(f"  IoT Virtual Environment Simulator  |  {now}")
    print("=" * 68)

    for p in patients:
        cfg     = ACTIVITIES[p.activity]
        r       = p.last_reading
        hr      = r.get("heart_rate",  "--")
        spo2    = r.get("spo2",        "--")
        temp    = r.get("temperature", "--")
        steps   = r.get("steps",       "--")
        hrv     = r.get("hrv",         "--")
        is_emg  = "!!" in cfg["label"]
        marker  = ">>>" if is_emg else "   "

        print(f"\n{marker} Patient {p.patient_id}: {p.name}")
        print(f"     Activity  : {cfg['emoji']} {cfg['label']}")
        print(f"     HR        : {hr} BPM  |  SpO2: {spo2}%  |  Temp: {temp}C")
        print(f"     Steps     : {steps}  |  HRV : {hrv} ms")

    print("\n" + "-" * 68)
    print("  COMMANDS  (format: <patient_number> <activity>)")
    print("-" * 68)
    print("  Normal  : rest | walking | running | sprinting | sleeping | stressed")
    print("  Emergency: heart_attack | hypoxia | bradycardia | fever")
    print("  Example : 1 running    2 heart_attack    3 sleeping")
    print("  Type 'quit' to stop the simulator")
    print("-" * 68)

    if logs:
        print("  Recent:")
        for log in logs[-4:]:
            print(f"    {log}")
    print()


def simulation_loop(patients, logs, stop_event):
    """Background thread: generates and sends vitals for all patients."""
    while not stop_event.is_set():
        for p in patients:
            reading       = p.next_reading()
            p.last_reading = reading
            ok            = p.send(reading)
            cfg           = ACTIVITIES[p.activity]
            t             = datetime.now().strftime("%H:%M:%S")
            status        = "OK" if ok else "FAIL"
            logs.append(
                f"[{t}] P{p.patient_id} {cfg['emoji']} "
                f"HR:{reading['heart_rate']} SpO2:{reading['spo2']}% [{status}]"
            )
        time.sleep(SEND_INTERVAL)


def main():
    parser = argparse.ArgumentParser(description="IoT Virtual Environment Simulator")
    parser.add_argument("--email",    required=True,  help="Your account email")
    parser.add_argument("--password", required=True,  help="Your account password")
    args = parser.parse_args()

    print("Connecting to backend...")
    token = login(args.email, args.password)
    if not token:
        print("Login failed. Make sure the backend is running and credentials are correct.")
        return

    print("Login successful! Starting 3-patient simulation...\n")

    patients = [
        PatientSimulator(1, "Chaitanya", token, "rest"),
        PatientSimulator(2, "Patient B", token, "walking"),
        PatientSimulator(3, "Patient C", token, "sleeping"),
    ]

    logs       = []
    stop_event = threading.Event()

    thread = threading.Thread(
        target=simulation_loop,
        args=(patients, logs, stop_event),
        daemon=True
    )
    thread.start()

    try:
        while True:
            print_dashboard(patients, logs)
            cmd = input("  > ").strip().lower()

            if cmd == "quit":
                break

            parts = cmd.split()
            if len(parts) == 2:
                pid, activity = parts
                if pid.isdigit() and activity in ACTIVITIES:
                    idx = int(pid) - 1
                    if 0 <= idx < len(patients):
                        patients[idx].set_activity(activity)
                        cfg = ACTIVITIES[activity]
                        logs.append(f"[CMD] Patient {pid} -> {cfg['label']}")
                    else:
                        logs.append(f"[ERR] No patient {pid}. Use 1, 2, or 3.")
                else:
                    logs.append(f"[ERR] Unknown activity '{activity}'")
            elif cmd:
                logs.append(f"[ERR] Bad command: '{cmd}'  (use: <number> <activity>)")

    except KeyboardInterrupt:
        pass

    stop_event.set()
    print("\nSimulator stopped.")


if __name__ == "__main__":
    main()
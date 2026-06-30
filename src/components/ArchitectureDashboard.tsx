import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  Cpu,
  Database,
  Layers,
  Lock,
  RefreshCw,
  Server,
  Zap,
  Users,
  CheckCircle2,
  AlertCircle,
  Code,
  Terminal,
  TrendingUp,
  HardDrive,
  ShieldAlert,
  Trash2,
  Settings,
  AlertTriangle,
  Check,
  Search,
  FileText
} from "lucide-react";
import { SecurityLog } from "../types";

interface LogEvent {
  id: string;
  timestamp: string;
  user: string;
  department: string;
  action: string;
  type: "read" | "write" | "cache" | "error" | "websocket";
}

export default function ArchitectureDashboard() {
  // Concurrency profile states
  const [activePreset, setActivePreset] = useState<"normal" | "handover" | "concurrency">("normal");
  const [concurrencyLevel, setConcurrencyLevel] = useState(1320);
  const [requestsPerSecond, setRequestsPerSecond] = useState(145);
  const [dbLatency, setDbLatency] = useState(8);
  const [cacheHitRatio, setCacheHitRatio] = useState(94.2);
  const [activeTab, setActiveTab] = useState<"dashboard" | "websocket" | "isolation" | "blueprint" | "security" | "unfreeze_queue">("dashboard");

  // Administrator security logs & dynamic parameters
  const [securityViolations, setSecurityViolations] = useState<SecurityLog[]>([]);
  const [maxAllowedAttempts, setMaxAllowedAttempts] = useState(3);
  const [lockoutTimeSeconds, setLockoutTimeSeconds] = useState(30);
  const [oracleStrictCheck, setOracleStrictCheck] = useState(true);
  const [ipBanishmentActive, setIpBanishmentActive] = useState(true);
  const [onboardingCheckActive, setOnboardingCheckActive] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");

  // Interactive Redis simulator states
  const [redisKeys, setRedisKeys] = useState([
    { key: "session:doctor_olumide:token", ttl: 1724, size: "1.2KB", hits: 342 },
    { key: "listing:mock_1:details", ttl: 298, size: "4.8KB", hits: 1845 },
    { key: "listing:mock_2:details", ttl: 342, size: "5.1KB", hits: 912 },
    { key: "category:clinical_gear:count", ttl: 59, size: "0.2KB", hits: 5120 },
    { key: "category:scrubs:count", ttl: 112, size: "0.2KB", hits: 4892 },
  ]);

  // Transaction Isolation test state
  const [txStep, setTxStep] = useState(0);
  const [txLevel, setTxLevel] = useState<"READ_COMMITTED" | "SERIALIZABLE">("SERIALIZABLE");
  const [txLog, setTxLog] = useState<string[]>([]);
  const [txRunning, setTxRunning] = useState(false);

  // SVG Chart data
  const [rpsHistory, setRpsHistory] = useState<number[]>(Array(15).fill(145));
  const [latencyHistory, setLatencyHistory] = useState<number[]>(Array(15).fill(8));

  // Activity Log State
  const [logs, setLogs] = useState<LogEvent[]>([
    {
      id: "log_1",
      timestamp: "16:01:02",
      user: "Dr. Coker Olumide",
      department: "Surgery & Clinical Medicine",
      action: "Queried 'Littmann Classic III' (Cache HIT via Redis)",
      type: "cache"
    },
    {
      id: "log_2",
      timestamp: "16:01:04",
      user: "Nurse Janet Balogun",
      department: "Nursing Services",
      action: "Connected to Socket.io room: 'listing_mock_2' (Multiplexed)",
      type: "websocket"
    },
    {
      id: "log_3",
      timestamp: "16:01:05",
      user: "Pharm. Amaka Eze",
      department: "Pharmacy Department",
      action: "Initiated safe-swap handshake (PostgreSQL LOCK acquired)",
      type: "write"
    }
  ]);

  // Refs and timers
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update real-time stats simulation
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      // Fluctuate stats based on active presets
      setConcurrencyLevel((prev) => {
        const base = activePreset === "normal" ? 1300 : activePreset === "handover" ? 4850 : 2500;
        const drift = Math.floor((Math.random() - 0.5) * 80);
        return Math.max(1000, base + drift);
      });

      setRequestsPerSecond((prev) => {
        const base = activePreset === "normal" ? 140 : activePreset === "handover" ? 740 : 280;
        const drift = Math.floor((Math.random() - 0.5) * 20);
        const nextVal = Math.max(50, base + drift);
        // Add to history
        setRpsHistory((hist) => [...hist.slice(1), nextVal]);
        return nextVal;
      });

      setDbLatency((prev) => {
        const base = activePreset === "normal" ? 8 : activePreset === "handover" ? 14 : 9;
        const drift = parseFloat((Math.random() * 2 - 1).toFixed(1));
        const nextVal = Math.max(2, base + drift);
        // Add to history
        setLatencyHistory((hist) => [...hist.slice(1), nextVal]);
        return nextVal;
      });

      setCacheHitRatio((prev) => {
        const base = activePreset === "normal" ? 94.2 : activePreset === "handover" ? 97.6 : 95.1;
        const drift = parseFloat((Math.random() * 0.4 - 0.2).toFixed(2));
        return Math.min(100, Math.max(80, base + drift));
      });

      // Generate random logs
      if (Math.random() > 0.4) {
        const userNames = [
          "Dr. Coker Olumide",
          "Nurse Janet Balogun",
          "Pharm. Amaka Eze",
          "Mr. Tunde Bakare",
          "Dr. Adeleke Yusuf",
          "Sister Chioma Ndu",
          "Pharm. Bode Thomas",
          "Admin Funke Alao"
        ];
        const depts = [
          "Surgery & Clinical Medicine",
          "Nursing Services",
          "Pharmacy Department",
          "Hospital Administration",
          "Cardiology Unit",
          "Pediatrics",
          "Gynaecology Ward",
          "Emergency Room"
        ];
        const actions = [
          { text: "Queried active listings in 'Medical Scrubs'", type: "cache" },
          { text: "Refreshed stethoscope catalog (PostgreSQL read-through)", type: "read" },
          { text: "Sent bargain proposal (Socket.io room broadcast)", type: "websocket" },
          { text: "Updated transaction status (ACID Commit confirmed)", type: "write" },
          { text: "Registered active session (Redis token saved)", type: "cache" },
          { text: "Polled notifications stream (Redis cache HIT)", type: "cache" }
        ];

        const randomUser = userNames[Math.floor(Math.random() * userNames.length)];
        const randomDept = depts[Math.floor(Math.random() * depts.length)];
        const randomActionIdx = Math.floor(Math.random() * actions.length);
        const chosenAction = actions[randomActionIdx];

        const now = new Date();
        const timestampStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;

        const newLog: LogEvent = {
          id: "log_" + Date.now(),
          timestamp: timestampStr,
          user: randomUser,
          department: randomDept,
          action: chosenAction.text,
          type: chosenAction.type as any
        };

        setLogs((prevLogs) => [newLog, ...prevLogs.slice(0, 19)]);
      }

      // Tick down Redis TTL
      setRedisKeys((prevKeys) =>
        prevKeys.map((k) => ({
          ...k,
          ttl: k.ttl <= 1 ? Math.floor(300 + Math.random() * 600) : k.ttl - 1,
          hits: k.hits + Math.floor(Math.random() * 4),
        }))
      );
    }, 2500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activePreset]);

  // Load and sync administrator security logs & parameters
  useEffect(() => {
    // 1. Load security violations logs
    const loadLogs = () => {
      const stored = localStorage.getItem("lasuth_security_violations");
      if (stored) {
        setSecurityViolations(JSON.parse(stored));
      } else {
        // Populate realistic sample security logs for demonstration
        const sampleLogs: SecurityLog[] = [
          {
            id: "violation_1",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            type: "MISMATCHED_CREDENTIALS",
            message: "Mismatched Oracle Payroll signature. Staff ID 'LASUTH/NR/2024/0981' claimed, but typed mismatching Oracle token.",
            severity: "high",
            staffId: "LASUTH/NR/2024/0981",
            oracleNumber: "Oracle-Wrong",
            ipAddress: "192.168.4.112"
          },
          {
            id: "violation_2",
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            type: "POLICY_VIOLATION",
            message: "Automated scanner flagged suspicious keyphrase: 'Surgically extracted state resources' inside clinical uniform draft.",
            severity: "medium",
            staffId: "LASUTH/SD/2023/1209",
            oracleNumber: "Oracle-5521",
            ipAddress: "192.168.4.98"
          }
        ];
        localStorage.setItem("lasuth_security_violations", JSON.stringify(sampleLogs));
        setSecurityViolations(sampleLogs);
      }
    };

    // 2. Load system configuration parameters
    const storedAttempts = localStorage.getItem("lasuth_sys_max_attempts");
    if (storedAttempts) setMaxAllowedAttempts(Number(storedAttempts));

    const storedLockout = localStorage.getItem("lasuth_sys_lockout_time");
    if (storedLockout) setLockoutTimeSeconds(Number(storedLockout));

    const storedStrict = localStorage.getItem("lasuth_sys_strict_oracle");
    if (storedStrict) setOracleStrictCheck(storedStrict === "true");

    loadLogs();
  }, [activeTab]);

  const handleSaveParameters = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("lasuth_sys_max_attempts", maxAllowedAttempts.toString());
    localStorage.setItem("lasuth_sys_lockout_time", lockoutTimeSeconds.toString());
    localStorage.setItem("lasuth_sys_strict_oracle", oracleStrictCheck.toString());
    
    setSuccessMessage("System parameters committed to LASUTH central database.");
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const handleClearLogs = () => {
    localStorage.removeItem("lasuth_security_violations");
    setSecurityViolations([]);
    setSuccessMessage("Security violation ledger purged successfully.");
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const handleManualOverride = (logId: string) => {
    const updated = securityViolations.map((v) => {
      if (v.id === logId) {
        return { ...v, type: "ADMIN_OVERRIDE" as const, message: `${v.message} - OVERRIDDEN BY ADMINISTRATOR ON ${new Date().toLocaleTimeString()}`, severity: "low" as const };
      }
      return v;
    });
    localStorage.setItem("lasuth_security_violations", JSON.stringify(updated));
    setSecurityViolations(updated);
    setSuccessMessage("Manual verification override dispatched. Credentials approved.");
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  // Adjust simulation presets
  const handlePresetChange = (preset: "normal" | "handover" | "concurrency") => {
    setActivePreset(preset);
    if (preset === "normal") {
      setConcurrencyLevel(1240);
      setRequestsPerSecond(135);
      setDbLatency(6);
      setCacheHitRatio(94.2);
    } else if (preset === "handover") {
      setConcurrencyLevel(4750);
      setRequestsPerSecond(745);
      setDbLatency(15);
      setCacheHitRatio(97.8);
    } else {
      setConcurrencyLevel(2600);
      setRequestsPerSecond(310);
      setDbLatency(9);
      setCacheHitRatio(95.4);
    }
  };

  // Run high-concurrency race condition test simulation
  const runConcurrencyTest = async () => {
    if (txRunning) return;
    setTxRunning(true);
    setTxStep(1);
    setTxLog([]);

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const levelText = txLevel;

    // Step 1: Initial State
    setTxLog((prev) => [
      ...prev,
      `[0.0s] [System Initialize] Item 'Littmann Stethoscope' has Status: 'ACTIVE', Version Token: 1004.`,
      `[0.1s] [Race Condition Setup] Two rapid buyer requests received at the same millisecond!`,
      `[0.2s] Request A: Dr. Coker Olumide (Buyer 1) requests purchase at list price ₦68,000.`,
      `[0.3s] Request B: Nurse Janet Balogun (Buyer 2) requests purchase at list price ₦68,000.`
    ]);
    await sleep(2000);

    // Step 2: Database Locking
    setTxStep(2);
    setTxLog((prev) => [
      ...prev,
      `[2.0s] [DB Thread Pool Pool-1] Thread-42 spawned for Dr. Coker. Isolation: ${levelText}.`,
      `[2.2s] [DB Thread Pool Pool-1] Thread-89 spawned for Nurse Janet. Isolation: ${levelText}.`,
      `[2.4s] Thread-42 executes: 'SELECT status FROM listings WHERE id = 'mock_1' FOR UPDATE;'`,
      `[2.6s] Thread-89 executes: 'SELECT status FROM listings WHERE id = 'mock_1' FOR UPDATE;'`,
      levelText === "SERIALIZABLE"
        ? `[2.8s] [PostgreSQL Lock Manager] Lock acquired by Thread-42. Thread-89 blocks / queued waiting on Row Exclusive Lock.`
        : `[2.8s] [PostgreSQL Read Committed] Row lock acquired by Thread-42. Thread-89 bypasses lock (or reads stale status depending on MVCC version).`
    ]);
    await sleep(2500);

    // Step 3: Isolation Resolution
    setTxStep(3);
    if (levelText === "SERIALIZABLE") {
      setTxLog((prev) => [
        ...prev,
        `[4.5s] Thread-42 changes Status -> 'SOLD' for Dr. Coker and issues COMMIT.`,
        `[4.8s] [PostgreSQL Engine] Transaction A COMMITTED successfully. Double-spend prevention token updated.`,
        `[5.0s] Thread-89 is woken up. Attempts to write Status -> 'SOLD' for Nurse Janet.`,
        `[5.2s] [PostgreSQL Engine] ⚠️ SERIALIZATION FAILURE (40001): Could not serialize access due to concurrent update.`,
        `[5.4s] [DB Transaction Manager] Thread-89 transaction ROLLBACK executed immediately.`,
        `[5.6s] [WebSocket Dispatch] Dispatched fail event to Nurse Janet: 'Item already sold. Transaction cancelled gracefully.'`,
        `[5.8s] [System Outcome] SUCCESS. Absolute Ledger Integrity. Zero double-spend. 1 item sold to 1 buyer.`
      ]);
    } else {
      setTxLog((prev) => [
        ...prev,
        `[4.5s] Thread-42 changes Status -> 'SOLD' and issues COMMIT. Transaction A completed.`,
        `[4.8s] [Stale Read Alert] Thread-89 continues without transaction isolation verification.`,
        `[5.2s] Thread-89 overwrites Status -> 'SOLD' for Nurse Janet and issues COMMIT. Transaction B completed.`,
        `[5.5s] ⚠️ CRITICAL LEDGER FAILURE: Double Claim occurred! 'mock_1' was sold twice. Status shows SOLD but ledger is corrupted.`,
        `[5.8s] [System Outcome] ERROR. High concurrency race-condition corrupted database records.`
      ]);
    }
    await sleep(2000);

    // Step 4: Finished
    setTxStep(4);
    setTxRunning(false);
  };

  // Cache Flusher simulation
  const handleClearCache = () => {
    setCacheHitRatio(2.1);
    setDbLatency(42.5); // Latency spike!
    setRedisKeys([]);
    setTxLog((prev) => [...prev, `[CACHE FLUSHED] Stored Redis keys evicted. Forcing database read-through pool.`]);

    setTimeout(() => {
      // Re-populate keys over 3 seconds
      setRedisKeys([
        { key: "session:doctor_olumide:token", ttl: 3600, size: "1.2KB", hits: 1 },
        { key: "listing:mock_1:details", ttl: 600, size: "4.8KB", hits: 1 },
        { key: "listing:mock_2:details", ttl: 600, size: "5.1KB", hits: 1 },
        { key: "category:clinical_gear:count", ttl: 300, size: "0.2KB", hits: 1 },
        { key: "category:scrubs:count", ttl: 300, size: "0.2KB", hits: 1 },
      ]);
      setCacheHitRatio(94.2);
      setDbLatency(8.2);
    }, 3000);
  };

  return (
    <div id="architecture-dashboard-root" className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden flex flex-col">
      {/* HEADER SECTION */}
      <div className="bg-slate-900 text-white px-6 py-5 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-brand-accent rounded-full animate-ping"></span>
            <span className="text-[10px] bg-brand-accent/20 text-brand-accent px-2 py-0.5 rounded font-black tracking-widest uppercase">
              Production System Monitoring
            </span>
          </div>
          <h2 className="text-lg font-black tracking-tight mt-1">LASUTH ARCHITECTURE CONTROL CENTER</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">
            Virtual audit & testing dashboard for high-concurrency (1,000 - 5,000 active users)
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-slate-850 p-1 rounded-lg border border-slate-700/80">
          {[
            { id: "dashboard", label: "Overview", icon: Activity },
            { id: "websocket", label: "WebSockets", icon: Zap },
            { id: "isolation", label: "ACID Isolation", icon: Lock },
            { id: "blueprint", label: "Code Blueprints", icon: Code },
            { id: "security", label: "Security & Parameters", icon: ShieldAlert },
            { id: "unfreeze_queue", label: "Identity Overrides", icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-brand-accent text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEWPORT CONTROLS */}
      <div className="bg-slate-50 px-6 py-3 border-b border-brand-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-brand-text-muted">Simulated Shift Concurrency Presets:</span>
          <div className="inline-flex rounded-lg bg-slate-200 p-0.5 border border-slate-300">
            <button
              onClick={() => handlePresetChange("normal")}
              className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                activePreset === "normal"
                  ? "bg-white text-brand-primary shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Normal Ward Activity (~1k Active)
            </button>
            <button
              onClick={() => handlePresetChange("handover")}
              className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                activePreset === "handover"
                  ? "bg-white text-brand-primary shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Shift Handover Rush (~5k Active)
            </button>
          </div>
        </div>
        
        <div className="text-[11px] font-mono text-brand-text-muted flex items-center gap-1.5">
          <RefreshCw className="h-3.5 w-3.5 text-brand-accent animate-spin" />
          <span>Real-time feeds auto-synthesizing</span>
        </div>
      </div>

      {/* MAIN VIEWPORT PANELS */}
      <div className="p-6">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            
            {/* REAL-TIME KPIS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex flex-col relative overflow-hidden">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Ward Concurrency</span>
                <span className="text-2xl font-black tracking-tight mt-1 text-white">{concurrencyLevel.toLocaleString()} Users</span>
                <div className="text-[9px] text-brand-accent font-bold mt-1.5 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Multiplexed on {Math.ceil(concurrencyLevel / 40)} Socket Nodes
                </div>
                <div className="absolute top-2 right-2 opacity-15">
                  <Users className="h-10 w-10 text-white" />
                </div>
              </div>

              <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex flex-col relative overflow-hidden">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Read Throughput</span>
                <span className="text-2xl font-black tracking-tight mt-1 text-brand-accent">{requestsPerSecond} RPS</span>
                <div className="text-[9px] text-slate-400 font-bold mt-1.5 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Average Node Load: {(requestsPerSecond / 10).toFixed(1)}%
                </div>
                <div className="absolute top-2 right-2 opacity-15">
                  <Activity className="h-10 w-10 text-white" />
                </div>
              </div>

              <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex flex-col relative overflow-hidden">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Postgres DB Latency</span>
                <span className="text-2xl font-black tracking-tight mt-1 text-blue-400">{dbLatency} ms</span>
                <div className="text-[9px] text-slate-400 font-bold mt-1.5 flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  Connection Pool: 250 (pgBouncer Active)
                </div>
                <div className="absolute top-2 right-2 opacity-15">
                  <Database className="h-10 w-10 text-white" />
                </div>
              </div>

              <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex flex-col relative overflow-hidden">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Redis Cache Hit Ratio</span>
                <span className="text-2xl font-black tracking-tight mt-1 text-amber-400">{cacheHitRatio}%</span>
                <div className="text-[9px] text-slate-400 font-bold mt-1.5 flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  Eviction policy: volatile-lru (Active)
                </div>
                <div className="absolute top-2 right-2 opacity-15">
                  <HardDrive className="h-10 w-10 text-white" />
                </div>
              </div>
            </div>

            {/* PERFORMANCE SVG GRAPHS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Requests Chart */}
              <div className="bg-white p-5 rounded-xl border border-brand-border shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wide">Live Request Rate (RPS History)</h3>
                  <p className="text-[10px] text-brand-text-muted mt-0.5">Real-time socket query broadcasts & page views</p>
                </div>
                <div className="h-28 w-full mt-4 flex items-end">
                  <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="rpsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0"/>
                      </linearGradient>
                    </defs>
                    {/* Grid Lines */}
                    <line x1="0" y1="25" x2="300" y2="25" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="50" x2="300" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="75" x2="300" y2="75" stroke="#f1f5f9" strokeWidth="1" />

                    {/* Area path */}
                    <path
                      d={`M 0 100 ${rpsHistory
                        .map((rps, idx) => {
                          const x = (idx / (rpsHistory.length - 1)) * 300;
                          const y = 100 - (rps / 1000) * 100; // max scale 1000 rps
                          return `L ${x} ${y}`;
                        })
                        .join(" ")} L 300 100 Z`}
                      fill="url(#rpsGrad)"
                    />
                    
                    {/* Line path */}
                    <path
                      d={rpsHistory
                        .map((rps, idx) => {
                          const x = (idx / (rpsHistory.length - 1)) * 300;
                          const y = 100 - (rps / 1000) * 100;
                          return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                        })
                        .join(" ")}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div className="flex justify-between text-[8px] font-mono text-brand-text-muted mt-2 border-t border-slate-100 pt-2">
                  <span>15 seconds ago</span>
                  <span>Scale: 0 - 1000 RPS</span>
                  <span>Live Feed</span>
                </div>
              </div>

              {/* Latency Chart */}
              <div className="bg-white p-5 rounded-xl border border-brand-border shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wide">Database Response Latency (ms)</h3>
                  <p className="text-[10px] text-brand-text-muted mt-0.5">Average read-through latency from PostgreSQL disk or cache</p>
                </div>
                <div className="h-28 w-full mt-4 flex items-end">
                  <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="latGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1e40af" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="#1e40af" stopOpacity="0.0"/>
                      </linearGradient>
                    </defs>
                    {/* Grid Lines */}
                    <line x1="0" y1="25" x2="300" y2="25" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="50" x2="300" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="75" x2="300" y2="75" stroke="#f1f5f9" strokeWidth="1" />

                    {/* Area path */}
                    <path
                      d={`M 0 100 ${latencyHistory
                        .map((lat, idx) => {
                          const x = (idx / (latencyHistory.length - 1)) * 300;
                          const y = 100 - (lat / 50) * 100; // max scale 50ms
                          return `L ${x} ${y}`;
                        })
                        .join(" ")} L 300 100 Z`}
                      fill="url(#latGrad)"
                    />
                    
                    {/* Line path */}
                    <path
                      d={latencyHistory
                        .map((lat, idx) => {
                          const x = (idx / (latencyHistory.length - 1)) * 300;
                          const y = 100 - (lat / 50) * 100;
                          return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                        })
                        .join(" ")}
                      fill="none"
                      stroke="#1e40af"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div className="flex justify-between text-[8px] font-mono text-brand-text-muted mt-2 border-t border-slate-100 pt-2">
                  <span>15 seconds ago</span>
                  <span>Scale: 0 - 50ms Latency</span>
                  <span>Live Feed</span>
                </div>
              </div>
            </div>

            {/* INTERACTIVE METRIC SIMULATORS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Redis Session Monitor */}
              <div className="md:col-span-2 bg-slate-900 text-slate-100 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                      <HardDrive className="h-4 w-4" />
                      REDIS IN-MEMORY CACHE REGISTER
                    </h3>
                    <button
                      onClick={handleClearCache}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[9px] rounded uppercase cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Flush Redis Keys
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    By bypassing Postgres reads on listing queries and sessions, Redis handles 1,000s of requests in sub-millisecond speeds.
                  </p>
                </div>

                <div className="mt-4 border border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-[11px] font-mono">
                    <thead className="bg-slate-850 text-slate-400">
                      <tr>
                        <th className="p-2 border-b border-slate-800">Cache Key Name</th>
                        <th className="p-2 border-b border-slate-800">Type</th>
                        <th className="p-2 border-b border-slate-800">Data Size</th>
                        <th className="p-2 border-b border-slate-800 text-right">Hits</th>
                        <th className="p-2 border-b border-slate-800 text-right">TTL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {redisKeys.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-rose-400 text-xs animate-pulse">
                            🚨 Cache completely empty! Experiencing raw database fetch latency...
                          </td>
                        </tr>
                      ) : (
                        redisKeys.map((item) => (
                          <tr key={item.key} className="hover:bg-slate-850/50">
                            <td className="p-2 text-brand-accent font-bold">{item.key}</td>
                            <td className="p-2 text-slate-400">string</td>
                            <td className="p-2 text-slate-400">{item.size}</td>
                            <td className="p-2 text-right text-slate-200">{item.hits.toLocaleString()}</td>
                            <td className="p-2 text-right text-amber-400">{item.ttl}s</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 text-[10px] text-slate-400 italic">
                  Cache configuration: Cache-aside strategy with 10-minute maximum listing TTL.
                </div>
              </div>

              {/* Live activity feed */}
              <div className="bg-slate-900 text-slate-100 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
                    <Terminal className="h-4 w-4 text-brand-accent" />
                    LIVE PORTAL LOGS
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">Real-time actions in the Lagos State hospital closed portal.</p>
                </div>

                <div className="mt-4 bg-slate-950 p-3 rounded-lg border border-slate-850 font-mono text-[10px] h-48 overflow-y-auto space-y-2 select-all scrollbar-none">
                  {logs.map((log) => (
                    <div key={log.id} className="leading-normal flex items-start gap-1">
                      <span className="text-slate-500 flex-shrink-0">[{log.timestamp}]</span>
                      <span className={`flex-shrink-0 font-bold ${
                        log.type === "write"
                          ? "text-blue-400"
                          : log.type === "cache"
                          ? "text-amber-400"
                          : log.type === "websocket"
                          ? "text-emerald-400"
                          : "text-purple-400"
                      }`}>
                        [{log.type.toUpperCase()}]
                      </span>
                      <span>
                        <span className="text-slate-300 font-semibold">{log.user} ({log.department.split(" ")[0]}):</span>{" "}
                        <span className="text-slate-100">{log.action}</span>
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-2 text-[9px] text-slate-500 font-mono text-right">
                  Logs stream connected: ws://localhost:3000/api/monitor
                </div>
              </div>

            </div>

          </div>
        )}

        {activeTab === "websocket" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white p-6 rounded-xl border border-brand-border flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-brand-primary uppercase tracking-wide flex items-center gap-2">
                    <Zap className="h-5 w-5 text-brand-accent" />
                    Socket.io Real-Time Event Dispatch Architecture
                  </h3>
                  <p className="text-xs text-brand-text-muted mt-2 leading-relaxed">
                    Rather than costly database polling, this system employs WebSockets (`socket.io`) connected to a clustered Node.js backend. State updates are broadcasted to dedicated room identifiers instantly.
                  </p>
                </div>

                {/* Event stream visual demo */}
                <div className="mt-6 border border-brand-border rounded-xl p-4 bg-slate-50">
                  <div className="text-[11px] font-bold text-brand-primary uppercase tracking-wider mb-3">
                    Active Multiplexed Channel Rooms:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-3.5 rounded-lg border border-brand-border">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-800 font-mono">room: "marketplace_feed"</span>
                        <span className="h-2 w-2 bg-brand-accent rounded-full animate-pulse"></span>
                      </div>
                      <p className="text-[10px] text-brand-text-muted mt-1 leading-normal">
                        Broadcasts real-time listing updates, price revisions, and items going "sold" to all 5,000 active devices in the hospital.
                      </p>
                      <div className="mt-3 text-[9px] bg-slate-50 p-2 rounded text-brand-primary font-mono truncate">
                        io.to("marketplace_feed").emit("listing_sold", id);
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-lg border border-brand-border">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-800 font-mono">room: "chat:listing_12"</span>
                        <span className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></span>
                      </div>
                      <p className="text-[10px] text-brand-text-muted mt-1 leading-normal">
                        Isolated secure chatroom multiplexed for private negotiation between verified seller & prospective staff buyer.
                      </p>
                      <div className="mt-3 text-[9px] bg-slate-50 p-2 rounded text-brand-primary font-mono truncate">
                        io.to("chat:listing_12").emit("new_message", msg);
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 text-white rounded-xl p-4 mt-6">
                  <div className="text-xs font-bold text-brand-accent uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    Scale Optimization Built-In:
                  </div>
                  <ul className="mt-2 text-[11px] text-slate-300 space-y-1.5 list-disc pl-4 leading-relaxed">
                    <li>
                      <strong className="text-white">Redis Adapter for Pub/Sub clustering:</strong> Allows multiple Node.js server container replicas on Cloud Run to seamlessly synchronize and broadcast messages to client sockets across node boundaries.
                    </li>
                    <li>
                      <strong className="text-white">Connection multiplexing:</strong> Keeps a single persistent TCP pipeline open, preventing the mobile device battery drainage common with rapid AJAX polling on on-call ward shifts.
                    </li>
                    <li>
                      <strong className="text-white">Heartbeat & Backpressure check:</strong> Automatically discards idle sockets (120-second timeout) to free up memory footprint.
                    </li>
                  </ul>
                </div>
              </div>

              {/* WebSocket diagnostics mock telemetry */}
              <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">WebSocket Cluster State</h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">WS Server Cluster Pool</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-3 w-3 bg-brand-accent rounded-full"></div>
                        <span className="text-sm font-black">4 Server Nodes Active</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Total Active Sockets</span>
                      <span className="block text-2xl font-black mt-0.5 text-brand-accent">{(concurrencyLevel * 1.1).toFixed(0)} Connects</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Load Balance Distribution</span>
                      <div className="space-y-1.5">
                        {[
                          { name: "Node-Run-A (europe-west1)", pct: 24, load: "Low" },
                          { name: "Node-Run-B (europe-west1)", pct: 26, load: "Low" },
                          { name: "Node-Run-C (europe-west1)", pct: 23, load: "Low" },
                          { name: "Node-Run-D (europe-west1)", pct: 27, load: "Medium" },
                        ].map((node) => (
                          <div key={node.name} className="text-[11px]">
                            <div className="flex justify-between text-slate-300 mb-0.5 font-mono text-[9px]">
                              <span>{node.name}</span>
                              <span>{node.pct}% load</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-brand-accent h-full" style={{ width: `${node.pct * 3}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4 mt-6 text-[10px] text-slate-400 leading-normal">
                  Our WebSockets leverage compression headers (deflate-frame) to decrease payload sizes by up to 65%.
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "isolation" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-brand-border">
              <h3 className="text-sm font-extrabold text-brand-primary uppercase tracking-wide flex items-center gap-2">
                <Lock className="h-5 w-5 text-brand-accent" />
                Double-Claim Prevention via PostgreSQL Transaction Isolation Levels
              </h3>
              <p className="text-xs text-brand-text-muted mt-2 leading-relaxed">
                In a peer-to-peer hospital staff market handling up to 5,000 concurrent users, race conditions are a high-risk factor. For example, two nurses might tap the "Claim Handover" button at the exact same millisecond. If the database uses default weak isolation levels, BOTH claims could proceed (Double Claim anomaly).
              </p>

              {/* Transaction Isolation level switcher */}
              <div className="bg-slate-50 p-4 rounded-xl border border-brand-border mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-primary tracking-wide block">Configure Database Isolation Level:</span>
                  <div className="inline-flex rounded-lg bg-slate-200 p-0.5 border border-slate-300 mt-1">
                    <button
                      onClick={() => setTxLevel("READ_COMMITTED")}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        txLevel === "READ_COMMITTED"
                          ? "bg-rose-600 text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      READ COMMITTED (Standard Lock - Vulnerable to Race Conditions)
                    </button>
                    <button
                      onClick={() => setTxLevel("SERIALIZABLE")}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        txLevel === "SERIALIZABLE"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      SERIALIZABLE (ACID Proof - Robust Isolation)
                    </button>
                  </div>
                </div>

                <button
                  disabled={txRunning}
                  onClick={runConcurrencyTest}
                  className={`px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50`}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${txRunning ? "animate-spin" : ""}`} />
                  Run Millisecond Race Simulation
                </button>
              </div>

              {/* SIMULATOR STAGE TRACKER */}
              {txStep > 0 && (
                <div className="mt-6 border border-brand-border rounded-xl p-5 bg-slate-900 text-white">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                    <span className="text-xs font-bold text-brand-accent uppercase tracking-wider">
                      SIMULATING CO-OCCURRENT CLAIMS AT HIGH SCALE
                    </span>
                    <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                      Isolation: {txLevel}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold mb-6">
                    {[
                      { step: 1, label: "1. Tapping Claim", color: "bg-blue-500" },
                      { step: 2, label: "2. Lock Request", color: "bg-purple-500" },
                      { step: 3, label: "3. Conflict Resolver", color: "bg-amber-500" },
                      { step: 4, label: "4. Lock Finalized", color: "bg-emerald-500" },
                    ].map((s) => (
                      <div
                        key={s.step}
                        className={`py-2 rounded-lg transition-all ${
                          txStep === s.step
                            ? `${s.color} text-white scale-105 shadow-md`
                            : txStep > s.step
                            ? "bg-slate-800 text-slate-400 line-through"
                            : "bg-slate-850 text-slate-600"
                        }`}
                      >
                        {s.label}
                      </div>
                    ))}
                  </div>

                  {/* CLI Output */}
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 font-mono text-[11px] leading-relaxed min-h-[160px] space-y-1 select-all">
                    {txLog.map((line, idx) => (
                      <div key={idx} className={line.includes("⚠️") ? "text-rose-400" : line.includes("SUCCESS") ? "text-emerald-400" : "text-slate-300"}>
                        {line}
                      </div>
                    ))}
                    {txRunning && (
                      <div className="text-brand-accent animate-pulse mt-2 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 bg-brand-accent rounded-full animate-ping"></span>
                        Executing lock checks inside PostgreSQL Transaction Engine...
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-200 mt-6 text-xs leading-relaxed">
                <strong>Why PostgreSQL SERIALIZABLE is the Gold Standard:</strong> When two transactions perform conflictual operations (like reading listing status as 'ACTIVE' then writing status to 'SOLD'), serializable isolation checks if the execution could have produced a non-serializable schedule. If a conflict cycle is detected, PostgreSQL rolls back one transaction with a serialization failure error. The application gracefully catches this and informs the user immediately, maintaining absolute safety.
              </div>
            </div>
          </div>
        )}

        {activeTab === "blueprint" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-brand-border">
              <h3 className="text-sm font-extrabold text-brand-primary uppercase tracking-wide flex items-center gap-2">
                <Code className="h-5 w-5 text-brand-accent" />
                Production Deployment Scalability blueprint
              </h3>
              <p className="text-xs text-brand-text-muted mt-2 leading-relaxed font-medium">
                To move from the prototype to a full enterprise-grade system serving 5,000+ staff on multiple ward shifts, here are the exact structural deployment config files needed:
              </p>

              {/* DOCKER & BACKEND CONFIG TAB */}
              <div className="mt-6 space-y-4">
                
                {/* Docker Compose Cluster */}
                <div className="border border-brand-border rounded-xl overflow-hidden">
                  <div className="bg-slate-900 text-slate-200 px-4 py-2 text-xs font-bold font-mono flex justify-between items-center">
                    <span>docker-compose.prod.yml</span>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-brand-accent">Cluster Replica</span>
                  </div>
                  <pre className="bg-slate-950 p-4 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed select-all">
{`version: '3.8'

services:
  # 1. PostgreSQL with Transaction Locks & pooling
  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_DB: lasuth_marketplace
      POSTGRES_USER: admin_staff
      POSTGRES_PASSWORD: \${DB_SECURE_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    command: ["postgres", "-c", "default_transaction_isolation=serializable", "-c", "max_connections=500"]
    ports:
      - "5432:5432"

  # 2. Redis Cache & WebSocket Session sync
  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --requirepass \${REDIS_SECURE_PASSWORD} --maxmemory 2gb --maxmemory-policy volatile-lru
    ports:
      - "6379:6379"

  # 3. Node.js backend replicas scaled automatically behind proxy
  app-node-1:
    build: .
    restart: always
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://admin_staff:\${DB_SECURE_PASSWORD}@postgres:5432/lasuth_marketplace
      - REDIS_URL=redis://:\${REDIS_SECURE_PASSWORD}@redis:6379
      - PORT=3000
    depends_on:
      - postgres
      - redis

  # 4. Load Balancer (Nginx) to route traffic to Socket nodes
  nginx-load-balancer:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - app-node-1`}
                  </pre>
                </div>

                {/* NestJS / Express Serializable Transaction Lock Code */}
                <div className="border border-brand-border rounded-xl overflow-hidden">
                  <div className="bg-slate-900 text-slate-200 px-4 py-2 text-xs font-bold font-mono flex justify-between items-center">
                    <span>server/controllers/swap.controller.ts</span>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-blue-400">Serializable Transaction</span>
                  </div>
                  <pre className="bg-slate-950 p-4 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed select-all">
{`import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { DatabaseService } from '../database.service';

@Controller('api/handovers')
export class HandoverController {
  constructor(private readonly db: DatabaseService) {}

  @Post('claim')
  async claimItem(@Body() body: { listingId: string; buyerId: string }) {
    // Execute inside an isolated SERIALIZABLE SQL block
    return this.db.transaction(async (tx) => {
      // 1. Acquire explicit row-level update lock
      const listing = await tx.query(
        'SELECT * FROM listings WHERE id = $1 FOR UPDATE', 
        [body.listingId]
      );

      if (!listing || listing.status === 'sold') {
        throw new Error('Item is already claimed or sold!');
      }

      // 2. Generate secured handover credentials
      const handoverCode = \`L-\${Math.floor(1000 + Math.random() * 9000)}\`;

      // 3. Commit swap ledger entries
      await tx.query(
        'INSERT INTO transactions(listing_id, buyer_id, handover_code, status) VALUES($1, $2, $3, $4)',
        [body.listingId, body.buyerId, handoverCode, 'pending_handover']
      );

      // 4. Update status to sold
      await tx.query(
        'UPDATE listings SET status = $1 WHERE id = $2',
        ['sold', body.listingId]
      );

      return { success: true, handoverCode };
    });
  }
}`}
                  </pre>
                </div>

              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-brand-border">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h3 className="text-sm font-extrabold text-brand-primary uppercase tracking-wide flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-red-600 animate-pulse" />
                    LASUTH Internal Safety Gateway & Verification Administration
                  </h3>
                  <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">
                    System Administrators can oversee automated anti-scam locking flags, audit Oracle Payroll ID mismatch attempts, and configure security parameters.
                  </p>
                </div>
                {successMessage && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold px-3 py-2 rounded-xl animate-bounce">
                    {successMessage}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. PARAMETRIC SECURITY CONTROLS (Col span 5) */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-4">
                      <Settings className="h-4 w-4 text-slate-600" />
                      Dynamic Gatekeeper Rules
                    </h4>
                    
                    <form onSubmit={handleSaveParameters} className="space-y-4 text-xs font-semibold text-slate-700">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                          Max Verification Attempts before Lockout
                        </label>
                        <select
                          value={maxAllowedAttempts}
                          onChange={(e) => setMaxAllowedAttempts(Number(e.target.value))}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:outline-none focus:border-brand-accent"
                        >
                          <option value={1}>1 Attempt (High Risk Paranoia)</option>
                          <option value={2}>2 Attempts (Strict Ward Protocol)</option>
                          <option value={3}>3 Attempts (Recommended Standard)</option>
                          <option value={5}>5 Attempts (Relaxed)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                          Lockout Cool-Off Duration (Seconds)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min={10}
                            max={600}
                            value={lockoutTimeSeconds}
                            onChange={(e) => setLockoutTimeSeconds(Number(e.target.value))}
                            className="flex-1 bg-white border border-slate-300 rounded-lg p-2 text-xs focus:outline-none focus:border-brand-accent"
                          />
                          <span className="bg-slate-200 px-3 py-2 rounded-lg text-[10px] font-bold flex items-center">
                            Sec
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-1">
                          Controls the countdown duration for locked-out devices or browsers.
                        </p>
                      </div>

                      <div className="space-y-3 pt-2">
                        <label className="flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={oracleStrictCheck}
                            onChange={(e) => setOracleStrictCheck(e.target.checked)}
                            className="mt-0.5 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                          />
                          <div>
                            <span className="block text-[11px] font-bold text-slate-800">Enforce Strict Oracle Mapping</span>
                            <span className="block text-[9px] text-slate-400 font-medium mt-0.5 leading-normal">
                              Enables real-time verification matching the Oracle Payroll number directly to extracted Staff ID data.
                            </span>
                          </div>
                        </label>

                        <label className="flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={onboardingCheckActive}
                            onChange={(e) => setOnboardingCheckActive(e.target.checked)}
                            className="mt-0.5 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                          />
                          <div>
                            <span className="block text-[11px] font-bold text-slate-800">Active Hospital ID OCR Screening</span>
                            <span className="block text-[9px] text-slate-400 font-medium mt-0.5 leading-normal">
                              Utilizes Gemini-powered intelligence to automatically extract and read details from photo scans of Staff IDs.
                            </span>
                          </div>
                        </label>

                        <label className="flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={ipBanishmentActive}
                            onChange={(e) => setIpBanishmentActive(e.target.checked)}
                            className="mt-0.5 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                          />
                          <div>
                            <span className="block text-[11px] font-bold text-slate-800">Dynamic IP Threat Bannister</span>
                            <span className="block text-[9px] text-slate-400 font-medium mt-0.5 leading-normal">
                              Temporarily bans client IP addresses on hospital intranet that exhibit repeated lockouts.
                            </span>
                          </div>
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="w-full mt-4 bg-slate-950 hover:bg-slate-900 text-white font-bold py-2 rounded-lg transition-all text-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Commit Security Rules
                      </button>
                    </form>
                  </div>

                  <div className="bg-red-50/50 border border-red-200 p-4 rounded-xl text-xs leading-relaxed text-red-800">
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                      Critical Administrative Alert
                    </div>
                    Any manual verification override permanently signs the audit log with your digital Administrator ID and can be reviewed during quarterly internal audits.
                  </div>
                </div>

                {/* 2. REAL-TIME AUDIT LOGS LEDGER (Col span 7) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex justify-between items-center bg-slate-100 p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-600">
                      Security Log Ledger ({securityViolations.length} Entries)
                    </span>
                    {securityViolations.length > 0 && (
                      <button
                        onClick={handleClearLogs}
                        className="text-[10px] text-red-600 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Clear Audit Trail
                      </button>
                    )}
                  </div>

                  {securityViolations.length === 0 ? (
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-400">
                      <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto stroke-[1.2] mb-2" />
                      <h4 className="font-bold text-slate-700 text-xs">No active violations on record</h4>
                      <p className="text-[10px] max-w-xs mx-auto mt-0.5">
                        The gatekeeper is quiet. All hospital login and scanning operations conform with institution payroll records.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                      {securityViolations.map((violation) => {
                        const isHigh = violation.severity === "high";
                        const isMedium = violation.severity === "medium";
                        const isOverride = violation.type === "ADMIN_OVERRIDE";
                        
                        return (
                          <div
                            key={violation.id}
                            className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all ${
                              isOverride
                                ? "bg-slate-50 border-slate-200 text-slate-600"
                                : isHigh
                                ? "bg-red-50/50 border-red-200 text-red-950"
                                : isMedium
                                ? "bg-amber-50/50 border-amber-200 text-amber-950"
                                : "bg-slate-50 border-slate-200 text-slate-700"
                            }`}
                          >
                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-mono text-[9px] bg-white/80 px-1.5 py-0.5 rounded shadow-sm border border-slate-200">
                                  {new Date(violation.timestamp).toLocaleTimeString()}
                                </span>
                                <span
                                  className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                    isOverride
                                      ? "bg-slate-200 text-slate-700"
                                      : isHigh
                                      ? "bg-red-100 text-red-800"
                                      : isMedium
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {violation.type.replace("_", " ")}
                                </span>
                              </div>

                              <p className="text-[11px] font-bold mt-2 leading-relaxed">
                                {violation.message}
                              </p>

                              <div className="grid grid-cols-2 gap-2 mt-3 font-mono text-[9px] text-slate-500 bg-white/50 p-2 rounded border border-slate-200/50">
                                {violation.staffId && (
                                  <div>
                                    <span className="text-slate-400 font-semibold block">Staff ID Account:</span>
                                    <span className="font-bold text-slate-700">{violation.staffId}</span>
                                  </div>
                                )}
                                {violation.oracleNumber && (
                                  <div>
                                    <span className="text-slate-400 font-semibold block">Oracle Inputted:</span>
                                    <span className="font-bold text-slate-700">{violation.oracleNumber}</span>
                                  </div>
                                )}
                                {violation.ipAddress && (
                                  <div className="col-span-2 mt-1">
                                    <span className="text-slate-400 font-semibold block">Intranet Origin IP:</span>
                                    <span className="font-bold text-slate-700">{violation.ipAddress}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {!isOverride && violation.type === "MISMATCHED_CREDENTIALS" && (
                              <button
                                onClick={() => handleManualOverride(violation.id)}
                                className="w-fit self-end bg-slate-900 hover:bg-slate-850 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer hover:scale-[1.02]"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                Approve Staff / Overrule Mismatch
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

        {activeTab === "unfreeze_queue" && (
          <div className="bg-white rounded-2xl shadow-md border border-slate-200/80 p-6 space-y-6">
            <div className="border-b border-slate-150 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                  <Users className="h-5 w-5 text-blue-600" />
                  Biometric Override Verification Portal
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Side-by-side comparison of scanned LASUTH staff badges with secondary national documents to clear biometric freeze blocks.
                </p>
              </div>
              <div className="bg-blue-50 text-blue-800 text-[10px] font-bold px-3 py-1 rounded-full border border-blue-100 flex items-center gap-1">
                <span>AI Matching Engine:</span>
                <span className="font-mono">ONLINE</span>
              </div>
            </div>

            {/* List of frozen users */}
            {(() => {
              // Retrieve user from localStorage to check if they are frozen or have uploaded docs
              const savedUserStr = localStorage.getItem("lasuth_user");
              const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;
              
              const isLocalUserFrozen = savedUser && (savedUser.status === "FROZEN_FLAGGED" || savedUser.fallbackDocSubmitted);
              
              // Seed simulated queue users
              const defaultQueue = [
                {
                  uid: "user_sim_doc_mismatch_1",
                  displayName: "Dr. Kunle Balogun",
                  department: "Surgery",
                  staffId: "STF-SURG-8910",
                  oracleNumber: "Oracle-8910",
                  status: "FROZEN_FLAGGED",
                  confidenceScore: 74.20,
                  lasuthIdUrl: "https://secure-docs.lasuth.org/staff_ids/STF-SURG-8910.jpg",
                  fallbackDocumentType: "NIN",
                  fallbackDocName: "NIN_Slip_Balogun_78912.pdf",
                  fallbackDocumentUrl: "https://secure-docs.lasuth.org/mocks/nin_mock_card.jpg",
                  fallbackDocSubmitted: true,
                  reason: "Liveness scan failed: Video screen re-projection (spoofing) suspected."
                },
                {
                  uid: "user_sim_doc_mismatch_2",
                  displayName: "Nurse Janet Adebayo",
                  department: "Pediatrics",
                  staffId: "STF-PED-4521",
                  oracleNumber: "Oracle-4521",
                  status: "FROZEN_FLAGGED",
                  confidenceScore: 68.50,
                  lasuthIdUrl: "https://secure-docs.lasuth.org/staff_ids/STF-PED-4521.jpg",
                  fallbackDocumentType: "PASSPORT",
                  fallbackDocName: "Nigerian_Passport_Adebayo.jpg",
                  fallbackDocumentUrl: "https://secure-docs.lasuth.org/mocks/passport_mock.jpg",
                  fallbackDocSubmitted: true,
                  reason: "Face Match Similarity below threshold: poor ambient hospital lighting glare."
                }
              ];

              if (isLocalUserFrozen) {
                // If the logged in user is frozen, add them to the top of the queue for immediate developer testing feedback!
                const exists = defaultQueue.some(u => u.uid === savedUser.uid);
                if (!exists) {
                  defaultQueue.unshift({
                    uid: savedUser.uid,
                    displayName: savedUser.displayName,
                    department: savedUser.department,
                    staffId: savedUser.staffId,
                    oracleNumber: savedUser.oracleNumber,
                    status: savedUser.status,
                    confidenceScore: savedUser.confidenceScore || 74.20,
                    lasuthIdUrl: savedUser.lasuthIdUrl || "https://secure-docs.lasuth.org/staff_ids/" + savedUser.staffId + ".jpg",
                    fallbackDocumentType: savedUser.fallbackDocumentType || "NIN",
                    fallbackDocName: savedUser.fallbackDocName || "Uploaded_ID_Scan.jpg",
                    fallbackDocumentUrl: savedUser.fallbackDocumentUrl || "https://secure-docs.lasuth.org/mocks/nin_mock_card.jpg",
                    fallbackDocSubmitted: savedUser.fallbackDocSubmitted || false,
                    reason: "Webcam spoof pattern detected. Confidence below 95.00% threshold."
                  });
                } else {
                  // update fallback doc info
                  const idx = defaultQueue.findIndex(u => u.uid === savedUser.uid);
                  defaultQueue[idx].fallbackDocSubmitted = savedUser.fallbackDocSubmitted;
                  defaultQueue[idx].fallbackDocName = savedUser.fallbackDocName;
                  defaultQueue[idx].fallbackDocumentType = savedUser.fallbackDocumentType;
                  defaultQueue[idx].status = savedUser.status;
                }
              }

              // Filter to show those requiring review
              const queueItems = defaultQueue.filter(u => u.status === "FROZEN_FLAGGED");

              const handleUnfreeze = async (userItem: any) => {
                try {
                  const response = await fetch("/api/admin/verify/unfreeze", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      userId: userItem.uid,
                      adminId: "admin_dr_olumide",
                      reviewNotes: "Override pipeline manual validation. Verified secondary government identity document matches payroll credentials."
                    })
                  });
                  const result = await response.json();
                  if (result.success) {
                    alert(`SUCCESS: Vendor account for ${userItem.displayName} successfully UNFROZEN. All marketplace operations restored.`);
                    
                    // If target user is current user, update localStorage and refresh state
                    if (savedUser && savedUser.uid === userItem.uid) {
                      const updatedUser = { 
                        ...savedUser, 
                        status: "ACTIVE" as const, 
                        verified: true,
                        fallbackDocSubmitted: false 
                      };
                      localStorage.setItem("lasuth_user", JSON.stringify(updatedUser));
                      window.location.reload(); // Hard reload to transition views smoothly
                    } else {
                      // Update simulated items
                      userItem.status = "ACTIVE";
                      userItem.fallbackDocSubmitted = false;
                      window.location.reload();
                    }
                  }
                } catch (err) {
                  console.error(err);
                }
              };

              return (
                <div className="space-y-6">
                  {queueItems.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50/55 animate-fade-in">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">Audit Queue Clear</p>
                      <p className="text-[10px] text-slate-400">All biometric mismatches have been manually cleared by System Administrators.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {queueItems.map((u) => {
                        const isUploaded = u.fallbackDocSubmitted;
                        return (
                          <div key={u.uid} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-slate-300 transition-all bg-slate-50/20">
                            {/* Card Header Info */}
                            <div className="bg-slate-50 p-4 border-b border-slate-150 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                              <div>
                                <span className="text-[10px] uppercase font-mono tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-extrabold border border-rose-100">
                                  STATUS: {u.status}
                                </span>
                                <h4 className="text-xs font-black text-slate-800 uppercase mt-1.5">{u.displayName}</h4>
                                <p className="text-[10px] text-slate-500 font-medium">
                                  {u.department} • Staff ID: {u.staffId} • Oracle: {u.oracleNumber}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Biometric Failure Flag</span>
                                <span className="text-xs font-extrabold text-rose-600 font-mono">
                                  {u.confidenceScore}% Similarity Match
                                </span>
                                <p className="text-[9px] text-slate-500 leading-none max-w-xs sm:text-right mt-0.5 italic">
                                  {u.reason}
                                </p>
                              </div>
                            </div>

                            {/* side-by-side comparison */}
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Left: Extracted badge details / reference photo */}
                              <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-slate-150">
                                <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                                  <span className="text-[10px] font-black uppercase text-slate-500">1. Official ID Badge Reference</span>
                                  <span className="text-[9px] uppercase font-mono tracking-widest text-emerald-600 font-bold bg-emerald-50 px-1.5 rounded">Extracted OCR</span>
                                </div>
                                <div className="space-y-2">
                                  <div className="aspect-video w-full rounded-lg bg-slate-900 border border-slate-200 flex flex-col justify-between p-3 relative overflow-hidden text-white font-mono text-[9px] shadow-sm">
                                    <div className="absolute inset-0 bg-blue-800/15"></div>
                                    <div className="flex justify-between items-start z-10">
                                      <div>
                                        <h5 className="font-extrabold text-[10px] text-blue-200">LASUTH STAFF IDENTITY</h5>
                                        <p className="text-[8px] opacity-75">Clinical Onboarding Card</p>
                                      </div>
                                      <div className="bg-white/10 px-1 py-0.5 rounded text-[8px] border border-white/20">Active</div>
                                    </div>
                                    <div className="z-10 py-1.5 flex gap-2">
                                      <div className="w-8 h-8 rounded-full bg-slate-300 shrink-0 border border-white/40 flex items-center justify-center text-slate-700 font-black">
                                        {u.displayName.split(" ").slice(-1)[0][0]}
                                      </div>
                                      <div>
                                        <p className="font-bold text-[9px] text-white uppercase">{u.displayName}</p>
                                        <p className="text-[8px] opacity-80">{u.department}</p>
                                      </div>
                                    </div>
                                    <div className="flex justify-between text-[8px] opacity-90 border-t border-white/10 pt-1 z-10">
                                      <span>ID: {u.staffId}</span>
                                      <span>PAYROLL MATCH</span>
                                    </div>
                                  </div>
                                  <div className="text-[9px] text-slate-500 font-mono space-y-0.5 bg-slate-50 p-2 rounded border border-slate-150">
                                    <div><strong className="text-slate-600">Liveness verification status:</strong> <span className="text-rose-600 font-bold">MISMATCH</span></div>
                                    <div><strong className="text-slate-600">IP Handshake:</strong> 192.168.4.103</div>
                                    <div><strong className="text-slate-600">Failure Cause:</strong> Non-live photo edge glare mismatch</div>
                                  </div>
                                </div>
                              </div>

                              {/* Right: Secondary Override documents (Uploaded NIN or passport) */}
                              <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-slate-150">
                                <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                                  <span className="text-[10px] font-black uppercase text-slate-500">2. Fallback Override Document</span>
                                  <span className="text-[9px] uppercase font-mono tracking-widest text-blue-600 font-bold bg-blue-50 px-1.5 rounded">Secondary Credential</span>
                                </div>
                                <div className="space-y-2">
                                  {isUploaded ? (
                                    <div className="space-y-2">
                                      <div className="aspect-video w-full rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center p-3 relative overflow-hidden border-2 border-dashed border-blue-200">
                                        <FileText className="h-7 w-7 text-blue-600 mb-1.5" />
                                        <span className="text-[10px] font-bold font-mono text-slate-800">{u.fallbackDocName || u.fallbackDocumentType}</span>
                                        <span className="text-[8px] uppercase tracking-wider font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded mt-1.5 animate-pulse">
                                          Document Loaded Side-by-Side
                                        </span>
                                      </div>
                                      <div className="bg-emerald-50 border border-emerald-150 p-2.5 rounded-lg text-[9px] text-emerald-800 leading-normal font-sans">
                                        🤖 <strong>Clinical AI Document Matcher:</strong> Secondary identity photo contains 97.2% facial feature match with Lagos State payroll records. Spoof threat cleared. Highly recommended to unfreeze.
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="aspect-video w-full rounded-lg bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center p-4 text-center">
                                      <AlertTriangle className="h-6 w-6 text-amber-500 mb-1" />
                                      <span className="text-[10px] font-bold text-slate-600 uppercase">Awaiting Document Upload</span>
                                      <p className="text-[9px] text-slate-400 mt-0.5 max-w-xs">
                                        User has not yet uploaded a fallback NIN slip or passport to clear this freeze flag.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Manual Unfreeze override actions */}
                            <div className="bg-slate-50 p-3 border-t border-slate-150 flex justify-end gap-2.5">
                              <button
                                onClick={() => handleUnfreeze(u)}
                                disabled={!isUploaded}
                                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-[10px] px-4 py-2 rounded-lg flex items-center gap-1 cursor-pointer transition-all uppercase tracking-wider shadow-sm"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Manually Override Mismatch & Unfreeze</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

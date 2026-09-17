"use client";

import { useEffect, useState } from "react";
import { clockIn, clockOut, getFilteredEmployeeReport } from "@/store/attendance/attendance";
import { employeeManualUpdate } from "@/store/attendance/attendance"; 
import { LogOut, LogIn, Calendar as CalendarIcon, AlertCircle, Clock, FileText, XCircle, CheckCircle2, X } from "lucide-react";
import toast from "react-hot-toast";
import { useEmployeeAuth } from "@/context/EmployeeAuthContext";

const getLocalDateString = (date: Date) => {
  const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return d.toISOString().split("T")[0];
};

const RING_RADIUS = 80;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function EmployeeClock() {
   const { employee } = useEmployeeAuth(); 
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [confirmModal, setConfirmModal] = useState<"in" | "out" | null>(null);
  
  // Manual Update Modal State
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualStatus, setManualStatus] = useState("leave");
  const [manualNotes, setManualNotes] = useState("");

  // Supplementary week-at-a-glance data (Dynamic from backend)
  const [weekRecords, setWeekRecords] = useState<Record<string, any>>({});

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchTodayStatus = async () => {
    const today = getLocalDateString(new Date());
    const res = await getFilteredEmployeeReport(`startDate=${today}&endDate=${today}`);
    if (res?.success && res.weeklyData[today]) {
      setTodayRecord(res.weeklyData[today]);
    } else {
      setTodayRecord(null);
    }
  };

  useEffect(() => {
    fetchTodayStatus();
  }, []);

  const fetchWeekStatus = async () => {
    try {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 6);
      const res = await getFilteredEmployeeReport(`startDate=${getLocalDateString(start)}&endDate=${getLocalDateString(end)}`);
      if (res?.success && res.weeklyData) {
        setWeekRecords(res.weeklyData);
      }
    } catch {
      // Graceful fail
    }
  };

  useEffect(() => {
    fetchWeekStatus();
  }, [todayRecord]);

  const handleClockAction = async () => {
    if (!confirmModal) return;
    setLoadingAction(true);
    if (confirmModal === "in") {
      const res = await clockIn();
      if (res?.success) await fetchTodayStatus();
    } else {
      const res = await clockOut();
      if (res?.success) await fetchTodayStatus();
    }
    setLoadingAction(false);
    setConfirmModal(null);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualNotes.trim()) return toast.error("Please provide a reason.");
    
    setLoadingAction(true);
    const today = getLocalDateString(new Date());
    const res = await employeeManualUpdate({ dateString: today, status: manualStatus, notes: manualNotes });
    
    if (res?.success) {
      setManualModalOpen(false);
      setManualNotes("");
      toast.success(res.message ?? "Status requested successfully");
      await fetchTodayStatus();
    }
    setLoadingAction(false);
  };

  const hasClockedInToday = !!todayRecord?.clockIn;
  const hasClockedOutToday = !!todayRecord?.clockOut;

  // --- STRICT & BULLETPROOF RECORD STATES ---
  const isManualState = todayRecord && !todayRecord.clockIn;
  
  const isPending = isManualState && !todayRecord.markedByAdminId;
  const isApproved = isManualState && !!todayRecord.markedByAdminId && ['leave', 'workfromhome'].includes(todayRecord.status);
  const isDenied = isManualState && !!todayRecord.markedByAdminId && todayRecord.status === 'absent' && todayRecord.notes && todayRecord.notes.includes('[REJECTED]');
  const isAdminForced = isManualState && !isApproved && !isDenied && !!todayRecord.markedByAdminId;

  // --- Presentation helpers ---
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const formatTime = (value: string | Date) =>
    new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // UPDATED TO CALCULATE SECONDS
  const formatDuration = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const clockInDate = todayRecord?.clockIn ? new Date(todayRecord.clockIn) : null;
  const clockOutDate = todayRecord?.clockOut ? new Date(todayRecord.clockOut) : null;
  const elapsedMs = clockInDate ? (clockOutDate ?? currentTime).getTime() - clockInDate.getTime() : 0;
  const elapsedLabel = clockInDate ? formatDuration(elapsedMs) : null;
  const shiftProgressPct = clockInDate ? Math.min(100, (elapsedMs / (8 * 60 * 60 * 1000)) * 100) : 0;
  const ringDashoffset = RING_CIRCUMFERENCE * (1 - shiftProgressPct / 100);

  const manualStatusInfo = isPending
    ? {
        icon: Clock,
        iconBg: "bg-amber-50",
        iconColor: "text-amber-600",
        title: "Pending review",
        description: `You requested ${todayRecord?.status === "workfromhome" ? "work from home" : "leave"} for today — waiting on admin approval.`,
      }
    : isApproved
    ? {
        icon: CheckCircle2,
        iconBg: "bg-green-50",
        iconColor: "text-green-600",
        title: "Approved",
        description: `Your ${todayRecord?.status === "workfromhome" ? "work from home" : "leave"} request for today was approved.`,
      }
    : isDenied
    ? {
        icon: XCircle,
        iconBg: "bg-red-50",
        iconColor: "text-red-600",
        title: "Request denied",
        description: "Your admin rejected your request and marked today as absent.",
      }
    : isAdminForced
    ? {
        icon: AlertCircle,
        iconBg: "bg-gray-100",
        iconColor: "text-gray-600",
        title: "Set by admin",
        description: `Your admin recorded today as ${todayRecord?.status === "workfromhome" ? "WFH" : String(todayRecord?.status).replace("_", " ")}.`,
      }
    : null;

  // Last 7 days dynamic calculation
  const todayStr = getLocalDateString(currentTime);
  const chartDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = getLocalDateString(d);
    const rec = weekRecords[dateStr];
    let hours = 0;
    if (rec?.clockIn) {
      const start = new Date(rec.clockIn).getTime();
      const end = rec.clockOut ? new Date(rec.clockOut).getTime() : dateStr === todayStr ? currentTime.getTime() : start;
      hours = Math.max(0, (end - start) / 3600000);
    }
    return {
      dateStr,
      isToday: dateStr === todayStr,
      label: dateStr === todayStr ? "Today" : d.toLocaleDateString(undefined, { weekday: "short" }),
      hours,
    };
  });
  const maxWeekHours = Math.max(8, ...chartDays.map((d) => d.hours));
  const weekTotalMs = chartDays.reduce((sum, d) => sum + d.hours, 0) * 3600000;

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300 max-w-2xl mx-auto mt-6 sm:mt-10">

      {/* HERO: Light themed "on the clock" ring OR non-clocked-in state */}
      {hasClockedInToday ? (
        <div className="bg-white rounded-[28px] shadow-lg border border-gray-100 p-6 sm:p-9 relative overflow-hidden">
          
          <div className="relative flex items-start justify-between gap-3 mb-7 sm:mb-9">
            <div>
              <p className="text-base font-bold text-gray-900">{getGreeting()} <span className=" text-[var(--color-primary)]">{employee?.name}</span></p>
              <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                <CalendarIcon size={14} className="text-[var(--color-primary)]" />
                {currentTime.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 ${hasClockedOutToday ? "bg-gray-100 text-gray-600 border border-gray-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
              {!hasClockedOutToday && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
              {hasClockedOutToday ? "Shift complete" : "On duty"}
            </span>
          </div>

          <div className="relative w-44 h-44 sm:w-52 sm:h-52 mx-auto">
            <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
              <circle cx="90" cy="90" r={RING_RADIUS} fill="none" stroke="#f1f5f9" strokeWidth="10" />
              <circle
                cx="90"
                cy="90"
                r={RING_RADIUS}
                fill="none"
                stroke="url(#shiftRingGradient)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={ringDashoffset}
                className="transition-all duration-1000 ease-linear"
              />
              <defs>
                <linearGradient id="shiftRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-primary-light)" />
                  <stop offset="100%" stopColor="var(--color-primary)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {/* UPDATED TEXT SIZE TO FIT SECONDS */}
              <span className="text-2xl sm:text-3xl font-bold text-gray-900 font-mono tabular-nums">{elapsedLabel}</span>
              <span className="text-xs text-gray-500 font-semibold mt-1.5">since {formatTime(todayRecord.clockIn)}</span>
            </div>
          </div>

          <div className="relative flex flex-col items-center mt-7 sm:mt-9">
            {hasClockedOutToday ? (
              <>
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <LogOut size={20} />
                </span>
                <span className="text-xs font-semibold text-gray-500 mt-2">Shift complete</span>
              </>
            ) : (
              <>
                <button
                  onClick={() => setConfirmModal("out")}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100 shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:bg-red-100 transition-all cursor-pointer"
                >
                  <LogOut size={20} />
                </button>
                <span className="text-xs font-semibold text-gray-600 mt-2">Clock out</span>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[28px] shadow-lg border border-gray-100 p-6 sm:p-9 relative">
          {!manualStatusInfo && (
            <span className="absolute top-6 right-6 sm:top-9 sm:right-9 inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600">
              Not started
            </span>
          )}

          <div className="mb-8 sm:mb-10">
            <p className="text-base font-bold text-gray-900">{getGreeting()}</p>
            <p className="text-sm text-[var(--color-gray)] flex items-center gap-1.5 mt-1">
              <CalendarIcon size={14} className="text-[var(--color-primary)]" />
              {currentTime.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl sm:text-6xl font-bold text-gray-900 tracking-tight font-mono tabular-nums">
              {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
          </div>

          {!manualStatusInfo && (
            <div className="space-y-3 w-full max-w-md mx-auto mt-8 sm:mt-10">
              <button
                onClick={() => setConfirmModal("in")}
                className="w-full flex items-center justify-center gap-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold py-4 sm:py-5 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-base sm:text-lg cursor-pointer"
              >
                <LogIn size={22} /> Clock in now
              </button>
              <button
                onClick={() => setManualModalOpen(true)}
                className="w-full text-sm font-semibold text-[var(--color-gray)] hover:text-[var(--color-primary)] transition-colors cursor-pointer pt-2"
              >
                Not coming in today?
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manual-state detail */}
      {manualStatusInfo && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-6 flex items-start gap-4 animate-in fade-in zoom-in-95">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${manualStatusInfo.iconBg}`}>
            <manualStatusInfo.icon size={20} className={manualStatusInfo.iconColor} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900">{manualStatusInfo.title}</p>
            <p className="text-sm text-[var(--color-gray)] mt-0.5 leading-relaxed">{manualStatusInfo.description}</p>
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-primary-lighter)] text-[var(--color-primary-dark)] mb-3">
            <LogIn size={18} />
          </span>
          <p className="text-xs font-semibold text-[var(--color-gray)]">Clocked in</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 font-mono tabular-nums mt-0.5">
            {clockInDate ? formatTime(clockInDate) : "—"}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-gray-600 mb-3">
            <Clock size={18} />
          </span>
          <p className="text-xs font-semibold text-[var(--color-gray)]">Hours today</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 font-mono tabular-nums mt-0.5">
            {/* UPDATED FALLBACK */}
            {elapsedLabel ?? "0h 0m 0s"}
          </p>
        </div>
      </div>

      {/* This week (Dynamically fetched from backend!) */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-7">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-bold text-gray-900">This week</p>
          <p className="text-xs font-semibold text-[var(--color-gray)]">{formatDuration(weekTotalMs)} worked</p>
        </div>
        <div className="flex items-end justify-between gap-2 h-28 sm:h-32">
          {chartDays.map((d) => (
            <div key={d.dateStr} className="flex-1 flex flex-col items-center justify-end gap-2 h-full">
              <div
                className={`w-full max-w-[18px] rounded-full transition-all duration-500 ${
                  d.isToday ? "bg-[var(--color-primary)]" : "bg-[var(--color-primary-light)]"
                }`}
                style={{ height: `${Math.max(4, (d.hours / maxWeekHours) * 100)}%` }}
              />
              <span className={`text-[11px] font-semibold ${d.isToday ? "text-[var(--color-primary-dark)]" : "text-[var(--color-gray)]"}`}>
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CLOCK IN/OUT CONFIRMATION MODAL */}
      {confirmModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200">
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-9 h-1 rounded-full bg-gray-300" />
            </div>
            <div className="p-6 sm:p-7">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    confirmModal === "in"
                      ? "bg-[var(--color-primary-lighter)] text-[var(--color-primary-darker)]"
                      : "bg-red-50 text-[var(--color-destructive)]"
                  }`}
                >
                  {confirmModal === "in" ? <LogIn size={18} /> : <LogOut size={18} />}
                </span>
                <h3 className="text-lg font-bold text-gray-900">
                  Confirm {confirmModal === "in" ? "clock in" : "clock out"}
                </h3>
              </div>
              <p className="text-sm text-[var(--color-gray)] mb-6 leading-relaxed">
                You&apos;re about to {confirmModal === "in" ? "clock in" : "clock out"} at{" "}
                <span className="inline-block font-mono font-semibold text-gray-900 bg-gray-100 rounded-md px-1.5 py-0.5">
                  {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                .
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 px-4 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClockAction}
                  disabled={loadingAction}
                  className={`flex-1 px-4 py-3.5 font-semibold text-white rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center ${
                    confirmModal === "in"
                      ? "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]"
                      : "bg-[var(--color-destructive)] hover:bg-red-600"
                  }`}
                >
                  {loadingAction ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    "Confirm"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL REQUEST MODAL (LEAVE / WFH) */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-9 h-1 rounded-full bg-gray-300" />
            </div>

            <div className="px-6 pt-4 sm:pt-6 pb-5 flex items-start justify-between gap-3 shrink-0 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <FileText size={16} />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Update today&apos;s status</h3>
                  <p className="text-xs text-[var(--color-gray)] mt-0.5">
                    {currentTime.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} · needs admin approval
                  </p>
                </div>
              </div>
              <button
                onClick={() => setManualModalOpen(false)}
                className="text-gray-400 hover:text-red-500 cursor-pointer bg-gray-50 hover:bg-red-50 p-2 rounded-full transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="p-6 space-y-5 overflow-y-auto">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">What&apos;s the plan?</label>
                <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setManualStatus("leave")}
                    className={`py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                      manualStatus === "leave" ? "bg-white text-[var(--color-primary-darker)] shadow-sm" : "text-[var(--color-gray)]"
                    }`}
                  >
                    On leave
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualStatus("workfromhome")}
                    className={`py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                      manualStatus === "workfromhome" ? "bg-white text-[var(--color-primary-darker)] shadow-sm" : "text-[var(--color-gray)]"
                    }`}
                  >
                    Work from home
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  required
                  rows={3}
                  placeholder="Let your admin know what's going on..."
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all resize-none text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loadingAction}
                className="w-full py-3.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex justify-center items-center cursor-pointer"
              >
                {loadingAction ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  "Send request"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
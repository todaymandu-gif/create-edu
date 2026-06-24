"use client";

import React, { useEffect } from "react";

export type ThemeType = "zero-one" | "nh";
export type RoleType = "admin" | "user-a" | "user-b" | "guest";

interface ThemeSelectorProps {
  theme: ThemeType;
  onChangeTheme: (theme: ThemeType) => void;
  role: RoleType;
  onChangeRole: (role: RoleType) => void;
}

export default function ThemeSelector({
  theme,
  onChangeTheme,
  role,
  onChangeRole,
}: ThemeSelectorProps) {
  // Apply theme to document element
  useEffect(() => {
    if (theme === "zero-one") {
      document.documentElement.style.setProperty("--primary-color", "#3b82f6");
      document.documentElement.style.setProperty("--primary-hover", "#1d4ed8");
      document.documentElement.style.setProperty(
        "--primary-glow",
        "rgba(59, 130, 246, 0.15)"
      );
    } else {
      document.documentElement.style.setProperty("--primary-color", "#10b981");
      document.documentElement.style.setProperty("--primary-hover", "#047857");
      document.documentElement.style.setProperty(
        "--primary-glow",
        "rgba(16, 185, 129, 0.15)"
      );
    }
  }, [theme]);

  return (
    <div className="w-full flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900/60 border border-slate-800 p-4 rounded-2xl backdrop-blur-md relative z-20">
      
      {/* 1. Theme Selector */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          행사 테마 전환:
        </span>
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onChangeTheme("zero-one")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              theme === "zero-one"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-blue-400"></span>
            제로원 테마 (Blue)
          </button>
          <button
            onClick={() => onChangeTheme("nh")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              theme === "nh"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            NH농협은행 테마 (Green)
          </button>
        </div>
      </div>

      {/* 2. Role Simulator Toggle */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          접속 권한 시뮬레이션:
        </span>
        <div className="flex flex-wrap bg-slate-950 p-1 rounded-xl border border-slate-800 w-full md:w-auto">
          <button
            onClick={() => onChangeRole("admin")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 flex-1 md:flex-initial ${
              role === "admin"
                ? "bg-slate-800 text-white border border-slate-700 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            🔑 관리자 (Admin)
          </button>
          <button
            onClick={() => onChangeRole("user-a")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 flex-1 md:flex-initial ${
              role === "user-a"
                ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            👤 이용자 A (회의실 1 배정)
          </button>
          <button
            onClick={() => onChangeRole("user-b")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 flex-1 md:flex-initial ${
              role === "user-b"
                ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            👤 이용자 B (회의실 A 배정)
          </button>
          <button
            onClick={() => onChangeRole("guest")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 flex-1 md:flex-initial ${
              role === "guest"
                ? "bg-slate-900 border border-slate-800 text-slate-300"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            👀 외부인 (Unassigned)
          </button>
        </div>
      </div>

    </div>
  );
}

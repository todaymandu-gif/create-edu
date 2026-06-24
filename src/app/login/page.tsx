"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, login, loading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/admin");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    const success = await login(email, password);
    if (success) {
      router.push("/admin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6fa] text-[#191f28] p-6 relative">
      
      {/* Background soft glow decoration */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-glow rounded-full blur-3xl opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-md bg-white border-0 shadow-lg rounded-[32px] p-8 relative z-10">
        
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-[#191f28] flex items-center justify-center gap-1.5">
            🔑 <span className="text-brand-primary font-black">SCALEUP</span> 관제 로그인
          </h2>
          <p className="text-sm font-semibold text-gray-400 mt-1">
            관리자 보안 검증을 수행합니다
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs px-4 py-3 rounded-2xl mb-6 font-bold">
            ⚠️ {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              관리자 아이디
            </label>
            <input
              type="text"
              required
              placeholder="admin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 h-12 bg-gray-100 border-0 rounded-2xl text-sm text-[#191f28] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/45 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              비밀번호
            </label>
            <input
              type="password"
              required
              placeholder="1234"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 h-12 bg-gray-100 border-0 rounded-2xl text-sm text-[#191f28] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/45 transition-all"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-brand-primary hover:bg-brand-hover text-white text-sm font-bold transition-all shadow-lg shadow-brand-primary/15 flex items-center justify-center gap-2"
            >
              {loading ? "보안 인증 중..." : "인증 및 대시보드 진입"}
            </button>
          </div>
        </form>

        {/* Sandbox Test Box */}
        <div className="mt-8 border-t border-gray-100 pt-6">
          <div className="bg-gray-50 border-0 rounded-2xl p-4 text-3xs text-gray-450 leading-relaxed font-semibold">
            💡 <strong>로컬 시뮬레이션 관리자 계정:</strong><br />
            아이디: <code className="text-slate-800 font-mono">admin</code><br />
            비밀번호: <code className="text-slate-800 font-mono">1234</code><br />
            <span className="mt-1 block text-gray-400 font-normal">
              * Firebase Auth 미연동 시 해당 정보로 로그인하면 로컬 관리자 권한 세션이 모의 셋업됩니다.
            </span>
          </div>
        </div>

        {/* Back to User View button */}
        <div className="text-center mt-5">
          <button
            onClick={() => router.push("/")}
            className="text-xs text-gray-400 hover:text-gray-600 underline font-bold transition-colors"
          >
            ← 일반 이용자 모니터링 화면으로 이동
          </button>
        </div>

      </div>
    </div>
  );
}

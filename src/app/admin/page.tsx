"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useRooms, Room, checkIsDelayed } from "@/hooks/useRooms";
import ReservationModal from "@/components/ReservationModal";
import { ThemeType } from "@/components/ThemeSelector";
import RoomTimeline from "@/components/RoomTimeline";

export default function AdminPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const { rooms, preAssignRoom, startProgress, releaseRoom, loading: roomsLoading } = useRooms();
  const router = useRouter();

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [currentTheme, setCurrentTheme] = useState<ThemeType>("zero-one");

  // Protect route
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Synchronize dynamic theme CSS custom variables
  useEffect(() => {
    if (currentTheme === "zero-one") {
      document.documentElement.style.setProperty("--primary-color", "#3182f6");
      document.documentElement.style.setProperty("--primary-hover", "#1b64da");
      document.documentElement.style.setProperty("--primary-glow", "rgba(49, 130, 246, 0.05)");
    } else {
      document.documentElement.style.setProperty("--primary-color", "#10b981");
      document.documentElement.style.setProperty("--primary-hover", "#047857");
      document.documentElement.style.setProperty("--primary-glow", "rgba(16, 185, 129, 0.05)");
    }
  }, [currentTheme]);

  // Live clock
  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString("ko-KR", { hour12: false }));
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("ko-KR", { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (authLoading || roomsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4f6fa] text-[#191f28]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-brand-primary"></div>
          <p className="text-sm font-bold text-gray-500">인증 정보 및 데이터 로드 중...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const delayedRooms = rooms.filter((r) => checkIsDelayed(r));
  const hasDelays = delayedRooms.length > 0;

  const assignedCount = rooms.filter((r) => r.status === "assigned").length;
  const activeCount = rooms.filter((r) => r.status === "active").length;

  const largeRooms = rooms.filter((r) => r.type === "large");
  const smallRooms = rooms.filter((r) => r.type === "small");

  const currentSelectedRoom = selectedRoom
    ? rooms.find((r) => r.id === selectedRoom.id) || null
    : null;

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-[#191f28] flex flex-col p-6 font-sans relative overflow-x-hidden transition-all duration-500">
      
      {/* Background decoration glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-glow rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-500"></div>

      {/* Red Alert warning banner for admin */}
      {hasDelays && (
        <div className="max-w-7xl w-full mx-auto mb-6">
          <div className="bg-rose-50 border border-rose-100 text-rose-700 px-5 py-4 rounded-3xl flex items-center justify-between shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="text-xl">🚨</span>
              <div className="text-sm font-semibold">
                <span>입실 지연 경고:</span>{" "}
                현재 <span className="underline decoration-2 font-black">{delayedRooms.map((r) => r.name).join(", ")}</span>의 입실 예정 시간이 지났으나 진행이 시작되지 않았습니다.
              </div>
            </div>
            <button
              onClick={() => handleRoomClick(delayedRooms[0])}
              className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-xl transition-all shadow shadow-rose-600/10"
            >
              강제 조정
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="relative z-10 max-w-7xl w-full mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/80 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#191f28] flex items-center gap-3">
            <span className="text-brand-primary font-black">SCALEUP 통합 관제</span>
            <span className="text-gray-300 font-light">|</span>
            <span className="text-xs px-2.5 py-1 rounded-md font-bold bg-rose-50 border border-rose-100 text-rose-500 uppercase tracking-widest">
              ADMIN VIEW
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-semibold">
            보안 로그인 완료 | 계정: {user.email}
          </p>
        </div>

        {/* Dashboard Status Info */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 text-xs">
          <div className="flex items-center gap-1.5 px-3 border-r border-gray-150 text-xs font-bold text-gray-400">
            대기: <strong className="text-[#191f28]">{assignedCount}</strong>
          </div>
          <div className="flex items-center gap-1.5 px-3 text-xs font-bold text-gray-400">
            사용 중: <strong className="text-[#191f28]">{activeCount}</strong>
          </div>
        </div>

        {/* Header Action / Clock / Logout */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-4xs font-bold text-gray-400">기준 시각</div>
            <div className="text-sm font-mono font-bold text-gray-500">{currentTime || "00:00:00"}</div>
          </div>
          
          <button
            onClick={() => setCurrentTheme(currentTheme === "zero-one" ? "nh" : "zero-one")}
            className="text-xs font-bold px-3 py-2 bg-white shadow-sm rounded-xl border border-gray-100 hover:bg-gray-50 transition-all text-gray-650"
          >
            🎨 테마: {currentTheme === "zero-one" ? "제로원" : "농협은행"}
          </button>
          
          <button
            onClick={handleLogout}
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-rose-500 transition-colors border border-gray-150"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="relative z-10 max-w-7xl w-full mx-auto grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        
        {/* Left: Map layout (col-span-1) */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-sm font-extrabold tracking-tight text-gray-500">
              ⚙️ 회의실 사전 배정 현황 (통합 미니맵)
            </h2>
            <span className="text-3xs text-gray-455 font-semibold">카드를 클릭하여 이용자를 사전 배정하세요.</span>
          </div>

          <div className="relative border-0 rounded-[32px] bg-white p-6 shadow-md overflow-hidden grid grid-cols-4 grid-rows-3 gap-5 h-[620px]">
            {/* Grid overlay */}
            <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 opacity-[0.015] pointer-events-none">
              {Array.from({ length: 72 }).map((_, i) => (
                <div key={i} className="border border-brand-primary"></div>
              ))}
            </div>

            {/* Large Meeting Rooms */}
            <div className="col-span-1 row-span-3 flex flex-col justify-between gap-4 h-full">
              {largeRooms.map((room) => {
                const isAvailable = room.status === "available";
                const isAssigned = room.status === "assigned";
                const isActive = room.status === "active";
                const isDelayed = checkIsDelayed(room);

                return (
                  <button
                    key={room.id}
                    onClick={() => handleRoomClick(room)}
                    className={`flex-1 rounded-2xl text-left p-4 flex flex-col justify-between transition-all duration-300 relative group overflow-hidden ${
                      isAvailable
                        ? "bg-gray-50 border border-gray-100 hover:border-brand-primary/30 hover:bg-gray-100/50 shadow-sm"
                        : isAssigned
                        ? isDelayed
                          ? "animate-red-flash border-0 shadow-lg"
                          : "bg-amber-500/5 border border-amber-500/20 hover:border-amber-400/40"
                        : "bg-brand-glow border border-brand-primary/20 hover:border-brand-primary/40 shadow-lg shadow-brand-primary/5"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-3xs uppercase tracking-wider font-extrabold">Large Room</span>
                        <div className={`h-2.5 w-2.5 rounded-full ${
                          isAvailable
                            ? "bg-gray-300"
                            : isAssigned
                            ? isDelayed
                              ? "bg-rose-500 animate-ping"
                              : "bg-amber-500"
                            : "bg-brand-primary animate-pulse"
                        }`}></div>
                      </div>
                      <h4 className="text-base font-extrabold text-[#191f28] mt-1.5 group-hover:text-brand-primary transition-colors">
                        {room.name}
                      </h4>
                      <p className="text-3xs font-semibold text-gray-400">10인 | TV 스크린</p>
                    </div>

                    <div className="mt-4 border-t border-gray-100 pt-2 w-full flex flex-col justify-end text-2xs min-h-[36px]">
                      {isAvailable ? (
                        <span className="text-brand-primary font-extrabold">배정 등록하기 +</span>
                      ) : (
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between text-[#191f28] font-extrabold truncate">
                            <span>{room.userName}</span>
                            <span className="text-3xs text-gray-400 font-normal">({room.position})</span>
                          </div>
                          <div className="text-3xs text-gray-400 flex justify-between font-mono font-bold">
                            <span>PIN: {room.roomPin}</span>
                            <span>{room.startTime} - {room.endTime}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Center Lounge */}
            <div className="col-span-2 row-span-2 border border-dashed border-gray-200 rounded-[24px] p-6 flex flex-col items-center justify-center bg-gray-50/30 relative">
              <div className="absolute top-4 left-4 text-3xs text-gray-400 font-bold uppercase tracking-widest">
                Lounge &amp; Open Area
              </div>
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-brand-primary/5 border border-brand-primary/10 flex items-center justify-center mx-auto mb-2">
                  <span className="text-brand-primary text-xs">☕</span>
                </div>
                <h4 className="text-xs font-bold text-gray-500">오픈 스퀘어 라운지</h4>
                <p className="text-4xs text-gray-400 font-medium">자유 네트워킹 &amp; 공유 업무 공간</p>
              </div>
            </div>

            {/* Seminar Hall */}
            <div className="col-span-1 row-span-2 border border-dashed border-gray-200 rounded-[24px] p-5 flex flex-col justify-between bg-gray-50/40 relative">
              <div className="absolute top-3 left-3 text-3xs text-gray-400 font-bold uppercase tracking-widest">
                Seminar Hall
              </div>
              <div className="flex-1 flex flex-col items-center justify-center gap-2">
                <div className="w-full py-2 bg-indigo-55 border border-indigo-100/10 rounded-xl text-center text-3xs text-indigo-500 font-bold">
                  미디어월 세미나 스크린
                </div>
                <div className="grid grid-cols-4 gap-1 w-full px-2 opacity-15 mt-2">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="h-3 bg-gray-400 rounded-sm"></div>
                  ))}
                </div>
              </div>
              <div className="text-center text-4xs text-gray-450 font-semibold">
                행사 대관 전용 공간
              </div>
            </div>

            {/* Bottom Row: Small Rooms */}
            <div className="col-start-2 col-span-3 flex justify-between gap-4 h-full">
              {smallRooms.map((room) => {
                const isAvailable = room.status === "available";
                const isAssigned = room.status === "assigned";
                const isActive = room.status === "active";
                const isDelayed = checkIsDelayed(room);

                return (
                  <button
                    key={room.id}
                    onClick={() => handleRoomClick(room)}
                    className={`flex-1 rounded-2xl text-left p-3.5 flex flex-col justify-between transition-all duration-300 relative group overflow-hidden ${
                      isAvailable
                        ? "bg-gray-50 border border-gray-100 hover:border-brand-primary/30 hover:bg-gray-100/50 shadow-sm"
                        : isAssigned
                        ? isDelayed
                          ? "animate-red-flash border-0 shadow-lg"
                          : "bg-amber-500/5 border border-amber-500/20 hover:border-amber-400/40"
                        : "bg-brand-glow border border-brand-primary/20 hover:border-brand-primary/40 shadow-lg shadow-brand-primary/5"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-3xs uppercase tracking-wider font-extrabold">Small Room</span>
                        <div className={`h-2 w-2 rounded-full ${
                          isAvailable
                            ? "bg-gray-300"
                            : isAssigned
                            ? isDelayed
                              ? "bg-rose-500 animate-ping"
                              : "bg-amber-500"
                            : "bg-brand-primary animate-pulse"
                        }`}></div>
                      </div>
                      <h4 className="text-sm font-extrabold text-[#191f28] mt-1.5 group-hover:text-brand-primary transition-colors">
                        {room.name}
                      </h4>
                      <p className="text-3xs font-semibold text-gray-400">4인 소회의실</p>
                    </div>

                    <div className="mt-3 border-t border-gray-100 pt-1.5 w-full flex flex-col justify-end text-2xs min-h-[32px]">
                      {isAvailable ? (
                        <span className="text-brand-primary font-bold">배정 등록 +</span>
                      ) : (
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between text-[#191f28] font-extrabold truncate">
                            <span>{room.userName}</span>
                            {isDelayed && <span className="text-rose-500 font-extrabold animate-pulse">지연</span>}
                          </div>
                          <div className="text-3xs text-gray-400 flex justify-between font-mono font-bold">
                            <span>PIN: {room.roomPin}</span>
                            <span>{room.startTime}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Detail Monitoring List */}
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold tracking-tight text-gray-500">
            📑 실시간 모니터링 상세 목록 (보안해제)
          </h2>

          <div className="border-0 rounded-[32px] bg-white p-6 shadow-md h-[620px] flex flex-col justify-between">
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {rooms.map((room) => {
                const isAvailable = room.status === "available";
                const isAssigned = room.status === "assigned";
                const isActive = room.status === "active";
                const isDelayed = checkIsDelayed(room);

                return (
                  <div
                    key={room.id}
                    onClick={() => handleRoomClick(room)}
                    className={`p-4 bg-white border rounded-2xl shadow-sm hover:shadow-md cursor-pointer flex flex-col gap-2 transition-all group ${
                      isDelayed ? "border-rose-400" : "border-gray-150"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${
                            isAvailable
                              ? "bg-gray-300"
                              : isAssigned
                              ? isDelayed
                                ? "bg-rose-500 animate-pulse"
                                : "bg-amber-500"
                              : "bg-brand-primary animate-pulse"
                          }`}
                        ></span>
                        <h4 className="text-sm font-extrabold text-[#191f28] group-hover:text-brand-primary transition-colors">
                          {room.name}
                        </h4>
                      </div>
                      
                      <span className={`font-extrabold text-4xs px-2 py-0.5 rounded-full border ${
                        isAvailable
                          ? "text-gray-400 bg-gray-50 border-gray-100"
                          : isActive
                          ? "text-brand-primary bg-brand-primary/10 border-brand-primary/20"
                          : isDelayed
                          ? "text-rose-500 bg-rose-50 border-rose-100 animate-pulse"
                          : "text-amber-500 bg-amber-50 border-amber-100"
                      }`}>
                        {isAvailable ? "배정 가능" : isActive ? "이용 중" : isDelayed ? "입실 지연" : "배정 대기"}
                      </span>
                    </div>

                    {!isAvailable && (
                      <div className="text-3xs text-gray-500 space-y-1.5 bg-gray-50 p-3 rounded-xl font-semibold">
                        <div className="flex justify-between">
                          <span>배정자:</span>
                          <span className="font-extrabold text-[#191f28]">{room.userName} ({room.position})</span>
                        </div>
                        <div className="flex justify-between">
                          <span>연락처:</span>
                          <span className="font-extrabold text-[#191f28]">{room.contact}</span>
                        </div>
                        <div className="flex justify-between font-mono">
                          <span>PIN: <strong className="text-brand-primary font-black">{room.roomPin}</strong></span>
                          <span>{room.startTime} - {room.endTime}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Admin Console helper inside card to align heights */}
            <div className="mt-4 border-t border-gray-150 pt-4 space-y-1.5 text-3xs text-gray-450 font-semibold">
              <div className="text-gray-500 font-extrabold flex items-center gap-1 mb-1">
                <span>⚡</span>
                <span>관제 콘솔</span>
              </div>
              <p className="leading-relaxed">
                관리자 모드에서는 회의실별 연락처와 4자리 PIN번호를 즉시 조회하고, 강제 입실/퇴실 처리를 현장에서 원클릭 수행할 수 있습니다.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Timeline Section */}
      <div className="mt-8 relative z-10 max-w-7xl w-full mx-auto">
        <RoomTimeline
          rooms={rooms}
          onRoomClick={handleRoomClick}
          isAdmin={true}
        />
      </div>

      {/* ReservationModal Overlay for Admin Role */}
      <ReservationModal
        room={currentSelectedRoom}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPreAssign={preAssignRoom}
        onStartProgress={startProgress}
        onRelease={releaseRoom}
        currentRole="admin"
      />
    </div>
  );
}

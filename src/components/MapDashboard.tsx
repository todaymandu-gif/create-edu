"use client";

import React, { useState, useEffect } from "react";
import { useRooms, Room, checkIsDelayed } from "@/hooks/useRooms";
import ReservationModal from "./ReservationModal";
import ThemeSelector, { ThemeType, RoleType } from "./ThemeSelector";

export default function MapDashboard() {
  const { rooms, preAssignRoom, startProgress, releaseRoom, loading } = useRooms();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  
  // Theme & Role simulation states
  const [currentTheme, setCurrentTheme] = useState<ThemeType>("zero-one");
  const [currentRole, setCurrentRole] = useState<RoleType>("admin");

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

  // Sync selectedRoom state with live rooms update
  const currentSelectedRoom = selectedRoom
    ? rooms.find((r) => r.id === selectedRoom.id) || null
    : null;

  // Masking helpers for map display
  const maskName = (name: string) => {
    if (!name) return "";
    if (name.length <= 2) return name[0] + "*";
    return name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
  };

  const maskContact = (num: string) => {
    if (!num) return "";
    const parts = num.split("-");
    if (parts.length === 3) {
      return `${parts[0]}-****-${parts[2]}`;
    }
    return "***-****-****";
  };

  // Find all currently delayed rooms
  const delayedRooms = rooms.filter((r) => checkIsDelayed(r));
  const hasDelays = delayedRooms.length > 0;

  // Counts
  const availableCount = rooms.filter((r) => r.status === "available").length;
  const assignedCount = rooms.filter((r) => r.status === "assigned").length;
  const activeCount = rooms.filter((r) => r.status === "active").length;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-brand-primary"></div>
          <p className="text-sm font-medium text-slate-400">시스템 현황 로드 중...</p>
        </div>
      </div>
    );
  }

  const largeRooms = rooms.filter((r) => r.type === "large");
  const smallRooms = rooms.filter((r) => r.type === "small");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-6 font-sans relative overflow-x-hidden transition-all duration-500">
      
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-glow rounded-full blur-3xl pointer-events-none transition-all duration-500"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Admin Red Alert Top Banner */}
      {currentRole === "admin" && hasDelays && (
        <div className="max-w-7xl w-full mx-auto mb-6 animate-bounce">
          <div className="bg-rose-600/90 border border-rose-500 text-white px-5 py-3 rounded-2xl flex items-center justify-between shadow-xl shadow-rose-950/20 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="text-xl">🚨</span>
              <div className="text-sm">
                <span className="font-bold">입실 지연 경고:</span>{" "}
                현재 <span className="underline decoration-2 font-semibold">{delayedRooms.map((r) => r.name).join(", ")}</span> 회의실의 입실 예정 시간이 지났으나 진행이 시작되지 않았습니다.
              </div>
            </div>
            <button
              onClick={() => handleRoomClick(delayedRooms[0])}
              className="text-xs font-bold bg-white text-rose-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              관제 상태 확인
            </button>
          </div>
        </div>
      )}

      {/* Title & ThemeSelector Header */}
      <header className="relative z-10 max-w-7xl w-full mx-auto mb-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-3">
              <span className="bg-gradient-to-r from-brand-primary to-cyan-400 bg-clip-text text-transparent">SCALEUP CENTER</span>
              <span className="text-slate-500 font-light">|</span>
              <span className="text-base font-medium text-slate-400">브랜드 맞춤형 회의실 예약 관제</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              실시간 상태 동기화 및 이용자 프라이버시 보호 기능 제공
            </p>
          </div>

          {/* Counts metrics */}
          <div className="flex items-center gap-4 bg-slate-900/60 border border-slate-800 p-2.5 rounded-2xl backdrop-blur-md">
            <div className="flex items-center gap-2 px-3 border-r border-slate-800">
              <span className="h-2 w-2 rounded-full bg-slate-500"></span>
              <span className="text-xs text-slate-400">배정 가능: <strong className="text-slate-100 font-bold">{availableCount}</strong></span>
            </div>
            <div className="flex items-center gap-2 px-3 border-r border-slate-800">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              <span className="text-xs text-slate-400">사전 대기: <strong className="text-slate-100 font-bold">{assignedCount}</strong></span>
            </div>
            <div className="flex items-center gap-2 px-3">
              <span className="h-2 w-2 rounded-full bg-brand-primary animate-pulse"></span>
              <span className="text-xs text-slate-400">이용 중: <strong className="text-slate-100 font-bold">{activeCount}</strong></span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-500">실시간 시각</div>
            <div className="text-lg font-mono font-bold text-slate-300 tracking-wider">{currentTime || "00:00:00"}</div>
          </div>
        </div>

        {/* Dynamic Theme & Role Bar */}
        <ThemeSelector
          theme={currentTheme}
          onChangeTheme={setCurrentTheme}
          role={currentRole}
          onChangeRole={setCurrentRole}
        />
      </header>

      {/* Main Grid */}
      <main className="relative z-10 max-w-7xl w-full mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left: Interactive Map Floor Plan (col-span-9) */}
        <div className="xl:col-span-9 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xs font-bold tracking-wider text-slate-400 uppercase flex items-center gap-2">
              🧭 스케일업 센터 도면 미니맵
            </h2>
            <span className="text-3xs text-slate-500">
              {currentRole === "admin"
                ? "⚙️ 관리자 모드: 모든 예약을 조회하고 사전 배정을 진행할 수 있습니다."
                : "🔒 이용자 모드: 본인의 예약을 제어하고 타인의 정보는 마스킹됩니다."}
            </span>
          </div>

          {/* Map Area */}
          <div className="relative border border-slate-800 rounded-3xl bg-slate-950/40 p-6 shadow-xl backdrop-blur-md overflow-hidden grid grid-cols-4 grid-rows-3 gap-4 h-[580px]">
            {/* Architectural Grid Line Overlays */}
            <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 opacity-[0.03] pointer-events-none">
              {Array.from({ length: 72 }).map((_, i) => (
                <div key={i} className="border border-brand-primary"></div>
              ))}
            </div>

            {/* Left Column: Large Meeting Rooms (1, 2, 3) */}
            <div className="col-span-1 row-span-3 flex flex-col justify-between gap-4 h-full">
              {largeRooms.map((room) => {
                const isAvailable = room.status === "available";
                const isAssigned = room.status === "assigned";
                const isActive = room.status === "active";
                const isDelayed = checkIsDelayed(room);
                
                // Permission checks
                const isOwnRoom = room.assignedUserId === currentRole;
                const canViewFull = currentRole === "admin" || isOwnRoom;

                return (
                  <button
                    key={room.id}
                    onClick={() => handleRoomClick(room)}
                    className={`flex-1 rounded-2xl border text-left p-4 flex flex-col justify-between transition-all duration-300 relative group overflow-hidden ${
                      isAvailable
                        ? "bg-slate-900/10 border-slate-800 hover:border-brand-primary/50 hover:bg-slate-900/20 shadow-md"
                        : isAssigned
                        ? isDelayed
                          ? "animate-red-flash border-rose-500 shadow-lg shadow-rose-950/20"
                          : "bg-amber-950/10 border-amber-500/40 hover:border-amber-400 hover:bg-amber-900/10 shadow-lg shadow-amber-500/5"
                        : "bg-brand-glow border-brand-primary/50 hover:border-brand-primary hover:bg-brand-primary/10 shadow-lg shadow-brand-primary/10"
                    }`}
                  >
                    {/* Corner badge highlight for own room */}
                    {!isAvailable && isOwnRoom && (
                      <div className="absolute top-0 left-0 bg-brand-primary text-white text-4xs font-black uppercase px-2 py-0.5 rounded-br-lg tracking-wider shadow">
                        My Room
                      </div>
                    )}

                    {/* Room title & status dot */}
                    <div className="w-full">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-3xs uppercase tracking-wider font-semibold">Large Room</span>
                        <div className={`h-2.5 w-2.5 rounded-full ${
                          isAvailable
                            ? "bg-slate-600"
                            : isAssigned
                            ? isDelayed
                              ? "bg-rose-500 shadow-md shadow-rose-500/50 animate-ping"
                              : "bg-amber-500 shadow-md shadow-amber-500/50"
                            : "bg-brand-primary shadow-md shadow-brand-primary/50 animate-pulse"
                        }`}></div>
                      </div>
                      <h4 className="text-base font-bold text-white mt-1 group-hover:text-brand-primary transition-colors">
                        {room.name}
                      </h4>
                      <p className="text-3xs text-slate-500">10인 | TV 스크린</p>
                    </div>

                    {/* User privacy masking footer */}
                    <div className="mt-4 border-t border-slate-800/80 pt-2 w-full flex flex-col justify-end text-2xs min-h-[36px]">
                      {isAvailable ? (
                        <span className="text-slate-500">배정 대기 중</span>
                      ) : (
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between text-slate-300 font-semibold truncate">
                            <span>
                              {canViewFull ? room.userName : maskName(room.userName)}
                            </span>
                            <span className="text-3xs text-slate-500 font-normal">
                              {canViewFull ? room.position : "이용자"}
                            </span>
                          </div>
                          <div className="text-3xs text-slate-500 flex justify-between font-mono">
                            <span>{room.startTime} - {room.endTime}</span>
                            {isDelayed && <span className="text-rose-400 font-bold">지연</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Center Area: Lounge */}
            <div className="col-span-2 row-span-2 border border-dashed border-slate-800/80 rounded-3xl p-5 flex flex-col justify-between bg-slate-900/10 relative">
              <div className="absolute top-3 left-3 text-3xs text-slate-600 font-bold uppercase tracking-widest">
                Lounge &amp; Open Area
              </div>

              {/* Objet Box in the Center-Left of lounge */}
              <div className="flex-1 flex items-center justify-center my-6">
                <div className="w-48 h-28 border border-slate-800 bg-slate-950/50 rounded-2xl flex flex-col items-center justify-center p-3 relative shadow-inner">
                  <div className="w-16 h-10 border border-dashed border-brand-primary/20 bg-brand-primary/5 rounded flex items-center justify-center mb-1">
                    <span className="text-brand-primary/60 font-semibold text-3xs">오브제</span>
                  </div>
                  <span className="text-slate-500 text-3xs font-medium text-center">오픈 스퀘어 라운지 테이블</span>
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-4xs text-slate-500">
                    OBJET ZONE
                  </div>
                </div>
              </div>

              {/* Lounge desks simulation (bottom part of lounge) */}
              <div className="flex justify-around items-center border-t border-slate-900/60 pt-3 text-3xs text-slate-600">
                <span>● 테이블 1</span>
                <span>● 테이블 2</span>
                <span>● 이동식 무빙월 영역</span>
              </div>
            </div>

            {/* Right Area: Seminar Hall */}
            <div className="col-span-1 row-span-2 border border-dashed border-slate-800/80 rounded-3xl p-5 flex flex-col justify-between bg-slate-900/10 relative">
              <div className="absolute top-3 left-3 text-3xs text-slate-600 font-bold uppercase tracking-widest">
                Seminar Hall
              </div>

              <div className="flex-1 flex flex-col items-center justify-center gap-2">
                <div className="w-full py-2 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-center text-3xs text-indigo-400 font-semibold">
                  미디어월 세미나 스크린
                </div>
                
                {/* Simulated rows of seats */}
                <div className="grid grid-cols-4 gap-1 w-full px-2 opacity-30 mt-2">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="h-3 bg-slate-700 rounded-sm"></div>
                  ))}
                </div>
              </div>

              <div className="text-center text-4xs text-slate-500">
                행사 대관 전용 공간
              </div>
            </div>

            {/* Bottom Row: Small Rooms (A, B, C, D) */}
            <div className="col-start-2 col-span-3 flex justify-between gap-4 h-full">
              {smallRooms.map((room) => {
                const isAvailable = room.status === "available";
                const isAssigned = room.status === "assigned";
                const isActive = room.status === "active";
                const isDelayed = checkIsDelayed(room);

                const isOwnRoom = room.assignedUserId === currentRole;
                const canViewFull = currentRole === "admin" || isOwnRoom;

                return (
                  <button
                    key={room.id}
                    onClick={() => handleRoomClick(room)}
                    className={`flex-1 rounded-2xl border text-left p-3.5 flex flex-col justify-between transition-all duration-300 relative group overflow-hidden ${
                      isAvailable
                        ? "bg-slate-900/10 border-slate-800 hover:border-brand-primary/50 hover:bg-slate-900/20 shadow-md"
                        : isAssigned
                        ? isDelayed
                          ? "animate-red-flash border-rose-500 shadow-lg shadow-rose-950/20"
                          : "bg-amber-950/10 border-amber-500/40 hover:border-amber-400 hover:bg-amber-900/10 shadow-lg shadow-amber-500/5"
                        : "bg-brand-glow border-brand-primary/50 hover:border-brand-primary hover:bg-brand-primary/10 shadow-lg shadow-brand-primary/10"
                    }`}
                  >
                    {!isAvailable && isOwnRoom && (
                      <div className="absolute top-0 left-0 bg-brand-primary text-white text-4xs font-black uppercase px-2 py-0.5 rounded-br-lg tracking-wider shadow">
                        My Room
                      </div>
                    )}

                    {/* Room Info */}
                    <div className="w-full">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-3xs uppercase tracking-wider font-semibold">Small Room</span>
                        <div className={`h-2 w-2 rounded-full ${
                          isAvailable
                            ? "bg-slate-600"
                            : isAssigned
                            ? isDelayed
                              ? "bg-rose-500 shadow-md shadow-rose-500/50 animate-ping"
                              : "bg-amber-500 shadow-md shadow-amber-500/50"
                            : "bg-brand-primary shadow-md shadow-brand-primary/50 animate-pulse"
                        }`}></div>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1 group-hover:text-brand-primary transition-colors">
                        {room.name}
                      </h4>
                      <p className="text-3xs text-slate-500">4인 소회의실</p>
                    </div>

                    {/* Masked Footer */}
                    <div className="mt-3 border-t border-slate-800/80 pt-1.5 w-full flex flex-col justify-end text-2xs min-h-[32px]">
                      {isAvailable ? (
                        <span className="text-slate-500">배정 가능</span>
                      ) : (
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between text-slate-300 font-bold truncate">
                            <span>{canViewFull ? room.userName : maskName(room.userName)}</span>
                            {isDelayed && <span className="text-rose-400 text-3xs font-extrabold animate-pulse">지연</span>}
                          </div>
                          <div className="text-3xs text-slate-500 font-mono">
                            {room.startTime} - {room.endTime}
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

        {/* Right Sidebar: Quick Room List */}
        <div className="xl:col-span-3 space-y-6">
          <h2 className="text-xs font-bold tracking-wider text-slate-400 uppercase flex items-center gap-2 px-1">
            📑 실시간 모니터링 현황
          </h2>

          <div className="border border-slate-800 rounded-3xl bg-slate-900/40 p-4 shadow-xl backdrop-blur-md space-y-3">
            {rooms.map((room) => {
              const isAvailable = room.status === "available";
              const isAssigned = room.status === "assigned";
              const isActive = room.status === "active";
              const isDelayed = checkIsDelayed(room);

              const isOwnRoom = room.assignedUserId === currentRole;
              const canViewFull = currentRole === "admin" || isOwnRoom;

              return (
                <div
                  key={room.id}
                  onClick={() => handleRoomClick(room)}
                  className={`p-3 rounded-2xl bg-slate-950/40 border hover:border-slate-700 cursor-pointer flex items-center justify-between transition-all group ${
                    isDelayed ? "border-rose-900/50" : "border-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${
                        isAvailable
                          ? "bg-slate-600"
                          : isAssigned
                          ? isDelayed
                            ? "bg-rose-500 animate-pulse shadow shadow-rose-500"
                            : "bg-amber-500 shadow shadow-amber-500"
                          : "bg-brand-primary animate-pulse shadow shadow-brand-primary"
                      }`}
                    ></span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-brand-primary transition-colors flex items-center gap-1.5">
                        <span>{room.name}</span>
                        {isOwnRoom && (
                          <span className="text-4xs bg-brand-primary/20 text-brand-primary border border-brand-primary/30 px-1 rounded">My</span>
                        )}
                      </h4>
                      <p className="text-3xs text-slate-500">
                        {room.type === "large" ? "대회의실 (10인)" : "소회의실 (4인)"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col justify-center items-end">
                    {isAvailable && (
                      <span className="text-slate-500 font-bold text-4xs bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        배정 가능
                      </span>
                    )}
                    {isAssigned && (
                      <>
                        <span className={`font-bold text-4xs px-1.5 py-0.5 rounded border ${
                          isDelayed
                            ? "text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse"
                            : "text-amber-500 bg-amber-500/10 border-amber-500/20"
                        }`}>
                          {isDelayed ? "입실 지연" : "배정 대기"}
                        </span>
                        <span className="text-4xs text-slate-400 font-semibold mt-0.5 max-w-[70px] truncate">
                          {canViewFull ? room.userName : maskName(room.userName)}
                        </span>
                      </>
                    )}
                    {isActive && (
                      <>
                        <span className="text-brand-primary font-bold text-4xs bg-brand-primary/10 px-1.5 py-0.5 rounded border border-brand-primary/20">
                          이용 중
                        </span>
                        <span className="text-4xs text-slate-400 font-semibold mt-0.5 max-w-[70px] truncate">
                          {canViewFull ? room.userName : maskName(room.userName)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Helper panel */}
          <div className="border border-slate-800 rounded-3xl bg-slate-900/10 p-5 backdrop-blur-md text-slate-500 space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <span>⚠️ 시뮬레이션 가이드</span>
            </h3>
            <ul className="text-3xs space-y-1.5 list-disc pl-3.5 leading-relaxed">
              <li>상단 **행사 테마 전환** 클릭 시 전체 UI 포인트 컬러가 즉시 변경됩니다.</li>
              <li>상단 **접속 권한**을 전환해 보세요. <strong>이용자 A/B</strong> 모드일 때 본인 회의실만 세부 연락처와 제어 버튼이 나타나고 다른 룸은 마스킹됩니다.</li>
              <li>회의실 1은 기본적으로 <strong>11:00 시작 지연(Delayed)</strong> 상태로 사전 주입되어, **빨간색 점멸** 및 관리자 Red Alert 배너를 즉시 보실 수 있습니다.</li>
            </ul>
          </div>
        </div>

      </main>

      {/* ReservationModal Overlay */}
      <ReservationModal
        room={currentSelectedRoom}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPreAssign={preAssignRoom}
        onStartProgress={startProgress}
        onRelease={releaseRoom}
        currentRole={currentRole}
      />
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRooms, Room, checkIsDelayed } from "@/hooks/useRooms";
import ReservationModal from "@/components/ReservationModal";
import PinInputModal from "@/components/PinInputModal";
import { ThemeType } from "@/components/ThemeSelector";
import RoomTimeline from "@/components/RoomTimeline";

export default function UserHomePage() {
  const { rooms, startProgressWithPin, releaseRoom, loading } = useRooms();
  const router = useRouter();

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isResModalOpen, setIsResModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinActionType, setPinActionType] = useState<"checkin" | "checkout">("checkin");
  const [currentTime, setCurrentTime] = useState("");
  const [currentTheme, setCurrentTheme] = useState<ThemeType>("zero-one");

  // Dynamic theme variables sync
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
    setIsResModalOpen(true);
  };

  const handleOpenPinModal = (type: "checkin" | "checkout") => {
    setPinActionType(type);
    setIsResModalOpen(false);
    setIsPinModalOpen(true);
  };

  const handlePinSubmit = async (enteredPin: string): Promise<boolean> => {
    if (!selectedRoom) return false;
    
    if (pinActionType === "checkin") {
      return await startProgressWithPin(selectedRoom.id, enteredPin);
    } else {
      if (selectedRoom.roomPin === enteredPin) {
        await releaseRoom(selectedRoom.id);
        return true;
      }
      return false;
    }
  };

  const maskName = (name: string) => {
    if (!name) return "";
    if (name.length <= 2) return name[0] + "*";
    return name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4f6fa] text-[#191f28]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-brand-primary"></div>
          <p className="text-sm font-bold text-gray-500">회의실 현황을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // Metrics
  const assignedCount = rooms.filter((r) => r.status === "assigned").length;
  const activeCount = rooms.filter((r) => r.status === "active").length;

  const largeRooms = rooms.filter((r) => r.type === "large");
  const smallRooms = rooms.filter((r) => r.type === "small");

  const currentSelectedRoom = selectedRoom
    ? rooms.find((r) => r.id === selectedRoom.id) || null
    : null;

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-[#191f28] flex flex-col p-6 font-sans relative overflow-x-hidden transition-all duration-500">
      
      {/* Header */}
      <header className="relative z-10 max-w-7xl w-full mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/80 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#191f28] flex items-center gap-2.5">
            <span className="text-brand-primary font-black">SCALEUP 현황판</span>
            <span className="text-gray-300 font-light">|</span>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-white shadow-sm border border-gray-100 text-gray-450 tracking-wider">
              USER VIEW
            </span>
          </h1>
          <p className="text-sm font-semibold text-gray-400 mt-1">
            실시간 회의실 현황 모니터링 및 모바일 체크인
          </p>
        </div>

        {/* Counts summary (Toss style pill cards) */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-1.5 px-3 border-r border-gray-150 text-xs font-bold text-gray-400">
            대기: <strong className="text-[#191f28]">{assignedCount}</strong>
          </div>
          <div className="flex items-center gap-1.5 px-3 text-xs font-bold text-gray-400">
            사용 중: <strong className="text-brand-primary">{activeCount}</strong>
          </div>
        </div>

        {/* Action button header */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-4xs font-bold text-gray-400">실시간 시각</div>
            <div className="text-sm font-mono font-bold text-gray-500 tracking-wider">{currentTime || "00:00:00"}</div>
          </div>
          
          <button
            onClick={() => setCurrentTheme(currentTheme === "zero-one" ? "nh" : "zero-one")}
            className="text-xs font-bold px-3 py-2 bg-white shadow-sm rounded-xl border border-gray-100 hover:bg-gray-50 transition-all text-gray-650"
          >
            🎨 테마: {currentTheme === "zero-one" ? "제로원" : "농협은행"}
          </button>
          
          <button
            onClick={() => router.push("/login")}
            className="text-xs font-bold px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-hover text-white transition-all shadow-md shadow-brand-primary/10"
          >
            🔑 관리자 로그인
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="relative z-10 max-w-7xl w-full mx-auto grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        
        {/* Left: Map layout (col-span-1) */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-sm font-extrabold tracking-tight text-gray-500 flex items-center gap-2">
              🧭 센터 회의실 도면 안내
            </h2>
            <span className="text-3xs text-gray-400 font-semibold">각 회의실 카드를 탭하여 체크인하세요.</span>
          </div>

          {/* Map layout (Light Theme Toss Style) */}
          <div className="relative border-0 rounded-[32px] bg-white p-6 shadow-md overflow-hidden grid grid-cols-4 grid-rows-3 gap-5 h-[620px]">
            {/* Grid decoration */}
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
                      <p className="text-3xs font-semibold text-gray-400">정원 10명 | 스크린 TV</p>
                    </div>

                    <div className="mt-4 border-t border-gray-100 pt-2 w-full flex flex-col justify-end text-2xs min-h-[36px]">
                      {isAvailable ? (
                        <span className="text-gray-400 font-bold">배정 대기</span>
                      ) : (
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between text-[#191f28] font-extrabold truncate">
                            <span>{maskName(room.userName)}</span>
                            {isDelayed && <span className="text-rose-500 text-3xs font-black animate-pulse">지연</span>}
                          </div>
                          <div className="text-3xs text-gray-400 font-bold font-mono">
                            {room.startTime} - {room.endTime}
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Center Lounge Area (Toss light style outline zone) */}
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

            {/* Seminar Hall Area */}
            <div className="col-span-1 row-span-2 border border-dashed border-gray-200 rounded-[24px] p-5 flex flex-col justify-between bg-gray-50/40 relative">
              <div className="absolute top-3 left-3 text-3xs text-gray-400 font-bold uppercase tracking-widest">
                Seminar Hall
              </div>
              <div className="flex-1 flex flex-col items-center justify-center gap-2">
                <div className="w-full py-2 bg-indigo-50 border border-indigo-100/10 rounded-xl text-center text-3xs text-indigo-500 font-bold">
                  미디어월 세미나 공간
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
                      <p className="text-3xs font-semibold text-gray-400">정원 4명</p>
                    </div>

                    <div className="mt-3 border-t border-gray-100 pt-1.5 w-full flex flex-col justify-end text-2xs min-h-[32px]">
                      {isAvailable ? (
                        <span className="text-gray-450 font-bold">배정 가능</span>
                      ) : (
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between text-[#191f28] font-extrabold truncate">
                            <span>{maskName(room.userName)}</span>
                            {isDelayed && <span className="text-rose-500 text-3xs font-black animate-pulse">지연</span>}
                          </div>
                          <div className="text-3xs text-gray-400 font-bold font-mono">
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

        {/* Right: Sidebar Status Summary */}
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold tracking-tight text-gray-500 px-1">
            📑 실시간 현황 목록
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
                    className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md cursor-pointer flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${
                          isAvailable
                            ? "bg-gray-300"
                            : isAssigned
                            ? isDelayed
                              ? "bg-rose-500 shadow shadow-rose-300"
                              : "bg-amber-500"
                            : "bg-brand-primary shadow shadow-brand-primary"
                        }`}
                      ></span>
                      <div>
                        <h4 className="text-sm font-extrabold text-[#191f28] group-hover:text-brand-primary transition-colors">
                          {room.name}
                        </h4>
                        <p className="text-3xs font-semibold text-gray-400">
                          {room.type === "large" ? "대회의실 (10인)" : "소회의실 (4인)"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      {isAvailable && (
                        <span className="text-gray-450 font-extrabold text-4xs bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
                          배정 가능
                        </span>
                      )}
                      {isAssigned && (
                        <>
                          <span className={`font-extrabold text-4xs px-2 py-0.5 rounded-full border ${
                            isDelayed
                              ? "text-rose-500 bg-rose-50 border-rose-100"
                              : "text-amber-600 bg-amber-50 border-amber-100"
                          }`}>
                            {isDelayed ? "지연됨" : "배정 대기"}
                          </span>
                          <span className="text-4xs text-gray-400 font-extrabold mt-0.5 max-w-[70px] truncate">
                            {maskName(room.userName)}
                          </span>
                        </>
                      )}
                      {isActive && (
                        <>
                          <span className="text-brand-primary font-extrabold text-4xs bg-brand-primary/10 px-2 py-0.5 rounded-full border border-brand-primary/20">
                            이용 중
                          </span>
                          <span className="text-4xs text-gray-400 font-extrabold mt-0.5 max-w-[70px] truncate">
                            {maskName(room.userName)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Toss guidelines card - Integrated inside list card height */}
            <div className="mt-4 border-t border-gray-150 pt-4 space-y-1.5 text-3xs text-gray-400 font-semibold">
              <div className="text-gray-500 font-extrabold flex items-center gap-1 mb-1">
                <span>📌</span>
                <span>이용 안내</span>
              </div>
              <div className="flex items-start gap-1">
                <span>•</span>
                <span>사전 배정 완료 회의실 탭 후 [진행 시작] 클릭 시 PIN 검증 창이 올라옵니다.</span>
              </div>
              <div className="flex items-start gap-1">
                <span>•</span>
                <span>보안 4자리 PIN 입력 완료 시 사용중 상태로 승인 완료됩니다.</span>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Timeline Section */}
      <div className="mt-8 relative z-10 max-w-7xl w-full mx-auto">
        <RoomTimeline
          rooms={rooms}
          onRoomClick={handleRoomClick}
          isAdmin={false}
        />
      </div>

      {/* Reservation details Modal (Guest role hides actions and masks details) */}
      <ReservationModal
        room={currentSelectedRoom}
        isOpen={isResModalOpen}
        onClose={() => setIsResModalOpen(false)}
        onPreAssign={() => {}}
        onStartProgress={() => handleOpenPinModal("checkin")}
        onRelease={() => handleOpenPinModal("checkout")}
        currentRole="guest"
      />

      {/* PinInputModal overlay for checkin/checkout confirmation */}
      <PinInputModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSubmit={handlePinSubmit}
        roomName={selectedRoom?.name || ""}
      />
    </div>
  );
}

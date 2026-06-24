"use client";

import React from "react";
import { Room, checkIsDelayed } from "@/hooks/useRooms";

interface RoomTimelineProps {
  rooms: Room[];
  onRoomClick: (room: Room) => void;
  isAdmin: boolean;
}

export default function RoomTimeline({ rooms, onRoomClick, isAdmin }: RoomTimelineProps) {
  const timeToMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + (m || 0);
  };

  const timelineStart = 480; // 08:00
  const timelineEnd = 1200;  // 20:00
  const timelineDuration = 720; // 12 hours (720 minutes)

  const hours = Array.from({ length: 13 }, (_, i) => 8 + i); // 8 to 20

  const maskName = (name: string) => {
    if (!name) return "";
    if (name.length <= 2) return name[0] + "*";
    return name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
  };

  // Render a tiny visual structure of the room seats
  const renderRoomMiniature = (type: "large" | "small") => {
    if (type === "large") {
      // 10-person rectangle table
      return (
        <div className="flex flex-col items-center justify-center w-12 h-10 border border-gray-100 rounded-lg p-0.5 bg-gray-50/50">
          {/* Top row seats */}
          <div className="flex gap-0.5 mb-0.5">
            <span className="w-1.5 h-1 bg-gray-300 rounded-full"></span>
            <span className="w-1.5 h-1 bg-gray-300 rounded-full"></span>
            <span className="w-1.5 h-1 bg-gray-300 rounded-full"></span>
          </div>
          {/* Middle table */}
          <div className="flex items-center gap-0.5">
            <span className="w-1 h-1.5 bg-gray-300 rounded-full"></span>
            <div className="w-7 h-3 bg-white border border-gray-200 rounded-md"></div>
            <span className="w-1 h-1.5 bg-gray-300 rounded-full"></span>
          </div>
          {/* Bottom row seats */}
          <div className="flex gap-0.5 mt-0.5">
            <span className="w-1.5 h-1 bg-gray-300 rounded-full"></span>
            <span className="w-1.5 h-1 bg-gray-300 rounded-full"></span>
            <span className="w-1.5 h-1 bg-gray-300 rounded-full"></span>
          </div>
        </div>
      );
    } else {
      // 4-person square table
      return (
        <div className="flex flex-col items-center justify-center w-10 h-10 border border-gray-100 rounded-lg p-0.5 bg-gray-50/50">
          {/* Top seat */}
          <span className="w-1.5 h-1 bg-gray-300 rounded-full mb-0.5"></span>
          {/* Middle table */}
          <div className="flex items-center gap-0.5">
            <span className="w-1.5 h-1 bg-gray-300 rounded-full"></span>
            <div className="w-4 h-4 bg-white border border-gray-200 rounded-sm"></div>
            <span className="w-1.5 h-1 bg-gray-300 rounded-full"></span>
          </div>
          {/* Bottom seat */}
          <span className="w-1.5 h-1 bg-gray-300 rounded-full mt-0.5"></span>
        </div>
      );
    }
  };

  return (
    <div className="bg-white border-0 rounded-[32px] p-6 shadow-md overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-extrabold tracking-tight text-gray-500 flex items-center gap-2">
          📅 회의실별 실시간 타임라인 현황판
        </h3>
        <div className="flex gap-3 text-3xs font-semibold text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-primary"></span> 이용 중
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 배정 대기
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> 입실 지연
          </span>
        </div>
      </div>

      <div className="overflow-x-auto select-none min-w-full">
        <div className="min-w-[800px] border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/30">
          {/* Timeline Header Row */}
          <div className="grid grid-cols-[140px_1fr] border-b border-gray-100 bg-gray-50">
            <div className="p-3.5 text-xs font-bold text-gray-400 border-r border-gray-100 text-center">
              회의실 정보
            </div>
            <div className="relative grid grid-cols-12 h-full">
              {hours.map((hour, idx) => (
                <div
                  key={hour}
                  className={`text-center py-3 text-4xs font-bold text-gray-400 relative ${
                    idx < 12 ? "border-r border-gray-100/50" : ""
                  }`}
                >
                  {String(hour).padStart(2, "0")}:00
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Body Rows */}
          <div className="divide-y divide-gray-100">
            {rooms.map((room) => {
              const isAvailable = room.status === "available";
              const isAssigned = room.status === "assigned";
              const isActive = room.status === "active";
              const isDelayed = checkIsDelayed(room);

              let blockLeft = 0;
              let blockWidth = 0;

              if (!isAvailable && room.startTime && room.endTime) {
                const startMin = timeToMinutes(room.startTime);
                const endMin = timeToMinutes(room.endTime);

                const leftPercent = ((startMin - timelineStart) / timelineDuration) * 100;
                const rightPercent = ((endMin - timelineStart) / timelineDuration) * 100;

                blockLeft = Math.max(0, Math.min(100, leftPercent));
                const blockRight = Math.max(0, Math.min(100, rightPercent));
                blockWidth = Math.max(0, blockRight - blockLeft);
              }

              return (
                <div
                  key={room.id}
                  className="grid grid-cols-[140px_1fr] hover:bg-gray-50/50 transition-colors"
                >
                  {/* Left Column: Room info & miniature */}
                  <div
                    onClick={() => onRoomClick(room)}
                    className="p-3 border-r border-gray-100 flex items-center gap-2 cursor-pointer group hover:bg-gray-50"
                  >
                    {renderRoomMiniature(room.type)}
                    <div>
                      <h4 className="text-xs font-extrabold text-[#191f28] group-hover:text-brand-primary transition-colors">
                        {room.name}
                      </h4>
                      <p className="text-4xs font-semibold text-gray-450">
                        {room.type === "large" ? "10인실" : "4인실"}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Time Blocks Matrix */}
                  <div className="relative h-16 w-full">
                    {/* Hour Vertical Grid Lines */}
                    <div className="absolute inset-0 grid grid-cols-12 pointer-events-none">
                      {Array.from({ length: 12 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="border-r border-gray-100/40 h-full"
                        ></div>
                      ))}
                    </div>

                    {/* Timeline Booking Fill Bar */}
                    {!isAvailable && blockWidth > 0 && (
                      <div
                        onClick={() => onRoomClick(room)}
                        style={{
                          left: `${blockLeft}%`,
                          width: `${blockWidth}%`,
                        }}
                        className={`absolute top-2 bottom-2 rounded-xl px-3 py-1 flex flex-col justify-center cursor-pointer shadow-sm text-white transition-all hover:scale-[1.01] overflow-hidden ${
                          isActive
                            ? "bg-brand-primary"
                            : isDelayed
                            ? "bg-rose-500 animate-red-flash"
                            : "bg-amber-500"
                        }`}
                      >
                        <div className="text-3xs font-extrabold flex justify-between items-center w-full truncate gap-2">
                          <span className="truncate">
                            {isAdmin
                              ? `${room.userName} (${room.position})`
                              : maskName(room.userName)}
                          </span>
                          <span className="font-mono text-4xs opacity-90 flex-shrink-0">
                            {room.startTime} - {room.endTime}
                          </span>
                        </div>
                        {isAdmin && room.roomPin && (
                          <div className="text-4xs opacity-80 font-mono tracking-wider font-semibold">
                            PIN: {room.roomPin}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Available area click-to-book shortcut */}
                    {isAvailable && (
                      <div
                        onClick={() => onRoomClick(room)}
                        className="absolute inset-0 cursor-pointer flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-brand-glow/20"
                      >
                        <span className="text-3xs text-brand-primary font-bold">
                          + 사전 배정 등록하기
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

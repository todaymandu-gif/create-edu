"use client";

import React, { useState, useEffect } from "react";
import { Room, checkIsDelayed } from "@/hooks/useRooms";
import { RoleType } from "./ThemeSelector";

interface ReservationModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onPreAssign: (
    roomId: string,
    data: {
      userName: string;
      position: string;
      contact: string;
      startTime: string;
      endTime: string;
      assignedUserId: string;
      roomPin: string;
    }
  ) => void;
  onStartProgress: (roomId: string) => void;
  onRelease: (roomId: string) => void;
  currentRole: RoleType;
}

export default function ReservationModal({
  room,
  isOpen,
  onClose,
  onPreAssign,
  onStartProgress,
  onRelease,
  currentRole,
}: ReservationModalProps) {
  // Form States for Pre-assignment
  const [userName, setUserName] = useState("");
  const [position, setPosition] = useState("");
  const [contact, setContact] = useState("");
  const [startTime, setStartTime] = useState("11:30");
  const [endTime, setEndTime] = useState("12:35");
  const [assignedUserId, setAssignedUserId] = useState("user-a");
  const [roomPin, setRoomPin] = useState("");

  useEffect(() => {
    if (isOpen && room && room.status === "available") {
      setUserName("");
      setPosition("");
      setContact("");
      setRoomPin("");
      
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, "0");
      const currentMin = now.getMinutes().toString().padStart(2, "0");
      setStartTime(`${currentHour}:${currentMin}`);
      
      const later = new Date(now.getTime() + 60 * 60 * 1000);
      const laterHour = later.getHours().toString().padStart(2, "0");
      const laterMin = later.getMinutes().toString().padStart(2, "0");
      setEndTime(`${laterHour}:${laterMin}`);
      setAssignedUserId(room.id === "room-1" ? "user-a" : room.id === "room-a" ? "user-b" : "guest");
    }
  }, [isOpen, room]);

  if (!isOpen || !room) return null;

  const isAdmin = currentRole === "admin";
  const isAssignedToCurrent = room.assignedUserId === currentRole;
  const hasControlAccess = isAdmin || isAssignedToCurrent;
  
  const isDelayed = checkIsDelayed(room);

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
    if (num.length >= 8) {
      return num.slice(0, 3) + "****" + num.slice(7);
    }
    return "***-****-****";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !contact.trim() || roomPin.length < 4) return;
    onPreAssign(room.id, {
      userName,
      position,
      contact,
      startTime,
      endTime,
      assignedUserId,
      roomPin,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 animate-fade-in backdrop-blur-[1px]">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>

      {/* Toss style Bottom Sheet Panel */}
      <div className="w-full max-w-md bg-white rounded-t-[32px] p-6 pb-8 shadow-2xl z-50 animate-slide-up text-[#191f28] border-t border-gray-150">
        
        {/* Drag Handle Pill */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-5"></div>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-[#191f28] tracking-tight">
              {room.name}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {room.type === "large" ? "대회의실 (10인실)" : "소회의실 (4인실)"}
            </p>
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-bold ${
              room.status === "available"
                ? "bg-gray-100 text-gray-500"
                : room.status === "assigned"
                ? isDelayed
                  ? "bg-rose-500/10 text-rose-500 animate-pulse"
                  : "bg-amber-500/10 text-amber-600"
                : "bg-emerald-500/10 text-emerald-600"
            }`}
          >
            {room.status === "available"
              ? "배정 가능"
              : room.status === "assigned"
              ? isDelayed
                ? "🚨 입실 지연"
                : "배정 대기"
              : "이용 중"}
          </span>
        </div>

        {/* VIEW 1: Available Room Pre-assignment Form (Admin only) */}
        {room.status === "available" && (
          <>
            {isAdmin ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-xs text-brand-primary font-bold uppercase tracking-wider mb-1">
                  ⚙️ 관리자 전용 회의실 사전 배정
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-3xs font-bold text-gray-400 mb-1">이름</label>
                    <input
                      type="text"
                      required
                      placeholder="홍길동"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full px-4 h-12 bg-gray-100 border-0 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition-all text-[#191f28]"
                    />
                  </div>
                  <div>
                    <label className="block text-3xs font-bold text-gray-400 mb-1">직책</label>
                    <input
                      type="text"
                      required
                      placeholder="대표이사"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="w-full px-4 h-12 bg-gray-100 border-0 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition-all text-[#191f28]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-3xs font-bold text-gray-400 mb-1">연락처</label>
                    <input
                      type="text"
                      required
                      placeholder="010-1234-5678"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className="w-full px-4 h-12 bg-gray-100 border-0 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition-all text-[#191f28]"
                    />
                  </div>
                  <div>
                    <label className="block text-3xs font-bold text-gray-400 mb-1">체크인 PIN (4자리)</label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      placeholder="1234"
                      value={roomPin}
                      onChange={(e) => setRoomPin(e.target.value.replace(/\D/g, ""))}
                      className="w-full px-4 h-12 bg-gray-100 border-0 rounded-2xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition-all text-[#191f28]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-3xs font-bold text-gray-400 mb-1">시작 시각</label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-4 h-12 bg-gray-100 border-0 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition-all text-[#191f28]"
                    />
                  </div>
                  <div>
                    <label className="block text-3xs font-bold text-gray-400 mb-1">종료 시각</label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-4 h-12 bg-gray-100 border-0 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition-all text-[#191f28]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-3xs font-bold text-gray-400 mb-1">이용 권한 매핑</label>
                  <select
                    value={assignedUserId}
                    onChange={(e) => setAssignedUserId(e.target.value)}
                    className="w-full px-4 h-12 bg-gray-100 border-0 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition-all text-[#191f28]"
                  >
                    <option value="user-a">이용자 A (user-a)</option>
                    <option value="user-b">이용자 B (user-b)</option>
                    <option value="guest">외부인 (guest / 없음)</option>
                  </select>
                </div>

                {/* h-14 Buttons */}
                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 h-14 rounded-2xl bg-gray-100 hover:bg-gray-200 text-[#4e5968] text-sm font-bold transition-all"
                  >
                    닫기
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-14 rounded-2xl bg-brand-primary hover:bg-brand-hover text-white text-sm font-bold transition-all shadow-lg shadow-brand-primary/15"
                  >
                    배정 등록
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-5 text-center py-4">
                <div className="text-3xl mb-1">🚫</div>
                <p className="text-sm font-bold text-[#191f28]">
                  관리자 사전 배정 전용 회의실
                </p>
                <p className="text-xs text-gray-500 leading-relaxed px-4">
                  해당 회의실은 관리자가 사전에 등록해야 사용할 수 있습니다. 관리자 화면에서 배정을 완료해 주세요.
                </p>
                <button
                  onClick={onClose}
                  className="w-full h-14 rounded-2xl bg-gray-100 hover:bg-gray-200 text-[#4e5968] text-sm font-bold transition-all"
                >
                  확인
                </button>
              </div>
            )}
          </>
        )}

        {/* VIEW 2: Assigned or Active Room Details */}
        {(room.status === "assigned" || room.status === "active") && (
          <div className="space-y-5">
            {/* Toss style clean layout card */}
            <div className="bg-gray-50 rounded-3xl p-5 space-y-4">
              <div className="flex justify-between border-b border-gray-200/60 pb-2 text-xs">
                <span className="text-gray-400 font-medium">진행 현황</span>
                <span className={`font-bold ${
                  room.status === "active" ? "text-emerald-500" : isDelayed ? "text-rose-500" : "text-amber-500"
                }`}>
                  {room.status === "active" ? "이용 중" : isDelayed ? "입실 지연" : "대기 중"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-4xs font-bold text-gray-400 mb-0.5">이용자 (직책)</span>
                  <span className="text-sm font-bold text-[#191f28]">
                    {hasControlAccess ? `${room.userName} (${room.position})` : `${maskName(room.userName)} (***)`}
                  </span>
                </div>
                <div>
                  <span className="block text-4xs font-bold text-gray-400 mb-0.5">연락처</span>
                  <span className="text-sm font-bold text-gray-700">
                    {hasControlAccess ? room.contact : maskContact(room.contact)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-4xs font-bold text-gray-400 mb-0.5">회의 시작</span>
                  <span className="text-sm font-bold text-gray-700">{room.startTime}</span>
                </div>
                <div>
                  <span className="block text-4xs font-bold text-gray-400 mb-0.5">이용 종료 예정</span>
                  <span className="text-sm font-bold text-gray-700">{room.endTime}</span>
                </div>
              </div>
            </div>

            {/* Delay alert notice */}
            {room.status === "assigned" && isDelayed && (
              <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-4 text-xs text-rose-500 leading-relaxed font-semibold">
                ⚠️ 입실 예정 시각({room.startTime})이 경과했습니다. 신속히 입실 처리를 완료해 주세요.
              </div>
            )}

            {/* Privacy notice for guests */}
            {!hasControlAccess && (
              <div className="bg-gray-50 rounded-2xl p-3.5 text-center text-4xs text-gray-400 leading-relaxed">
                🔒 타인의 개인정보 보안을 위해 이름과 연락처가 마스킹 처리되어 있습니다.
              </div>
            )}

            {/* Admin vs User Actions Matrix */}
            <div className="flex gap-3 pt-1">
              {/* Admin Views */}
              {isAdmin && (
                <>
                  <button
                    onClick={() => {
                      onRelease(room.id);
                      onClose();
                    }}
                    className="flex-1 h-14 rounded-2xl bg-gray-100 hover:bg-gray-200 text-rose-500 text-sm font-bold transition-all"
                  >
                    배정 강제 취소
                  </button>
                  {room.status === "assigned" ? (
                    <button
                      onClick={() => {
                        onStartProgress(room.id);
                        onClose();
                      }}
                      className="flex-1 h-14 rounded-2xl bg-brand-primary hover:bg-brand-hover text-white text-sm font-bold transition-all shadow-lg shadow-brand-primary/15"
                    >
                      강제 진행 시작
                    </button>
                  ) : (
                    <button
                      onClick={onClose}
                      className="flex-1 h-14 rounded-2xl bg-gray-100 hover:bg-gray-200 text-[#4e5968] text-sm font-bold transition-all"
                    >
                      확인
                    </button>
                  )}
                </>
              )}

              {/* Assigned User controls (PIN modal trigger) */}
              {!isAdmin && isAssignedToCurrent && (
                <>
                  {room.status === "assigned" ? (
                    <>
                      <button
                        onClick={() => {
                          onRelease(room.id);
                          onClose();
                        }}
                        className="flex-1 h-14 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-500 text-sm font-bold transition-all"
                      >
                        배정 취소
                      </button>
                      <button
                        onClick={() => onStartProgress(room.id)}
                        className="flex-1 h-14 rounded-2xl bg-brand-primary hover:bg-brand-hover text-white text-sm font-bold transition-all shadow-lg shadow-brand-primary/15"
                      >
                        진행 시작 (입실)
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={onClose}
                        className="flex-1 h-14 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-500 text-sm font-bold transition-all"
                      >
                        닫기
                      </button>
                      <button
                        onClick={() => onRelease(room.id)}
                        className="flex-1 h-14 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold transition-all shadow-lg shadow-rose-500/15"
                      >
                        진행 종료 (퇴실)
                      </button>
                    </>
                  )}
                </>
              )}

              {/* Guest view */}
              {!isAdmin && !isAssignedToCurrent && (
                <button
                  onClick={onClose}
                  className="w-full h-14 rounded-2xl bg-gray-100 hover:bg-gray-200 text-[#4e5968] text-sm font-bold transition-all"
                >
                  닫기
                </button>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

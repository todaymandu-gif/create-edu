"use client";

import React, { useState, useEffect } from "react";

interface PinInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => Promise<boolean>;
  roomName: string;
}

export default function PinInputModal({
  isOpen,
  onClose,
  onSubmit,
  roomName,
}: PinInputModalProps) {
  const [pin, setPin] = useState<string[]>(["", "", "", ""]);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputRefs = [
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (isOpen) {
      setPin(["", "", "", ""]);
      setIsError(false);
      setTimeout(() => inputRefs[0].current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    setIsError(false);
    
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);

    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      setIsError(false);
      if (!pin[index] && index > 0) {
        const newPin = [...pin];
        newPin[index - 1] = "";
        setPin(newPin);
        inputRefs[index - 1].current?.focus();
      } else {
        const newPin = [...pin];
        newPin[index] = "";
        setPin(newPin);
      }
    }
  };

  const handleKeypadClick = (num: string) => {
    setIsError(false);
    const firstEmptyIndex = pin.findIndex((val) => val === "");
    if (firstEmptyIndex !== -1) {
      const newPin = [...pin];
      newPin[firstEmptyIndex] = num;
      setPin(newPin);
      
      if (firstEmptyIndex < 3) {
        inputRefs[firstEmptyIndex + 1].current?.focus();
      }
    }
  };

  const handleBackspaceClick = () => {
    setIsError(false);
    const lastFilledIndex = [...pin].reverse().findIndex((val) => val !== "");
    if (lastFilledIndex !== -1) {
      const index = 3 - lastFilledIndex;
      const newPin = [...pin];
      newPin[index] = "";
      setPin(newPin);
      inputRefs[index].current?.focus();
    }
  };

  const handleClearClick = () => {
    setIsError(false);
    setPin(["", "", "", ""]);
    inputRefs[0].current?.focus();
  };

  const verifyPin = async () => {
    const fullPin = pin.join("");
    if (fullPin.length < 4) return;
    
    setLoading(true);
    const success = await onSubmit(fullPin);
    setLoading(false);
    
    if (success) {
      onClose();
    } else {
      setIsError(true);
      setPin(["", "", "", ""]);
      inputRefs[0].current?.focus();
      
      setTimeout(() => {
        setIsError(false);
      }, 500);
    }
  };

  useEffect(() => {
    if (pin.every((val) => val !== "")) {
      verifyPin();
    }
  }, [pin]);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 animate-fade-in backdrop-blur-[1px]">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>

      {/* Toss style Bottom Sheet Panel */}
      <div
        className={`w-full max-w-md bg-white rounded-t-[32px] p-6 pb-8 shadow-2xl z-50 animate-slide-up text-[#191f28] flex flex-col transition-all duration-300 ${
          isError ? "border-t border-rose-500 animate-shake" : "border-t border-gray-150"
        }`}
        style={{
          animation: isError ? "shake 0.5s" : "slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      >
        {/* Style tag for custom shake animation */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
        `}} />

        {/* Drag Handle Pill */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-5"></div>

        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-[#191f28] tracking-tight">
            인증번호 입력
          </h3>
          <p className="text-sm text-[#4e5968] mt-1 font-medium">
            {roomName} 입실을 위해 사전 등록된 4자리 PIN을 입력해 주세요.
          </p>
        </div>

        {/* Digit Boxes */}
        <div className="flex justify-center gap-3.5 mb-6">
          {pin.map((digit, idx) => (
            <input
              key={idx}
              ref={inputRefs[idx]}
              type="password"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`w-14 h-16 text-center text-2xl font-extrabold bg-gray-100 border-0 rounded-2xl focus:outline-none transition-all ${
                isError
                  ? "bg-rose-50 border border-rose-400 text-rose-500 focus:ring-2 focus:ring-rose-450/30"
                  : "text-brand-primary focus:ring-2 focus:ring-brand-primary/40"
              }`}
            />
          ))}
        </div>

        {/* Error message */}
        <div className="text-center min-h-[24px] mb-4">
          {isError && (
            <span className="text-xs text-rose-500 font-bold">
              인증번호가 일치하지 않습니다. 다시 입력해 주세요.
            </span>
          )}
        </div>

        {/* Digital Interactive Touch Keypad (Toss circular design) */}
        <div className="grid grid-cols-3 gap-y-4 gap-x-8 justify-items-center max-w-[280px] mx-auto mb-6">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              onClick={() => handleKeypadClick(num)}
              className="w-16 h-16 flex items-center justify-center bg-gray-50 active:bg-gray-100 rounded-full text-lg font-bold text-[#191f28] transition-colors"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClearClick}
            className="w-16 h-16 flex items-center justify-center text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
          >
            CLEAR
          </button>
          <button
            onClick={() => handleKeypadClick("0")}
            className="w-16 h-16 flex items-center justify-center bg-gray-50 active:bg-gray-100 rounded-full text-lg font-bold text-[#191f28] transition-colors"
          >
            0
          </button>
          <button
            onClick={handleBackspaceClick}
            className="w-16 h-16 flex items-center justify-center text-base text-gray-400 hover:text-gray-600 transition-colors"
          >
            ⌫
          </button>
        </div>

        {/* Footer Actions (h-14 touch targets) */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-14 rounded-2xl bg-gray-100 hover:bg-gray-200 text-[#4e5968] text-sm font-bold transition-all"
          >
            닫기
          </button>
          <button
            onClick={verifyPin}
            disabled={loading || pin.join("").length < 4}
            className="flex-1 h-14 rounded-2xl bg-brand-primary hover:bg-brand-hover disabled:bg-gray-100 disabled:text-gray-300 text-white text-sm font-bold transition-all shadow-lg shadow-brand-primary/15"
          >
            {loading ? "인증 중..." : "확인"}
          </button>
        </div>

      </div>
    </div>
  );
}

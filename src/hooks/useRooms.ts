"use client";

import { useEffect, useState } from "react";
import { db, isFirebaseEnabled } from "@/lib/firebase";
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  setDoc,
  getDocs,
} from "firebase/firestore";

export interface Room {
  id: string;
  name: string;
  type: "large" | "small";
  status: "available" | "assigned" | "active"; // available: 사용가능, assigned: 사전배정(대기), active: 진행중(사용중)
  userName: string;
  position: string;
  contact: string;
  startTime: string; // "HH:MM" format
  endTime: string;   // "HH:MM" format
  assignedUserId: string; // assigned user's simulated ID (e.g., "user-a")
  roomPin: string; // 4-digit PIN number for entry validation
}

// Helper to check if a room is delayed
export function checkIsDelayed(room: Room): boolean {
  if (room.status !== "assigned" || !room.startTime) return false;
  
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  const [startHours, startMinutes] = room.startTime.split(":").map(Number);
  const startMinutesTotal = startHours * 60 + startMinutes;
  
  return currentMinutes > startMinutesTotal;
}

// Helper to check if usage time has expired
export function checkIsExpired(room: Room): boolean {
  if (room.status !== "active" || !room.endTime) return false;
  
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  const [endHours, endMinutes] = room.endTime.split(":").map(Number);
  const endMinutesTotal = endHours * 60 + endMinutes;
  
  return currentMinutes >= endMinutesTotal;
}

const INITIAL_ROOMS: Room[] = [
  {
    id: "room-1",
    name: "회의실 1",
    type: "large",
    status: "assigned",
    userName: "홍길동",
    position: "대표이사",
    contact: "010-1234-5678",
    startTime: "11:00", // Past time to trigger delay
    endTime: "13:00",
    assignedUserId: "user-a",
    roomPin: "1234", // Pre-set check-in pin code
  },
  { id: "room-2", name: "회의실 2", type: "large", status: "available", userName: "", position: "", contact: "", startTime: "", endTime: "", assignedUserId: "", roomPin: "" },
  { id: "room-3", name: "회의실 3", type: "large", status: "available", userName: "", position: "", contact: "", startTime: "", endTime: "", assignedUserId: "", roomPin: "" },
  {
    id: "room-a",
    name: "회의실 A",
    type: "small",
    status: "assigned",
    userName: "이몽룡",
    position: "마케팅팀장",
    contact: "010-9876-5432",
    startTime: "12:00",
    endTime: "12:50",
    assignedUserId: "user-b",
    roomPin: "9999", // Pre-set check-in pin code
  },
  { id: "room-b", name: "회의실 B", type: "small", status: "available", userName: "", position: "", contact: "", startTime: "", endTime: "", assignedUserId: "", roomPin: "" },
  { id: "room-c", name: "회의실 C", type: "small", status: "available", userName: "", position: "", contact: "", startTime: "", endTime: "", assignedUserId: "", roomPin: "" },
  { id: "room-d", name: "회의실 D", type: "small", status: "available", userName: "", position: "", contact: "", startTime: "", endTime: "", assignedUserId: "", roomPin: "" },
];

const LOCAL_STORAGE_KEY = "scaleup-center-v3-rooms";
const BROADCAST_CHANNEL_NAME = "scaleup-center-v3-room-sync";

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [loading, setLoading] = useState(true);

  // Load and subscribe
  useEffect(() => {
    if (isFirebaseEnabled && db) {
      const roomsCollection = collection(db, "rooms_v3");
      
      // Seed data if empty
      getDocs(roomsCollection).then((snapshot) => {
        if (snapshot.empty) {
          INITIAL_ROOMS.forEach((room) => {
            setDoc(doc(db, `rooms_v3/${room.id}`), room);
          });
        }
      });

      // Realtime listener
      const unsubscribe = onSnapshot(roomsCollection, (snapshot) => {
        const roomsData: Room[] = [];
        snapshot.forEach((doc) => {
          roomsData.push(doc.data() as Room);
        });
        
        // Sort rooms by initial order
        const sortedRooms = INITIAL_ROOMS.map(
          (initial) => roomsData.find((r) => r.id === initial.id) || initial
        );
        setRooms(sortedRooms);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Local fallback
      const loadLocalRooms = () => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          try {
            setRooms(JSON.parse(stored));
          } catch (e) {
            setRooms(INITIAL_ROOMS);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_ROOMS));
          }
        } else {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_ROOMS));
          setRooms(INITIAL_ROOMS);
        }
        setLoading(false);
      };

      loadLocalRooms();

      // Sync across tabs
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channel.onmessage = (event) => {
        if (event.data && Array.isArray(event.data)) {
          setRooms(event.data);
        }
      };

      return () => {
        channel.close();
      };
    }
  }, []);

  const updateRoomState = async (updatedRooms: Room[]) => {
    setRooms(updatedRooms);
    
    if (isFirebaseEnabled && db) {
      for (const room of updatedRooms) {
        const roomDocRef = doc(db, `rooms_v3/${room.id}`);
        await updateDoc(roomDocRef, { ...room });
      }
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedRooms));
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channel.postMessage(updatedRooms);
      channel.close();
    }
  };

  // Actions
  const preAssignRoom = async (
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
  ) => {
    const updated = rooms.map((room) => {
      if (room.id === roomId) {
        return {
          ...room,
          status: "assigned" as const,
          ...data,
        };
      }
      return room;
    });
    await updateRoomState(updated);
  };

  // PIN 검증 기반 진행 시작
  const startProgressWithPin = async (roomId: string, pin: string): Promise<boolean> => {
    const targetRoom = rooms.find((r) => r.id === roomId);
    if (!targetRoom || targetRoom.status !== "assigned") return false;
    
    if (targetRoom.roomPin === pin) {
      const updated = rooms.map((room) => {
        if (room.id === roomId) {
          return {
            ...room,
            status: "active" as const,
          };
        }
        return room;
      });
      await updateRoomState(updated);
      return true;
    }
    
    return false;
  };

  const startProgress = async (roomId: string) => {
    const updated = rooms.map((room) => {
      if (room.id === roomId && room.status === "assigned") {
        return {
          ...room,
          status: "active" as const,
        };
      }
      return room;
    });
    await updateRoomState(updated);
  };

  const releaseRoom = async (roomId: string) => {
    const updated = rooms.map((room) => {
      if (room.id === roomId) {
        return {
          ...room,
          status: "available" as const,
          userName: "",
          position: "",
          contact: "",
          startTime: "",
          endTime: "",
          assignedUserId: "",
          roomPin: "",
        };
      }
      return room;
    });
    await updateRoomState(updated);
  };

  // Automated release of expired rooms
  useEffect(() => {
    const interval = setInterval(() => {
      let hasChanges = false;
      
      const updated = rooms.map((room) => {
        if (checkIsExpired(room)) {
          hasChanges = true;
          return {
            ...room,
            status: "available" as const,
            userName: "",
            position: "",
            contact: "",
            startTime: "",
            endTime: "",
            assignedUserId: "",
            roomPin: "",
          };
        }
        return room;
      });

      if (hasChanges) {
        updateRoomState(updated);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [rooms]);

  return {
    rooms,
    loading,
    preAssignRoom,
    startProgress,
    startProgressWithPin,
    releaseRoom,
  };
}

"use client";

import { useEffect, useState } from "react";
import { auth, isFirebaseEnabled } from "@/lib/firebase";
import {
  signInWithEmailAndPassword as fbSignIn,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";

export interface AuthUser {
  email: string | null;
  uid: string;
}

const MOCK_STORAGE_KEY = "scaleup-center-mock-auth";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isFirebaseEnabled && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          setUser({ email: fbUser.email, uid: fbUser.uid });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Local Mock Auth Session
      const storedToken = localStorage.getItem(MOCK_STORAGE_KEY);
      if (storedToken === "admin-session-active") {
        setUser({ email: "admin", uid: "mock-admin-uid" });
      } else {
        setUser(null);
      }
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setError(null);
    setLoading(true);
    
    if (isFirebaseEnabled && auth) {
      try {
        await fbSignIn(auth, email, pass);
        setLoading(false);
        return true;
      } catch (err: any) {
        setError(err.message || "로그인에 실패했습니다.");
        setLoading(false);
        return false;
      }
    } else {
      // Mock Login Validation
      await new Promise((resolve) => setTimeout(resolve, 800)); // simulate latency
      if (email === "admin" && pass === "1234") {
        localStorage.setItem(MOCK_STORAGE_KEY, "admin-session-active");
        setUser({ email: "admin", uid: "mock-admin-uid" });
        setLoading(false);
        return true;
      } else {
        setError("아이디 혹은 비밀번호가 올바르지 않습니다. (테스트용: admin / 1234)");
        setLoading(false);
        return false;
      }
    }
  };

  const logout = async () => {
    setLoading(true);
    if (isFirebaseEnabled && auth) {
      await fbSignOut(auth);
    } else {
      localStorage.removeItem(MOCK_STORAGE_KEY);
      setUser(null);
    }
    setLoading(false);
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
  };
}

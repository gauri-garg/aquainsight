
"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { auth, database } from "@/lib/firebase";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { ref, set, get } from "firebase/database";

export type UserRole = "CMLRE" | "Researcher" | "Student";

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    role: UserRole,
    details: { fullName?: string; approvedId?: string }
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInAsDemo: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const role = await getUserRole(user.uid);
        setRole(role);
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getUserRole = async (uid: string): Promise<UserRole | null> => {
    try {
      const snapshot = await get(ref(database, `users/${uid}/role`));
      if (snapshot.exists()) {
        return snapshot.val() as UserRole;
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
    return null;
  };
  
  const signInAsDemo = async (demoRole: UserRole) => {
    let email, password;
    switch(demoRole) {
      case 'CMLRE':
        email = 'cmlre.user@example.com';
        password = 'password';
        break;
      case 'Researcher':
        email = 'researcher.user@example.com';
        password = 'password';
        break;
      case 'Student':
        email = 'student.user@example.com';
        password = 'password';
        break;
    }
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
       if (error.code === 'auth/user-not-found') {
        const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
        await set(ref(database, "users/" + newUser.uid), {
          role: demoRole,
          email: newUser.email,
        });
       } else {
         throw error;
       }
    }
  }

  const signUp = async (
    email: string,
    password: string,
    role: UserRole,
    details: { fullName?: string; approvedId?: string }
  ) => {
    const { user: newUser } = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await set(ref(database, "users/" + newUser.uid), {
      role: role,
      email: newUser.email,
      ...details
    });
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signUp, signIn, logout, signInAsDemo }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

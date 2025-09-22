
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
  updateProfile,
} from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { datasets as initialDatasets, DatasetType } from "@/lib/data";

export type UserRole = "CMLRE" | "Researcher" | "Student";

interface UserDetails {
  fullName?: string;
  approvedId?: string;
}
interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  userDetails: UserDetails | null;
  signUp: (
    email: string,
    password: string,
    role: UserRole,
    details: UserDetails
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const datasetTypeToTableName = (type: DatasetType): string => {
  return type.toLowerCase().replace(/ /g, '_');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRole = await getUserRole(user.uid);
        const details = await getUserDetails(user.uid);
        setRole(userRole);
        setUserDetails(details);
        setUser(user);
      } else {
        setUser(null);
        setRole(null);
        setUserDetails(null);
      }
      setLoading(false);
    });
    
    const seedDatabase = async () => {
      const approvedIds = [
        "CMLRE-XYZ-123",
        "CMLRE-ABC-789",
        "CMLRE-QWE-456",
      ];
      const cmlreApprovedIdsRef = ref(database, 'cmlreApprovedIds');
      const cmlreSnapshot = await get(cmlreApprovedIdsRef);
      if (!cmlreSnapshot.exists()) {
        await set(cmlreApprovedIdsRef, approvedIds);
      }
      
      const allDatasetTypes: DatasetType[] = [
        "Physical Oceanography",
        "Chemical Oceanography",
        "Marine Weather",
        "Ocean Atmosphere",
        "Fisheries",
        "eDNA"
      ];

      for (const type of allDatasetTypes) {
        const tableName = datasetTypeToTableName(type);
        const datasetsRef = ref(database, tableName);
        const datasetsSnapshot = await get(datasetsRef);
        if (!datasetsSnapshot.exists()) {
          const initialDataForType = initialDatasets.filter(d => d.type === type);
          if (initialDataForType.length > 0) {
            const dataToSeed: { [key: string]: any } = {};
            initialDataForType.forEach(dataset => {
              dataToSeed[dataset.id] = dataset;
            });
            await set(datasetsRef, dataToSeed);
          }
        }
      }
    }
    
    seedDatabase();

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

  const getUserDetails = async (uid: string): Promise<UserDetails | null> => {
    try {
      const snapshot = await get(ref(database, `users/${uid}`));
      if (snapshot.exists()) {
        return snapshot.val() as UserDetails;
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
    return null;
  }
  
  const signUp = async (
    email: string,
    password: string,
    role: UserRole,
    details: UserDetails
  ) => {
    const { user: newUser } = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    if (details.fullName) {
        await updateProfile(newUser, { displayName: details.fullName });
    }

    await set(ref(database, "users/" + newUser.uid), {
      email: newUser.email,
      role: role,
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
    <AuthContext.Provider value={{ user, role, userDetails, loading, signUp, signIn, logout }}>
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

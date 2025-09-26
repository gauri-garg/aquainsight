
"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { auth, database } from "@/lib/firebase";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  deleteUser,
} from "firebase/auth";
import { ref, set, get, child, update, remove, push, onValue } from "firebase/database";


export type UserRole = "CMLRE" | "Researcher" | "Student";

export interface Dataset {
  id?: string;
  name: string;
  description: string;
  csvData: string;
  submittedBy: string;
  date: string;
  userId: string;
}

export interface RequestedDataset {
  id?: string;
  name: string;
  description: string;
  csvData: string;
  submittedBy: string;
  date: string;
  userId: string;
}

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
  updateUserProfile: (details: Partial<UserDetails>) => Promise<void>;
  changeUserPassword: (email:string, oldPass: string, newPass: string) => Promise<void>;
  deleteUserAccount: (email: string, password: string) => Promise<void>;
  createDataset: (dataset: Omit<Dataset, "id">) => Promise<void>;
  createRequestedDataset: (dataset: Omit<RequestedDataset, "id">) => Promise<void>;
  getAllDatasets: () => Promise<Dataset[]>;
  getDatasetById: (id: string) => Promise<Dataset | null>;
  updateDataset: (id: string, updates: Partial<Dataset>) => Promise<void>;
  deleteDataset: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const seedCmlreApprovedIds = async () => {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, 'cmlreApprovedIds'));
    if (!snapshot.exists()) {
        const defaultIds = {
            'CMLRE-A-001': true,
            'CMLRE-B-002': true,
            'CMLRE-C-003': true,
        };
        await set(ref(database, 'cmlreApprovedIds'), defaultIds);
    }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const getUserRole = useCallback(async (uid: string): Promise<UserRole | null> => {
    try {
      const snapshot = await get(ref(database, `users/${uid}/role`));
      if (snapshot.exists()) {
        return snapshot.val() as UserRole;
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
    return null;
  }, []);

  const getUserDetails = useCallback(async (uid: string): Promise<UserDetails | null> => {
    try {
      const snapshot = await get(ref(database, `users/${uid}`));
      if (snapshot.exists()) {
        const details = snapshot.val();
        const authUser = auth.currentUser;
        if(authUser) {
          return {
            fullName: details.fullName || authUser.displayName,
            ...details,
          }
        }
        return details;
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
    return null;
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      await seedCmlreApprovedIds(); 

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setLoading(true);
        if (user) {
          const userRole = await getUserRole(user.uid);
          const details = await getUserDetails(user.uid);
          setUser(user);
          setRole(userRole);
          setUserDetails(details);
        } else {
          setUser(null);
          setRole(null);
          setUserDetails(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    };

    const unsubscribePromise = initializeAuth();

    return () => {
        unsubscribePromise.then(unsubscribe => unsubscribe && unsubscribe());
    };
  }, [getUserDetails, getUserRole]);

  
  const signUp = async (
    email: string,
    password: string,
    role: UserRole,
    details: UserDetails
  ) => {

    if (role === 'CMLRE') {
      if (!details.approvedId) {
        throw new Error('CMLRE Staff must provide an Approved ID.');
      }
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, `cmlreApprovedIds/${details.approvedId}`));
      if (!snapshot.exists()) {
        throw new Error('The provided Approved ID is not valid.');
      }
    }
    
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
  
  const updateUserProfile = async (details: Partial<UserDetails>) => {
    if (!user) throw new Error("Not authenticated");
    
    const updates: any = {};
    if (details.fullName) {
        updates.displayName = details.fullName;
    }
   
    if (Object.keys(updates).length > 0) {
        await updateProfile(user, updates);
    }

    await update(ref(database, 'users/' + user.uid), details);
    
    const latestUserDetails = await getUserDetails(user.uid);
    setUserDetails(latestUserDetails);
    
    // Force a re-render by creating a new user object
    if (auth.currentUser) {
      setUser({ ...auth.currentUser });
    }
  };

  const changeUserPassword = async (email: string, oldPass: string, newPass: string) => {
    if (!user) throw new Error("Not authenticated");

    const cred = EmailAuthProvider.credential(email, oldPass);
    await reauthenticateWithCredential(user, cred);
    await updatePassword(user, newPass);
  }

  const deleteUserAccount = async (email: string, password: string) => {
    if (!user) throw new Error("Not authenticated");

    const cred = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(user, cred);
    
    await remove(ref(database, 'users/' + user.uid));
    
    await deleteUser(user);
  };

  const createDataset = async (dataset: Omit<Dataset, "id">) => {
    if (role !== "CMLRE") throw new Error("Permission denied.");
    const datasetsRef = ref(database, "datasets");
    const newDatasetRef = push(datasetsRef);
    await set(newDatasetRef, dataset);
  };

  const createRequestedDataset = async (dataset: Omit<RequestedDataset, "id">) => {
    const requestedDatasetsRef = ref(database, "requested-data");
    const newRequestedDatasetRef = push(requestedDatasetsRef);
    await set(newRequestedDatasetRef, dataset);
  };

  const getAllDatasets = async (): Promise<Dataset[]> => {
    return new Promise((resolve, reject) => {
      const datasetsRef = ref(database, 'datasets');
      onValue(datasetsRef, (snapshot) => {
        const data = snapshot.val();
        if (snapshot.exists()) {
          const datasetsArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          resolve(datasetsArray);
        } else {
          resolve([]);
        }
      }, (error) => {
        reject(error);
      });
    });
  };

  const getDatasetById = async (id: string): Promise<Dataset | null> => {
    const snapshot = await get(child(ref(database), `datasets/${id}`));
    if (snapshot.exists()) {
      return { id, ...snapshot.val() };
    }
    return null;
  };

  const updateDataset = async (id: string, updates: Partial<Dataset>) => {
    if (role !== "CMLRE") throw new Error("Permission denied.");
    await update(ref(database, `datasets/${id}`), updates);
  };

  const deleteDataset = async (id: string) => {
    if (role !== "CMLRE") throw new Error("Permission denied.");
    await remove(ref(database, `datasets/${id}`));
  };


  return (
    <AuthContext.Provider value={{ user, role, userDetails, loading, signUp, signIn, logout, updateUserProfile, changeUserPassword, deleteUserAccount, createDataset, createRequestedDataset, getAllDatasets, getDatasetById, updateDataset, deleteDataset }}>
      {children}
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

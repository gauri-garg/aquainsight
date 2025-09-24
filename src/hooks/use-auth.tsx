

"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { auth, database, storage } from "@/lib/firebase";
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
import { ref, set, get, child, update, remove } from "firebase/database";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

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
  updateUserProfile: (details: Partial<UserDetails>) => Promise<void>;
  changeUserPassword: (email:string, oldPass: string, newPass: string) => Promise<void>;
  deleteUserAccount: (email: string, password: string) => Promise<void>;
  updateUserProfilePicture: (file: File) => Promise<void>;
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
        return snapshot.val() as UserDetails;
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
    return null;
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      await seedCmlreApprovedIds(); // Seed the DB first

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userRole = await getUserRole(user.uid);
          const details = await getUserDetails(user.uid);
          setRole(userRole);
          setUserDetails(details);
          // Create a new user object to force re-render
          setUser({...user});
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
    setUserDetails(prev => ({...prev, ...details}));
    // Force a re-render of user object to update consumers
    setUser({...user});
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
    
    // Delete data from Realtime Database first
    await remove(ref(database, 'users/' + user.uid));
    
    // Finally, delete the user from Authentication
    await deleteUser(user);
  };

  const updateUserProfilePicture = async (file: File) => {
    if (!user) throw new Error("Not authenticated");

    const fileRef = storageRef(storage, `profile-pictures/${user.uid}`);
    await uploadBytes(fileRef, file);
    const photoURL = await getDownloadURL(fileRef);

    await updateProfile(user, { photoURL });
     // Force a re-render of user object to update consumers
    setUser({...user});
  };


  return (
    <AuthContext.Provider value={{ user, role, userDetails, loading, signUp, signIn, logout, updateUserProfile, changeUserPassword, deleteUserAccount, updateUserProfilePicture }}>
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

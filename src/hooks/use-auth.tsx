

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
  User as FirebaseUser,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  deleteUser,
  sendPasswordResetEmail,
} from "firebase/auth";
import { ref, set, get, child, update, remove, push, onValue, query, orderByChild, equalTo } from "firebase/database";
import { format, subMonths } from 'date-fns';


export type UserRole = "CMLRE" | "User";

export interface Dataset {
  id?: string;
  name: string;
  description: string;
  csvData: string;
  submittedBy: string;
  date: string;
  userId: string;
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'new';

export interface RequestedDataset {
  id?: string;
  name: string;
  description: string;
  csvData: string;
  submittedBy: string;
  date: string;
  userId: string;
  status: SubmissionStatus;
}

export interface ArchivedSubmission {
  id: string;
  name: string;
  submittedBy: string;
  date: string;
  archivedDate: string;
  status: SubmissionStatus;
  originalId: string;
  type: 'Dataset' | 'Submission';
}

export interface Notification {
  id: string;
  userId: string;
  datasetName: string;
  date: string;
  message: string;
  read: boolean;
  status: 'approved' | 'rejected' | 'new';
}

interface UserDetails {
  fullName?: string;
  approvedId?: string;
  role?: UserRole;
  uid?: string;
}

export interface SpeciesData {
    name: string;
    count: number;
}

export type SubmissionStatusCounts = {
    [key in SubmissionStatus]?: number
} & {
    total: number;
}

export interface MonthlySubmission {
  month: string;
  submissions: number;
}

interface AuthContextType {
  user: FirebaseUser | null;
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
  sendPasswordReset: (email: string) => Promise<void>;
  updateUserProfile: (details: Partial<UserDetails>) => Promise<void>;
  changeUserPassword: (email:string, oldPass: string, newPass: string) => Promise<void>;
  deleteUserAccount: (email: string, password: string) => Promise<void>;
  createDataset: (dataset: Omit<Dataset, "id">) => Promise<void>;
  createRequestedDataset: (dataset: Omit<RequestedDataset, "id" | 'status'>) => Promise<void>;
  getAllDatasets: () => Promise<Dataset[]>;
  getDatasetById: (id: string) => Promise<Dataset | null>;
  getRequestedDatasetById: (id: string) => Promise<RequestedDataset | null>;
  getRequestedDatasetsByUserId: (userId: string) => Promise<RequestedDataset[]>;
  updateDataset: (id: string, updates: Partial<Dataset>) => Promise<void>;
  deleteDataset: (id: string) => Promise<void>;
  getRequestedDatasets: () => Promise<{ datasets: RequestedDataset[]; pendingCount: number }>;
  getAllApprovedSubmissions: () => Promise<RequestedDataset[]>;
  approveDatasetRequest: (request: RequestedDataset) => Promise<RequestedDataset>;
  rejectDatasetRequest: (request: RequestedDataset) => Promise<RequestedDataset>;
  deleteRequestedDataset: (id: string, userId: string) => Promise<void>;
  getUserNotifications: (userId: string, callback: (notifications: Notification[]) => void) => () => void;
  markNotificationsAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  getTotalDatasets: () => Promise<number>;
  getTotalUsers: () => Promise<UserDetails[]>;
  getTotalRecords: () => Promise<number>;
  clearSubmissionHistory: () => Promise<void>;
  getArchivedData: () => Promise<ArchivedSubmission[]>;
  permanentlyDeleteSubmission: (id: string, type: 'Dataset' | 'Submission') => Promise<void>;
  getUserSubmissionsCount: (userId: string) => Promise<number>;
  getUserTotalRecords: (userId: string) => Promise<number>;
  getUserSubmissionsStatusCounts: (userId: string) => Promise<SubmissionStatusCounts>;
  getUserSubmissionHistory: (userId: string) => Promise<MonthlySubmission[]>;
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
  const [user, setUser] = useState<FirebaseUser | null>(null);
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
            uid,
            ...details,
          }
        }
        return {...details, uid};
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

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
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

  const createRequestedDataset = async (dataset: Omit<RequestedDataset, "id" | "status">) => {
    const requestedDatasetsRef = ref(database, "requested-data");
    const newRequestedDatasetRef = push(requestedDatasetsRef);
    await set(newRequestedDatasetRef, {...dataset, status: 'pending'});

    // Notify all CMLRE staff
    const allUsers = await getTotalUsers();
    const cmlreStaff = allUsers.filter(u => u.role === 'CMLRE');
    
    for (const staff of cmlreStaff) {
      if (staff.uid) {
        const newNotifRef = push(ref(database, `notifications/${staff.uid}`));
        await set(newNotifRef, {
          userId: staff.uid,
          datasetName: dataset.name,
          date: new Date().toISOString(),
          message: 'New Submission',
          read: false,
          status: 'new'
        });
      }
    }
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
  
  const getRequestedDatasets = async (): Promise<{ datasets: RequestedDataset[]; pendingCount: number }> => {
    return new Promise((resolve, reject) => {
      const requestsRef = query(ref(database, 'requested-data'), orderByChild('date'));
      onValue(requestsRef, (snapshot) => {
        const data = snapshot.val();
        if (snapshot.exists()) {
          const requestsArray: RequestedDataset[] = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          
          const pendingCount = requestsArray.filter(r => r.status === 'pending').length;
          
          resolve({ 
              datasets: requestsArray.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), 
              pendingCount 
          });

        } else {
          resolve({ datasets: [], pendingCount: 0 });
        }
      }, (error) => {
        reject(error);
      });
    });
  };

  const getRequestedDatasetsByUserId = async (userId: string): Promise<RequestedDataset[]> => {
    const activeReqsPromise = new Promise<RequestedDataset[]>((resolve, reject) => {
      const activeRef = query(ref(database, 'requested-data'), orderByChild('userId'), equalTo(userId));
      onValue(activeRef, snapshot => {
        if (!snapshot.exists()) return resolve([]);
        const data = snapshot.val();
        resolve(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      }, reject, { onlyOnce: true });
    });

    const archivedReqsPromise = new Promise<RequestedDataset[]>((resolve, reject) => {
      const archivedRef = query(ref(database, 'archived-data/submissions'), orderByChild('userId'), equalTo(userId));
      onValue(archivedRef, snapshot => {
        if (!snapshot.exists()) return resolve([]);
        const data = snapshot.val();
        resolve(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      }, reject, { onlyOnce: true });
    });
  
    const [active, archived] = await Promise.all([activeReqsPromise, archivedReqsPromise]);
  
    // Combine and remove duplicates, giving preference to active submissions.
    const combined = [...active, ...archived];
    const unique = Array.from(new Map(combined.map(item => [item.name, item])).values());
  
    return unique.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const approveDatasetRequest = async (request: RequestedDataset): Promise<RequestedDataset> => {
    if (role !== "CMLRE" || !request.id) throw new Error("Permission denied.");

    const updatedRequest = { ...request, status: 'approved' as SubmissionStatus };
    await update(ref(database, `requested-data/${request.id}`), { status: 'approved' });
    
    const newNotifRef = push(ref(database, `notifications/${request.userId}`));
    await set(newNotifRef, {
      userId: request.userId,
      datasetName: request.name,
      date: new Date().toISOString(),
      message: 'Dataset approved',
      read: false,
      status: 'approved'
    });
    return updatedRequest;
  };

  const rejectDatasetRequest = async (request: RequestedDataset): Promise<RequestedDataset> => {
    if (role !== "CMLRE" || !request.id) throw new Error("Permission denied.");
    
    const updatedRequest = { ...request, status: 'rejected' as SubmissionStatus };
    await update(ref(database, `requested-data/${request.id}`), { status: 'rejected' });
    
    const newNotifRef = push(ref(database, `notifications/${request.userId}`));
    await set(newNotifRef, {
      userId: request.userId,
      datasetName: request.name,
      date: new Date().toISOString(),
      message: `Dataset rejected`,
      read: false,
      status: 'rejected',
    });

    return updatedRequest;
  };
  
  const deleteRequestedDataset = async (id: string, userId: string) => {
    if (!user || user.uid !== userId) throw new Error("Permission denied.");
    const requestRef = ref(database, `requested-data/${id}`);
    const snapshot = await get(requestRef);
    if(snapshot.exists() && snapshot.val().status === 'pending') {
      await remove(requestRef);
    } else {
      throw new Error("Can only delete pending submissions that you own.");
    }
  };

  const getUserNotifications = (userId: string, callback: (notifications: Notification[]) => void) => {
    const notificationsRef = query(ref(database, `notifications/${userId}`), orderByChild('date'));
    const listener = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notificationsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        callback(notificationsArray);
      } else {
        callback([]);
      }
    });
    return listener;
  };
  
  const markNotificationsAsRead = async () => {
    if (!user) return;
    const notificationsRef = ref(database, `notifications/${user.uid}`);
    const snapshot = await get(notificationsRef);
    if (snapshot.exists()) {
      const updates: { [key: string]: boolean } = {};
      snapshot.forEach((childSnapshot) => {
        if (!childSnapshot.val().read) {
          updates[`${childSnapshot.key}/read`] = true;
        }
      });
      if (Object.keys(updates).length > 0) {
        await update(notificationsRef, updates);
      }
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!user) throw new Error("Not authenticated");
    await remove(ref(database, `notifications/${user.uid}/${notificationId}`));
  };

  const getDatasetById = async (id: string): Promise<Dataset | null> => {
    const snapshot = await get(child(ref(database), `datasets/${id}`));
    if (snapshot.exists()) {
      return { id, ...snapshot.val() };
    }
    return null;
  };
  
  const getRequestedDatasetById = async (id: string): Promise<RequestedDataset | null> => {
    const snapshot = await get(child(ref(database), `requested-data/${id}`));
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
    
    const datasetRef = ref(database, `datasets/${id}`);
    const snapshot = await get(datasetRef);

    if (snapshot.exists()) {
      const dataToMove = snapshot.val();
      const archiveRef = ref(database, `archived-data/datasets/${id}`);
      await set(archiveRef, {...dataToMove, archivedDate: new Date().toISOString()});
      await remove(datasetRef);
    }
  };

  const getTotalDatasets = async (): Promise<number> => {
    const snapshot = await get(ref(database, 'datasets'));
    return snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
  }
  
  const getTotalUsers = async (): Promise<UserDetails[]> => {
    const snapshot = await get(ref(database, 'users'));
    if (snapshot.exists()) {
      const usersData = snapshot.val();
      return Object.keys(usersData).map(uid => ({
        uid,
        ...usersData[uid]
      }));
    }
    return [];
  };

  const getTotalRecords = async (): Promise<number> => {
    const snapshot = await get(ref(database, 'datasets'));
    if (!snapshot.exists()) return 0;
    const datasets = snapshot.val();
    return Object.values<Dataset>(datasets).reduce((acc, ds) => {
        // -1 for header row
        const rowCount = (ds.csvData?.split('\n').length || 1) - 1;
        return acc + (rowCount > 0 ? rowCount : 0);
    }, 0);
  };
  
  const clearSubmissionHistory = async () => {
    if (role !== "CMLRE") throw new Error("Permission denied.");

    const requestedDataRef = ref(database, 'requested-data');
    const snapshot = await get(requestedDataRef);

    if (snapshot.exists()) {
        const allSubmissions = snapshot.val();
        const submissionsToArchive: { [key: string]: any } = {};
        const submissionsToRemove: { [key: string]: null } = {};

        for (const key in allSubmissions) {
            const submission = allSubmissions[key];
            if (submission.status === 'approved' || submission.status === 'rejected') {
                submissionsToArchive[key] = {
                    ...submission,
                    archivedDate: new Date().toISOString(),
                };
                submissionsToRemove[key] = null; // Mark for deletion
            }
        }
        
        if (Object.keys(submissionsToArchive).length > 0) {
          const archiveRef = ref(database, 'archived-data/submissions');
          await update(archiveRef, submissionsToArchive);
          await update(requestedDataRef, submissionsToRemove);
        }
    }
  };

  const getArchivedData = async (): Promise<ArchivedSubmission[]> => {
    if (role !== "CMLRE") throw new Error("Permission denied.");
    const archiveRef = ref(database, 'archived-data');
    const snapshot = await get(archiveRef);
    if (snapshot.exists()) {
      const allArchives = snapshot.val();
      const combined: ArchivedSubmission[] = [];

      if (allArchives.datasets) {
        combined.push(...Object.keys(allArchives.datasets).map(key => ({
          id: key,
          type: 'Dataset',
          ...allArchives.datasets[key]
        })));
      }
      if (allArchives.submissions) {
         combined.push(...Object.keys(allArchives.submissions).map(key => ({
          id: key,
          type: 'Submission',
           ...allArchives.submissions[key]
        })));
      }
      return combined.sort((a, b) => {
        const dateA = a.archivedDate || a.date;
        const dateB = b.archivedDate || b.date;
        return new Date(dateB).getTime() - new Date(dateA).getTime()
      });
    }
    return [];
  };
  
  const permanentlyDeleteSubmission = async (id: string, type: 'Dataset' | 'Submission') => {
    if (role !== "CMLRE") throw new Error("Permission denied.");
    
    const node = type.toLowerCase() + 's'; // 'datasets' or 'submissions'
    const archiveRef = ref(database, `archived-data/${node}/${id}`);

    const snapshot = await get(archiveRef);
    if (snapshot.exists()) {
      await remove(archiveRef);
    } else {
        throw new Error(`Archived item not found for ID: ${id}`);
    }
  };
  
  const getAllApprovedSubmissions = async (): Promise<RequestedDataset[]> => {
    const activePromise = new Promise<RequestedDataset[]>((resolve, reject) => {
      const activeRef = query(ref(database, 'requested-data'), orderByChild('status'), equalTo('approved'));
      onValue(activeRef, snapshot => {
        if (!snapshot.exists()) return resolve([]);
        const data = snapshot.val();
        resolve(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      }, reject, { onlyOnce: true });
    });

    const archivedPromise = new Promise<RequestedDataset[]>((resolve, reject) => {
      const archivedRef = query(ref(database, 'archived-data/submissions'), orderByChild('status'), equalTo('approved'));
      onValue(archivedRef, snapshot => {
        if (!snapshot.exists()) return resolve([]);
        const data = snapshot.val();
        resolve(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      }, reject, { onlyOnce: true });
    });

    const [active, archived] = await Promise.all([activePromise, archivedPromise]);
    const combined = [...active, ...archived];
    const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
    
    return unique.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getUserSubmissionsCount = async (userId: string): Promise<number> => {
    const submissions = await getRequestedDatasetsByUserId(userId);
    return submissions.length;
  };
  
  const getUserTotalRecords = async (userId: string): Promise<number> => {
    const submissions = await getRequestedDatasetsByUserId(userId);
    const approvedSubmissions = submissions.filter(s => s.status === 'approved');
    return approvedSubmissions.reduce((acc, ds) => {
        const rowCount = (ds.csvData?.split('\n').length || 1) - 1;
        return acc + (rowCount > 0 ? rowCount : 0);
    }, 0);
  };
  
  const getUserSubmissionsStatusCounts = async (userId: string): Promise<SubmissionStatusCounts> => {
    const submissions = await getRequestedDatasetsByUserId(userId);
    const counts = submissions.reduce((acc, sub) => {
      acc[sub.status] = (acc[sub.status] || 0) + 1;
      return acc;
    }, {} as Record<SubmissionStatus, number>);
    return { ...counts, total: submissions.length };
  };

  const getUserSubmissionHistory = async (userId: string): Promise<MonthlySubmission[]> => {
    const submissions = await getRequestedDatasetsByUserId(userId);
    const now = new Date();
    const monthlyCounts: { [key: string]: number } = {};

    for (let i = 0; i < 12; i++) {
        const date = subMonths(now, 11 - i);
        const monthKey = format(date, 'MMM yy');
        monthlyCounts[monthKey] = 0;
    }
    
    submissions.forEach(s => {
      const subDate = new Date(s.date);
      const oneYearAgo = subMonths(now, 11);
      oneYearAgo.setDate(1);

      if (subDate >= oneYearAgo) {
          const monthKey = format(subDate, 'MMM yy');
          if (monthlyCounts.hasOwnProperty(monthKey)) {
             monthlyCounts[monthKey]++;
          }
      }
    });
    
    return Object.entries(monthlyCounts).map(([month, count]) => ({
        month: month,
        submissions: count,
    }));
  };


  return (
    <AuthContext.Provider value={{ user, role, userDetails, loading, signUp, signIn, logout, sendPasswordReset, updateUserProfile, changeUserPassword, deleteUserAccount, createDataset, createRequestedDataset, getAllDatasets, getDatasetById, getRequestedDatasetById, updateDataset, deleteDataset, getRequestedDatasets, getAllApprovedSubmissions, getRequestedDatasetsByUserId, approveDatasetRequest, rejectDatasetRequest, deleteRequestedDataset, getUserNotifications, markNotificationsAsRead, deleteNotification, getTotalDatasets, getTotalUsers, getTotalRecords, clearSubmissionHistory, getArchivedData, permanentlyDeleteSubmission, getUserSubmissionsCount, getUserTotalRecords, getUserSubmissionsStatusCounts, getUserSubmissionHistory }}>
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

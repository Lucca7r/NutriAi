import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { FIREBASE_AUTH, FIREBASE_DB } from "../services/firebaseConfig"; // Importe o DB
import firebase from "firebase/compat/app";

type User = firebase.User;

export interface UserProfile {
  name: string;
  email: string;
  createdAt: firebase.firestore.Timestamp;
  formularioConcluido?: boolean;
  formResponses?: Record<string, any>;
  dailyCalorieGoal?: number;
  photoURL?: string;
  cachedTips?: {
    tips: string[];
    generatedAt: firebase.firestore.Timestamp;
  };
}

interface AuthContextData {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  reloadProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    const userDocRef = FIREBASE_DB.collection("users").doc(uid);
    const doc = await userDocRef.get();

    if (doc.exists) {
      setProfile(doc.data() as UserProfile);
      console.log("--- PERFIL CARREGADO DO FIRESTORE ---", doc.data());
      setProfile(doc.data() as UserProfile);
    } else {
      console.log("Documento do usuário não encontrado no Firestore.");
      setProfile(null);
    }
  };

  useEffect(() => {
    const unsubscribe = FIREBASE_AUTH.onAuthStateChanged(
      async (authenticatedUser) => {
        setUser(authenticatedUser);
        if (authenticatedUser) {
          await fetchProfile(authenticatedUser.uid);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const reloadProfile = async () => {
    if (user) {
      await fetchProfile(user.uid);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, reloadProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
// Remova o import de User e onAuthStateChanged de 'firebase/auth'
import { FIREBASE_AUTH } from "../services/firebaseConfig";
import firebase from "firebase/compat/app"; // Importe o firebase/compat/app

type User = firebase.User;

interface AuthContextData {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // SINTAXE NOVA para o listener
    const unsubscribe = FIREBASE_AUTH.onAuthStateChanged(
      (authenticatedUser) => {
        setUser(authenticatedUser);
        setLoading(false);
      }
    );

    return unsubscribe; // A função de cleanup é a própria unsubscribe
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para facilitar o uso do contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

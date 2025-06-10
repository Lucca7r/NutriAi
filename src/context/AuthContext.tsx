// src/context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FIREBASE_AUTH, FIREBASE_DB } from '../services/firebaseConfig'; // Importe o DB
import firebase from 'firebase/compat/app';

type User = firebase.User;

// Vamos criar uma interface para os dados do nosso perfil
export interface UserProfile {
  name: string;
  email: string;
  createdAt: firebase.firestore.Timestamp;
  // futuramente: avatarUrl, planoAlimentar, etc.
}

interface AuthContextData {
  user: User | null;
  profile: UserProfile | null; // Adicione o perfil do usuário ao contexto
  loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null); // Crie o estado para o perfil
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = FIREBASE_AUTH.onAuthStateChanged(async (authenticatedUser) => {
      setUser(authenticatedUser);

      // Se o usuário fez login, busque os dados dele no Firestore
      if (authenticatedUser) {
        const userDocRef = FIREBASE_DB.collection('users').doc(authenticatedUser.uid);
        const doc = await userDocRef.get();
        
        if (doc.exists) {
          setProfile(doc.data() as UserProfile);
        } else {
          console.log("Documento do usuário não encontrado no Firestore.");
          setProfile(null);
        }
      } else {
       
        setProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
    // ... (o hook continua igual)
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};
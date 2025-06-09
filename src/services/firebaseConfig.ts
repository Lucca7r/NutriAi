import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

import { 
  FIREBASE_API_KEY, 
  FIREBASE_AUTH_DOMAIN, 
  FIREBASE_PROJECT_ID, 
  FIREBASE_STORAGE_BUCKET, 
  FIREBASE_MESSAGING_SENDER_ID, 
  FIREBASE_APP_ID 
} from '@env';

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
};

// Se o app não foi inicializado, inicializa
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Criamos as instâncias dos serviços aqui
const auth = firebase.auth();
const db = firebase.firestore();

// -------------------------------------------------------------------
// A CORREÇÃO DEFINITIVA ESTÁ AQUI
// -------------------------------------------------------------------
// Em vez de importar 'getReactNativePersistence', nós explicitamente dizemos
// ao Firebase para usar o armazenamento do dispositivo. A biblioteca 'compat'
// é inteligente o suficiente para encontrar o AsyncStorage por conta própria
// quando instruída a usar a persistência local neste ambiente.
// Isso resolve tanto o erro de importação quanto o erro 'setItem of undefined'.
try {
  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
} catch (error) {
  console.error("Firebase persistence error:", error);
}

export { auth, db };

// src/services/firebaseConfig.ts

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
// Importação do Functions (v9)
import { getFunctions } from "firebase/functions"; 

// Suas importações do @env (Correto!)
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID
} from '@env';

// Sua config (Correto!)
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
};

// Sua inicialização (Correto!)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const app = firebase.app(); 

// Suas exportações (Correto!)
export const FIREBASE_AUTH = firebase.auth();
export const FIREBASE_DB = firebase.firestore();
export const FIREBASE_STORAGE = firebase.storage();

// A ÚNICA LINHA NOVA QUE VOCÊ PRECISA ADICIONAR:
export const FIREBASE_FUNCTIONS = getFunctions(app, 'us-central1');
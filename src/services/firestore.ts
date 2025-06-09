import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import firebase from './firebaseConfig';

export const db = firebase.firestore();

export const saveUserData = async (uid: string, data: any) => {
  await setDoc(doc(db, 'users', uid), data);
};

export const getUserData = async (uid: string) => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

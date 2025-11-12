// Firebase config and helper exports
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, query, where, orderBy, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBW6ZTGHyaYwVgT9dog2y-B2Xg44d_047o",
  authDomain: "novafarmaageu-5c519.firebaseapp.com",
  projectId: "novafarmaageu-5c519",
  storageBucket: "novafarmaageu-5c519.firebasestorage.app",
  messagingSenderId: "954166915495",
  appId: "1:954166915495:web:d90f95364e95c8e31b0682",
  measurementId: "G-XNDV0NKV3H"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// helper to reference collection 'faltas'
const faltasCollection = (storeId) => collection(db, 'faltas');

export {
  db,
  faltasCollection,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc
};

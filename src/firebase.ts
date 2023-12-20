import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyAqC970R0HBerRwZ3XP_m6KzPrlboJlIYg",
  authDomain: "scan-rent.firebaseapp.com",
  projectId: "scan-rent",
  storageBucket: "scan-rent.appspot.com",
  messagingSenderId: "33007209112",
  appId: "1:33007209112:web:dd1ec57e50ec2887839eed",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

if (import.meta.env.DEV) {
  connectFirestoreEmulator(db, "localhost", 8080);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
  connectFunctionsEmulator(functions, "localhost", 5001);
}

export default app;

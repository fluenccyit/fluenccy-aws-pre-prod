import 'firebase/auth';
import 'firebase/remote-config';
import firebase from 'firebase/app';

export const firebaseService = firebase.apps.length
  ? firebase.app()
  : firebase.initializeApp({
      apiKey: window.__FLUENCCY_APP_CONFIG__.FIREBASE_API_KEY,
      authDomain: window.__FLUENCCY_APP_CONFIG__.FIREBASE_AUTH_DOMAIN,
      projectId: window.__FLUENCCY_APP_CONFIG__.FIREBASE_PROJECT_ID,
      storageBucket: window.__FLUENCCY_APP_CONFIG__.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: window.__FLUENCCY_APP_CONFIG__.FIREBASE_MESSAGING_SENDER_ID,
      appId: window.__FLUENCCY_APP_CONFIG__.FIREBASE_APP_ID,
    });

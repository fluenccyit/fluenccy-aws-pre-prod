import 'firebase/auth';
import firebase from 'firebase/app';

const _fire = firebase.initializeApp({
  apiKey: Cypress.env('FIREBASE_API_KEY'),
  authDomain: Cypress.env('FIREBASE_AUTH_DOMAIN'),
  projectId: Cypress.env('FIREBASE_PROJECT_ID'),
  storageBucket: Cypress.env('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: Cypress.env('FIREBASE_MESSAGING_SENDER_ID'),
  appId: Cypress.env('FIREBASE_APP_ID'),
});

Cypress.Commands.add('login', async (email, password) => {
  return new Promise((resolve, reject) => {
    _fire
      .auth()
      .signOut()
      .then(() => _fire.auth().signInWithEmailAndPassword(email, password))
      .then(resolve)
      .catch(reject);
  });
});

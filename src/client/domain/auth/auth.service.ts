import firebase from 'firebase/app';
import { firebaseService, loggerService } from '@client/common';

type OnAuthStateChangedParam = (firebaseUser: firebase.User | null) => void;
type OnIsTokenChangedParam = () => void;

class AuthService {
  getFirebaseUser(): Promise<firebase.User | null> {
    loggerService.debug('[AuthService] Getting firebase user in state.');

    return new Promise((resolve) => {
      const unsubscribe = firebaseService.auth().onAuthStateChanged((firebaseUser) => {
        resolve(firebaseUser);
        unsubscribe();
      });
    });
  }

  getToken(): Promise<string> {
    loggerService.debug('[AuthService] Getting firebase token in state.');

    return new Promise((resolve, reject) => {
      firebaseService.auth().currentUser?.getIdToken(true).then(resolve).catch(reject);
    });
  }

  onAuthStateChanged(callback: OnAuthStateChangedParam) {
    return firebaseService.auth().onAuthStateChanged(callback);
  }

  onIdTokenChanged(callback: OnIsTokenChangedParam) {
    return firebaseService.auth().onIdTokenChanged(callback);
  }

  signInWithEmailAndPassword(email: string, password: string): Promise<firebase.User> {
    loggerService.debug('[AuthService] Signing user in.');

    return new Promise((resolve, reject) => {
      firebaseService
        .auth()
        .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => firebaseService.auth().signInWithEmailAndPassword(email, password))
        .then(() => this.getFirebaseUser())
        .then((firebaseUser) => (firebaseUser ? resolve(firebaseUser) : reject()))
        .catch(reject);
    });
  }

  sendResetPasswordEmail(email: string) {
    loggerService.debug('[AuthService] Sending reset password email.');

    return new Promise((resolve, reject) => {
      firebaseService.auth().sendPasswordResetEmail(email).then(resolve).catch(reject);
    });
  }

  signOut() {
    loggerService.debug('[AuthService] Signing user out.');

    return new Promise((resolve, reject) => {
      firebaseService.auth().signOut().then(resolve).catch(reject);
    });
  }
}

export const authService = new AuthService();

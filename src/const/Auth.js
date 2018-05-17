import { AsyncStorage } from "react-native";
import CONFIG from './Config';

export const onSignIn = (data) => AsyncStorage.setItem(CONFIG.AUTH, data);

export const onSignOut = () => AsyncStorage.removeItem(CONFIG.AUTH);

export const isSignedIn = () => {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem(CONFIG.AUTH)
      .then(res => {
        if (res !== null) {
          let result = JSON.parse(res);
          resolve(result);
        } else {
          resolve(false);
        }
      })
      .catch(err => reject(err));
  });
};
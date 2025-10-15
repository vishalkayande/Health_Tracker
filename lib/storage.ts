import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

const storage = {
  async getItem(key: string) {
    return Promise.resolve(localStorage.getItem(key));
  },
  async setItem(key: string, value: string) {
    localStorage.setItem(key, value);
    return Promise.resolve();
  },
  async removeItem(key: string) {
    localStorage.removeItem(key);
    return Promise.resolve();
  }
};

export default storage;

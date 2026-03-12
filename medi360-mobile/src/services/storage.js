/**
 * Safe AsyncStorage Wrapper
 * Prevents crashes if the native module is null (common in some dev environments)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Memory fallback for environments where AsyncStorage native module is missing
const memoryStorage = {};

const SafeStorage = {
  getItem: async (key) => {
    try {
      if (!AsyncStorage) return memoryStorage[key] || null;
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.warn('Storage Error (getItem):', e);
      return memoryStorage[key] || null;
    }
  },

  setItem: async (key, value) => {
    try {
      if (!AsyncStorage) {
        memoryStorage[key] = value;
        return;
      }
      return await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.warn('Storage Error (setItem):', e);
      memoryStorage[key] = value;
    }
  },

  removeItem: async (key) => {
    try {
      if (!AsyncStorage) {
        delete memoryStorage[key];
        return;
      }
      return await AsyncStorage.removeItem(key);
    } catch (e) {
      console.warn('Storage Error (removeItem):', e);
      delete memoryStorage[key];
    }
  },

  clear: async () => {
    try {
      if (!AsyncStorage) {
        Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]);
        return;
      }
      return await AsyncStorage.clear();
    } catch (e) {
      console.warn('Storage Error (clear):', e);
    }
  }
};

export default SafeStorage;

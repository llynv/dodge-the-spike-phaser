import { Storage } from '../interface/storage';

/**
 * LocalStorage implementing IStorage interface
 * Provides browser localStorage functionality with consistent async API
 */
export class HighScoreRepository implements Storage {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = localStorage.getItem(key);
      if (value === null) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Error getting item from localStorage (key: ${key}):`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error setting item in localStorage (key: ${key}):`, error);
      throw new Error(
        `Failed to store data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item from localStorage (key: ${key}):`, error);
      throw new Error(
        `Failed to remove data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error(`Error checking item in localStorage (key: ${key}):`, error);
      return false;
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      throw new Error(
        `Failed to clear storage: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

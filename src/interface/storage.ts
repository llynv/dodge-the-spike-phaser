/**
 * Storage interface for abstracting data persistence
 * Allows for different storage implementations (localStorage, cloud storage, etc.)
 */
export interface Storage {
  /**
   * Get data by key
   * @param key Storage key
   * @returns Promise resolving to the stored data or null if not found
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Set data by key
   * @param key Storage key
   * @param value Data to store
   * @returns Promise resolving when storage operation is complete
   */
  set<T>(key: string, value: T): Promise<void>;

  /**
   * Remove data by key
   * @param key Storage key
   * @returns Promise resolving when removal is complete
   */
  remove(key: string): Promise<void>;

  /**
   * Check if key exists
   * @param key Storage key
   * @returns Promise resolving to true if key exists
   */
  has(key: string): Promise<boolean>;

  /**
   * Clear all storage
   * @returns Promise resolving when clear is complete
   */
  clear(): Promise<void>;
}

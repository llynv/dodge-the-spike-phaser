/**
 * Service Container for dependency injection and service management
 * Implements the Service Locator and Dependency Injection patterns
 */
export class ServiceContainer {
  private static instance: ServiceContainer | null = null;
  private services: Map<string, unknown> = new Map();
  private factories: Map<string, () => unknown> = new Map();
  private singletons: Map<string, unknown> = new Map();

  private constructor() { }

  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  /**
   * Register a service instance (already created)
   */
  public registerInstance<T>(key: string, instance: T): void {
    this.services.set(key, instance);
  }

  /**
   * Register a factory function for creating services
   */
  public registerFactory<T>(key: string, factory: () => T): void {
    this.factories.set(key, factory);
  }

  /**
   * Register a singleton factory (created once, reused)
   */
  public registerSingleton<T>(key: string, factory: () => T): void {
    this.factories.set(key, () => {
      if (!this.singletons.has(key)) {
        this.singletons.set(key, factory());
      }
      return this.singletons.get(key);
    });
  }

  /**
   * Resolve a service by key
   */
  public resolve<T>(key: string): T {
    if (this.services.has(key)) {
      return this.services.get(key) as T;
    }

    if (this.factories.has(key)) {
      const factory = this.factories.get(key)!;
      return factory() as T;
    }

    throw new Error(`Service '${key}' is not registered`);
  }

  /**
   * Check if a service is registered
   */
  public has(key: string): boolean {
    return this.services.has(key) || this.factories.has(key);
  }

  /**
   * Remove a service registration
   */
  public unregister(key: string): void {
    this.services.delete(key);
    this.factories.delete(key);
    this.singletons.delete(key);
  }

  /**
   * Clear all services (useful for testing)
   */
  public clear(): void {
    this.services.clear();
    this.factories.clear();
    this.singletons.clear();
  }
}

export const ServiceKeys = {
  HIGH_SCORE_SERVICE: 'HighScoreService',
  STORAGE_SERVICE: 'StorageService',
} as const;

import { ServiceContainer, ServiceKeys } from './ServiceContainer';
import { Storage } from '../interface/storage';
import { HighScoreRepository } from '../repositories/HighScoreRepository';
import { HighScoreService } from './HighScoreService';
import { ServiceConfig } from '../interface/serviceConfig';
import { StorageConfig } from '../interface/storageConfig';

/**
 * Service Bootstrapper - handles service registration and configuration
 * Separates service setup from business logic
 */
export class ServiceBootstrapper {
  private container: ServiceContainer;

  constructor(container: ServiceContainer = ServiceContainer.getInstance()) {
    this.container = container;
  }

  /**
   * Initialize all services for the game
   * This is where service composition happens
   */
  public initializeServices(config?: ServiceConfig): void {
    this.setupStorageServices(config?.storage);

    this.setupGameServices();
  }

  /**
   * Setup storage-related services
   */
  private setupStorageServices(storageConfig?: StorageConfig): void {
    const storageType = storageConfig?.type || 'localStorage';

    const storage = this.chooseStorage(storageType);

    this.container.registerInstance(ServiceKeys.STORAGE_SERVICE, storage);
  }

  private chooseStorage(storageType: StorageConfig['type']): Storage {
    switch (storageType) {
      case 'localStorage':
        return new HighScoreRepository();
      case 'cloud':
        throw new Error('Cloud storage not yet implemented');
      case 'hybrid':
        throw new Error('Hybrid storage not yet implemented');
      default:
        return new HighScoreRepository();
    }
  }
  /**
   * Setup game-specific services
   */
  private setupGameServices(): void {
    this.container.registerSingleton(ServiceKeys.HIGH_SCORE_SERVICE, () => {
      const storage = this.container.resolve<Storage>(ServiceKeys.STORAGE_SERVICE);
      return new HighScoreService(storage);
    });
  }

  /**
   * Clean up services (useful for testing or shutdown)
   */
  public cleanup(): void {
    this.container.clear();
  }
}

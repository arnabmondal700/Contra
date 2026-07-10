// core/ServiceLocator.ts
export class ServiceLocator {
  private static services = new Map<string, unknown>();

  static register<T>(key: string, instance: T): void {
    this.services.set(key, instance);
  }

  static get<T>(key: string): T {
    const svc = this.services.get(key);
    if (!svc) throw new Error(`Service not registered: ${key}`);
    return svc as T;
  }

  static has(key: string): boolean {
    return this.services.has(key);
  }

  static clear(): void {
    this.services.clear();
  }
}

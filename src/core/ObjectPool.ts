interface Poolable {
  active: boolean;
  setActive(value: boolean): this;
  setVisible(value: boolean): this;
}

export class ObjectPool<T extends Phaser.GameObjects.GameObject> {
  private pool: T[] = [];

  constructor(
    private readonly factory: () => T,
    private readonly reset: (obj: T) => void,
    initialSize = 20
  ) {
    for (let i = 0; i < initialSize; i++) {
      const obj = factory();
      (obj as unknown as Poolable).setActive(false);
      (obj as unknown as Poolable).setVisible(false);
      this.pool.push(obj);
    }
  }

  acquire(): T {
    let obj = this.pool.find((o) => !(o as unknown as Poolable).active);
    if (!obj) {
      obj = this.factory();
      this.pool.push(obj);
    }
    (obj as unknown as Poolable).setActive(true).setVisible(true);
    return obj;
  }

  release(obj: T): void {
    this.reset(obj);
    (obj as unknown as Poolable).setActive(false).setVisible(false);
  }

  get activeCount(): number {
    return this.pool.filter((o) => (o as unknown as Poolable).active).length;
  }

  get totalCount(): number {
    return this.pool.length;
  }
}
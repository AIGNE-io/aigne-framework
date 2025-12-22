export class Mutex {
  constructor() {
    this._lock = Promise.resolve();
  }

  private _lock: Promise<void>;

  lock() {
    let unlockNext: () => void;
    const willLock = new Promise<void>((resolve) => {
      unlockNext = resolve;
    });

    const willUnlock = this._lock.then(() => unlockNext);
    this._lock = willLock;

    return willUnlock;
  }

  async runExclusive<T>(callback: () => Promise<T> | T): Promise<T> {
    const unlock = await this.lock();
    try {
      return await callback();
    } finally {
      unlock();
    }
  }
}

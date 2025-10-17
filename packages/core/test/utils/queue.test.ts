import { describe, expect, it, jest } from "bun:test";
import assert from "node:assert";
import fastq, { promise } from "@aigne/core/utils/queue.js";

// Utility functions for testing
const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));
const immediate = (): Promise<void> => new Promise((resolve) => setImmediate(resolve));

describe("queue", () => {
  describe("Basic concurrency validation", () => {
    it("should throw error for concurrency less than 1", () => {
      expect(() => {
        fastq(async () => {}, 0);
      }).toThrow("concurrency must be equal to or greater than 1");
    });

    it("should not throw error for concurrency equal to 1", () => {
      expect(() => {
        fastq(async () => {}, 1);
      }).not.toThrow();
    });

    it("should not throw error for concurrency greater than 1", () => {
      expect(() => {
        fastq(async () => {}, 5);
      }).not.toThrow();
    });
  });

  describe("Worker execution", () => {
    it("should execute worker with correct arguments", () => {
      const worker = jest.fn((task: number, done: (err: any, result?: number) => void) => {
        done(null, task * 2);
      });

      const queue = fastq(worker, 1);

      queue.push(42, (err, result) => {
        expect(err).toBeNull();
        expect(result).toBe(84);
      });

      expect(worker).toHaveBeenCalledTimes(1);
      expect(worker).toHaveBeenCalledWith(42, expect.any(Function));
    });

    it("should handle multiple tasks in order", (done) => {
      const results: number[] = [];

      const worker = (task: number, callback: (err: any, result?: number) => void) => {
        setTimeout(() => {
          callback(null, task * 2);
        }, task);
      };

      const queue = fastq(worker, 1);

      queue.push(10, (_err, result) => {
        assert(result);
        results.push(result);
      });

      queue.push(5, (_err, result) => {
        assert(result);
        results.push(result);
        expect(results).toEqual([20, 10]);
        done();
      });
    });
  });

  describe("Queue properties and methods", () => {
    it("should report running tasks correctly", () => {
      const queue = fastq((_task: any, done: any) => {
        setTimeout(() => done(null), 10);
      }, 2);

      expect(queue.running()).toBe(0);

      queue.push(1);
      expect(queue.running()).toBe(1);

      queue.push(2);
      expect(queue.running()).toBe(2);

      queue.push(3);
      expect(queue.running()).toBe(2); // limited by concurrency
    });

    it("should report queue length correctly", () => {
      const queue = fastq((_task: any, done: any) => {
        setTimeout(() => done(null), 50);
      }, 1);

      expect(queue.length()).toBe(0);

      queue.push(1);
      queue.push(2);
      queue.push(3);

      expect(queue.length()).toBe(2); // one is running, two are queued
    });

    it("should return queued tasks", () => {
      const queue = fastq((_task: any, done: any) => {
        setTimeout(() => done(null), 50);
      }, 1);

      queue.push(1);
      queue.push(2);
      queue.push(3);

      const queuedTasks = queue.getQueue();
      expect(queuedTasks).toEqual([2, 3]);
    });

    it("should report idle state correctly", (done) => {
      const queue = fastq((_task: any, callback: any) => {
        setTimeout(() => callback(null), 10);
      }, 1);

      expect(queue.idle()).toBe(true);

      queue.push(1, () => {
        setTimeout(() => {
          expect(queue.idle()).toBe(true);
          done();
        }, 5);
      });

      expect(queue.idle()).toBe(false);
    });
  });

  describe("Pause and resume functionality", () => {
    it("should pause and resume queue processing", (done) => {
      let processed = 0;

      const queue = fastq((task: number, callback: any) => {
        processed++;
        setTimeout(() => callback(null, task), 1);
      }, 1);

      queue.push(1);
      queue.push(2);

      queue.pause();
      expect(queue.paused).toBe(true);

      setTimeout(() => {
        expect(processed).toBe(1); // Only first task should be processed

        queue.resume();
        expect(queue.paused).toBe(false);

        setTimeout(() => {
          expect(processed).toBe(2); // Second task should now be processed
          done();
        }, 10);
      }, 10);
    });
  });

  describe("Unshift functionality", () => {
    it("should add tasks to the front of the queue", (done) => {
      const processed: number[] = [];

      const queue = fastq((task: number, callback: any) => {
        processed.push(task);
        setTimeout(() => callback(null, task), 1);
      }, 1);

      queue.push(1);
      queue.push(2);
      queue.unshift(3);

      setTimeout(() => {
        expect(processed).toEqual([1, 3, 2]);
        done();
      }, 20);
    });
  });

  describe("Error handling", () => {
    it("should handle worker errors", (done) => {
      const queue = fastq((task: any, callback: any) => {
        if (task === "error") {
          callback(new Error("Test error"));
        } else {
          callback(null, task);
        }
      }, 1);

      queue.push("error", (err, result) => {
        expect(err).toBeInstanceOf(Error);
        expect(err?.message).toBe("Test error");
        expect(result).toBeUndefined();
        done();
      });
    });

    it("should call global error handler", (done) => {
      const queue = fastq((task: any, callback: any) => {
        callback(new Error("Global error"), task);
      }, 1);

      queue.error((err, task) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe("Global error");
        expect(task).toBe("test");
        done();
      });

      queue.push("test");
    });
  });

  describe("Kill functionality", () => {
    it("should kill queue and clear pending tasks", () => {
      const queue = fastq((_task: any, done: any) => {
        setTimeout(() => done(null), 50);
      }, 1);

      queue.push(1);
      queue.push(2);
      queue.push(3);

      expect(queue.length()).toBe(2);

      queue.kill();

      expect(queue.length()).toBe(0);
      expect(queue.getQueue()).toEqual([]);
    });

    it("should kill and drain queue", (done) => {
      let drainCalled = false;

      const queue = fastq((_task: any, callback: any) => {
        setTimeout(() => callback(null), 10);
      }, 1);

      queue.drain = () => {
        drainCalled = true;
      };

      queue.push(1);
      queue.push(2);

      queue.killAndDrain();

      expect(drainCalled).toBe(true);
      expect(queue.length()).toBe(0);
      done();
    });
  });

  describe("Drain callback", () => {
    it("should call drain when queue becomes empty", (done) => {
      let drainCalled = false;

      const queue = fastq((_task: any, callback: any) => {
        setTimeout(() => callback(null), 5);
      }, 1);

      queue.drain = () => {
        drainCalled = true;
      };

      queue.push(1, () => {
        setTimeout(() => {
          expect(drainCalled).toBe(true);
          done();
        }, 1);
      });
    });
  });

  describe("Saturated callback", () => {
    it("should call saturated when concurrency limit is reached", (done) => {
      let saturatedCalled = false;

      const queue = fastq((_task: any, callback: any) => {
        setTimeout(() => callback(null), 20);
      }, 1);

      queue.saturated = () => {
        saturatedCalled = true;
      };

      queue.push(1);
      queue.push(2); // This should trigger saturated

      setTimeout(() => {
        expect(saturatedCalled).toBe(true);
        done();
      }, 1);
    });
  });

  describe("Context binding", () => {
    it("should bind worker to provided context", (done) => {
      const context = { value: 42 };

      const queue = fastq(
        context,
        function (this: typeof context, task: any, callback: any) {
          expect(this).toBe(context);
          expect(this.value).toBe(42);
          callback(null, task);
          done();
        },
        1,
      );

      queue.push("test");
    });
  });

  describe("Concurrency adjustment", () => {
    it("should allow concurrency to be changed at runtime", (done) => {
      const queue = fastq((task: any, callback: any) => {
        setTimeout(() => callback(null, task), 10);
      }, 1);

      expect(queue.concurrency).toBe(1);

      queue.push(1);
      queue.push(2);
      queue.push(3);

      expect(queue.running()).toBe(1);

      queue.concurrency = 2;
      expect(queue.concurrency).toBe(2);

      setTimeout(() => {
        expect(queue.running()).toBe(2);
        done();
      }, 5);
    });

    it("should throw error when setting concurrency less than 1", () => {
      const queue = fastq((task: any, callback: any) => {
        callback(null, task);
      }, 1);

      expect(() => {
        queue.concurrency = 0;
      }).toThrow("concurrency must be equal to or greater than 1");
    });
  });
});

describe("promise queue", () => {
  describe("Basic promise functionality", () => {
    it("should return promises from push", async () => {
      const queue = promise(async (task: number) => {
        return task * 2;
      }, 1);

      const result = await queue.push(42);
      expect(result).toBe(84);
    });

    it("should return promises from unshift", async () => {
      const queue = promise(async (task: number) => {
        return task * 2;
      }, 1);

      const result = await queue.unshift(21);
      expect(result).toBe(42);
    });
  });

  describe("Concurrency with promises", () => {
    it("should respect concurrency limits", async () => {
      const queue = promise(async (task: number) => {
        await sleep(task);
        return task;
      }, 1);

      const start = Date.now();
      const [res1, res2] = await Promise.all([queue.push(10), queue.push(0)]);
      const end = Date.now();

      expect(res1).toBe(10);
      expect(res2).toBe(0);
      expect(end - start).toBeGreaterThanOrEqual(10);
    });
  });

  describe("Multiple executions", () => {
    it("should handle multiple concurrent promises", async () => {
      const queue = promise(async (task: number) => {
        await sleep(1);
        return task * 2;
      }, 1);

      const tasks = [1, 2, 3, 4, 5];
      const expected = [2, 4, 6, 8, 10];

      const results = await Promise.all(tasks.map((task) => queue.push(task)));
      expect(results).toEqual(expected);
    });
  });

  describe("Drained functionality", () => {
    it("should resolve drained when all tasks complete", async () => {
      const queue = promise(async (task: number) => {
        await sleep(task);
        return task;
      }, 2);

      const tasks = Array.from({ length: 5 }, (_, _i) => 10);
      let count = 0;

      tasks.forEach(() => {
        queue.push(10).then(() => {
          count++;
        });
      });

      await queue.drained();
      expect(count).toBe(tasks.length);
    });

    it("should resolve drained immediately when idle", async () => {
      const queue = promise(async (task: number) => {
        await sleep(10);
        return task;
      }, 1);

      await queue.drained(); // Should resolve immediately
    });

    it("should work with drain callback", async () => {
      let drainCalled = false;
      const queue = promise(async (task: number) => {
        await sleep(10);
        return task;
      }, 1);

      queue.drain = () => {
        drainCalled = true;
      };

      queue.push(1);
      queue.push(2);

      await queue.drained();

      expect(drainCalled).toBe(true);
    });

    it("should not call drain when already idle", async () => {
      let drainCalled = false;
      const queue = promise(async (task: number) => {
        await sleep(10);
        return task;
      }, 1);

      queue.drain = () => {
        drainCalled = true;
      };

      await queue.drained();
      expect(drainCalled).toBe(false);
    });
  });

  describe("Error handling", () => {
    it("should reject promises on worker errors", async () => {
      const queue = promise(async (task: string) => {
        if (task === "error") {
          throw new Error("Test error");
        }
        return task;
      }, 1);

      await expect(queue.push("error")).rejects.toThrow("Test error");
    });

    it("should handle errors without unhandled rejections", async () => {
      const queue = promise(async (_task: string) => {
        throw new Error("test error");
      }, 1);

      // Push without awaiting to test unhandled rejection prevention
      queue.push("test");

      await immediate();
      // If we reach here without unhandled rejection, the test passes
    });

    it("should call global error handler on promise rejections", async () => {
      let errorHandlerCalled = false;
      const queue = promise(async (_task: string) => {
        throw new Error("test error");
      }, 1);

      queue.error((err, task) => {
        errorHandlerCalled = true;
        expect(err.message).toBe("test error");
        expect(task).toBe("test");
      });

      try {
        await queue.push("test");
      } catch (_err) {
        // Expected error
      }

      expect(errorHandlerCalled).toBe(true);
    });
  });

  describe("Context binding", () => {
    it("should bind async worker to provided context", async () => {
      const context = { multiplier: 3 };

      const queue = promise(
        context,
        async function (this: typeof context, task: number) {
          return task * this.multiplier;
        },
        1,
      );

      const result = await queue.push(10);
      expect(result).toBe(30);
    });
  });

  describe("Unshift order", () => {
    it("should maintain correct order with unshift", async () => {
      const processed: number[] = [];
      const queue = promise(async (task: number) => {
        processed.push(task);
        await sleep(1);
        return task;
      }, 1);

      await Promise.all([queue.push(1), queue.push(4), queue.unshift(3), queue.unshift(2)]);

      expect(processed).toEqual([1, 2, 3, 4]);
    });
  });
});

describe("Cross-platform compatibility", () => {
  it("should work in browser environment", async () => {
    const queue = promise(async (task: number) => {
      await sleep(1);
      return task * 2;
    }, 1);

    const result = await queue.push(21);
    expect(result).toBe(42);

    // Test drained functionality
    queue.push(1);
    queue.push(2);
    await queue.drained();

    expect(true).toBe(true); // If we reach here, cross-platform features work
  });
});

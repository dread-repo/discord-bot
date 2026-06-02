/** Worker entry (BullMQ consumers added in later Spec Kit tasks). */
export function runWorker(): void {
  // Intentionally empty until job queue wiring lands.
}

void runWorker();

// Keep process alive until queue consumers are registered.
await new Promise<never>(() => {});

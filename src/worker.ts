/** Worker entry (BullMQ consumers added in later Spec Kit tasks). */
export function runWorker(): void {
  // Intentionally empty until job queue wiring lands.
}

runWorker();

// Keep process alive until queue consumers are registered.
process.stdin.resume();

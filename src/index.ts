/** Application entry (Discord client wiring added in later Spec Kit tasks). */
export function main(): void {
  // Intentionally empty until bot wiring lands.
}

void main();

// Keep process alive until gateway client is implemented.
await new Promise<never>(() => {});

export function buildGithubDedupeKey(deliveryId: string): string {
  return `gh:${deliveryId}`;
}

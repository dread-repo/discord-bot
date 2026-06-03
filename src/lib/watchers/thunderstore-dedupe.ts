export function buildThunderstoreDedupeKey(packageKey: string, version: string): string {
  return `ts:${packageKey}@${version}`;
}

export function parsePackageKey(packageKey: string): { namespace: string; name: string } {
  const slash = packageKey.indexOf('/');
  if (slash === -1) {
    throw new Error(`Invalid package key: ${packageKey}`);
  }
  return {
    namespace: packageKey.slice(0, slash),
    name: packageKey.slice(slash + 1),
  };
}

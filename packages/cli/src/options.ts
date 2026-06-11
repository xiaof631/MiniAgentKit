export function readOption(args: string[], name: string, fallback?: string): string | undefined {
  const index = args.indexOf(name);
  if (index === -1) return fallback;
  return args[index + 1] ?? fallback;
}

export function hasFlag(args: string[], name: string): boolean {
  return args.includes(name);
}

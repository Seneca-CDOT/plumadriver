let timeoutThreshold = 120000;

export function updateTimeoutThreshold(newLimit: number): void {
  timeoutThreshold = newLimit * 1000;
}

export function getTimeoutThreshold(): number {
  return timeoutThreshold;
}

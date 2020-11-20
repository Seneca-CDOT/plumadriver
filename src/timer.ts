let timeoutThreshold: number;
let timeoutStatus = false;

export function updateTimeoutThreshold(newLimit: number): void {
  timeoutThreshold = newLimit * 1000;
}
export function updateTimeoutStatus(newStatus: boolean): void {
  timeoutStatus = newStatus;
}

export function getTimeoutThreshold(): number {
  return timeoutThreshold;
}

export function getTimeoutStatus(): boolean {
  return timeoutStatus;
}

let idleTimer = Date.now();
let idleThreshold = 120;

export function updateTimer() {
  idleTimer = Date.now();
}

export function updateIdleThreshold(newLimit: number) {
  idleThreshold = newLimit;
}

export function idleShutdown() {
  const miliseconds = Date.now() - idleTimer;
  const seconds = Math.floor(miliseconds / 1000);
  if (seconds >= idleThreshold) {
    process.exit(0);
  }
}

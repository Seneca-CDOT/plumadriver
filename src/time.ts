let idleTimer = Date.now();

export function updateDate() {
  idleTimer = Date.now();
}

export function idleShutdown() {
  const miliseconds = Date.now() - idleTimer;
  const seconds = Math.floor(miliseconds / 1000);
  if (seconds >= 120) {
    process.exit(0);
  }
}

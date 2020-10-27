import argv from 'minimist';
import app from './app';
import { idleShutdown, updateDate } from './time';

const args = argv(process.argv.slice(2));
const HTTP_PORT = process.env.PORT || args.port || 3000;
// let idleTimer = Date.now();

/* function updateDate() {
  idleTimer = Date.now();
} */

/* function idleShutdown() {
  const miliseconds = Date.now() - idleTimer;
  const seconds = Math.floor(miliseconds / 1000);
  if (seconds > 120) {
    process.exit(0);
  }
} */

app.listen(HTTP_PORT, () => {
  updateDate();
  console.info(`plumadriver is listening on port ${HTTP_PORT}`);
  setInterval(idleShutdown, 20000);
});

// export default updateDate;

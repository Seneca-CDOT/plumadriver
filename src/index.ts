import argv from 'minimist';
import app from './app';
import { idleShutdown, updateTimer } from './timer';

const args = argv(process.argv.slice(2));
const HTTP_PORT = process.env.PORT || args.port || 3000;

app.listen(HTTP_PORT, () => {
  updateTimer();
  console.info(`plumadriver is listening on port ${HTTP_PORT}`);
  setInterval(idleShutdown, 10000);
});

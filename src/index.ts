import argv from 'minimist';
import app from './app';

const args = argv(process.argv.slice(2));
const HTTP_PORT = process.env.PORT || args.port || 3000;

app.listen(HTTP_PORT, () => {
  console.log(`plumadriver is listening on port ${HTTP_PORT}`);
});

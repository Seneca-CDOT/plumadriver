const app = require('express')();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log(
    `Method: '${req.method}', URL: ${req.originalUrl}, Body: ${req.body}`,
  );
  next();
});

app.get('/', (req, res) => {
  res.send('root');
});

app.get('/foo', (req, res) => {
  res.send('foo');
});

app.use((req, res) => {
  console.log('RES IS HERE');
});

app.listen(4444, () => console.log('listening test'));


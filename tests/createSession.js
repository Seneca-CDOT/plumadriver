const axios = require('axios');

axios.post('http://localhost:3000/session').then((response) => {
  console.log(`Created new session \n sessionID: ${response.data}`);
}).catch((err) => {
  console.log('there was an error');
  console.log(err);
});


const axios = require('axios');

let url = 'http://www.example.com';
url = encodeURIComponent(url);
let sessionId;

axios.post('http://localhost:3000/session').then((response) => {
  console.log(`Created new session \n sessionID: ${response.data} \n\n`);
  sessionId = response.data;

  axios.post(`http://localhost:3000/session/${sessionId}/${url}`).then((response) => {
    console.log(`Navigated to ${url}\n`);
    console.log(response.data);
  }).catch((err) => {
    console.log('could not navigate to specified url');
    console.log(err);
  });
}).catch((err) => {
  console.log('could not create a new session');
  console.log(err);
});

const axios = require('axios');

let id;
let url = 'http://www.example.com';
const encodedUrl = encodeURIComponent(url);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function wait(n) {
  await sleep(n);
}

async function testFunction() {

  await axios.post('http://localhost:3000/session').then((response) => {
    console.log(`Created new session \nSessionID: ${response.data}`);
    id = response.data;
  }).catch((err) => {
    console.log('there was an error');
    console.log(err);
  });

  
  await axios.post(`http://localhost:3000/session/${id}/${encodedUrl}`)
  .then()
  .catch((err) => {
    console.log('could not navigate to specified url');
    console.log(err);
    });


    axios.get(`http://localhost:3000/session/${id}/title`).then((response) => {
        console.log('Title: ');
        console.log(response)
    }).catch((err) => {
        console.log(err);
    })
}

testFunction();


const axios = require('axios');

let id;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function demo() {
  await sleep(5000);
}

async function someFunction() {

  await axios.post('http://localhost:3000/session').then((response) => {
    console.log(`Created new session \nSessionID: ${response.data}`);
    id = response.data;
  }).catch((err) => {
    console.log('there was an error');
    console.log(err);
  });

  console.log("Id:", id);

  await demo();

  axios.delete(`http://localhost:3000/session/${id}`).then(() => {
    console.log('deleted session');
  });
}

someFunction();


const axios = require('axios');

const driver = require('./driver/pluma-webdriver');

async function createSession() {
  const response = await axios.post('http://localhost:3000/session');
  console.log(`created session: ${response.data.id}`);
  return response.data;
}

async function navigate(session, url) {
  const encodedUrl = encodeURIComponent(url);
  await axios.post(`http://localhost:3000/session/${session.id}/${encodedUrl}`);
  console.log(`Navigated to ${url}`);
}

async function getTitle(session) {
  const response = await axios.get(`http://localhost:3000/session/${session.id}/title`);
  console.log(`Title: ${response.data}`);
}

async function main() {
  driver.start();

  const session1 = await createSession();
  const session2 = await createSession();
  const session3 = await createSession();
  const session4 = await createSession();

  await navigate(session1, 'https://www.nexj.com');
  await navigate(session2, 'http://www.example.com');
  await navigate(session4, 'https://cdot.senecacollege.ca');
  await navigate(session3, 'http://www.reddit.com');

  await getTitle(session1);
  await getTitle(session2);
  await getTitle(session3);
  await getTitle(session4);
}

main();

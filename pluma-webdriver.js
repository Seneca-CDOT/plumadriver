
const express = require('express');
const args = require('minimist')(process.argv.slice(2)); // for user provided port
const cors = require('cors');
const { SessionsManager } = require('./SessionsManager/SessionsManager');

const server = express();
server.use(cors());
const HTTP_PORT = process.env.PORT || args['port']; // needs to be changed to accept user provided port with validation and deafult port if none specified.

const sessionsManager = new SessionsManager();


async function onHTTPStart() {
  console.log(`listening on port ${HTTP_PORT}`);
}

/* -------- ENDPOINTS -------------------- */

// code for this endpoint is for testing purposes at the moment
server.get('/', (req, res) => {
  res.send(sessionsManager.sessions);
});

// Status
server.get('/status', (req, res) => {
  const body = sessionsManager.getReadinessState();
  res.status(200).json(body);
});

// New session
server.post('/session', async (req, res) => {
  try {
    const newSession = sessionsManager.createSession();
    res.send(newSession);
  } catch (error) {
    console.log(error);
  }
});

// delete session
server.delete('/session/:sessionId', (req, res) => {
  let index = -1;
  try {
    index = sessionsManager.findSession(req.params.sessionId);
  } catch (error) {
    console.log(error);
  }
  if (index > -1) {
    sessionsManager.sessions.splice(index, 1);
    res.send(null);
  }
});

// get title
server.get('/session/:sessionId/title', (req, res) => {
  try {
    const session = sessionsManager.findSession(req.params.sessionId);
    const title = session.browser.getTitle();
    res.send(title);
  } catch (error) {
    console.log(error);
  }
});

// Navigate to
server.post('/session/:sessionId/:url', async (req, res) => {
  try {
    const session = sessionsManager.findSession(req.params.sessionId);
    await session.browser.navigateToURL(req.params.url);
    res.json(null);
  } catch (error) {
    console.log(error);
  }
});
/*---------------------------------------------------------*/

server.listen(HTTP_PORT, async () => {
  await onHTTPStart();
});

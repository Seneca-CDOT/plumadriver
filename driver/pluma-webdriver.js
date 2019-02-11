
const express = require('express');
const cors = require('cors');
const Session = require('../Session/Session.js');
const { SessionsManager } = require('../SessionsManager/SessionsManager');

const server = express();
server.use(cors());
const HTTP_PORT = process.env.PORT || 3000;

const sessionsManager = new SessionsManager();

const Driver = {
  start() {
    async function onHTTPStart() {
      console.log(`listening on port ${HTTP_PORT}`);
    }

    /* -------- ENDPOINTS -------------------- */

    // code for this endpoint is for testing purposes at the moment
    server.get('/', (req, res) => {
      res.send(sessionsManager.sessions);
    });

    // New session
    server.post('/session', async (req, res) => {
      const newSession = new Session();

      Object.defineProperty(newSession, 'sessionID', { // restrict sessionID as readonly
        writable: false,
      });

      sessionsManager.sessions.push(newSession); // creates new session from url provided
      res.send(newSession);
    });

    // delete session
    server.delete('/session/:sessionId', (req, res) => {
      try {
        session = sessionsManager.findSession(req.params.sessionId);
        sessionsManager.deleteSession(req.params.sessionId);
        console.log(`deleted session ${req.params.sessionId}`);
        res.send(null);
      } catch (error) {
        console.log(error);
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

    return this;
  },
};

module.exports = Driver;

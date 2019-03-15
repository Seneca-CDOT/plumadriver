
const validator = require('validator');
const os = require('os');
const Session = require('../Session/Session');
const {
  NotFound,
  InvalidArgument,
} = require('../Error/errors');

class SessionsManager {
  constructor() {
    this.sessions = [];
    this.readinessState = {
      status: this.sessions.length,
      value: {
        message: 'PlumaDriver is ready for new sessions',
        os: {
          arch: os.arch(),
          name: os.platform(),
          version: os.release(),
        },
        ready: true,
      },
    };
  }

  createSession(requestBody) {
    const session = new Session();
    const body = session.configureSession(requestBody);
    this.sessions.push(session);
    return body;
  }

  setReadinessState() {
    this.readinessState.status = this.sessions.length;
  }

  findSession(sessionId) {
    const foundSession = this.sessions.find(session => session.id === sessionId);
    if (!foundSession) {
      throw new NotFound(`Session ${sessionId} not found`);
    } else {
      return foundSession;
    }
  }

  deleteSession(sessionId) {
    this.findSession(sessionId); // look for session, throws error if not found.
    const index = this.sessions.map(session => session.id).indexOf(sessionId);
    this.sessions.splice(index, 1);
  }

  navigateSession(sessionId, url) {
    if (!validator.isURL(url)) throw new InvalidArgument('invalid URL');
    // TODO: write code to handle user prompts
    const session = this.findSession(sessionId);
    if (session.browser.getURL() !== url) {
      setTimeout(() => {
        throw new Error('timeout');
      }, session.timeouts.pageLoad);

      if (session.browser.navigateToURL(url)) clearTimeout();
    } else {
      session.browser.navigateToURL(url);
    }
  }

  getReadinessState() {
    this.setReadinessState();
    return this.readinessState;
  }
}

exports.SessionsManager = SessionsManager;

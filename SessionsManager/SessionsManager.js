
const os = require('os');
const Session = require('../Session/Session');
const {
  NotFoundError,
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
    const session = new Session(requestBody);
    this.sessions.push(session);
    const sessionConfig = {
      value: {
        sessionId: session.id,
        capabilities: {
          browserName: 'pluma',
          browserVersion: 'v1.0',
          platformName: os.platform(),
          acceptInsecureCerts: session.secureTLS,
          setWindowRect: false,
          pageLoadStrategy: session.pageLoadStrategy,
          'plm:plumaOptions': {
            runScripts: session.browser.options.runScripts,
          },
          unhandledPromtBehaviour: session.browser.unhandledPromtBehaviour,
          proxy: session.proxy ? session.proxy : {},
          timeouts: session.timeouts,
        },
      },
    };
    return sessionConfig;
  }


  findSession(sessionId) {
    const foundSession = this.sessions.find(session => session.id === sessionId);
    if (!foundSession) {
      throw new NotFoundError(`Session ${sessionId} not found`);
    } else {
      return foundSession;
    }
  }

  async deleteSession(currentSession, request) {
    const index = this.sessions.map(session => session.id).indexOf(currentSession.id);
    await currentSession.process(request);
    this.sessions.splice(index, 1);
  }

  getReadinessState() {
    this.readinessState.status = this.sessions.length;
    return this.readinessState;
  }
}

exports.SessionsManager = SessionsManager;


const os = require('os');
const Session = require('../Session/Session');
const { NotFound } = require('../Error/errors');

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

  createSession(body) {
    let session;
    try {
      session = new Session(body);
    } catch (error) {
      throw error;
    }
    this.sessions.push(session);
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
    try {
      this.findSession(sessionId);
    } catch (error) {
      throw error;
    }
    const index = this.sessions.map(session => session.id).indexOf(sessionId);
    this.sessions.splice(index, 1);
  }

  getReadinessState() {
    this.setReadinessState();
    return this.readinessState;
  }
}

exports.SessionsManager = SessionsManager;

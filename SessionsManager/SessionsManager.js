
const os = require('os');
const Session = require('../Session/Session');
const Capabilities = require('../Capabilities/Capabilities');
const {
  NotFound,
  BadRequest,
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

  createSession(body) {
    let capabilities = new Capabilities();
    
    if (!Object.prototype.hasOwnProperty.call(body, 'capabilities')) {
      throw new BadRequest('invalid argument');
    }

    if (body.capabilities.alwaysMatch === undefined)
      
    const newSession = new Session();

    Object.defineProperty(newSession, 'sessionID', { // restrict sessionID as readonly
      writable: false,
    });

    this.sessions.push(newSession); // creates new session from url provided
    return newSession;
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
    const index = this.sessions.map(session => session.id).indexOf(sessionId);
    this.sessions.splice(index, 1);
  }

  getReadinessState() {
    this.setReadinessState();
    return this.readinessState;
  }
}

exports.SessionsManager = SessionsManager;

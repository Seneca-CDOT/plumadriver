
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
    const session = new Session();
    const body = session.configureSession(requestBody);
    this.sessions.push(session);
    const response = { value: body };
    return response;
  }

  setReadinessState() {
    this.readinessState.status = this.sessions.length;
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
    this.setReadinessState();
    return this.readinessState;
  }
}

exports.SessionsManager = SessionsManager;


class SessionsManager {
  constructor() {
    this.sessions = [];
    this.readinessState = SessionsManager.setReadinessState();
  }

  static setReadinessState() {
    const body = {
      ready: true,
      message: 'ready',
    };

    return body;
  }

  findSession(sessionId) {
    const foundSession = this.sessions.find(session => session.id === sessionId);
    if (!foundSession) {
      throw new Error(`Session ${sessionId} not found`);
    } else {
      return foundSession;
    }
  }

  deleteSession(sessionId) {
    const index = this.sessions.map(session => session.id).indexOf(sessionId);
    this.sessions.splice(index, 1);
  }

  getReadinessState() {
    return this.readinessState;
  }
}

exports.SessionsManager = SessionsManager;

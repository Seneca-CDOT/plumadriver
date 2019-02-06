
class SessionsManager {
  constructor() {
    this.sessions = [];
    this.readinessState = this.sessions.length;
  }

  findSession(sessionId) {
    const foundSession = this.sessions.find(session => session.id === sessionId);
    if (!foundSession) {
      throw new Error(`Session ${sessionId} not found`);
    } else {
      return foundSession;
    }
  }
}

exports.SessionsManager = SessionsManager;

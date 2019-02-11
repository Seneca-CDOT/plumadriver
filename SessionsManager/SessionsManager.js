
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

  deleteSession(sessionId) {
    const index = this.sessions.map(session => session.id).indexOf(sessionId);
    this.sessions.splice(index,1);
  }
}

exports.SessionsManager = SessionsManager;

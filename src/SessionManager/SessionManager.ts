import os from 'os';
import Session from '../Session/Session';
import { NotFoundError } from '../Error/errors';
import Pluma from '../Types/types';
import { getVersion } from '../utils/utils';

/**
 * manages the life and death of all Session objects
 */
class SessionManager {
  /** the Active Plumadriver sessions */
  sessions: Array<Session>;

  /** Plumadriver's [readiness state](https://w3c.github.io/webdriver/#nodes) */
  readinessState: Pluma.ReadinessState;

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

  /**
   * Creates a new @type {Session}
   * from a user defined session configuration object
   */
  createSession(requestBody: Record<string, unknown>): Pluma.SessionConfig {
    const session = new Session(requestBody);
    this.sessions.push(session);

    const sessionConfig = {
      value: {
        sessionId: session.id,
        capabilities: {
          browserName: 'pluma',
          browserVersion: getVersion(),
          platformName: os.platform(),
          acceptInsecureCerts: session.acceptInsecureCerts,
          setWindowRect: false,
          pageLoadStrategy: session.pageLoadStrategy,
          'plm:plumaOptions': {
            runScripts: session.browser.browserConfig.runScripts,
          },
          unhandledPromptBehavior:
            session.browser.browserConfig.unhandledPromptBehavior,
          proxy: session.proxy ? session.proxy : {},
          timeouts: session.timeouts,
          idleTime: session.browser.browserConfig.idleTime,
        },
      },
    };
    return sessionConfig;
  }

  /**
   * find a session from a user specified uuid
   */
  findSession(sessionId: string): Session {
    const foundSession = this.sessions.find(
      session => session.id === sessionId,
    );
    if (!foundSession) {
      throw new NotFoundError();
    } else {
      return foundSession;
    }
  }

  /**
   * deletes a session from a user specified uuid
   */
  async deleteSession(
    currentSession: Session,
    request: Pluma.Request,
  ): Promise<void> {
    const index = this.sessions
      .map(session => session.id)
      .indexOf(currentSession.id);
    await currentSession.process(request);
    this.sessions.splice(index, 1);
  }

  /**
   * updates and then returns the drivers readiness state
   */
  getReadinessState(): Pluma.ReadinessState {
    this.readinessState.status = this.sessions.length;
    return this.readinessState;
  }
}

export default SessionManager;

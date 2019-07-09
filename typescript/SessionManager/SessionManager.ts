import * as os from 'os';
import { Session } from '../Session/Session';
import { NotFoundError } from '../Error/errors';
import { Pluma } from '../Types/types';

export class SessionManager {
    sessions:Array<Session>;
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
          version: os.release()
        },
        ready: true
      }
    };
  }

  /**
   * Creates a new @type {Session}
   * @param requestBody contains the user defined session configuration object
   */
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
            runScripts: session.browser.browserConfig.runScripts
          },
          unhandledPromtBehaviour: session.browser.browserConfig.unhandledPromptBehaviour,
          proxy: session.proxy ? session.proxy : {},
          timeouts: session.timeouts
        }
      }
    };
    return sessionConfig;
  }

  /**
   * find a session from a user specified uuid
   * @param sessionId The Id of the session to find
   */
  findSession(sessionId:string) {
    const foundSession = this.sessions.find(
      session => session.id === sessionId
    );
    if (!foundSession) {
      throw new NotFoundError(`Session ${sessionId} not found`);
    } else {
      return foundSession;
    }
  }
 
  /**
   * deletes a session from a user specified uuid
   * @param currentSession the current session
   * @param request the request object 
   */
  async deleteSession(currentSession:Session, request:Pluma.Request) {
    const index = this.sessions
      .map(session => session.id)
      .indexOf(currentSession.id);
    await currentSession.process(request);
    this.sessions.splice(index, 1);
  }

  /**
   * updates and then returns the drivers readiness state
   */
  getReadinessState() {
    this.readinessState.status = this.sessions.length;
    return this.readinessState;
  }
}
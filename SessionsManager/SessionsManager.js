
const os = require('os');
const Session = require('../Session/Session');
const Capabilities = require('../Capabilities/Capabilities');
const {
  NotFound,
  BadRequest,
} = require('../Error/errors');

const utility = require('../utils/utils');

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
    const reqCapabilityValues = {
      acceptInsecureCerts: 'boolean',
      browserName: 'string',
      browserVersion: 'string',
      platformName: 'string',
    };
    // determine if JSON object has property 'capabilities' (W3C standard)
    const capabiltiesRequest = Object.prototype.hasOwnProperty.call(body, 'capabilities');
    if (!capabiltiesRequest) {
      throw new BadRequest('invalid argument');
    }
    const requiredCapabilties = {};
    if (body.capabilities.alwaysMatch !== undefined) {
      Object.keys(reqCapabilityValues).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(body.capabilities.alwaysMatch, key)) {
          if (typeof body.capabilities.alwaysMatch[key] !== reqCapabilityValues[key]) {
            throw new BadRequest('invalid argument');
          } else {
            Object.defineProperty(requiredCapabilties, key, {
              value: body.capabilities.alwaysMatch[key],
              writeable: true,
              enumerable: true,
            });
          }
        } else {
          // TODO: return some error if name of capability not found.
        }
      });
    }

    const newSession = new Session(requiredCapabilties);

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

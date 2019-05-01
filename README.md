# PlumaDriver

PlumaDriver is a JavaScript implementation of the W3C WebDriver standards using 
the JSDOM library to emulate the remote end node (browser) in the communication chain of nodes between the local end (client) and remote end. More information on this can be found at the [W3C webdriver protocol](https://www.w3.org/TR/webdriver1/#protocol) website.
More information about JSDOM can be found <a href="https://github.com/jsdom/jsdom">here.</a>
The project is still in the development stage.

## Objective
The goal of this project is to provide an automation tool for jsdom in order to load test web applications without the overhead of modern web browsers. An extension to [Selenium WebDriver](https://github.com/SeleniumHQ/selenium) is being developed alongside plumadriver. Note that this extension was created for this project and is not part of the official Selenium WebDriver build. It is important to keep in mind that jsdom is not intended to be a full rendering browser but rather emulate enough of a browser to be useful for testing and webscraping applications. As a result, standard-specified endpoints which require browser rendering capabilities will not be implemented.

## Endpoints

- [x] **New Session:**    POST /session
- [x] **Delete Session:** DELETE /session/{session id}
- [x] **Get Status:** GET /status
- [x] **Get Timeouts:** GET 	/session/{session id}/timeouts
- [x] **Set Timeouts:** POST 	/session/{session id}/timeouts
- [x] **Navigate To:** POST 	/session/{session id}/url
- [x] **Get Current URL:** GET 	/session/{session id}/url
- [x] **Get Title:** GET 	/session/{session id}/title
- [x] **Find Elements:** POST 	/session/{session id}/elements
- [x] **Find Element:** POST 	/session/{session id}/element
- [x] **Find Element from Element:** POST 	/session/{session id}/element/{element id}/element
- [x] **Find Elements from Element:** POST 	/session/{session id}/element/{element id}/elements
- [x] **Get Element Text:** GET 	/session/{session id}/element/{element id}/text
- [x] **Get Element Tag Name:** POST 	/session/{session id}/element/{element id}/{name}
- [x] **Get All Cookies:** GET 	/session/{session id}/cookie
- [x] **Add Cookie:** POST 	/session/{session id}/cookie

The following endpoints require browser rendering capabilities and will therefore not be implemented for plumadriver. 

- [ ] **Accept Alert** POST 	/session/{session id}/alert/accept 	
- [ ] **Get Alert Text** GET 	/session/{session id}/alert/text 	
- [ ] **Send Alert Text** POST 	/session/{session id}/alert/text 	
- [ ] **Take Screenshot** GET 	/session/{session id}/screenshot
- [ ] **Take Element Screenshot** GET 	/session/{session id}/element/{element id}/screenshot
- [ ] **Back** POST 	/session/{session id}/back
- [ ] **Forward** POST 	/session/{session id}/forward
- [ ] **Refresh** POST 	/session/{session id}/refresh
- [ ] **Switch To Window** POST 	/session/{session id}/window
- [ ] **New Window** POST 	/session/{session id}/window/new
- [ ] **Maximize Window** POST 	/session/{session id}/window/maximize
- [ ] **Minimize Window** POST 	/session/{session id}/window/minimize
- [ ] **Fullscreen Window** POST 	/session/{session id}/window/fullscreen


## Building Plumadriver

### Requirements:
 - Latest version of NodeJS

From the command line: 

1. Clone this repository
2. `cd plumadriver`
3. `npm install`
4. For Linux:    
    `pkg . --target latest-linux `  
   For Windows:  
    `pkg . --target latest-win`  
   For Mac:  
    `pkg . --target latest-macos`  

## Using Plumadriver

Plumadriver can be used by running the executable created above and making requests with any HTTP client or by using the Selenium WebDriver Java client extension for plumadriver available [here](#).Note that this extension was created for this project and is not part of the official selenium build.  

The plumadriver executable will attempt to start the server on port 3000 by default. The server can be started on a user specified port by passing the `--port=<user_specified_port>` argument to the `plumadriver` executable. 

### Functionality with the Selenium Webdriver API

In order to use the Selenium plumadriver extension, include the pluma.jar file in your project's libraries.

The executable path must be set prior to running your code. This is the path to the executable created in the **Building Plumadriver** section above. The path can be set using:  
`System.setProperty("webdriver.pluma.driver","<path_to_executable>");`

## Project Structure

### SessionManager
The SessionManager object manages all sessions instantiated by the client.

- #### Properties:
  - **sessions:** A list of active Session Objects currently being managed
  - **readinessState:** An object containing:
    - **status:** property indicating the number of sessions being managed
    - **value:**  property containing platform specific information, a boolean **ready** indicating that the driver is ready to accept new connections
    
- #### Methods:
  - **createSession(requestBody)** - takes the HTTP request body as an arugment. It instantiates a Session object by calling its constructor with requestBody as an argument which performs further validation. If no error is thrown by the Session object constructor, the newly created session is added to the SessionManager object's **sessions** list. A sessionConfig object is created and returned detailing the session's supported capabilties.
  
  - **findSession(sessionID)** - accepts a uuid v1 string identifying a session which it uses to find a specific session within its **sessions** list. Throws an **InvalidSessionId** error if the session id is not in the list of active sessions.
 
  - **deleteSession(currentSession, request)** - accepts the current Session Object and a string (request) indicating the command to be processed by the Session Object's [process](#) method. Finds the index of the current Session Object and removes it from the active sessions list once the Session's process method has completed execution. 
  - **getReadinessState** - updates the SessionManager's readiness state **status** property before returning the readinesss state.
  
 ### Session
 The Session object represents a single instantiation of the user-agent, in this case [jsdom](https://github.com/jsdom/jsdom)
 
 - #### Properties:
   - **id** -  A UUID v1 which uniquely identifies the Session Object
   - **pageLoadStrategy** - a string which specifies the session's page loading strategy. It defaults to 'normal'. 
   - **secureTLS** - boolean property indicating whether untrusted or self-signed TLS certificates should be trusted for the duration of the Session object. A false value indicates that certificate or TLS errors should be suppressed. 
   - **timeouts** -  property which contains the sessions implicit, pageload and script timeouts. Unless otherwise specified, these default to 0 ms, 30000 ms and 30000 ms, respectively.
   - **mutex** - a [Mutex] object which serves as the Session object's [request queue](https://www.w3.org/TR/webdriver/#dfn-request-queue). This is used to queue requests currently awaiting processing. Ensures that requests made to the session occur in a First In First Out order.
   - **browser** - a [Browser](#) object. The remote end-point node which contains the jsdom object.
    
- #### Methods:
 

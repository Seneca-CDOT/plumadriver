<h1>PlumaDriver</h1>

<p>PlumaDriver is a JavaScript implementation of the W3C WebDriver standards using 
the JSDOM library to emulate the remote end node (browser) in the communication chain of nodes between the local end (client) and remote end which hosts the server side of the <a href ="https://www.w3.org/TR/webdriver1/#protocol">W3C webdriver protocol</a>.
More information about JSDOM can be found <a href="https://github.com/jsdom/jsdom">here</a></p>


<h2>Classes</h2>

<p><strong>NOTE: </strong> Implementations of the classes below are not finalized and currently not W3C compliant. However, work is being made in order to achieve this. The standAlone branch of this repo contains the current implementation progress of these classes in addition to additional classes not mentioned in this file.</p>
<ul>
    <li>
        <h3>Browser</h3>
        <p>Represents the remote end node in the chain of nodes. It uses a JSDOM object in
        order to represent the remote endpoint node.</p>
        <h4>Properties</h4>
        <ul>
            <li>
                <strong>dom</strong> - The JSDOM object.
            </li>
            <li>
                <strong>options</strong> - an options object which allows the user to
                customize each instance of JSDOM.
            </li>
            <li>
                <strong>webdriverActive</strong> - a boolean flag set to true when the
                 user agent is under remote control. Initially set to false.
            </li>        
        </ul>
        <h4>Methods</h4>
        <ul>
            <li>
                <strong>navigateToURL(URL)</strong> - accepts a string representing a URL.
                Currently creates a new JSDOM object from the provided url and replaces the objects dom 
                property.  
            </li>
            <li>
                <strong>getTitle()</strong> - Gets the text of the title element from the JSDOM object.
            </li>      
        </ul>
    </li>
    <li>
        <h3>Session</h3>
        <p>The session class is the equivalent to the single instantiation of a user agent, including all child browsers.</h4>
        <ul>
            <li>
                <strong>id</strong> - a unique UUID which uniquely identifies the session.
            </li>
            <li>
                <strong>browser</strong> - the user agent instantiated by the session.
            </li>
            <li>
                <strong>webdriverActive</strong> - a boolean flag set to true when the
                 user agent is under remote control. Initially set to false.
            </li>        
        </ul>
    </li>
    <li>
        <h3>SessionManager</h3>
        <p>The session manager class manages all sessions instantiated by local end.</p>
        <h4>Properties</h4>
        <ul>
            <li>
                <strong>sessions</strong> - An array containing all active sessions. 
            </li>
            <li>
                <strong>readinessState</strong> - Currently the length of the sessions array indicating all active sessions.
            </li>     
        </ul>
        <h4>Methods</h4>
        <ul>
            <li>
                <strong>findSession(sessionId)</strong> - accepts a string representing a session's UUID and searches the objects sessions array for a session object corresponding to the provided UUID. If a session object with this particular id is not found, a session not found is thrown, otherwise it returns the found session.  
            </li>
            <li>
                <strong>deleteSession(sessionId)</strong> - Calls the findSession(sessionId) method with the provided session id.  Removes the returned session if found.
            </li>      
        </ul>
    </li>
</ul>

<h2>Try out PlumaDriver!</h2>
<h3>Requirements: </h3>
<ul>
    <li>NodeJS</li>
</ul>
<br />
<p>To get started, clone the repository and make sure that you have NodeJS installed. If you don't have NodeJS, you may download it <a href="https://nodejs.org/en/download">here</a>. Once inside the repository directory, open a terminal window and type in 'npm install'. This will use the node package manager (NPM) to install all the dependencies required for PlumaDriver to work. Once this step is completed, you may try out plumadriver by modifying the code inside the main function in index.js, found in the root directory of the project.
</p>

<h3>Getting Started</h3>

<p>The index.js file uses Axios, an HTTP client, in order to make requests with the
PlumaDriver server. This file includes a few useful functions:</p>

<ul>
    <li>
    <h4>createSession()</h4>
    <p>This function uses axios to call the /session end-point. It creates a new session, gives it a unique UUID and stores it inside the driver's SessionManager object. </p>
    </li>
    <li>
    <h4>navigate(session, url)</h4>
    <p>This function accepts a Session object and a url (string). It then uses axios to pass these parameters to the server using a POST request.</p>
    </li>
    <h4>getTitle(session)</h4>
    <p>This function uses axios to call the /session/session/sessionId/title end-point. It accepts a session object which is then passed to the server using a GET request to obtain the title element of the DOM created by calling the navigate function. Note that the navigate() function must be called prior to getTitle() in order for the latter to work properly.</p>
    </li>
    <h4>delete(session)</h4>
    <p>This function uses axios to call the /session/sessionId end-point using a DELETE request. It removes the provided session from the SessionManager Object</p>
    </li>
</ul>
<h1>PlumaDriver</h1>

<p>PlumaDriver is a JavaScript implementation of the W3C WebDriver standards using 
the JSDOM library to emulate the remote end node (browser) in the chain of nodes.
More information about JSDOM can be found <a href="https://github.com/jsdom/jsdom">here</a></p>

<h2>Try out PlumaDriver!</h2>
<h3>Requirements: </h3>
<ul>
    <li>NodeJS</li>
</ul>
<br />
<p>To get started, clone the repository and make sure that you have NodeJS installed. If you don't have NodeJS, you may download it <a href="https://nodejs.org/en/download">here</a>. Once inside the repository directory, open a terminal window and type in 'npm install'. This will use the node package manager (NPM) to install all the dependencies required for PlumaDriver to work. Once this step is completed, you may try out plumadriver by modifying the code inside the main function in index.js, found in the root directory of the project.
</p>

<h2>Classes</h2>


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
    <p>This function uses axios to call the /session/url end-point. It accepts a Session object and a url (string). It then uses axios to pass these parameters to the server using a POST request.</p>
    </li>
    <h4>getTitle(session)</h4>
    <p>This function uses axios to call the /session/session/sessionId/title end-point. It accepts a session object which is then passed to the server using a GET request to obtain the title element of the DOM created by calling the navigate function. Note that the navigate() function must be called prior to getTitle() in order for the latter to work properly.</p>
    </li>
    <h4>delete(session)</h4>
    <p>This function uses axios to call the /session/sessionId end-point using a DELETE request. It removes the provided session from the SessionManager Object</p>
    </li>
</ul>
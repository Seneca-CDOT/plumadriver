# PlumaDriver

PlumaDriver is a JavaScript implementation of the W3C WebDriver standards using 
the JSDOM library to emulate the remote end node (browser) in the communication chain of nodes between the local end (client) and remote end. More information on this can be found at the [W3C webdriver protocol](https://www.w3.org/TR/webdriver1/#protocol) website.
More information about JSDOM can be found <a href="https://github.com/jsdom/jsdom">here.</a>
The project is still in the development stage.

## Objective
The goal of this project is to provide an automation tool for jsdom in order to load test web applications without the overhead of modern web browsers. An extension to [Selenium WebDriver](https://github.com/SeleniumHQ/selenium) is being developed alongside plumadriver. Note that this extension was created for this project and is not part of the official Selenium WebDriver build.

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

As JSDOM is not intended to be an implementation of a full rendering browser, rather it emulates enough of a web browser to be useful for testing and webscraping applications. Jsdom's limitations are reflected upon the following endpoints that are not implemented as they pertain more to a full rendering browser:

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

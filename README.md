# PlumaDriver

PlumaDriver is a JavaScript implementation of the W3C WebDriver standards using 
the JSDOM library to emulate the remote end node (browser) in the communication chain of nodes between the local end (client) and remote end. More information on this can be found at the [W3C webdriver protocol](https://www.w3.org/TR/webdriver1/#protocol) website.
More information about JSDOM can be found <a href="https://github.com/jsdom/jsdom">here.</a>
The project is still in the development stage.

## Objective
The goal of this project is to provide an automation tool for jsdom in order to load test web applications without the overhead of modern web browsers. An extension to [Selenium WebDriver](https://github.com/SeleniumHQ/selenium) is being developed alongside plumadriver 

## Implemented Endpoints

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


## Using Plumadriver
Plumadriver can be used with any HTTP client or the Selenium WebDriver extension for plumadriver. Note that this extension was created for this project and is not part of the official selenium build.


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

# PlumaDriver

PlumaDriver is a JavaScript/Typescript implementation of the W3C WebDriver standard for the jsdom library. More information on this can be found at the [W3C webdriver protocol](https://www.w3.org/TR/webdriver1/#protocol) website. More information about jsdom can be found [here](https://github.com/jsdom/jsdom).

**NOTE:** This project is still in the development stage. You are welcome to use plumadriver, however, keep in mind that there are still unimplemented features and bugs to be fixed. If you would like to suggest a feature to implement or an issue that needs to be addressed, please create an issue and the team will address it as soon as possible.

## Objective
The goal of this project is to provide an automation tool for jsdom in order to load test web applications without the overhead of modern web browsers. Plumadriver can be used with the [Selenium client](https://www.seleniumhq.org/), however, at the time of writing there is only a Java language binding. Additional language bindings will be developed in the future. Note that this selenium extension was created for this project and is not part of the official Selenium WebDriver build. It is important to keep in mind that jsdom is not intended to be a full rendering browser but rather emulate enough of a browser to be useful for testing and webscraping applications. As a result, standard-specified endpoints which require browser rendering capabilities will not be implemented.

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
- [x] **Execute Script:** POST 	/session/{session id}/execute/sync
- [x] **Get Element Attribute:** POST 	/session/{session id}/element/{element id}/attribute/{name}

The following endpoints will not be implemented as they require either rendering capabilities or functionality that jsdom does not yet have. 

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

## Using Plumadriver
Plumadriver essentially boils down to RESTful API and can be used with any HTTP request client with the endpoints specified above. However,  
bear in mind that plumadriver was created with the purpose to make jsdom accessible to those already familiar with selenium but hesitant to learn how to use
jsdom directly. There is a plumadriver extension for selenium included in this repository for those that already know how to use selenium. 

## Getting Started
To get started with plumadriver, you will need to either [download]() or [build]() the plumadriver executable. The most current build can be found [here](). If you would rather build plumadriver from the source, follow the instructions in the [Building PlumaDriver]() section.

Plumadriver can be used with the Java language binding for the Selenium client. If you are not familiar with Selenium WebDriver, you can read more about it [here](https://www.seleniumhq.org/projects/webdriver/). The Java language binding for the Selenium client can be found [here](https://github.com/Seneca-CDOT/plumadriver/tree/master/selenium/Java). Because of the experimental state of this project, a pull request has not been made to the Selenium commnunity and therefore plumadriver is not part of the supported drivers included in the official Selenium build. In the meanwhile, you can work with selenium and plumadriver by adding the pluma.jar file to your project libraries in addition to the [official selenium build](https://www.seleniumhq.org/download/). The pluma.jar file can be found under the /selenium/java directory of this repo.

You can also use plumadriver with any HTTP request client as long as you hit its endpoints correctly.


## Using Plumadriver
The executable path must be set prior to running your code. This is the path to the executable created in the **Building Plumadriver** section above. The path can be set using:  
`System.setProperty("webdriver.pluma.driver","<path_to_executable>");`

### Sample Test
```java
// Set plumadriver executable path
System.setProperty("webdriver.pluma.driver","<path_to_executable>");

// Create a driver Instance 
Webdriver driver = new PlumaDriver();

driver.get("http://www.example.com"); // navigate to 
WebElement e = driver.findelement(By.tagName("p"));
String text = e.getText();
System.out.println(text);
driver.quit();
```
### Plumadriver lifetime

The PlumaDriver class will create a server instance at creation and destroy it when the quit() method is called. This means that for every instance of this class a separate server will be created resulting in a significant amount of resource usage. To reduce the resource consumption, the following options are available:

PlumaDriverService:
```java
PlumaDriverService service = new PlumaDriverService() {
 .usingDriverExecuteable(new File("path/to/plumadriver/"))
 .usingAnyFreePort()
 .build();

service.start();

 WebDriver pluma = new RemoteWebDriver(service.getUrl(), new PlumaOptions());
```
Starting the Plumadriver server directly from the terminal and connecting it to the Remote WebDriver:

Terminal:
```bash
./plumadriver --port=4040
```
Java:  
```java
WebDriver pluma = new RemoteWebDriver("http://127.0.0.1:4040", new PlumaOptions());
pluma.get("http://www.example.com");
```
## Building Plumadriver

### Requirements:
 - Latest stable version of NodeJS
 - npm pkg  module `npm install pkg -g`

From the command line: 

1. Clone this repository
2. `cd plumadriver`
3. `npm install`
4. For Linux:    
    `npm run build-linux`  
   For Windows:  
    `npm run build-win`  
   For Mac:  
    `npm run build-macos`

These scripts will transpile all the typescript code found within src directory and output the result to the build directory. From here pkg will create an executable which should appear in the project's root directory.
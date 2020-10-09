# PlumaDriver

PlumaDriver is a Node.js implementation of the [W3C WebDriver Recommendation](https://www.w3.org/TR/webdriver1/#protocol) for the [jsdom](https://github.com/jsdom/jsdom) library. The goal of this project is to provide an automation tool for jsdom in order to test web applications without the overhead of modern web browsers.

## Getting Started

PlumaDriver can be used with the Java language binding for [Selenium WebDriver](https://www.seleniumhq.org/projects/webdriver/) (additional language bindings will be developed in the future). Alternatively, as a RESTful API, PlumaDriver can be used with any HTTP request client (see [Using PlumaDriver Without Selenium](#using-plumadriver-without-selenium)).

## Using PlumaDriver With Selenium Java

1. [Download](https://github.com/Seneca-CDOT/plumadriver/releases) or [build](#building-plumadriver) the PlumaDriver executable.
2. Add the [pluma.jar](/selenium/Java/client) file to your project libraries in addition to the [Selenium Java bindings](https://www.seleniumhq.org/download/).

### Sample Test

```java
// Set PlumaDriver executable path
System.setProperty("webdriver.pluma.driver","<path_to_executable>");

// Create a driver Instance
Webdriver driver = new PlumaDriver();

driver.get("http://www.example.com"); // navigate to
WebElement e = driver.findElement(By.tagName("p"));
String text = e.getText();
System.out.println(text);
driver.quit();
```

### WebDriver Options

```java
PlumaOptions options = new PlumaOptions();

options.setAcceptInsecureCerts(false);
options.setRunScripts(true);
options.rejectPublicSuffixes(false);

PlumaDriver plumaDriver = new PlumaDriver(options);
```

The following options are available when creating a PlumaDriver instance:

- `AcceptInsecureCerts`: Determines whether or not invalid SSL certificates are accepted.
- `RunScripts`: Enables executing scripts inside the page. In most cases, you'll likely want to set this to `true`.
- `RejectPublicSuffixes`: Determines whether or not cookies with domains like `com` and `co.uk` are rejected. See http://publicsuffix.org/ for more information.

### PlumaDriver Lifetime

The PlumaDriver class will create a server instance at creation and destroy it when the `quit()` method is called. This means that for every instance of this class a separate server will be created resulting in a significant amount of resource usage. To reduce the resource consumption, the following options are available:

PlumaDriverService:

```java
PlumaDriverService service = new PlumaDriverService() {
 .usingDriverExecuteable(new File("path/to/plumadriver/"))
 .usingAnyFreePort()
 .build();

service.start();

 WebDriver pluma = new RemoteWebDriver(service.getUrl(), new PlumaOptions());
```

Starting the PlumaDriver server directly from the terminal and connecting it to the Remote WebDriver:

Terminal:

```bash
./plumadriver --port=4040
```

Java:

```java
WebDriver pluma = new RemoteWebDriver("http://127.0.0.1:4040", new PlumaOptions());
pluma.get("http://www.example.com");
```

## Using PlumaDriver Without Selenium

You may also use PlumaDriver with any HTTP request software (e.g. `Postman`, `fetch`, `cURL`, etc.):

1. [Download](https://github.com/Seneca-CDOT/plumadriver/releases) or [build](#building-plumadriver) PlumaDriver executable appropriate for your operating system.
2. Run the executable. This will start the server by default on port 3000 (alternatively, set the port instead with `--port <number>`).
3. Use your preferred HTTP Client to make requests to the endpoints.

### Sample Test

`POST` the following example JSON to `http://localhost:3000/session` to create a new session:

```json
{
  "capabilities": {
    "alwaysMatch": {
      "plm:plumaOptions": {
        "runScripts": true
      }
    }
  }
}
```

PlumaDriver should respond with a unique `sessionId` along with the session information:

```json
{
    "value": {
        "sessionId": "<unique-id>",
        "capabilities": {...}
    }
}
```

You may use the above `sessionId` value provided by the web driver to make further requests. For instance, to navigate to a page, `POST` the following to `http://localhost:3000/session/<sessionId>/url`:

```json
{
  "url": "http://example.com"
}
```

See the [W3C endpoint specification](https://www.w3.org/TR/webdriver1/#list-of-endpoints) or this [simplified guide](https://github.com/jlipps/simple-wd-spec) to learn more about how to work with WebDriver endpoints.

## Building PlumaDriver

### Requirements:

- Latest stable version of Node.jS

From the command line:

1. Clone this repository
2. `cd plumadriver`
3. `npm install`
4. For Linux:  
    `npm run build:linux`  
   For Windows:  
    `npm run build:win`  
   For Mac:  
    `npm run build:macos`

These scripts will transpile all the typescript code found within src directory and output the result to the build directory. From here pkg will create an executable which should appear in the project's root directory.

## Completed Endpoints

It is important to keep in mind that jsdom is not intended to be a full rendering browser but rather emulate enough of a browser to be useful for testing and web scraping applications. As a result, W3C WebDriver endpoints which require browser rendering capabilities will not be implemented at this time.

- [x] [**New Session:**](https://www.w3.org/TR/webdriver1/#dfn-creating-a-new-session) POST /session
- [x] [**Delete Session:**](https://www.w3.org/TR/webdriver1/#dfn-delete-session) DELETE /session/{session id}
- [x] [**Get Status:**](https://www.w3.org/TR/webdriver1/#dfn-status) GET /status
- [x] [**Get Timeouts:**](https://www.w3.org/TR/webdriver1/#dfn-get-timeouts) GET /session/{session id}/timeouts
- [x] [**Set Timeouts:**](https://www.w3.org/TR/webdriver1/#dfn-timeouts) POST /session/{session id}/timeouts
- [x] [**Navigate To:**](https://www.w3.org/TR/webdriver1/#dfn-navigate-to) POST /session/{session id}/url
- [x] [**Get Current URL:**](https://www.w3.org/TR/webdriver1/#dfn-get-current-url) GET /session/{session id}/url
- [x] [**Get Title:**](https://www.w3.org/TR/webdriver1/#dfn-get-title) GET /session/{session id}/title
- [x] [**Find Elements:**](https://www.w3.org/TR/webdriver1/#dfn-find-elements) POST /session/{session id}/elements
- [x] [**Find Element:**](https://www.w3.org/TR/webdriver1/#dfn-find-element) POST /session/{session id}/element
- [x] [**Find Element from Element:**](https://www.w3.org/TR/webdriver1/#dfn-find-element-from-element) POST /session/{session id}/element/{element id}/element
- [x] [**Find Elements from Element:**](https://www.w3.org/TR/webdriver1/#dfn-find-elements-from-element) POST /session/{session id}/element/{element id}/elements
- [x] [**Get Element Text:**](https://www.w3.org/TR/webdriver1/#dfn-get-element-text) GET /session/{session id}/element/{element id}/text
- [x] [**Get Element Tag Name:**](https://www.w3.org/TR/webdriver1/#dfn-get-element-tag-name) POST /session/{session id}/element/{element id}/{name}
- [x] [**Get All Cookies:**](https://www.w3.org/TR/webdriver1/#dfn-get-all-cookies) GET /session/{session id}/cookie
- [x] [**Add Cookie:**](https://www.w3.org/TR/webdriver1/#dfn-adding-a-cookie) POST /session/{session id}/cookie
- [x] [**Get Named Cookie:**](https://www.w3.org/TR/webdriver1/#dfn-get-named-cookie) GET /session/{session id}/cookie/{name}
- [x] [**Delete Cookie:**](https://www.w3.org/TR/webdriver1/#dfn-delete-cookie) DELETE /session/{session id}/cookie/{name}
- [x] [**Delete All Cookies:**](https://www.w3.org/TR/webdriver1/#dfn-delete-all-cookies) DELETE /session/{session id)/cookie
- [x] [**Execute Script:**](https://www.w3.org/TR/webdriver1/#dfn-execute-script) POST /session/{session id}/execute/sync
- [x] [**Get Element Attribute:**](https://www.w3.org/TR/webdriver1/#dfn-get-element-attribute) POST /session/{session id}/element/{element id}/attribute/{name}
- [x] [**Get Element Property:**](https://www.w3.org/TR/webdriver/#dfn-get-element-property) GET /session/{session id}/element/{element id}/property/{name}
- [x] [**Element Click:**](https://www.w3.org/TR/webdriver1/#dfn-element-click) POST /session/{session id}/element/{element id}/click
- [x] [**Element Clear:**](https://www.w3.org/TR/webdriver1/#dfn-element-clear) POST /session/{session id}/element/{element id}/clear
- [x] [**Is Element Enabled:**](https://www.w3.org/TR/webdriver1/#dfn-is-element-enabled) GET /session/{session id}/element/{element id}/enabled
- [x] [**Is Displayed:**](https://www.w3.org/TR/webdriver1/#element-displayedness) GET /session/{session id}/element/{element id}/displayed
- [x] [**Get Page Source:**](https://www.w3.org/TR/webdriver1/#dfn-get-page-source) GET /session/{session id}/source
- [x] **Shutdown:** GET /shutdown (Non-W3C)
- [x] [**Get Active Element:**](https://www.w3.org/TR/webdriver1/#dfn-get-active-element) GET /session/{session id}/element/active
- [x] [**Switch To Frame:**](https://www.w3.org/TR/webdriver1/#dfn-switch-to-frame) POST /session/{session id}/frame
- [x] [**Switch To Parent Frame:**](https://www.w3.org/TR/webdriver1/#dfn-switch-to-parent-frame) POST /session/{session id}/frame/parent
- [x] [**Is Element Selected:**](https://www.w3.org/TR/webdriver/#dfn-is-element-selected) GET /session/{session id}/element/{element id}/selected

"use strict";
exports.__esModule = true;
var jsdom_1 = require("jsdom");
var BrowserOptions = /** @class */ (function () {
    function BrowserOptions(runScripts, unhandledPromptBehaviour, strictSSL) {
        if (runScripts === void 0) { runScripts = ''; }
        if (unhandledPromptBehaviour === void 0) { unhandledPromptBehaviour = 'dismiss'; }
        if (strictSSL === void 0) { strictSSL = true; }
        this.runScripts = runScripts;
        this.unhandledPromptBehaviour = unhandledPromptBehaviour;
        this.strictSSL = strictSSL;
        this.resourceLoader = new jsdom_1.ResourceLoader({
            strictSSL: this.strictSSL
        });
        switch (unhandledPromptBehaviour) {
            case 'accept':
                this.beforeParse = BrowserOptions.beforeParseFactory(function () { return true; });
                break;
            case 'dismiss':
                this.beforeParse = BrowserOptions.beforeParseFactory(function () { return false; });
                break;
            case 'dismiss and notify':
                this.beforeParse = BrowserOptions.beforeParseFactory(function (message) {
                    console.log(message);
                    return false;
                });
                break;
            case 'accept and notify':
                this.beforeParse = BrowserOptions.beforeParseFactory(function (message) {
                    console.log(message);
                    return true;
                });
                break;
            case 'ignore':
                break;
            default:
                break;
        }
    }
    BrowserOptions.beforeParseFactory = function (func) {
        return function (window) {
            window.confirm = func;
            window.alert = func;
            window.prompt = func;
        };
    };
    return BrowserOptions;
}());
module.exports = { BrowserOptions: BrowserOptions };

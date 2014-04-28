The objective of this module is to allow Google Anaytics to be used for server-side Page View and Event tracking.
For example, we use this module on api.udx.io and cdn.udx.io to track access to CDN assets and API requests.

![Google Analytics Overview Screenshot](http://content.screencast.com/users/TwinCitiesTech.com/folders/Jing/media/7b355e5d-1a83-4d61-ba6e-52a4b540fe21/00000681.png "Google Analytics Overview Screenshot")

## Features
* Supports multiple GA properties based on host.
* Simple usage as Express/Connect middleware.

## Instance Configuration
Although multiple instances may be created a single instance can support multiple hosts.

* hosts - Declare tracked hosts and their UA ids.
* dimensionMap  - Define custom Google Analytics dimensions.
* exposeLocals  - Expose tracker ID to response locals.
* useHeaderFlag - Will set a response header "x-google-analytics-tracked". This is useful if you're running proxies and only want to trigger GA once within your service stack.
* computeOrigin - Will attempt to determine "referrer" when one is not provided.

## Request Object Methods
When used as a middleware, we extend the request prototype with additional methods for manual tracking.

* trackPage
* trackEvent
* trackScreen (not yet implemented)
* trackSocialEvent (not yet implemented)
* trackTiming (not yet implemented)

## Usage

```javascript
var config = {
hosts: [
  {
    ua: 'UA-XXXX-1',
    host: 'api.example.io',
    debug: true
  },
  {
    ua: 'UA-XXXX-2',
    host: 'cdn.example.io',
    debug: true
  },
  {
    ua: 'UA-XXXX-3',
    host: 'www.example.io',
    debug: true
  }
]
}

app.use( require( 'google-analytics' ).middleware( config ) );
```
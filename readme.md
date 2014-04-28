## Features
* Supports multiple GA properties based on host.
* Simple usage as Express/Connect middleware.

## Instance Configuration

* clientId - Client ID to use.
* hosts - Declare tracked hosts and their UA ids.
* dimensionMap  - Define custom Google Analytics dimensions.
* exposeLocals  - Expose tracker ID to response locals.
* useHeaderFlag - Will set a response header "x-google-analytics-tracked". This is useful if you're running proxies and only want to trigger GA once within your service stack.
* computeOrigin - Will attempt to determine "referrer" when one is not provided.

## Request Methods
When used as a middleware, we extend the request prototype with additional methods for manual tracking.

* trackPage
* trackEvent
* trackScreen
* trackSocialEvent
* trackTiming

## Usage

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
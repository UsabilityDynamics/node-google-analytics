/**
 *
 * @param options
 * @returns {GoogleAnalytics}
 */
function GoogleAnalytics( options ) {
  GoogleAnalytics.debug( 'Creating new instance.' );

  var self  = this;
  var ga    = require( 'ga' );

  Object.defineProperties( this, {
    options: {
      value: options || {},
      enumerable: true,
      configurable: true,
      writable: true
    },
    trackedHosts: {
      value: [],
      enumerable: true,
      configurable: true,
      writable: true
    }
  })

  // Prepare trackedHosts by identifying each tracked host.
  options.hosts.forEach( function eachHost( host ) {

    // Create GA Instance for each declared host.
    self.trackedHosts[ host.host ] = new ga( host.ua || host.id, host.host );

    if( host.debug === true ) {
      self.trackedHosts[ host.host ].debug = true;
    }

  });

  return this;

}

/**
 * Instance Properties.
 *
 */
Object.defineProperties( GoogleAnalytics.prototype, {
  getUserId: {
    /**
     * Compute UserID.
     *
     * @param req
     * @returns {*}
     */
    value: function getUserId( req ) {

      // If User Id set, use it.
      if( req.headers[ 'x-user-id' ] ) {
        return req.headers[ 'x-user-id' ];
      }

      var crypto  = require( 'crypto' );
      var agent   = req.headers[ 'user-agent' ] || 'unknown-agent';
      var origin  = this.setReferrer( req ) || 'unknown-origin';

      return [ 'uid', crypto.createHash('md5').update( [ origin, agent ].join( '/' ).toLowerCase() ).digest( 'hex' ) ].join( '-' );

    },
    enumerable: true,
    configurable: true,
    writable: true
  },
  getClientId: {
    /**
     * Compute getClientId.
     *
     * @param req
     * @returns {*}
     */
    value: function getClientId( req ) {

      // If User Id set, use it.
      if( req.headers[ 'x-client-id' ] ) {
        return req.headers[ 'x-client-id' ];
      }

      var crypto  = require( 'crypto' );
      var agent   = req.headers[ 'user-agent' ] || 'unknown-agent';
      var origin  = this.setReferrer( req ) || 'unknown-origin';

      return [ 'cid', crypto.createHash ('md5' ).update( [ origin, agent ].join( '/' ).toLowerCase() ).digest( 'hex' ) ].join( '-' );

    },
    enumerable: true,
    configurable: true,
    writable: true
  },
  setReferrer: {
    /**
     * Compute Origin.
     *
     * @param req
     * @returns {*}
     */
    value: function setReferrer( req ) {

      if( req.headers[ 'x-referrer' ] ) {
        return req.headers[ 'x-referrer' ];
      }

      if( req.headers[ 'referrer' ] ) {
        return req.headers[ 'x-referrer' ] = req.headers[ 'referrer' ];
      }

      if( req.headers[ 'host' ] ) {
        return req.headers[ 'x-referrer' ] = req.headers[ 'host' ];
      }

      return null;

    },
    enumerable: true,
    configurable: true,
    writable: true
  },
  trackPage: {
    /**
     * Track Page View.
     *
     * @param path
     * @param callback
     * @returns {*}
     */
    value: function trackPage( path, callback ) {
      GoogleAnalytics.debug( 'trackPage', path );

      function responseFinished() {
        GoogleAnalytics.debug( 'trackPage:responseFinished', this.path );
        this.__googleAnalytics._makeRequest( 'pageview', { sc: 'end', plt: 200, dp: path || this.path }, callback )
      }

      // Once response is sent, close the session.
      this.res.on( 'finish', responseFinished.bind( this ));

      return this.__googleAnalytics._makeRequest( 'pageview', { sc: 'start', dp: path || this.path }, callback )

    },
    enumerable: true,
    configurable: true,
    writable: true
  },
  trackEvent: {
    /**
     * Track Arbitrary Event.
     *
     * @param category
     * @param action
     * @param label
     * @param value
     * @param callback
     * @returns {*}
     */
    value: function trackEvent( category, action, label, value, callback ) {
      GoogleAnalytics.debug( 'trackEvent', category, action );

      var obj = {
        ec: category,
        ea: action,
        el: label,
        ev: value
      };

      return this._makeRequest( 'event', obj, callback );

    },
    enumerable: true,
    configurable: true,
    writable: true
  },
  trackTimer: {
    /**
     * Track Timer
     *
     * @returns {*}
     */
    value: function trackTimer() {

      var obj = {
        uid: this.__googleAnalytics.uid,
        sc: 'end',
        dh: this.headers.host,
        dp: path || this.path
      };

      return this.__googleAnalytics._makeRequest( 'timer', obj, callback );

    },
    enumerable: true,
    configurable: true,
    writable: true
  },
  _requestHandler: {
    /**
     * Request Middleware Handler.
     *
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    value: function _requestHandler( req, res, next ) {
      GoogleAnalytics.debug( req.get( 'host' ), req.method, req.url, req.headers[ 'x-google-analytics-tracked' ] ? 'Skipped' : 'Tracked' );

      // Do nothing if already tracked.
      if( this.options.useHeaderFlag && req.headers[ 'x-google-analytics-tracked' ] ) {
        return next();
      }

      // Set Tracked Response Header.
      if( this.options.useHeaderFlag ) {
        res.setHeader( 'x-google-analytics-tracked', true );
      }

      var __googleAnalytics = {
        tracker: this.trackedHosts[ req.headers.host ],
        origin: this.setReferrer( req ),
        uid: this.options.userId || this.getUserId( req ),
        cid: this.options.clientId || this.getClientId( req ),
        _makeRequest: this._makeRequest.bind( req )
      };

      Object.defineProperties( req, {
        __googleAnalytics: {
          value: __googleAnalytics,
          enumerable: false,
          configurable: true,
          writable: true
        },
        trackPage: {
          value: this.trackPage.bind( req ),
          enumerable: true,
          configurable: true,
          writable: true
        },
        trackEvent: {
          value: this.trackEvent.bind( req ),
          enumerable: true,
          configurable: true,
          writable: true
        },
        trackTimer: {
          value: this.trackTimer.bind( req ),
          enumerable: true,
          configurable: true,
          writable: true
        }
      });

      // Determine Referrer, tracker and User ID.
      req.googleAnalytics = {
        tracker: this.trackedHosts[ req.headers.host ],
        origin: this.setReferrer( req ),
        uid: this.getUserId( req )
      }

      // No tracker found, bail.
      if( !req.googleAnalytics.tracker ) {
        return next();
      }

      // If request tracking is enabled, track it now.
      if( this.options.trackRequests ) {
        req.trackPage( req.url );
      }

      return next();

    },
    enumerable: true,
    configurable: true,
    writable: true
  },
  _makeRequest: {
    /**
     * Make GA Request.
     *
     * @param type
     * @param obj
     * @param cb
     * @returns {*}
     * @private
     */
    value: function _makeRequest( type, obj, cb ) {
      GoogleAnalytics.debug( '_makeRequest' );

      var self        = this;
      var request     = require( 'request' );
      var deepExtend  = require( 'deep-extend' );

      // Set User ID from passed object or default
      obj = deepExtend({
        t: type || 'pageview',
        tid: this.__googleAnalytics.tracker.ua,
        cid: this.__googleAnalytics.cid,
        uid: this.__googleAnalytics.uid,
        dr: 'http://' + this.headers[ 'x-referrer' ],
        ua: this.headers[ 'user-agent' ],
        de: 'UTF-8',
        ul: 'en-us',
        dh: this.headers.host,
        v: 1,
        // cm: undefined,
        // sc: undefined,
        // uip: undefined,
        // plt: undefined,
        z: ( Math.random() ).toString().substring( 2 )
      }, obj );

      // console.log( require( 'util' ).inspect( obj, { showHidden: true, colors: true, depth: 2 } ) )

      request.get({
        url: 'http://www.google-analytics.com/collect',
        qs: obj
      }, GoogleAnalytics.prototype.apiResponse.bind( this ) );

      // @chainable.
      return this;

    },
    enumerable: true,
    configurable: true,
    writable: true
  },
  apiResponse: {
    value: function apiResponse( error, res, body ) {
      // GoogleAnalytics.debug( '_makeRequest:response', body );

      if ( this.__googleAnalytics.tracker.debug ) {
        GoogleAnalytics.debug( error, body, res.req.path );
      }

    },
    enumerable: true,
    configurable: true,
    writable: true
  }
})

/**
 * Constructor Properties.
 *
 */
Object.defineProperties( module.exports = GoogleAnalytics, {
  version: {
    value: require( '../package' ).version,
    enumerable: false,
    configurable: true,
    writable: false
  },
  debug: {
    value: require( 'debug' )( 'google-analytics' ),
    enumerable: true,
    configurable: true,
    writable: true
  },
  create: {
    value: function create( options ) {
      return new GoogleAnalytics( options || {} );
    },
    enumerable: true,
    configurable: true,
    writable: false
  },
  middleware: {
    value: function middleware( options ) {
      var instance = GoogleAnalytics.create( options || {} );
      return instance._requestHandler.bind( instance );
    },
    enumerable: true,
    configurable: true,
    writable: false
  }
})
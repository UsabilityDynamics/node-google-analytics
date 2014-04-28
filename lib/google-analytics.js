/**
 *
 * @param options
 * @returns {googleAnalytics}
 */
function googleAnalytics( options ) {

  return this;

}

/**
 *
 */
Object.defineProperties( googleAnalytics.prototype, {
  debug: {
    value: function debug() {

    },
    enumerable: true,
    configurable: true,
    writable: true
  }
})

/**
 *
 */
Object.defineProperties( module.exports = googleAnalytics, {
  create: {
    value: function create( options ) {
      return new googleAnalytics( options );
    },
    enumerable: true,
    configurable: true,
    writable: true
  },
  middleware: {
    value: function middleware( options ) {
      return new googleAnalytics( options );
    },
    enumerable: true,
    configurable: true,
    writable: true
  }
})
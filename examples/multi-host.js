/**
 *
 *
 */

var app = require( 'express' ).call();
var ga  = require( '../lib/google-analytics' );

app.use( ga.middleware({
  hosts: [
    {
      ua: 'UA-43694229-6',
      host: 'localhost:8080',
      debug: true
    },
    {
      ua: 'UA-43694229-4',
      host: 'localhost:8090',
      debug: true
    }
  ],
  trackRequests: true
}));

app.use( '/page-one', function( req, res ) {
  res.send( 'Page one.' );
})

app.use( '/page-two', function( req, res ) {
  res.send( 'Page two.' );
})

app.use( function( req, res ) {
  res.send( 404, 'Nothing found.' );
})

app.listen( 8080, function() {
  console.log( 'Google Analytics example started on %s:%d.', this.address().address, this.address().port );
});

app.listen( 8090, function() {
  console.log( 'Google Analytics example started on %s:%d.', this.address().address, this.address().port );
});


# anyWare Demo

Starting point from the [AngularJS Socket.IO Seed](https://github.com/btford/angular-socket-io-seed). 
A walkthrough of writing the seed application is available [here](http://briantford.com/blog/angular-socket-io.html).

## Running it

1) Install node libraries with npm:

    npm install

2) We also need global dependencies:
    npm install -g bower
(..or add node_modules/.bin to your PATH)

3) Install client libraries with bower

    cd public
    bower install

3) Run the app like so:

    node app.js

And navigate to `localhost:3000`

## Useful development tools

To automatically restart the app on file changes, install `nodemon` and run:

	nodemon app.js

To enable debug messages from the server, run:

	DEBUG=server nodemon app.js

To enable chrome debugger for node app, install `node-inspector`, run:

	node-inspector app.js

in a new terminal tab, and navigate to http://127.0.0.1:8080/debug?port=5858.

## URL Redirects

For ease of development and testing, navigate to any state. You will be
redirected to the login page. After logging in, your proximity will be set,
and you will be directed back to the initial requested page.

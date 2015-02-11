# anyWare Demo

Starting point from the [AngularJS Socket.IO Seed](https://github.com/btford/angular-socket-io-seed). 
A walkthrough of writing the seed application is available [here](http://briantford.com/blog/angular-socket-io.html).

## Running it

First, grab the dependencies with npm:

    npm install

Then run the app like so:

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

## TODO

### Status Bar
- ~~FIX logged in user state isn't sent from cyberObject after user status change~~
- ~~Include list of user name, and corresponding proximity in status bar~~
- ~~FIX send current status of other users when another user logs in, not just on change~~
- ~~Move status bar into index.jade, present on every page~~
- Don't want status bar on login page, as won't recieve any login broadcast
  events unless logged in

### Chat box
- ~~Populate username in messages list on message send~~
	~~(fixing status bar should take care of this)~~

### General
- ~~Enforce login before accessing remaining app flow~~
- Disable interaction if proximity is not set?
- Clean up controllers.js, seperate into view specific files
- Do cleanup on "logout"/tab close to remove cyberObjects and update status bars
...
- Visualize knock pattern instead of just a message box
- Make everything pretty
- 'Open Sesame' transition

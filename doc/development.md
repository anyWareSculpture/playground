# HOWTO setup a development environment

## Dependencies

### C Compiler & git

* Mac: Xcode incl. Command Line Tools (this includes git)

### node.js

One way of doing it (using nvm):

    git clone git://github.com/creationix/nvm.git ~/.nvm
    echo ". ~/.nvm/nvm.sh" >> ~/.profile
    <restart shell>
    nvm install 0.10
    nvm use 0.10

## Clone source code

    git clone git@github.com:anyWareSculpture/playground.git

## Run server on localhost

    npm install
    node index.js

## Run server on anyware.kintel.net

* ```ssh anyware.kintel.net```

Until further notice:

* Same as localhost deployment. Use your own user.

### Run client

In a browser:

http://localhost:3000 or http://anyware.kintel.net:3000


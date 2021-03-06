# anyWare TODO

This document discusses things to do related to anyWare

## Serial Communication

The physical aspects of the project is controlled by one or more
microcontrollers, typically based on Arduino.

These microcontrollers communicate with a computer embedded into the
sculpture. This can be a full computer (e.g. Mac Mini) or an embedded
board (e.g. BeagleBone).  The communication is typically done over a
serial interface, possible over USB.

Since microcontrollers have very limited resources, especially RAM,
the communication protocol needs to be easy to parse without using
dynamic memory.

**Tasks**

* Define serial protocol
* Implement serial protocol handler for microcontroller (C++)
* Implement serial protocol handler for embedded computer (Javascript)

## JSON API

The sculptures communicate with each other through a central server.
The embedded computers communicates with the server, typically using a web socket connection.
We'll likely use a JSON-based protocol/API for the communication over the web socket.

**Tasks**

* Research strategies for JSON APIs over web sockets
* Define JSON protocol/API
* Implement protocol framework for both server and clients (Javascript)

## Server Messaging and State Machine

The server will keep track of the state of the individual sculptures
and make sure they're kept in sync.
Thinking about this should probably be done before defining the JSON protocol/API.

**Tasks**

* State Machine strategy
* Messaging strategy
* How to deal with network issues
* What types of interaction will we support?
* How low-level will the communication between the server and sculptures be?
* What kind of bandwidth do we need/want to sustain?


## Server Infrastructure

The server will be based on node.js.
We might need a database. If that's the case, look into MongoDB.

**Tasks**

* Basic server framework
* Authentication
* Web socket upgrading
* Serving of web content (typically Express)
* SSL support
* Find, register and set up domain for anyware

## Embedded computer Infrastructure

As a start, we'll aim to use a Beagle Bone as an embedded computer.
The Beagle Bone will run some sort of Linux distribution, likely the
one supported by Beagle Bone. node.js should be a standard part of
that distribution.

**Tasks**

* Look into Beagle Bone, bootstrap a basic system
* Set up application framework (node.js)
   * web socket client
   * basic simulator (look at sharing code with the web simulator)
   * port knock box code
* Make it easy to reinstall/clone and update the system
* Look into networking options (WiFi vs. Ethernet)
* Look into remote admin strategy

## Microcontroller Infrastructure

As a start, we'll use Arduino as a microcontroller platform. This may
change in the future, and we might also use more than one
microcontroller.

**Tasks**

* Establish Structure/framework of Arduino code (clean up the existing knock box code)
* Look into ways of simulating hardware / abstracting communication and app logic from hardware
* Look info ways of testing this code

## Web client

We'll use a web client for testing and simulating the sculptures, as well as for admin purposes.
The web client will talk to the server using the same web socket protocol/API as the embedded computers will use.

**Tasks**

* Basic web client framework
* Decide on which existing frameworks to use (bootstrap, angular.js, templating, client libs)
* Implement knock box simulation
* Look into how to share code between embedded computer and web client
* Integrate web client content into the server framework

## Test framework

We should try to use the same test framework for all javascript code
(server code, embedded code and web client code). Since we're using node.js,
look into using mocha and chai as the core components of a test
framework. For testing the web client GUI, look into alternatives.

**Tasks**

* Establish basic test framework
* Add initial tests for server, embedded and web client code

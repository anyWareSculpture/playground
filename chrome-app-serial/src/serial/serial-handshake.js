const serialProtocol = require('./serial-protocol');
const {SerialProtocolCommandBuilder} = serialProtocol;

export default class SerialHandshake {
  constructor(serialConfig, identity, port) {
    this.serialConfig = serialConfig;
    this.handshakeConfig = this.serialConfig.HANDSHAKE;
    this.identity = identity;
    this.port = port;
    this.callback = null;

    this._helloSucceeded = false;
    this._helloAttempts = 0;
  }

  execute(callback) {
    this.callback = callback;
    this._sendHello();
    this._handleNextCommandWith(this._hello);
    this._beginTimeout();
  }

  _sendHello() {
    const commandString = SerialProtocolCommandBuilder.buildHello({debug: true});
    this.port.write(commandString, this._error.bind(this));
  }

  _hello(error, commandName, commandData) {
    this._helloAttempts += 1;

    if (error || commandName !== serialProtocol.HELLO_COMMAND || commandName === serialProtocol.DEBUG_COMMAND) {
      if (commandName === serialProtocol.DEBUG_COMMAND) {
        console.log(`DEBUG: ${commandData.message} from ${this.port.path}`);

        this._helloAttempts -= 1;
        this._handleNextCommandWith(this._hello);
      }
      else if (this._helloAttempts >= this.handshakeConfig.HELLO_ATTEMPTS) {
        this._error(`Could not get HELLO after ${this.handshakeConfig.HELLO_ATTEMPTS} attempts`);
      }
      else {
        this._handleNextCommandWith(this._hello);
      }
      return;
    }

    this._helloSucceeded = true;
    this._handleNextCommandWith(this._supported);
  }

  _supported(error, commandName, commandData) {
    if (error || commandName !== serialProtocol.SUPPORTED_COMMAND) {
      if (commandName === serialProtocol.DEBUG_COMMAND) {
        this._debugMode(error, commandName, commandData);
      }
      else {
        this._error(`Did not receive SUPPORTED command. Got: ${error || commandName}`);
      }
      return;
    }

    this._handleNextCommandWith(this._supportedPattern);
  }

  _debugMode(error, commandName, commandData) {
    if (commandName !== serialProtocol.DEBUG_COMMAND) {
      this._error(`Did not receive DEBUG command. Got: ${error || commandName}`);
      return;
    }

    this._handleNextCommandWith(this._supported);
  }

  _supportedPattern(error, commandName, commandData) {
    // Ignore unrecognized commands because they just imply that a command
    // the serial interface supports isn't supported by our code. That's
    // not a problem and if we need to support that command we will.
    if (error) {
      this._handleNextCommandWith(this._supportedPattern);
      return;
    }
    else if (commandName === serialProtocol.END_SUPPORTED_COMMAND) {
      this._endHandshake();
      return;
    }

    const pattern = SerialProtocolCommandBuilder.build(commandName, commandData).trim();
    this.port.supportedPatterns.push(pattern);

    this._handleNextCommandWith(this._supportedPattern);
  }

  _handleNextCommandWith(handler) {
    this.port.handleNextCommand(handler ? handler.bind(this) : handler);
  }

  _endHandshake() {
    this._finish();
  }

  _error(message) {
    if (!message) {
      return;
    }
    this.callback(new Error(message.toString()));
  }

  _finish() {
    this.callback();
  }

  _beginTimeout() {
    setTimeout(() => {
      if (!this._helloSucceeded) {
        // no arguments resets it all
        this._handleNextCommandWith();
        this._error(`Connection to ${this.port.path} timed out after ${this.handshakeConfig.TIMEOUT} ms`);
      }
    }, this.handshakeConfig.TIMEOUT);
  }
}

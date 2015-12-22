import * as serialProtocol from './serial/serial-protocol';
const {SerialProtocolCommandBuilder} = serialProtocol;
import SerialManager from './serial/serial-manager';

var logarea = document.querySelector('textarea');

document.addEventListener("keydown", function(e) {
  if (e.keyCode == 0xbc && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    chrome.app.window.create('prefs.html', {
      'bounds': {
        'width': 600,
        'height': 500
      }
    });
  }
});

window.onload = function() {
  const manifest = chrome.runtime.getManifest();
  var v = document.getElementById('anyware-version');
  v.innerHTML = manifest.version;

  var restart = document.getElementById('restart');
  restart.addEventListener('click', function() {
    chrome.runtime.reload();
  });
}

function log(str) {
  logarea.value=str+"\n"+logarea.value;
}

var logarea = document.querySelector('textarea');

const serialConfig = {
  COMMAND_DELIMETER: "\n",
  BAUDRATE: 115200,
  HANDSHAKE: {
    // The number of attempts to make towards getting a valid HELLO command
    HELLO_ATTEMPTS: 100,
    // The time to wait for a valid HELLO
    // Measurements show that it takes 1700-1800 ms to get a HELLO from an
    // Arduino after reset (tested on a Mac)
    TIMEOUT: 2000 // ms
  },
  // Serial port paths matching these patterns will be ignored
  HARDWARE_INVALID_PATH_PATTERNS: [
    "Bluetooth",
    "WirelessiAP"
  ],
  HARDWARE_VENDOR_IDS: new Set([
    "0x0",    // Generic/Unspecified (for Macs)
    "0x2341", // Arduino Vendor ID
    "0x2a03", // Arduino Uno (Alternate) Vendor ID
    "0x16c0"  // Teensy Vendor ID
  ])
};

setupSerialManager(serialConfig);

function setupSerialManager(serialConfig) {
  const serialManager = new SerialManager(serialConfig, 'dummy');
  serialManager.searchPorts(() => {
    console.log(`Finished searching all serial ports: ${Object.keys(serialManager.ports).length} ports found`);

    const table = document.getElementById('serial-ports');
    for (let portId of Object.keys(serialManager.ports)) {
      const port = serialManager.ports[portId];
      const patterns = port.supportedPatterns.join(', ');
      const cell = table.insertRow(-1).insertCell(0);
      console.log(`${portId}: ${patterns}`);
      cell.innerHTML = `${portId}: ${patterns}`;
    }

    const commands = buildRequiredCommands();
    const statusTable = document.getElementById('serial-status');
    for (let cmdobj of commands) {
      const ports = serialManager.findTargetPorts(cmdobj.cmd);
      console.debug(`${cmdobj.name} ${ports.size === 0 ? 'Not' : ''} OK`);
      const cell = statusTable.insertRow(-1).insertCell(0);
      cell.innerHTML = `${cmdobj.name} ${ports.size === 0 ? 'Not' : ''} OK`;
    }

  });
  return serialManager;
}

function buildRequiredCommands() {
  const config = {
    LIGHTS: {
      STRIP_A: '0',
      STRIP_B: '1',
      STRIP_C: '2',
      PERIMETER_STRIP: '3',
      DISK_LIGHT_STRIP: '4',
      HANDSHAKE_STRIP: '5',
      ART_LIGHTS_STRIP: '6'
    }
  };
  const commands = [];
  // All required panels
  for (let lightId of Object.keys(config.LIGHTS)) {
    const stripId = config.LIGHTS[lightId];
    commands.push({name: lightId,
                   cmd: SerialProtocolCommandBuilder.build(serialProtocol.PANEL_SET_COMMAND, {stripId})});
  }
  commands.push({name: 'Disk Reset',
                 cmd: SerialProtocolCommandBuilder.build(serialProtocol.DISK_RESET_COMMAND, {})});
  commands.push({name: 'Handshake',
                 cmd: SerialProtocolCommandBuilder.build(serialProtocol.HANDSHAKE_COMMAND, {})});
  return commands;
}

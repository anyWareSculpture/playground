const assert = require('assert');
const path = require('path');

// FIXME: Defer this to window.onload() ?
const context = initContext();

export class Sound {
  constructor({ url, loop = false, fadeIn = 0, fadeOut = fadeIn, name = path.basename(url, '.wav') } = {}) {

    assert(url && path.extname(url).toLowerCase() === '.wav');

    this.url = url;
    this.loop = loop;
    this.fadeIn = fadeIn;
    this.fadeOut = fadeOut;
    this.name = name;

    this.gain = context.createGain();
    this.gain.connect(context.destination);
    this.head = this.gain;
    
    this.load();
  }

  load() {
    const request = new XMLHttpRequest();
    request.open("GET", this.url, true);
    request.responseType = "arraybuffer";
    
    // Our asynchronous callback
    request.onload = () => {
      console.log('loaded');
      context.decodeAudioData(request.response, 
                              soundBuffer => this.buffer = soundBuffer, 
                              err => console.log(err));
    }
    
    request.send();
  }

  play() {
    if (this.fadeIn > 0) {
      this.gain.gain.setValueAtTime(0, context.currentTime);
      this.gain.gain.linearRampToValueAtTime(1, context.currentTime + this.fadeIn);
    }

    this.source = context.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.loop = this.loop;
    this.source.connect(this.head);
    this.source.start(context.currentTime);
  }

  stop() {
    if (this.fadeOut > 0) {
      var volume = this.gain.gain.value;
      this.gain.gain.cancelScheduledValues(context.currentTime);
      this.gain.gain.setValueAtTime(volume, context.currentTime);
      this.gain.gain.linearRampToValueAtTime(0,context.currentTime + volume*this.fadeOut);
      this.gain.gain.setValueAtTime(1, context.currentTime + volume*this.fadeOut);
      this.source.stop(context.currentTime + volume*this.fadeOut);
    }
    else {
      if (this.source) this.source.stop();
    }
  }
}

/*
  Sound with a VCF (Voltage Controlled Filter). The VCF is currently hardcoded since we only use it once
*/
export class VCFSound extends Sound {
  constructor({ url, fadeIn = 0, fadeOut = fadeIn, name = path.basename(url, '.wav') } = {}) {
    super({url, loop: true, fadeIn, fadeOut, name});
  }
  play() {

    const lowpass = context.createBiquadFilter();
    lowpass.Q.value = 2;
    lowpass.frequency.value = 2200;
    lowpass.type = 'lowpass';
    lowpass.connect(this.head);
    this.head = lowpass;

    var lfogain = context.createGain();
    lfogain.gain.value = 2000;

    var lfo = context.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.333;
    lfogain.connect(lowpass.frequency);
    lfo.connect(lfogain);
    lfo.start(context.currentTime);

    super.play();
  }
  stop() {
    super.stop();
  }
}

function initContext() {
  if (typeof AudioContext !== "undefined") {
    return new AudioContext();
  } else if (typeof webkitAudioContext !== "undefined") {
    return new webkitAudioContext();
  } else {
    throw new Error('AudioContext not supported. :(');
  }
}

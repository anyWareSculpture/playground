const assert = require('assert');
const path = require('path');
const fs = require('fs');
require('promise-decode-audio-data');

// FIXME: Defer this to window.onload() ?
const context = initContext();

let isNode = false;

export class Sound {
  constructor({ url, loop = false, fadeIn = 0, fadeOut = fadeIn, name = path.basename(url, '.wav') } = {}) {

    assert(url);

    this.url = url;
    this.loop = loop;
    this.fadeIn = fadeIn;
    this.fadeOut = fadeOut;
    this.name = name;
    this.gain = context.createGain();
    if (!isNode) this.gain.connect(context.destination);
    this.head = this.gain;
  }

  /**
   *  Returns a promise to fully load all needed assets for this sound
   */
  load() {
    console.log('loading ' + this.url);
    // FIXME: Node support:
    //    if (isNode) fetch = promisify(fs.readFile)(__dirname + '/../' + this.url).then(buffer => buffer);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', this.url, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = e => {
        if (xhr.status == 200) resolve(xhr.response);
        else reject(xhr.response);
      }
      xhr.onerror = e => reject(e);
      xhr.send();
    })
      .then(buffer => {
        console.log(`loaded ${this.url} - ${buffer.byteLength} bytes`);
        if (!buffer) console.log(`Buffer error: ${this.url}`);
        return context.decodeAudioData(buffer);
      })
      .then(soundBuffer => {
        console.log(`decoded ${this.url}`);
        this.buffer = soundBuffer;
        return this;
      });
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
    if (isNode) this.gain.connect(context.destination);
    this.source.start(context.currentTime);
  }

  stop() {
    if (this.fadeOut > 0) {
      var volume = this.gain.gain.value;
      this.gain.gain.cancelScheduledValues(context.currentTime);
      this.gain.gain.setValueAtTime(volume, context.currentTime);
      this.gain.gain.linearRampToValueAtTime(0,context.currentTime + volume*this.fadeOut);
      this.gain.gain.setValueAtTime(1, context.currentTime + volume*this.fadeOut);
      if (this.source) this.source.stop(context.currentTime + volume*this.fadeOut);
    }
    else {
      if (this.source) this.source.stop();
    }
  }
}

/**
 * Sound with a VCF (Voltage Controlled Filter). The VCF is currently hardcoded since we only use it once
 */
export class VCFSound extends Sound {
  constructor({ url, fadeIn = 0, fadeOut = fadeIn, name = path.basename(url, '.wav') } = {}) {
    super({url, loop: true, fadeIn, fadeOut, name});
  }

  play() {
    // FIXME: If running on node.js
    if (!context.createBiquadFilter) return super.play();

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
  } else if (typeof NodeAudioContext !== "undefined") {
    isNode = true;
    return new NodeAudioContext();
  }
  else {
    throw new Error('AudioContext not supported. :(');
  }
}

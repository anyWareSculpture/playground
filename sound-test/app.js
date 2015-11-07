(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = ADSR

function ADSR(audioContext){
  var node = audioContext.createGain()

  var voltage = node._voltage = getVoltage(audioContext)
  var value = scale(voltage)
  var startValue = scale(voltage)
  var endValue = scale(voltage)

  node._startAmount = scale(startValue)
  node._endAmount = scale(endValue)

  node._multiplier = scale(value)
  node._multiplier.connect(node)
  node._startAmount.connect(node)
  node._endAmount.connect(node)

  node.value = value.gain
  node.startValue = startValue.gain
  node.endValue = endValue.gain

  node.startValue.value = 0
  node.endValue.value = 0

  Object.defineProperties(node, props)
  return node
}

var props = {

  attack: { value: 0, writable: true },
  decay: { value: 0, writable: true },
  sustain: { value: 1, writable: true },
  release: {value: 0, writable: true },

  getReleaseDuration: {
    value: function(){
      return this.release
    }
  },

  start: {
    value: function(at){
      var target = this._multiplier.gain
      var startAmount = this._startAmount.gain
      var endAmount = this._endAmount.gain

      this._voltage.start(at)
      this._decayFrom = this._decayFrom = at+this.attack
      this._startedAt = at

      var sustain = this.sustain

      target.cancelScheduledValues(at)
      startAmount.cancelScheduledValues(at)
      endAmount.cancelScheduledValues(at)

      endAmount.setValueAtTime(0, at)

      if (this.attack){
        target.setValueAtTime(0, at)
        target.linearRampToValueAtTime(1, at + this.attack)

        startAmount.setValueAtTime(1, at)
        startAmount.linearRampToValueAtTime(0, at + this.attack)
      } else {
        target.setValueAtTime(1, at)
        startAmount.setValueAtTime(0, at)
      }

      if (this.decay){
        target.setTargetAtTime(sustain, this._decayFrom, getTimeConstant(this.decay))
      }
    }
  },

  stop: {
    value: function(at, isTarget){
      if (isTarget){
        at = at - this.release
      }

      var endTime = at + this.release
      if (this.release){

        var target = this._multiplier.gain
        var startAmount = this._startAmount.gain
        var endAmount = this._endAmount.gain

        target.cancelScheduledValues(at)
        startAmount.cancelScheduledValues(at)
        endAmount.cancelScheduledValues(at)

        var expFalloff = getTimeConstant(this.release)

        // truncate attack (required as linearRamp is removed by cancelScheduledValues)
        if (this.attack && at < this._decayFrom){
          var valueAtTime = getValue(0, 1, this._startedAt, this._decayFrom, at)
          target.linearRampToValueAtTime(valueAtTime, at)
          startAmount.linearRampToValueAtTime(1-valueAtTime, at)
          startAmount.setTargetAtTime(0, at, expFalloff)
        }

        endAmount.setTargetAtTime(1, at, expFalloff)
        target.setTargetAtTime(0, at, expFalloff)
      }

      this._voltage.stop(endTime)
      return endTime
    }
  },

  onended: {
    get: function(){
      return this._voltage.onended
    },
    set: function(value){
      this._voltage.onended = value
    }
  }

}

var flat = new Float32Array([1,1])
function getVoltage(context){
  var voltage = context.createBufferSource()
  var buffer = context.createBuffer(1, 2, context.sampleRate)
  buffer.getChannelData(0).set(flat)
  voltage.buffer = buffer
  voltage.loop = true
  return voltage
}

function scale(node){
  var gain = node.context.createGain()
  node.connect(gain)
  return gain
}

function getTimeConstant(time){
  return Math.log(time+1)/Math.log(100)
}

function getValue(start, end, fromTime, toTime, at){
  var difference = end - start
  var time = toTime - fromTime
  var truncateTime = at - fromTime
  var phase = truncateTime / time
  return start + phase * difference
}
},{}],2:[function(require,module,exports){
var ADSR = require('adsr');

var context;
var sounds = {};
var effects = {};
var FADE_TIME = 5;

window.onload = function() {

  console.log('Starting sound-test');

  initContext();
  var tuna = new Tuna(context);

  effects.envelope = function(sound) {
    sound.envelope = true;
    return true;
  }
    
  effects.wahwah = function() {
    return new tuna.WahWah({
      automode: true,                //true/false
      baseFrequency: 0.4,            //0 to 1
      excursionOctaves: 2,           //1 to 6
      sweep: 0.5,                    //0 to 1
      resonance: 10,                 //1 to 100
      sensitivity: 0.5,              //-1 to 1
      bypass: 0
    });
  }

  effects.delay = function() {
    return new tuna.Delay({
      feedback: 0.50,    //0 to 1+
      delayTime: 150,    //how many milliseconds should the wet signal be delayed?
      wetLevel: 0.5,    //0 to 1+
      dryLevel: 1,       //0 to 1+
      cutoff: 2000,      //cutoff frequency of the built in lowpass-filter. 20 to 22050
      bypass: 0
    });
  }

  effects.compressor = function() {
    return new tuna.Compressor({
      threshold: 0.5,    //-100 to 0
      makeupGain: 1,     //0 and up
      attack: 1,         //0 to 1000
      release: 0,        //0 to 3000
      ratio: 4,          //1 to 20
      knee: 5,           //0 to 40
      automakeup: true,  //true/false
      bypass: 0
    });
  }

  effects.lowpass = function() {
    return new tuna.Filter({
      frequency: 440, //20 to 22050
      Q: 1, //0.001 to 100
      gain: 0, //-40 to 40
      filterType: "lowpass", //lowpass, highpass, bandpass, lowshelf, highshelf, peaking, notch, allpass
      bypass: 0
    });  
  }

  effects.highpass = function() {
    return new tuna.Filter({
      frequency: 1440, //20 to 22050
      Q: 1, //0.001 to 100
      gain: 0, //-40 to 40
      filterType: "highpass", //lowpass, highpass, bandpass, lowshelf, highshelf, peaking, notch, allpass
      bypass: 0
    });  
  }
  
  effects.convolver = function() {
    return new tuna.Convolver({
      highCut: 22050,                         //20 to 22050
      lowCut: 20,                             //20 to 22050
      dryLevel: 1,                            //0 to 1+
      wetLevel: 1,                            //0 to 1+
      level: 1,                               //0 to 1+, adjusts total output of both wet and dry
      impulse: "impulses/matrix-reverb1.wav",    //the path to your impulse response
      bypass: 0
    });
  }

  effects.tremolo = function() {
    return new tuna.Tremolo({
      intensity: 0.3,    //0 to 1
      rate: 5,         //0.001 to 8
      stereoPhase: 0,    //0 to 180
      bypass: 0
    });
  }

  addSound('sounds/Pulse_Amb_Loop.wav', {loop: true, fade: true});
  addSound('sounds/Pulse_Amb_Loop.wav', {loop: true, fade: true, effects: ['wahwah', 'lowpass']});
  addSound('sounds/Pulse_Amb_Loop.wav', {loop: true, fade: true, effects: ['convolver']});
  addSound('sounds/Pulse_Amb_Loop.wav', {loop: true, fade: true, effects: ['lowpass']});
  addSound('sounds/Pulse_Amb_Loop.wav', {loop: true, fade: true, effects: ['highpass']});
  addSound('sounds/Pulse_Amb_Loop.wav', {loop: true, fade: true, effects: ['tremolo']});
  addSound('sounds/Pulse_Amb_Loop.wav', {loop: true, fade: true, effects: ['delay']});
  addSound('sounds/Pulse_Amb_Loop.wav', {effects: ['envelope']});
  addSound('sounds/LED_01.wav');
  addSound('sounds/LED_01.wav', {effects: ['wahwah', 'highpass']});
  addSound('sounds/LED_02.wav', {effects: ['convolver']});
  addSound('sounds/LED_03.wav', {effects: ['delay']});
  addSound('sounds/LED_04.wav');
  addSound('sounds/LED_05.wav');
  addSound('sounds/LED_06.wav');
  addSound('sounds/LED_07.wav');
  addSound('sounds/LED_08.wav');
  addSound('sounds/LED_09.wav');
  addSound('sounds/LED_10.wav');
}

function addSound(url, options) {
  options = options || {};

  var soundname = basename(url);
  var sound = {
    url: url,
    name: soundname
  }

  var gain = context.createGain();
  sound.gain = gain;
  gain.connect(context.destination);
  var headnode = gain;
  if (options.effects) {
    options.effects.slice(0).reverse().forEach(function(effect) {
      var effectnode = effects[effect](sound);
      if (effectnode.connect) {
        effectnode.connect(headnode);
        headnode = effectnode;
      }
    });
    sound.effects = options.effects;
  }
  
  sound.headnode = headnode;
  if (options.loop) sound.loop = true;
  sounds[soundname] = sound;
  
  addButton(sound);

  loadSound(sound, function(err, soundBuffer, sound) {
    if (err) return console.log(err);
    sound.buffer = soundBuffer;
  });
}

function playSound(sound) {
  console.log('playing ' + sound.name + '...');  

  if (sound.fade) {
    sound.gain.gain.setValueAtTime(0, context.currentTime);
    sound.gain.gain.linearRampToValueAtTime(1,context.currentTime + FADE_TIME);
  }

  var soundSource = context.createBufferSource();
  soundSource.buffer = sound.buffer;
  soundSource.loop = sound.loop;

  soundSource.connect(sound.headnode);

  if (sound.envelope) {
    var adsr = ADSR(context);
    sound.gain.gain.value = 0;
    adsr.connect(sound.gain.gain);
    adsr.attack = 0.1; // seconds
    adsr.decay = 0.01; // seconds
    adsr.sustain = 0.9; // multiply gain.gain.value
    adsr.release = 0.5; // seconds
    sound.envelope = adsr;
    sound.envelope.start(context.currentTime);
  }
  soundSource.start(context.currentTime);
  sound.source = soundSource;
  if (sound.envelope) {
    var stopAt = adsr.stop(context.currentTime + 1.1);
    soundSource.stop(stopAt);
  }
}

function stopSound(sound) {
  if (sound.fade) {
    var volume = sound.gain.gain.value;
    sound.gain.gain.cancelScheduledValues(context.currentTime);
    sound.gain.gain.setValueAtTime(volume, context.currentTime);
    sound.gain.gain.linearRampToValueAtTime(0,context.currentTime + volume*FADE_TIME);
  }
  else {
    if (sound.source) sound.source.stop();
    if (sound.envelope) sound.envelope.stop(context.currentTime);
  }
}

function basename(str) {
    var str = str.substr(str.lastIndexOf('/') + 1);
    return str.substr(0,str.lastIndexOf('.'));
}

function addButton(sound) {
  if (sound.loop) {
    var checkbox = $('<input type="checkbox"/>').change(function () {
    });
    var button = $('<button/>').text(sound.name).click(function () {
      if (!checkbox.is(':checked')) {
        sound.fade = false;
        playSound(sound);
      }
      else {
        sound.fade = false;
        stopSound(sound);
      }
      checkbox.click();
    });
  }
  else {
    var button = $('<button/>').text(sound.name).click(function () {
      playSound(sound);
    });
  }
  var row = $('<tr><td></td></tr>').children().append(checkbox).append(button).end();

  if (sound.loop) {
    row.append($('<button>fadeIn</button>').click(function() {
      if (!checkbox.is(':checked')) {
        sound.fade = true;
        playSound(sound);
        checkbox.click();
      }
    }));
    row.append($('<button>fadeOut</button>').click(function() {
      if (checkbox.is(':checked')) {
        sound.fade = true;
        stopSound(sound);
        checkbox.click();
      }
    }));
  }

  if (sound.effects) {
    var effectelem = row.append($('<span>Effects: </span>'));
    sound.effects.forEach(function(effect) {
      effectelem.append(effect + " ");
    });
  }

  $('#buttons').append(row);
}

function initContext() {
  if (typeof AudioContext !== "undefined") {
    context = new AudioContext();
  } else if (typeof webkitAudioContext !== "undefined") {
    context = new webkitAudioContext();
  } else {
    throw new Error('AudioContext not supported. :(');
  }
}

function decodeAudioData(arraybuffer, url, callback) {
  // decode the buffer into an audio source
  context.decodeAudioData(arraybuffer, (soundBuffer) => {
//    console.log('decoded');
    callback(soundBuffer);
  });
}

function loadSound(sound, callback) {
  const request = new XMLHttpRequest();
  request.open("GET", sound.url, true);
  request.responseType = "arraybuffer";
  
  // Our asynchronous callback
  request.onload = () => {
//    console.log('loaded');
    var soundSource = decodeAudioData(request.response, sound.url, soundBuffer => {
      callback(null, soundBuffer, sound);
    });
  }
  
  request.send();
}

},{"adsr":1}]},{},[2]);

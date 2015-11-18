import {Sound, VCFSound} from './audio-api';
var ADSR = require('adsr');
const Tuna = require('tunajs');

let context;
var sounds = {};
var effects = {};
var FADE_TIME = 5;
var destination;
var tuna;
var recorder;


function startRecording(button) {
  recorder && recorder.record();
  button.disabled = true;
  button.nextElementSibling.disabled = false;
  console.log('Recording...');
}

function stopRecording(button) {
  recorder && recorder.stop();
  button.disabled = true;
  button.previousElementSibling.disabled = false;
  console.log('Stopped recording.');
  
  // create WAV download link using audio data blob
  createDownloadLink();
 
//  recorder.clear();
}

function createDownloadLink() {
  recorder && recorder.exportWAV(function(blob) {
    console.log('WAV created');
    var url = URL.createObjectURL(blob);
    var li = document.createElement('li');
    var au = document.createElement('audio');
    var hf = document.createElement('a');
    
    au.controls = true;
    au.src = url;
    hf.href = url;
    hf.download = new Date().toISOString() + '.wav';
    hf.innerHTML = hf.download;
    li.appendChild(au);
    li.appendChild(hf);
    recordingslist.appendChild(li);
  });
}

window.onload = function() {

  console.log('Starting sound-test');

  initContext();

  var compressor = context.createDynamicsCompressor();
  compressor.threshold.value = 0;
  compressor.connect(context.destination);
  destination = compressor;
  recorder = new Recorder(compressor);
 

  $('#record').click(startRecording.bind(null, $('#record')[0]));
  $('#stop').click(stopRecording.bind(null, $('#stop')[0]));

  tuna = new Tuna(context);

  effects.lfofilter = function(sound) {
    sound.lfofilter = true;
    return true;
  }

  effects.oscillator = function(sound) {
    sound.oscillator = true;
    return true;
  }

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
      intensity: 1,    //0 to 1
      rate: 50,         //0.001 to 8
      stereoPhase: 0,    //0 to 180
      bypass: 0
    });
  }

  addButton(new Sound({url:'sounds/G01_LED_04.wav'}));
  addButton(new Sound({url:'sounds/Pulse_Amb_Loop.wav', loop: true, fadeIn: 3}));
  addButton(new VCFSound({url:'sounds/Pulse_Amb_Loop.wav', loop: true, fadeIn: 3}));

  addSound('sounds/Pulse_Amb_Loop.wav', {loop: true, fade: true});
  addSound('sounds/Pulse_Amb_Loop.wav', {loop: true, fade: true, effects: ['wahwah', 'lowpass']});
  addSound('sounds/Pulse_Amb_Loop.wav', {loop: true, fade: true, effects: ['convolver']});
  addSound('sounds/Pulse_Amb_Loop.wav', {loop: true, fade: true, effects: ['lowpass']});
  addSound('sounds/Pulse_Amb_Loop.wav', {loop: true, fade: true, effects: ['highpass']});
  addSound('sounds/Pulse_Amb_Loop.wav', {loop: true, fade: true, effects: ['tremolo']});
  addSound('sounds/Pulse_Amb_Loop.wav', {loop: true, fade: true, effects: ['lfofilter']});
  addSound("sounds/Pulse_Amb+Filter.wav", {loop: true, fade: true});
  addSound('sounds/Pulse_Amb_Loop.wav', {effects: ['envelope']});
  addSound('sounds/G01_Negative_01.wav');
  addSound('sounds/G01_Success_01.wav');
  addSound('sounds/G01_LED_01.wav', {loop: true});
  addSound('sounds/G01_LED_01.wav', {effects: ['wahwah', 'highpass']});
  addSound('sounds/G01_LED_02.wav', {effects: ['convolver']});
  addSound('sounds/G01_LED_03.wav', {effects: ['delay']});
  addSound('sounds/G01_LED_04.wav');
  addSound('sounds/G01_LED_05.wav');
  addSound('sounds/G01_LED_06.wav');
  addSound('sounds/G01_LED_07.wav');
  addSound('sounds/G01_LED_08.wav');
  addSound('sounds/G01_LED_09.wav');
  addSound('sounds/G01_LED_10.wav');
  addSound('Test.osc', {loop: true, effects: ['oscillator']});
}

function addSound2(options) {
  const sound = new Sound(options);
  addButton(sound);
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
  gain.connect(destination);
  var headnode = gain;
  if (options.effects) {
    options.effects.slice(0).reverse().forEach(function(effect) {
      var effectnode = effects[effect](sound);
      if (effectnode.connect) {
        effectnode.connect(headnode);
        headnode = effectnode;
      }

      if (effect === 'oscillator') sound.source = effectnode;
    });
    sound.effects = options.effects;
  }
  
  sound.headnode = headnode;
  if (options.loop) sound.loop = true;
  sounds[soundname] = sound;
  
  addButton(sound);

  if (suffix(sound.url).toLowerCase() === 'wav') {
    loadSound(sound, function(err, soundBuffer, sound) {
      if (err) return console.log(err);
      sound.buffer = soundBuffer;
    });
  }
}

function playSound(sound) {

  if (sound instanceof Sound) {
    return;
  }

  console.log('playing ' + sound.name + '...');  
  var headnode = sound.headnode;

  if (sound.fade) {
    sound.gain.gain.setValueAtTime(0, context.currentTime);
    sound.gain.gain.linearRampToValueAtTime(1,context.currentTime + FADE_TIME);
  }

  if (sound.oscillator) {
    var osc = context.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 50;
    osc.connect(sound.headnode);
    sound.source = osc;
  }

  if (sound.lfofilter) {
    var lowpass = new tuna.Filter({
      frequency: 2200, // 
      Q: 2, //0.001 to 100
      gain: 0, //-40 to 40
      filterType: "lowpass", //lowpass, highpass, bandpass, lowshelf, highshelf, peaking, notch, allpass
      bypass: 0
    });
    lowpass.connect(sound.headnode);

    var lfogain = context.createGain();
    lfogain.gain.value = 2000;

    var lfo = context.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.333;
    lfogain.connect(lowpass.filter.frequency);
    lfo.connect(lfogain);
    lfo.start(context.currentTime);
    
    headnode = lowpass;
  }

  if (sound.buffer) {
    var soundSource = context.createBufferSource();
    soundSource.buffer = sound.buffer;
    soundSource.loop = sound.loop;
    //  soundSource.playbackRate.value = 10;
    soundSource.connect(headnode);
    sound.source = soundSource;
  }

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
  sound.source.start(context.currentTime);
  if (sound.envelope) {
    var stopAt = adsr.stop(context.currentTime + 1.1);
    sound.source.stop(stopAt);
  }
}

function stopSound(sound) {
  if (sound.fade) {
    var volume = sound.gain.gain.value;
    sound.gain.gain.cancelScheduledValues(context.currentTime);
    sound.gain.gain.setValueAtTime(volume, context.currentTime);
    sound.gain.gain.linearRampToValueAtTime(0,context.currentTime + volume*FADE_TIME);
    sound.gain.gain.setValueAtTime(1, context.currentTime + volume*FADE_TIME);
    sound.source.stop(context.currentTime + volume*FADE_TIME);
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

function suffix(str) {
    return str.substr(str.lastIndexOf('.')+1);
}

function addButton(sound) {
  if (sound instanceof Sound) {
    if (sound.loop) {
      var checkbox = $('<input type="checkbox"/>').change(function () {
        if (checkbox.is(':checked')) sound.play();
        else sound.stop();
      });
      var button = $('<button/>').text(sound.name).click(function () {
        checkbox.click();
      });
    }
    else {
      var button = $('<button/>').text(sound.name).click(() => sound.play());
    }
    var row = $('<tr><td></td></tr>').children().append(checkbox).append(button).end();
    $('#buttons').append(row);
    return;
  }
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

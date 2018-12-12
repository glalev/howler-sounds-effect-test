
// window.onload = function () {
var SOUND = null;


var BUTTONS = {
  load: document.querySelector('#add-btn'),
  play: document.querySelector('#play-btn'),
  stop: document.querySelector('#stop-btn'),
  loop: document.querySelector('#loop-btn'),
}
var INPUTS = {
  load: document.querySelector('#soundToLoad'),
  playback: document.querySelector('#playback-slider'),
  balance: document.querySelector('#balance-slider'),
  effectsSelector: document.querySelector('#effects'),
}
var INFO = {
  name: document.querySelector('#soundName'),
  speed: document.querySelector('#playback-speed'),
  loop: document.querySelector('#loop-btn').classList.contains('active'),
  balance: parseFloat(INPUTS.balance.value),
  effect: null
};
var addSound = function() {
  INPUTS.load.click();
};

var newSoundHandle = function () {
    if (SOUND && SOUND.playing()) SOUND.stop();

    var name = INPUTS.load.files[0].name;
    loadSound(name);
}

var loadSound = function (name) {
  SOUND = new Howl({src: ['sounds/' + name]});
  INFO.name.innerHTML = name;
  toggleButton(['play', 'stop', 'loop'], true);
}
var soundPlay = function () {
  SOUND.stop();
	SOUND.play();
  SOUND.loop(INFO.loop);
  SOUND.stereo(INFO.balance);
  SOUND.rate(INPUTS.playback.value)
}

var soundStop = function () {
	SOUND.stop();
}

var toggleLoop = function (value){
  var loop = typeof value === "undefined" ? !INFO.loop : value;
  SOUND.loop(loop);
  INFO.loop = loop;
	// SOUND._loop = !SOUND._loop;	//TODO
  BUTTONS.loop.classList.toggle('active', loop);
}

var setPlaybackSpeed = function (){
	INFO.speed.innerHTML = INPUTS.playback.value;
	SOUND && SOUND.rate(INPUTS.playback.value);
}
var setBalance = function() {
  INFO.balance = parseFloat(INPUTS.balance.value, 10);
  SOUND && SOUND.stereo(INFO.balance);
}

var toggleButton = function (nameOrNames, value) {
  if (Array.isArray(nameOrNames)){
    nameOrNames.forEach(function(name){
      toggleButton(name, value)
    });
    return;
  }

  var name = nameOrNames;

  if (!BUTTONS[name]) return console.error('no such button');

  BUTTONS[name].disabled = typeof value === "undefined" ? !BUTTONS[name].disabled : !value;
}

var addEffect = function(e) {
  var value = e.currentTarget.value;
  var controls = document.querySelector('#effects-controls');
  var control = document.querySelector('#effects-controls #' + value);
  // var inputs = control.querySelectorAll('.input');

  Array.from(controls.children).forEach(function(control){ // todo is Array.from ES5?
    control.classList.toggle('visible', control.id === value);
  });
  if(value === 'none') {
    INFO.effect = null;
    SOUND.removeEffects();
  } else {
    var tuna = new Tuna(Howler.ctx);
    var effect = INFO.effect = new tuna[value]({});
    SOUND.addEffect(effect);
  }
}
var effectChanged = function(e) {
  var input = e.target;
  var name = input.dataset.name;
  var value = input.type === 'range' ? parseFloat(input.value, 10) : input.value;
  
  if(!INFO.effect || !INFO.effect[name]) return;

  input.nextSibling.innerHTML = value;
  INFO.effect[name] = value;

}

var setEffectValues = function (effect, inputs) {

}
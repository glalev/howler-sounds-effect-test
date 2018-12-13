import {Howl, Howler} from 'howler';
import howlerMixins from './howler-mixins.js';
import handlebarsHelpers from './handlebars-helpers.js';

import Sounds from './Sounds.js';
import Config from './Config.js';
import Effect from './Effect.js';
import template from '../templates/app.hbs';

howlerMixins();
handlebarsHelpers();

class App {
  constructor(container) {
    container.innerHTML = template({effects: Config.effects});

    this.inputs = {
      load: container.querySelector('#soundToLoad'),
      playback: container.querySelector('#playback-slider'),
      balance: container.querySelector('#balance-slider'),
      effectsSelector: container.querySelector('#effects-selector'),
      effects: container.querySelector('#effects'),
    };

    this.info = {
      soundName: container.querySelector('#soundName'),
      speed: container.querySelector('#playback-speed'),
      loop: container.querySelector('#loop-btn').classList.contains('active'),
      balance: parseFloat(this.inputs.balance.value),
      effect: null
    };

    this.buttons = {
      load: container.querySelector('#add-btn'),
      play: container.querySelector('#play-btn'),
      stop: container.querySelector('#stop-btn'),
      loop: container.querySelector('#loop-btn'),
    }

    this.effects = this._addEffects(Config.effects);
  }

  addSound() {
    this.inputs.load.click();
  }

  loadSound(e) {
    const name = this.inputs.load.files[0].name;
    var sound = Sounds.current;

    sound && sound.stop();
    Sounds.load(name);

    this.info.soundName.innerHTML = name;
    this._toggleButton(['play', 'stop', 'loop'], true);
  }

  playSound() {
    const sound = Sounds.current;
    const {loop, balance} = this.info;
    const {value: rate} = this.inputs.playback;

    sound.stop();
    sound.play();
    sound.loop(loop);
    sound.stereo(balance);
    sound.rate(rate);
  }

  stopSound() {
    Sounds.current.stop();
  }

  toggleSoundLoop(){
    const loop = typeof value === "undefined" ? !this.info.loop : value;
    Sounds.current.loop(loop);

    this.info.loop = loop;
    this.buttons.loop.classList.toggle('active', loop);
  }

  setPlaybackSpeed() {
    const sound = Sounds.current;
    const {value: rate} = this.inputs.playback;

    this.info.speed.innerHTML = rate;
    sound && sound.rate(rate);
  }

  setBalance() {
    const sound = Sounds.current;
    const balance = parseFloat(this.inputs.balance.value, 10);

    this.info.balance = balance;
    sound && sound.stereo(balance);
  }

  addEffect(e) { // todo applay effect
    const name = e.currentTarget.value;
    const effect = this.effects[name];

    this.inputs.effects.innerHTML = '';
    Sounds.current.removeEffects();

    if (effect) {
      Sounds.current.addEffect(effect.instance);
      this.inputs.effects.appendChild(effect.inputs);
    }

    this.info.effect = effect;
  }

  changeEffect(e) {
    const effect = this.info.effect;
    effect && effect.update(e.target);
  }

  _addEffects(effects) {
    return Object.keys(effects).reduce((acc, effect) => {
      const options = effects[effect];
      acc[effect] = new Effect({name: effect, ...options});
      return acc;
    }, {});
  }

  _toggleButton(nameOrNames, value) {
    if (Array.isArray(nameOrNames)){
      return nameOrNames.forEach((name) => this._toggleButton(name, value));
    }

    const name = nameOrNames;
    const button = this.buttons[name];
    if (!button) return console.error('no such button');

    button.disabled = typeof value === "undefined" ? !button.disabled : !value;
  }
}

window.App = App;
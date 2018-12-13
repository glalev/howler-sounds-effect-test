import { Howler } from 'howler';
import Tuna from 'tunajs';
import template from '../templates/effect.hbs';

class Effect {
  constructor (config) {
    this.inputs = document.createElement('div');
    this.inputs.innerHTML = template(config);
    this.config = config;
  }

  update ({name, value}) {
    const oldValue = typeof this.instance[name].value !== 'undefined' ? this.instance[name].value : this.instance[name];
    const newValue = typeof oldValue === 'number' ? parseFloat(value, 10) : value;
    const label = this.inputs.querySelector(`.${name}.effect-label`); // todo

    if (label) label.innerHTML = value;
    this.instance[name] = newValue;
  }

  get instance () {
    if (!Howler.ctx) return null;
    if (this._instance) return this._instance;

    const tuna = new Tuna(Howler.ctx);
    const {name, defaults} = this.config;

    this._instance = new tuna[name](defaults);

    return this._instance;
  }
}

export default Effect;

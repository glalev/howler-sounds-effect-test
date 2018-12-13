import {Howler} from 'howler';

const Sounds = {
  pool: {},
  current: null,
  load: (name) => {
    const sound = new Howl({src: ['sounds/' + name]});

    Sounds.current = sound;
    Sounds.pool[name] = sound;
  }
}

export default Sounds;
const mixins = function(){
  if(!Howl) return console.warn('No global instance os Howler');
  if(Howl.prototype.addEffect) console.warn('addEffect method on Howl will be overwritten, which is most likely unwanted');

  Howl.prototype.addEffect = function (effect) {
    if(!Howler.usingWebAudio) return console.warn('effects cannot be applyed becouse web audio is not supported');
    var sounds = this._sounds;
    sounds.forEach(function(sound){
      sound._node.disconnect();
      sound._node.connect(effect);

      effect.connect(Howler.masterGain);
    });

    return effect;
  }

  Howl.prototype.removeEffects = function () {
    if(!Howler.usingWebAudio) return;

    var sounds = this._sounds;
    sounds.forEach(function(sound){
      sound._node.disconnect();
      sound._node.connect(Howler.masterGain);
    });

    return true;
  }
};

export default mixins;
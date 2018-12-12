(function() {

	/**
	 * TODO:
	 * - use promises
	 * - on end
	 * - rate
	 */

	'use strict';

	// Support fadeIn/fadeOut/fadeTo  -------------------------------------------------------------------

	/**
	  *	@dependency: TweenMax
	  */

	Howl.prototype.fadeIn = function(duration){
		if(duration === undefined) duration = 0.5;

		TweenMax.to(this, duration * (1 - this._volume), { 
			_volume: 1.0,
			onUpdate: this._updateVolume, onUpdateScope: this
		});
		return this;
	};
	
	Howl.prototype.fadeOut = function(duration, autoStop){
		if(duration === undefined) duration = 0.5;
		if(autoStop === undefined) autoStop = true;

		TweenMax.to(this, duration * this._volume, { 
			_volume: 0.0,
			onUpdate: this._updateVolume, onUpdateScope: this,
			onComplete: autoStop ? this.stop.bind(this) : null, onCompleteScope: this,
		});
		return this;
	};

	Howl.prototype.fadeTo = function(duration, volume){
		if(duration === undefined) duration = 0.5;
		if(volume === undefined) volume = 0.5;

		var syncTime = duration * Math.abs(this._volume - volume);
		TweenMax.to(this, syncTime, { 
			_volume: volume,
			onUpdate: this._updateVolume, onUpdateScope: this
		});
		return this;
	};

	Howl.prototype._updateVolume = function(){
		this.volume(this._volume);
	};

	// Allow chaingin of play method  -------------------------------------------------------------------

	Howl.prototype.play = (function(_super) {
		return function() {
			this._lastSoundId = _super.apply(this, arguments);
			return this;
		};
	})(Howl.prototype.play);

	Howl.prototype.getSoundId = function(duration, autoStop){
		return this._lastSoundId;
	};


	// Support chained delay  -------------------------------------------------------------------

	var METHODS = ['play', 'stop', 'pause', 'seek', 'loop', 'volume', 'mute', 'fade', 'fadeIn', 'fadeOut', 'fadeTo', 'delay'];

	Howl.prototype.delay = function(secs){
		if(this._delayed) {
			console.warn('Sorry, but multiple delays are not supported yet, so I will just kill the previous one');
			this.clearDelay();
		}

		this._delayed = true;
		this._delayCallbacks = [];
		//TODO: this implementation pauses delayed sounds, only when TweenMax is paused. Improve it to work in any other case
		this._delayTimeout = _.wait(secs, function(){
			this._delayCallbacks.forEach(function(callback){
				callback();
			});
			this.clearDelay();
		}, this);

		return this;
	};

	Howl.prototype.clearDelay = function(){
		if(this._delayTimeout) {
			_.clearWait(this._delayTimeout);
		}
		this._delayed = false;
		this._delayCallbacks = null;
		this._delayTimeout = null;
	};

	METHODS.forEach(function(method){
		Howl.prototype[method] = (function(_super) {
			return function() {
				// console.warn(method, this._delayed);
				if(!this._delayed){
					return _super.apply(this, arguments);
				} else {
					var me = this;
					var args = arguments;
					this._delayCallbacks.push(function(){
						_super.apply(me, args);
					});
					return this;
				}
			};
		})(Howl.prototype[method]);
	});

	// pause all sound
	/**
	 * Pause all sounds, which are playing.
	 * @return {Howler}
	 */
	HowlerGlobal.prototype.resumeAll = function(){
		var self = this || Howler;

		// Loop through and mute all HTML5 Audio nodes.
		for (var i=0; i<self._howls.length; i++) {
			//if (!self._howls[i]._webAudio) {
				// Get all of the sounds in this Howl group.
				var ids = self._howls[i]._getSoundIds();

				// Loop through all sounds and mark the audio node as muted.
				for (var j=0; j<ids.length; j++) {
					var sound = self._howls[i]._soundById(ids[j]);

					if (sound && sound._wasPaused) {
						self._howls[i].play(sound._id);
						sound._wasPaused = false;
					}
				}
			//}
		}

		return self;
	};

	/**
	 * Resume all sounds, which are playing.
	 * @return {Howler}
	 */
	HowlerGlobal.prototype.pauseAll = function(){
		var self = this || Howler;

		// Loop through and mute all HTML5 Audio nodes.
		for (var i=0; i<self._howls.length; i++) {
			//if (!self._howls[i]._webAudio) {
				// Get all of the sounds in this Howl group.
				var ids = self._howls[i]._getSoundIds();

				// Loop through all sounds and mark the audio node as muted.
				for (var j=0; j<ids.length; j++) {
					var sound = self._howls[i]._soundById(ids[j]);
					var isPlaying = sound && !sound._paused && !sound._ended;
					if (sound && isPlaying) {
						sound._wasPaused = true;
						self._howls[i].pause(sound._id);
					}
				}
			//}
		}

		return self;
	};


	/**
	 * Update the sound playback rate.
	 * @return {Sound}
	 */
	Sound.prototype.setRate = function(rate){
		var self = this;
		var parent = self._parent;
		self._rate = rate;

		if (parent._webAudio) {
			if(self._node && self._node.bufferSource) {
				self._node.bufferSource.playbackRate.value = rate;
			}
		} else {
			//self._node = new Audio();
			//TODO: handle the case of HTML5
			//http://www.w3schools.com/tags/av_prop_playbackrate.asp

		}

		return self;
	};

	/**
	 * Get the sound playback rate.
	 * @return {int}
	 */
	Sound.prototype.getRate = function(){
		var self = this;
		var parent = self._parent;
		var rate = 1;
		if(self._rate) {
			rate = self._rate;
		}

		if (parent._webAudio) {
			if(self._node && self._node.bufferSource) {
				rate = self._node.bufferSource.playbackRate.value;
			}
		} else {
			//self._node = new Audio();
			//TODO: handle the case of HTML5
			//http://www.w3schools.com/tags/av_prop_playbackrate.asp
			//rate = 1.0;
		}

		return rate;
	};

	Howl.prototype.setRate = function(rate){
		var self = this;
		var ids = self._getSoundIds();
		for (var j=0; j<ids.length; j++) {
			var sound = self._soundById(ids[j]);
			if (sound) {
				sound.setRate(rate);
			}
		}

		//update the config, so every next sound will be started with this rate
		self._rate = rate;

		return self;
	};

	Howl.prototype.restoreRate = function(){
		var self = this;
		var rate = 1.0;
		var ids = self._getSoundIds();
		for (var j=0; j<ids.length; j++) {
			var sound = self._soundById(ids[j]);
			if (sound) {
				sound.setRate(rate);
			}
		}
		//update the config, so every next sound will be started with this rate
		self._rate = rate;

		return self;
	};

	//global level
	HowlerGlobal.prototype.setRate = function(rate){
		var self = this || Howler;

		// Loop through and mute all HTML5 Audio nodes.
		for (var i=0; i<self._howls.length; i++) {
			// Get all of the sounds in this Howl group.
			self._howls[i].setRate(rate);
		}

		return self;
	};

	HowlerGlobal.prototype.restoreRate = function(){
		var self = this || Howler;

		// Loop through and mute all HTML5 Audio nodes.
		for (var i=0; i<self._howls.length; i++) {
			// Get all of the sounds in this Howl group.
			self._howls[i].restoreRate();
		}

		return self;
	};


})();
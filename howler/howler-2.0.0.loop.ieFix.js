(function() {

	'use strict';

	Sound.prototype._loadListener = function () {
		var self = this;
		var parent = self._parent;

		// Round up the duration to account for the lower precision in HTML5 Audio.
		// CHANGED: rounded to 1000 instead of 10.
		parent._duration = Math.ceil(self._node.duration * 1000) / 1000;

		// Setup a sprite if none is defined.
		if (Object.keys(parent._sprite).length === 0) {
			parent._sprite = {__default: [0, parent._duration * 1000]};
		}

		if (!parent._loaded) {
			parent._loaded = true;
			parent._emit('load');
		}

		if (parent._autoplay) {
			parent.play();
		}

		// Clear the event listener.
		self._node.removeEventListener('canplaythrough', self._loadFn, false);
	};

    Howl.prototype._lastPlayed = null;

	Howl.prototype.play = function (sprite, interval) {
		var self = this;
		var args = arguments;
		var id = null;

		if (typeof sprite === 'number') {
			id = sprite;
			sprite = null;
		} else if (typeof sprite === 'undefined' || sprite === null) {
			sprite = '__default';

			var num = 0;
			for (var i = 0; i < self._sounds.length; i++) {
				if (self._sounds[i]._paused && !self._sounds[i]._ended) {
					num++;
					id = self._sounds[i]._id;
				}
			}

			if (num === 1) sprite = null;
			else id = null;
		}

		// Get the selected node, or get one from the pool.
		var sound = id ? self._soundById(id) : self._inactiveSound();

		// If the sound doesn't exist, do nothing.
		if (!sound) return null;

		// Select the sprite definition.
		if (id && !sprite) sprite = sound._sprite || '__default';

        // CHANGED: play only once in every 20ms
        if (!self._lastPlayed) self._lastPlayed = {};
        var lastPlayed = self._lastPlayed[sprite] || 0;
        var now = Date.now();
		interval = interval || self._interval;
        if (now - self._lastPlayed[sprite] <= interval) return sound._id;
        self._lastPlayed[sprite] = now;


		// If we have no sprite and the sound hasn't loaded, we must wait
		// for the sound to load to get our audio's duration.
		if (!self._loaded && !self._sprite[sprite]) {
			self.once('load', function () {
				self.play(self._soundById(sound._id) ? sound._id : undefined);
			});
			return sound._id;
		}

		// Don't play the sound if an id was passed and it is already playing.
		if (id && !sound._paused) return sound._id;

		// Determine how long to play for and where to start playing.
		var seek = sound._seek > 0 ? sound._seek : self._sprite[sprite][0] / 1000;
		var duration = Math.max(((self._sprite[sprite][0] + self._sprite[sprite][1]) / 1000) - seek - 0.05, 0);

		// Create a timer to fire at the end of playback or the start of a new loop.
		var ended = function () {
			// Should this sound loop?
			var loop = !!(sound._loop || self._sprite[sprite][2]);

			// Fire the ended event.
			self._emit('end', sound._id);

			// Restart the playback for HTML5 Audio loop.
			if (!self._webAudio && loop) {
				// CHANGED: removed the original stop from the loop and adding normal seek just before the end.
				sound._seek = sound._start || 0;
				sound._paused = true;
				sound._ended = true;

				// CHANGED: Not sure if this is needed but we can still add it.
				self._clearTimer(sound._id);

				// CHANGED: Now we just have to seek to 0 - 0.01
				if (sound._node) {
					sound._seek = 0.01;

					var playing = self.playing(id);
					self.play(sound._id);
				}
			}

			// Restart this timer if on a Web Audio loop.
			if (self._webAudio && loop) {
				self._emit('play', sound._id);
				sound._seek = sound._start || 0;
				sound._playStart = Howler.ctx.currentTime;
				self._endTimers[sound._id] = setTimeout(ended, ((sound._stop - sound._start) * 1000) / Math.abs(self._rate));
			}

			// Mark the node as paused.
			if (self._webAudio && !loop) {
				sound._paused = true;
				sound._ended = true;
				sound._seek = sound._start || 0;
				self._clearTimer(sound._id);

				// Clean up the buffer source.
				sound._node.bufferSource = null;
			}

			// When using a sprite, end the track.
			if (!self._webAudio && !loop) {
				self.stop(sound._id);
			}
		};
		self._endTimers[sound._id] = setTimeout(ended, (duration * 1000) / Math.abs(self._rate));

		// Update the parameters of the sound
		sound._paused = false;
		sound._ended = false;
		sound._sprite = sprite;
		sound._seek = seek;
		sound._start = self._sprite[sprite][0] / 1000;
		sound._stop = (self._sprite[sprite][0] + self._sprite[sprite][1]) / 1000;
		sound._loop = !!(sound._loop || self._sprite[sprite][2]);

		// Begin the actual playback.
		var node = sound._node;
		if (self._webAudio) {
			// Fire this when the sound is ready to play to begin Web Audio playback.
			var playWebAudio = function () {
				self._refreshBuffer(sound);

				// Setup the playback params.
				var vol = (sound._muted || self._muted) ? 0 : sound._volume * Howler.volume();
				node.gain.setValueAtTime(vol, Howler.ctx.currentTime);
				sound._playStart = Howler.ctx.currentTime;

				// Play the sound using the supported method.
				if (typeof node.bufferSource.start === 'undefined') {
					sound._loop ? node.bufferSource.noteGrainOn(0, seek, 86400) : node.bufferSource.noteGrainOn(0, seek, duration);
				} else {
					sound._loop ? node.bufferSource.start(0, seek, 86400) : node.bufferSource.start(0, seek, duration);
				}

				// Start a new timer if none is present.
				if (!self._endTimers[sound._id]) {
					self._endTimers[sound._id] = setTimeout(ended, (duration * 1000) / Math.abs(self._rate));
				}

				if (!args[1]) {
					setTimeout(function () {
						self._emit('play', sound._id);
					}, 0);
				}
			};

			if (self._loaded) {
				playWebAudio();
			} else {
				// Wait for the audio to load and then begin playback.
				self.once('load', playWebAudio);

				// Cancel the end timer.
				self._clearTimer(sound._id);
			}
		} else {
			// Fire this when the sound is ready to play to begin HTML5 Audio playback.
			var playHtml5 = function () {
				node.currentTime = seek;
				node.muted = sound._muted || self._muted || Howler._muted || node.muted;
				node.volume = sound._volume * Howler.volume();
				node.playbackRate = self._rate;
				setTimeout(function () {
					node.play();
					if (!args[1]) {
						self._emit('play', sound._id);
					}
				}, 0);
			};

			// Play immediately if ready, or wait for the 'canplaythrough'e vent.
			if (node.readyState === 4 || !node.readyState && navigator.isCocoonJS) {
				playHtml5();
			} else {
				var listener = function () {
					// Setup the new end timer.
					self._endTimers[sound._id] = setTimeout(ended, (duration * 1000) / Math.abs(self._rate));

					// Begin playback.
					playHtml5();

					// Clear this listener.
					node.removeEventListener('canplaythrough', listener, false);
				};
				node.addEventListener('canplaythrough', listener, false);

				// Cancel the end timer.
				self._clearTimer(sound._id);
			}
		}

		return sound._id;
	};


	// Support interval
	Howl.prototype.init = (function(_super) {
		return function(o) {
			this._interval = o.interval || 0;
			return _super.apply(this, arguments);
		};
	})(Howl.prototype.init);


})();
const Config = {
  effects: {
    Chorus: {
      defaults: {
        rate: 1.5, // 0.01 to 8+
        feedback: 0.2, // 0 to 1+
        delay: 0.0045, // 0 to 1
        bypass: 0
      },
      inputs: {
        rate: { type: 'range', min: 0.01, max: 8, step: 0.01, value: 0.2 },
        feedback: { type: 'range', min: 0, max: 1, step: 0.1, value: 0.2 },
        delay: { type: 'range', min: 0, max: 1, step: 0.01, value: 0.0045 }
      }
    },

    Filter: {
      defaults: {
        frequency: 440, // 20 to 22050
        Q: 1, // 0.001 to 100
        gain: 0, // -40 to 40 (in decibels)
        filterType: 'lowpass', // lowpass, highpass, bandpass, lowshelf, highshelf, peaking, notch, allpass
        bypass: 0
      },
      inputs: {
        frequency: { type: 'range', min: 20, max: 22050, step: 10, value: 440 },
        Q: { type: 'range', min: 0.001, max: 100, step: 0.01, value: 1 },
        gain: { type: 'range', min: -40, max: 40, step: 1, value: 0 },
        filterType: { type: 'radio', label: 'filter type', values: ['lowpass', 'highpass', 'bandpass', 'lowshelf', 'highshelf', 'peaking', 'notch', 'allpass']}
      }
    },

    Delay: {
      defaults: {
        feedback: 0.45, // 0 to 1+
        delayTime: 150, // 1 to 10000 milliseconds
        wetLevel: 0.25, // 0 to 1+
        dryLevel: 1, // 0 to 1+
        cutoff: 2000, // cutoff frequency of the built in lowpass-filter. 20 to 22050
      },
      inputs: {
        feedback: { type: 'range', min: 0, max: 1, step: 0.01, value: 0.45 },
        delayTime: { type: 'range', min: 1, max: 10000, step: 10, value: 150 },
        wetLevel: { type: 'range', min: 0, max: 1, step: 0.01, value: 0.25 },
        dryLevel: { type: 'range', min: 0, max: 1, step: 0.01, value: 1},
        cutoff: { type: 'range', min: 20, max: 22050, step: 10, value: 2000}
      }
    }

  }
};

export default Config;

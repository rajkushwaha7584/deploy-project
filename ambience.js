(() => {
  const soundButton = document.querySelector('.sound-toggle');
  const soundState = soundButton?.querySelector('.sound-state');
  const voiceButton = document.querySelector('.voice-toggle');
  const voiceStatus = document.querySelector('.voice-status');
  let audioContext;
  let waterGain;
  let sourceNodes = [];
  let closingTimer;

  function makeWaterfall() {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) throw new Error('Web Audio is not supported in this browser.');
    audioContext = new Context();
    const size = audioContext.sampleRate * 3;
    const buffer = audioContext.createBuffer(1, size, audioContext.sampleRate);
    const channel = buffer.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < size; i++) {
      const white = Math.random() * 2 - 1;
      brown = (brown + 0.025 * white) / 1.025;
      channel[i] = brown * 3.2;
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const rumbleFilter = audioContext.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.value = 850;
    const rumbleGain = audioContext.createGain();
    rumbleGain.gain.value = 0.065;
    source.connect(rumbleFilter).connect(rumbleGain).connect(audioContext.destination);
    source.start();
    sourceNodes.push(source);

    const sparkleSource = audioContext.createBufferSource();
    sparkleSource.buffer = buffer;
    sparkleSource.loop = true;
    const sparkleFilter = audioContext.createBiquadFilter();
    sparkleFilter.type = 'bandpass';
    sparkleFilter.frequency.value = 1750;
    sparkleFilter.Q.value = 0.55;
    waterGain = audioContext.createGain();
    waterGain.gain.value = 0.013;
    sparkleSource.connect(sparkleFilter).connect(waterGain).connect(audioContext.destination);
    sparkleSource.start();
    sourceNodes.push(sparkleSource);

    const lfo = audioContext.createOscillator();
    const lfoAmount = audioContext.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.12;
    lfoAmount.gain.value = 0.009;
    lfo.connect(lfoAmount).connect(rumbleGain.gain);
    lfo.start();
    sourceNodes.push(lfo);
    return audioContext.resume();
  }

  function stopWaterfall() {
    if (!audioContext) return;
    const closingContext = audioContext;
    sourceNodes.forEach(node => { try { node.stop(); } catch { /* Already stopped. */ } });
    sourceNodes = [];
    audioContext = null;
    waterGain = null;
    clearTimeout(closingTimer);
    closingTimer = setTimeout(() => closingContext.close().catch(() => {}), 80);
  }

  soundButton?.addEventListener('click', async () => {
    const enabled = soundButton.getAttribute('aria-pressed') === 'true';
    if (enabled) {
      stopWaterfall();
      soundButton.setAttribute('aria-pressed', 'false');
      soundButton.setAttribute('aria-label', 'Turn on gentle water ambience');
      soundState.textContent = 'Off';
      return;
    }
    try {
      clearTimeout(closingTimer);
      await makeWaterfall();
      soundButton.setAttribute('aria-pressed', 'true');
      soundButton.setAttribute('aria-label', 'Turn off gentle water ambience');
      soundState.textContent = 'On';
    } catch (error) {
      stopWaterfall();
      soundState.textContent = 'Unavailable';
      soundButton.setAttribute('aria-label', 'Water ambience is unavailable in this browser');
      console.info('Water ambience could not start.', error);
    }
  });

  voiceButton?.addEventListener('click', () => {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      voiceStatus.textContent = 'Your browser does not support spoken audio. जल ही जीवन है।';
      return;
    }
    window.speechSynthesis.cancel();
    const line = new SpeechSynthesisUtterance('जल ही जीवन है।');
    line.lang = 'hi-IN';
    line.rate = 0.82;
    line.pitch = 1;
    line.onstart = () => { voiceStatus.textContent = 'जल ही जीवन है…'; };
    line.onend = () => { voiceStatus.textContent = ''; };
    line.onerror = () => { voiceStatus.textContent = 'जल ही जीवन है।'; };
    voiceStatus.textContent = 'Playing Hindi voice…';
    window.speechSynthesis.speak(line);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && audioContext?.state === 'running') audioContext.suspend();
    else if (!document.hidden && audioContext?.state === 'suspended' && soundButton?.getAttribute('aria-pressed') === 'true') audioContext.resume();
  });
})();

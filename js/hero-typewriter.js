// Hero typewriter effect
(function initTypewriter() {
  const el = document.getElementById('hero-tagline');
  if (!el) return;

  const phrases = [
    '别当哥的小迷弟，哥只是个传说',
    '游戏我只玩第五人格'
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let isPaused = false;

  function type() {
    const current = phrases[phraseIndex];

    if (isPaused) {
      isPaused = false;
      isDeleting = true;
      setTimeout(type, 800);
      return;
    }

    if (isDeleting) {
      el.textContent = current.substring(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(type, 200);
        return;
      }
      setTimeout(type, 40);
    } else {
      el.textContent = current.substring(0, charIndex + 1);
      charIndex++;

      if (charIndex === current.length) {
        isPaused = true;
        setTimeout(type, 2000);
        return;
      }
      setTimeout(type, 60);
    }
  }

  // Add cursor blink element
  const cursor = document.createElement('span');
  cursor.className = 'cursor-blink';
  cursor.textContent = '|';
  el.appendChild(cursor);

  // Start typing after a brief delay
  setTimeout(type, 800);
})();

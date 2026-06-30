// About year tab switching
(function initAboutTabs() {
  const tabs = document.querySelectorAll('.year-tab');
  const panels = document.querySelectorAll('.year-panel');

  if (!tabs.length || !panels.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const year = tab.dataset.year;

      // Update tab states
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update panel states
      panels.forEach(p => {
        p.classList.remove('active');
        if (p.dataset.year === year) {
          p.classList.add('active');
        }
      });
    });
  });
})();

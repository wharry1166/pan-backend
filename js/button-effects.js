// Magnetic button effect
(function initMagneticButtons() {
  const magnets = document.querySelectorAll('.btn-magnetic');

  magnets.forEach(btn => {
    const btnInner = btn.querySelector('.btn-primary');
    if (!btnInner) return;

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      btnInner.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btnInner.style.transform = 'translate(0, 0)';
    });
  });
})();

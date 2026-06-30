// Shared components: nav and footer injection
document.addEventListener('DOMContentLoaded', () => {

  // Nav component
  const navSlot = document.getElementById('nav-slot');
  if (navSlot) {
    navSlot.innerHTML = `
      <nav class="nav" id="navbar">
        <div class="nav-logo">潘元川</div>
        <ul class="nav-links">
          <li><a href="#hero">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
          <li><a href="/admin/dashboard.html" style="font-size:0.8rem;opacity:0.5;">管理</a></li>
        </ul>
      </nav>
    `;
  }

  // Footer component
  const footerSlot = document.getElementById('footer-slot');
  if (footerSlot) {
    footerSlot.innerHTML = `
      <footer class="footer">
        <p class="footer-text">&copy; ${new Date().getFullYear()} — 潘元川</p>
      </footer>
    `;
  }

  // Contact card click -> navigate
  document.querySelectorAll('.contact-card[data-href]').forEach(card => {
    card.addEventListener('click', () => {
      window.location.href = card.dataset.href;
    });
  });
});

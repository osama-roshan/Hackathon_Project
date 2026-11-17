/**
 * js/login.js — Login page logic
 * Handles form submit, demo email click-to-fill, and post-login redirect.
 */

(function () {
  'use strict';

  const form      = document.getElementById('loginForm');
  const emailEl   = document.getElementById('email');
  const passEl    = document.getElementById('password');
  const loginBtn  = document.getElementById('loginBtn');
  const bannerEl  = document.getElementById('loginBanner');

  /* If already logged in, redirect to the right page */
  (function checkAlreadyLoggedIn() {
    try {
      const user = JSON.parse(sessionStorage.getItem('nw_user') || 'null');
      if (user) {
        window.location.href = user.role === 'AGENT' ? 'my-tasks.html' : 'dashboard.html';
      }
    } catch (e) { /* ignore */ }
  })();

  /* ---- Demo email click-to-fill ---- */
  document.querySelectorAll('.demo-email').forEach(el => {
    el.addEventListener('click', () => {
      emailEl.value = el.dataset.email;
      passEl.value  = 'Demo123!';
      emailEl.focus();
      hideBanner(bannerEl);
    });
  });

  /* ---- Form submit ---- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideBanner(bannerEl);

    const email    = emailEl.value.trim();
    const password = passEl.value;

    if (!email || !password) {
      showBanner(bannerEl, 'error', 'Please enter your email and password.');
      return;
    }

    /* Disable button to prevent double-click */
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in…';

    try {
      const { user } = await login(email, password);
      /* Redirect based on role — fade transition handled by navigateTo */
      navigateTo(user.role === 'AGENT' ? 'my-tasks.html' : 'dashboard.html');
    } catch (err) {
      showBanner(bannerEl, 'error', err.message || 'Login failed. Please try again.');
      loginBtn.disabled = false;
      loginBtn.textContent = 'Login';
      passEl.value = '';
      passEl.focus();
    }
  });

})();

/**
 * BHODT AI - Client Authentication Service
 * Manages JWT tokens, session checks, and protected routes
 */

window.BhodtAuth = (function () {
  const TOKEN_KEY = 'bhodt_auth_token';
  const USER_KEY = 'bhodt_auth_user';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  function getUser() {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function setUser(user) {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }

  async function checkAuth(redirectIfUnauth = false) {
    const token = getToken();
    if (!token) {
      if (redirectIfUnauth) {
        window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
      return null;
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Session invalid');
      }

      const data = await response.json();
      setUser(data.user);
      return data.user;
    } catch (err) {
      setToken(null);
      setUser(null);
      if (redirectIfUnauth) {
        window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
      return null;
    }
  }

  async function checkAdmin(redirectIfNotAdmin = true) {
    const user = await checkAuth(true);
    if (!user || user.role !== 'admin') {
      if (redirectIfNotAdmin) {
        alert('Access denied. Administrator privileges required.');
        window.location.href = '/dashboard.html';
      }
      return false;
    }
    return true;
  }

  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}

    setToken(null);
    setUser(null);
    window.location.href = '/login.html';
  }

  return {
    getToken,
    setToken,
    getUser,
    setUser,
    checkAuth,
    checkAdmin,
    logout,
  };
})();

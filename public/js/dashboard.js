/**
 * BHODT AI - Dashboard Client Script
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Enforce authentication guard
  const user = await window.BhodtAuth.checkAuth(true);
  if (!user) return;

  // Render user info in Topbar & Welcome banner
  const nameEl = document.getElementById('dash-user-name');
  const roleEl = document.getElementById('dash-user-role');
  const emailEl = document.getElementById('dash-user-email');
  const avatarEl = document.getElementById('dash-user-avatar');
  const welcomeEl = document.getElementById('dash-welcome-text');

  if (nameEl) nameEl.textContent = user.full_name;
  if (emailEl) emailEl.textContent = user.email;
  if (welcomeEl) welcomeEl.textContent = `Welcome back, ${user.full_name}!`;
  if (roleEl) {
    roleEl.textContent = user.role.toUpperCase();
    roleEl.className = `badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`;
  }
  if (avatarEl) {
    avatarEl.textContent = user.full_name.charAt(0).toUpperCase();
  }

  // If user is admin, show Admin Portal link in sidebar
  const adminLink = document.getElementById('nav-admin-link');
  if (adminLink && user.role === 'admin') {
    adminLink.style.display = 'flex';
  }

  // Setup Logout button
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Are you sure you want to log out?')) {
        window.BhodtAuth.logout();
      }
    });
  }

  // Load Dashboard Data
  loadConversations();
  loadFavorites();
  loadNotifications();
});

async function loadConversations() {
  const container = document.getElementById('conversations-container');
  const countEl = document.getElementById('stat-conversations-count');
  if (!container) return;

  const token = window.BhodtAuth.getToken();
  try {
    const res = await fetch('/api/user/conversations', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const convs = data.conversations || [];

    if (countEl) countEl.textContent = convs.length;

    if (convs.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:32px;color:#94a3b8;font-size:13px;">
          <p>No previous conversations found.</p>
          <a href="/#marketplace-section" style="display:inline-block;margin-top:12px;color:#00E5FF;font-weight:600;text-decoration:none;">
            Chat with BHODT AI →
          </a>
        </div>
      `;
      return;
    }

    container.innerHTML = convs
      .slice(0, 5)
      .map(
        (c) => `
        <div class="conv-item" onclick="openConversation(${c.id})">
          <div>
            <div class="conv-title">${escapeHtml(c.title)}</div>
            <div class="conv-meta">${new Date(c.updated_at).toLocaleDateString()} · ${new Date(c.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
          <button onclick="event.stopPropagation(); deleteConversation(${c.id})" title="Delete conversation" style="background:none;border:none;color:#ff8099;cursor:pointer;padding:6px;">
            ✕
          </button>
        </div>
      `
      )
      .join('');
  } catch (err) {
    container.innerHTML = '<p style="color:#ff8099;font-size:13px;">Failed to load conversations.</p>';
  }
}

async function deleteConversation(id) {
  if (!confirm('Are you sure you want to delete this conversation?')) return;
  const token = window.BhodtAuth.getToken();
  try {
    await fetch(`/api/user/conversations/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    loadConversations();
  } catch (err) {
    alert('Failed to delete conversation');
  }
}

function openConversation(id) {
  window.location.href = `/?convId=${id}`;
}

async function loadFavorites() {
  const container = document.getElementById('favorites-container');
  const countEl = document.getElementById('stat-favorites-count');
  if (!container) return;

  const token = window.BhodtAuth.getToken();
  try {
    const res = await fetch('/api/user/favorites', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const favs = data.favorites || [];

    if (countEl) countEl.textContent = favs.length;

    if (favs.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:24px;color:#94a3b8;font-size:13px;">
          <p>No favorite tools saved yet.</p>
          <a href="/#marketplace-section" style="display:inline-block;margin-top:8px;color:#00FF66;font-weight:600;text-decoration:none;">
            Explore Tools →
          </a>
        </div>
      `;
      return;
    }

    container.innerHTML = favs
      .map(
        (p) => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.06);margin-bottom:8px;">
          <div>
            <div style="font-weight:700;font-size:13px;color:#fff;">${escapeHtml(p.name)}</div>
            <div style="font-size:11px;color:#00E5FF;font-family:'JetBrains Mono';">${p.price} LKR · ${p.category}</div>
          </div>
          <a href="https://t.me/blackhatmrx" target="_blank" style="padding:6px 12px;background:#00FF66;color:#000;font-weight:bold;font-size:11px;border-radius:8px;text-decoration:none;">
            BUY
          </a>
        </div>
      `
      )
      .join('');
  } catch (err) {
    container.innerHTML = '<p style="color:#ff8099;font-size:13px;">Failed to load favorites.</p>';
  }
}

async function loadNotifications() {
  const container = document.getElementById('notifications-container');
  if (!container) return;

  const token = window.BhodtAuth.getToken();
  try {
    const res = await fetch('/api/user/notifications', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const notifs = data.notifications || [];

    if (notifs.length === 0) {
      container.innerHTML = '<p style="color:#94a3b8;font-size:13px;text-align:center;padding:16px;">No new notifications.</p>';
      return;
    }

    container.innerHTML = notifs
      .slice(0, 4)
      .map(
        (n) => `
        <div style="padding:12px;border-radius:10px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);margin-bottom:8px;">
          <div style="font-weight:700;font-size:13px;color:#00E5FF;margin-bottom:2px;">${escapeHtml(n.title)}</div>
          <div style="font-size:12px;color:#cbd5e1;line-height:1.4;">${escapeHtml(n.message)}</div>
          <div style="font-size:10px;color:#64748b;margin-top:4px;">${new Date(n.created_at).toLocaleDateString()}</div>
        </div>
      `
      )
      .join('');
  } catch (err) {}
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, (tag) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

/**
 * BHODT Marketplace Main Application Logic
 * Pure Vanilla JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // State
  let currentCategory = 'ALL';
  let searchQuery = '';
  let sortOption = 'NEWEST';
  let activeModalTool = null;

  // DOM Elements
  const toolsContainer = document.getElementById('tools-container');
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  const categoryButtons = document.querySelectorAll('.category-filter-btn');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const modal = document.getElementById('product-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  // Theme Handling
  const savedTheme = localStorage.getItem('bhodt_theme') || 'dark';
  applyTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isDark = document.body.classList.contains('dark-theme');
      const nextTheme = isDark ? 'light' : 'dark';
      applyTheme(nextTheme);
    });
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      localStorage.setItem('bhodt_theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      localStorage.setItem('bhodt_theme', 'dark');
    }
  }

  // Filter Helper
  function matchCategory(catName, filterKey) {
    if (filterKey === 'ALL') return true;
    switch (filterKey) {
      case 'WEB': return catName === 'Web Tools';
      case 'DEVELOPER': return catName === 'Developer Tools';
      case 'AI': return catName === 'AI Tools';
      case 'SECURITY': return catName === 'Security Tools';
      case 'PRODUCTIVITY': return catName === 'Productivity';
      case 'EDUCATION': return catName === 'Educational Tools';
      case 'UTILITY': return catName === 'Utility Tools';
      default: return true;
    }
  }

  // Render Product Cards
  function renderProducts() {
    if (!toolsContainer || typeof products === 'undefined') return;

    let filtered = products.filter(tool => {
      const matchCat = matchCategory(tool.category, currentCategory);
      if (!matchCat) return false;

      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.version.toLowerCase().includes(q) ||
        tool.platform.toLowerCase().includes(q)
      );
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'PRICE_LOW_HIGH': return a.price - b.price;
        case 'PRICE_HIGH_LOW': return b.price - a.price;
        case 'NAME_A_Z': return a.name.localeCompare(b.name);
        case 'NEWEST':
        default:
          return (b.lastUpdated || '').localeCompare(a.lastUpdated || '');
      }
    });

    if (filtered.length === 0) {
      toolsContainer.innerHTML = `
        <div class="empty-state">
          <h3>No tools found</h3>
          <p>No tools matched your search or category selection. Try resetting filters.</p>
          <button id="reset-filters-btn" class="btn btn-primary">Reset Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById('reset-filters-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          searchQuery = '';
          if (searchInput) searchInput.value = '';
          currentCategory = 'ALL';
          updateActiveCategoryTab();
          renderProducts();
        });
      }
      return;
    }

    toolsContainer.innerHTML = filtered.map(tool => {
      const isAvailable = tool.status === 'AVAILABLE' || tool.status === 'UPDATING';
      const statusClass = `status-${tool.status.toLowerCase().replace(/\s+/g, '-')}`;

      return `
        <article class="tool-card" data-id="${tool.id}">
          <div class="card-media">
            <img src="${tool.image}" alt="${tool.name}" loading="lazy" onerror="this.src='https://placehold.co/600x450/111111/00FF66?text=BHODT+TOOL'">
            <div class="card-media-overlay"></div>
            <div class="card-badges">
              <span class="status-indicator ${statusClass}">${tool.status}</span>
              ${tool.isDemo ? '<span class="demo-tag">DEMO</span>' : ''}
            </div>
            <div class="card-media-footer">
              <span>${tool.platform}</span>
              <span>v${tool.version}</span>
            </div>
          </div>
          <div class="card-body">
            <span class="card-category">${tool.category}</span>
            <h3 class="card-title">${tool.name}</h3>
            <p class="card-desc">${tool.description}</p>
            <div class="card-meta">
              <span>${tool.category}</span> · 
              <span>v${tool.version}</span> · 
              <span>${tool.platform}</span>
            </div>
          </div>
          <div class="card-footer">
            <div class="card-price-row">
              <span class="price-label">PRICE</span>
              <span class="price-value">${formatLKRPrice(tool.price)}</span>
            </div>
            <div class="card-actions">
              <button class="btn btn-outline view-details-btn" data-id="${tool.id}">VIEW DETAILS</button>
              ${
                isAvailable
                  ? `<button class="btn btn-primary buy-now-btn" data-id="${tool.id}">BUY NOW</button>`
                  : `<button class="btn btn-disabled" disabled>NOT AVAILABLE</button>`
              }
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach Event Listeners to cards
    document.querySelectorAll('.view-details-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const tool = products.find(p => p.id === id);
        if (tool) openModal(tool);
      });
    });

    document.querySelectorAll('.buy-now-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const tool = products.find(p => p.id === id);
        if (tool) buyTool(tool);
      });
    });
  }

  // Category Filter Events
  categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.getAttribute('data-category');
      updateActiveCategoryTab();
      renderProducts();
    });
  });

  function updateActiveCategoryTab() {
    categoryButtons.forEach(btn => {
      if (btn.getAttribute('data-category') === currentCategory) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Search Input Event
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderProducts();
    });
  }

  // Sort Select Event
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sortOption = e.target.value;
      renderProducts();
    });
  }

  // Modal Open / Close
  function openModal(tool) {
    activeModalTool = tool;
    if (!modal) return;

    document.getElementById('modal-img').src = tool.image;
    document.getElementById('modal-title').textContent = tool.name;
    document.getElementById('modal-desc').textContent = tool.description;
    document.getElementById('modal-category').textContent = tool.category;
    document.getElementById('modal-price').textContent = formatLKRPrice(tool.price);
    document.getElementById('modal-version').textContent = tool.version;
    document.getElementById('modal-platform').textContent = tool.platform;
    document.getElementById('modal-filetype').textContent = tool.fileType;
    document.getElementById('modal-reqs').textContent = tool.requirements;
    document.getElementById('modal-license').textContent = tool.license;
    document.getElementById('modal-updated').textContent = tool.lastUpdated;
    document.getElementById('modal-support').textContent = tool.supportInfo;

    const statusEl = document.getElementById('modal-status');
    statusEl.textContent = tool.status;
    statusEl.className = `status-indicator status-${tool.status.toLowerCase().replace(/\s+/g, '-')}`;

    // Features
    const featuresList = document.getElementById('modal-features');
    featuresList.innerHTML = (tool.features || []).map(f => `<li>✓ ${f}</li>`).join('');

    // Buy Button
    const modalBuyBtn = document.getElementById('modal-buy-btn');
    if (tool.status === 'AVAILABLE' || tool.status === 'UPDATING') {
      modalBuyBtn.disabled = false;
      modalBuyBtn.textContent = 'BUY NOW VIA TELEGRAM';
      modalBuyBtn.className = 'btn btn-primary btn-block';
      modalBuyBtn.onclick = () => buyTool(tool);
    } else {
      modalBuyBtn.disabled = true;
      modalBuyBtn.textContent = `NOT AVAILABLE (${tool.status})`;
      modalBuyBtn.className = 'btn btn-disabled btn-block';
      modalBuyBtn.onclick = null;
    }

    // Pre-filled message preview
    const previewEl = document.getElementById('modal-message-preview');
    if (previewEl) {
      previewEl.textContent = generatePurchaseMessage(tool);
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = 'unset';
    activeModalTool = null;
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
      closeModal();
    }
  });

  // Copy Message Helper
  const copyBtn = document.getElementById('copy-msg-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (!activeModalTool) return;
      const msg = generatePurchaseMessage(activeModalTool);
      navigator.clipboard.writeText(msg).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
      });
    });
  }

  // Initial render
  renderProducts();
});

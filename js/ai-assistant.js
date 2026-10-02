/**
 * BHODT AI - Standalone Assistant Logic
 * Dynamically queries window.BHODT_PRODUCTS or /api/products
 */

window.BhodtAI = (function () {
  let isOpen = false;
  let language = 'en';

  function getProducts() {
    return window.BHODT_PRODUCTS || [];
  }

  function init() {
    // Check if container already exists
    if (document.getElementById('bhodt-ai-container')) return;

    const container = document.createElement('div');
    container.id = 'bhodt-ai-container';
    container.innerHTML = `
      <div id="bhodt-ai-fab" class="bhodt-ai-fab">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#00FF66;box-shadow:0 0 6px #00FF66;"></span>
        <div style="display:flex;flex-direction:column;line-height:1;">
          <strong style="font-size:12px;letter-spacing:1px;color:#00FF66;">BHODT AI</strong>
          <span style="font-size:9px;color:#aaa;letter-spacing:1px;">24/7 ASSISTANT</span>
        </div>
      </div>

      <div id="bhodt-ai-window" class="bhodt-ai-window" style="display:none;">
        <div class="bhodt-ai-header">
          <div style="display:flex;align-items:center;gap:8px;">
            <strong style="color:#00FF66;font-size:14px;">BHODT AI</strong>
            <span style="font-size:9px;background:rgba(0,255,102,0.15);color:#00FF66;padding:2px 6px;border-radius:4px;border:1px solid rgba(0,255,102,0.3);">● ONLINE</span>
          </div>
          <button id="bhodt-ai-close" style="background:none;border:none;color:#aaa;cursor:pointer;font-size:16px;">✕</button>
        </div>
        <div id="bhodt-ai-messages" class="bhodt-ai-messages">
          <div class="bhodt-ai-msg ai">
            Hello! I'm BHODT AI, your 24/7 digital assistant. I can help you explore our digital tools, check prices, features and guide you through purchasing directly on Telegram @blackhatmrx.
          </div>
        </div>
        <div class="bhodt-ai-footer">
          <form id="bhodt-ai-form" class="bhodt-ai-input-wrap">
            <input id="bhodt-ai-input" class="bhodt-ai-input" placeholder="Ask BHODT AI anything..." />
            <button type="submit" class="bhodt-ai-btn">Send</button>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(container);

    const fab = document.getElementById('bhodt-ai-fab');
    const win = document.getElementById('bhodt-ai-window');
    const closeBtn = document.getElementById('bhodt-ai-close');
    const form = document.getElementById('bhodt-ai-form');
    const input = document.getElementById('bhodt-ai-input');
    const messages = document.getElementById('bhodt-ai-messages');

    fab.addEventListener('click', () => {
      isOpen = true;
      fab.style.display = 'none';
      win.style.display = 'flex';
      input.focus();
    });

    closeBtn.addEventListener('click', () => {
      isOpen = false;
      win.style.display = 'none';
      fab.style.display = 'flex';
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;

      // Add user message
      const userDiv = document.createElement('div');
      userDiv.className = 'bhodt-ai-msg user';
      userDiv.textContent = text;
      messages.appendChild(userDiv);
      input.value = '';

      // Answering logic using dynamic product knowledge
      setTimeout(() => {
        const reply = answerQuery(text);
        const aiDiv = document.createElement('div');
        aiDiv.className = 'bhodt-ai-msg ai';
        aiDiv.innerHTML = reply;
        messages.appendChild(aiDiv);
        messages.scrollTop = messages.scrollHeight;
      }, 300);

      messages.scrollTop = messages.scrollHeight;
    });
  }

  function answerQuery(text) {
    const q = text.toLowerCase();
    const products = getProducts();

    if (q.includes('what tools') || q.includes('list')) {
      const list = products.map(p => `• <strong>${p.name}</strong> (${p.price} LKR)`).join('<br>');
      return `Here are the currently available BHODT tools:<br><br>${list}`;
    }

    const matched = products.find(p => q.includes(p.name.toLowerCase()) || q.includes(p.id));
    if (matched) {
      if (q.includes('buy') || q.includes('order')) {
        return `To purchase <strong>${matched.name}</strong> (${matched.price} LKR), contact BHODT directly on Telegram @blackhatmrx.`;
      }
      return `<strong>${matched.name}</strong><br>Price: ${matched.price} LKR<br>Status: ${matched.status}<br>Platform: ${matched.platform}<br><br>${matched.description}`;
    }

    if (q.includes('price')) {
      const list = products.map(p => `• ${p.name}: ${p.price} LKR`).join('<br>');
      return `Current prices in Sri Lankan Rupees (LKR):<br><br>${list}`;
    }

    return "I'm BHODT AI. Ask me about any specific tool name, price in LKR, or how to order via Telegram @blackhatmrx.";
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
  window.BhodtAI.init();
});

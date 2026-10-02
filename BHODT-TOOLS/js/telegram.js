/**
 * BHODT Telegram Purchase & Contact Engine
 * Destination: @blackhatmrx
 */

const TELEGRAM_USERNAME = 'blackhatmrx';
const TELEGRAM_BASE_URL = `https://t.me/${TELEGRAM_USERNAME}`;

/**
 * Format numeric price to LKR currency string
 */
function formatLKRPrice(price) {
  return `LKR ${Number(price).toLocaleString('en-US')}`;
}

/**
 * Generate standardized purchase message for Telegram
 */
function generatePurchaseMessage(tool) {
  const priceDisplay = formatLKRPrice(tool.price);
  return `Hello BHODT,

I am interested in purchasing:

Tool Name: ${tool.name}
Version: ${tool.version}
Category: ${tool.category}
Platform: ${tool.platform}
Price: ${priceDisplay}

Please send me the purchase, payment and delivery details.

Thank you.`;
}

/**
 * Build official Telegram deep link for tool purchase
 */
function getTelegramPurchaseLink(tool) {
  const message = generatePurchaseMessage(tool);
  const encoded = encodeURIComponent(message);
  return `https://t.me/${TELEGRAM_USERNAME}?text=${encoded}`;
}

/**
 * buyTool(tool) - Main handler invoked by BUY NOW button
 */
function buyTool(tool) {
  if (!tool) return;
  if (tool.status === 'COMING SOON' || tool.status === 'SOLD OUT') {
    alert(`This product is currently ${tool.status}. Please check back later or contact @${TELEGRAM_USERNAME} for updates.`);
    return;
  }
  const url = getTelegramPurchaseLink(tool);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * General contact link to @blackhatmrx
 */
function contactBHODT(topic = '') {
  if (!topic) {
    window.open(TELEGRAM_BASE_URL, '_blank', 'noopener,noreferrer');
    return;
  }
  const text = encodeURIComponent(`Hello BHODT,\n\nI am contacting you regarding: ${topic}`);
  window.open(`https://t.me/${TELEGRAM_USERNAME}?text=${text}`, '_blank', 'noopener,noreferrer');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TELEGRAM_USERNAME,
    TELEGRAM_BASE_URL,
    formatLKRPrice,
    generatePurchaseMessage,
    getTelegramPurchaseLink,
    buyTool,
    contactBHODT
  };
}

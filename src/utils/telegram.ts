import { Product } from '../types/product';

export const TELEGRAM_USERNAME = 'blackhatmrx';
export const TELEGRAM_BASE_URL = `https://t.me/${TELEGRAM_USERNAME}`;
export const WHATSAPP_NUMBER = '0724332896';
export const WHATSAPP_BASE_URL = 'https://wa.me/94724332896';

/**
 * Formats a numeric price into standard Sri Lankan Rupees representation (e.g. LKR 2,500).
 */
export function formatPrice(price: number): string {
  return `LKR ${price.toLocaleString('en-US')}`;
}

/**
 * Generates the standardized purchase message for BHODT tools.
 */
export function generatePurchaseMessage(product: Product): string {
  return `Hello BHODT,

I would like to purchase:

Tool: ${product.name}
Version: ${product.version}
Price: ${formatPrice(product.price)}
Category: ${product.category}

Please provide the purchase and delivery details.

Thank you.`;
}

/**
 * Builds the deep link to Telegram with the pre-filled purchase message.
 */
export function getBuyToolUrl(product: Product): string {
  const message = generatePurchaseMessage(product);
  const encodedText = encodeURIComponent(message);
  return `https://t.me/${TELEGRAM_USERNAME}?text=${encodedText}`;
}

/**
 * Builds the deep link to WhatsApp with the pre-filled purchase message.
 */
export function getBuyToolWhatsAppUrl(product: Product): string {
  const message = generatePurchaseMessage(product);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/94724332896?text=${encodedText}`;
}

/**
 * Automatically triggers the Telegram deep link to purchase the selected tool.
 */
export function buyTool(product: Product): void {
  const url = getBuyToolUrl(product);
  // In iframe environments, top navigation or standard link navigation is safest:
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Builds the general contact link to BHODT Telegram.
 */
export function getContactTelegramUrl(subject?: string): string {
  if (!subject) {
    return TELEGRAM_BASE_URL;
  }
  const text = encodeURIComponent(`Hello BHODT,\n\nI am contacting you regarding: ${subject}`);
  return `https://t.me/${TELEGRAM_USERNAME}?text=${text}`;
}

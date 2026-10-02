# BHODT - Digital Tools Marketplace

Official digital software and utilities marketplace for:
**BHODT (BLACK_HAR_OFFICIAL_DEVELOPING_TEAM)**

- **Official Telegram:** [@blackhatmrx](https://t.me/blackhatmrx)
- **Primary Team Colors:** 
  - Green (`#00FF66`)
  - Red (`#FF1744`)
  - Deep Black (`#0A0A0A` & `#111111`)
  - White (`#FFFFFF`) & Gray (`#B8B8B8`)

---

## 🚀 Overview

BHODT is a premium marketplace for digital products, developer utilities, web tools, educational simulators, and defensive security software.

### Key Highlights:
1. **Automated Telegram Buy Flow:** Clicking **BUY NOW** automatically prepares a formatted message pre-filled with the tool's name, version, category, platform, and price, directly opening `@blackhatmrx`.
2. **Real-time Live Filter & Search:** Filter by category (`ALL`, `WEB`, `DEVELOPER`, `AI`, `SECURITY`, `PRODUCTIVITY`, `EDUCATION`, `UTILITY`) and search live across titles, descriptions, and version tags.
3. **Transparent LKR Pricing:** All prices are specified in Sri Lankan Rupees (e.g. `LKR 2,500`) with no hidden charges.
4. **Dark & Light Modes:** Saved persistently in `localStorage`.
5. **Strict Legal & Defensive Compliance:** No illegal hacking tools, malware, or phishing kits. All security utilities are designed strictly for authorized testing, defense, and education.

---

## 📁 Project Structure

```
BHODT-TOOLS/
│
├── index.html          # Main storefront & marketplace
├── tool.html           # Dedicated product details view
├── about.html          # About BHODT team & standards
├── contact.html        # Official communications & Telegram portal
│
├── css/
│   ├── style.css       # Core styles, glassmorphism, themes
│   ├── responsive.css  # Breakpoints: 320px, 375px, 768px, 1024px, 1440px+
│   └── animations.css  # Ambient glow, smooth hover & transitions
│
├── js/
│   ├── main.js         # Search, category filters, sorting, modals
│   ├── products.js     # Editable product database
│   └── telegram.js     # buyTool() & deep-link generator
│
└── README.md
```

---

## 🛠️ How to Add or Edit Products

To add a new tool or change pricing, open `js/products.js` (or `src/data/products.ts` for the React application) and insert a new object:

```javascript
{
  id: "tool-011",
  name: "BHODT My New Tool",
  image: "assets/tools/tool-001.png",
  description: "Description of your tool.",
  category: "Developer Tools", // "Web Tools" | "Developer Tools" | "AI Tools" | "Security Tools" | "Productivity" | "Educational Tools" | "Utility Tools"
  version: "1.0.0",
  platform: "Windows / macOS",
  price: 2500, // Numeric value in LKR
  currency: "LKR",
  status: "AVAILABLE", // "AVAILABLE" | "COMING SOON" | "UPDATING" | "SOLD OUT"
  isDemo: false,
  features: [
    "Feature One",
    "Feature Two",
    "Feature Three"
  ],
  requirements: "Windows 10 or later",
  license: "Single User License",
  fileType: ".zip / .exe",
  lastUpdated: "2026-10-02",
  supportInfo: "Direct support via Telegram @blackhatmrx"
}
```

---

## 💬 Telegram Buy Now Message Format

When a customer clicks **BUY NOW**, the following formatted message is automatically constructed and sent to `@blackhatmrx`:

```
Hello BHODT,

I am interested in purchasing:

Tool Name: [NAME]
Version: [VERSION]
Category: [CATEGORY]
Platform: [PLATFORM]
Price: [PRICE]

Please send me the purchase, payment and delivery details.

Thank you.
```

---

## ⚖️ Legal & Ethical Declaration

All products listed are developed or distributed by BHODT for legitimate, ethical, and defensive applications. Cybersecurity utilities must only be utilized on networks and systems with explicit authorization.

# Agent Operating System (`agent_instructions.md`)

**Context for the AI Agent:** 
You are an advanced Next-Gen AI frontend developer, SEO specialist, and Elite Copywriter. 
This document serves as your **Master Operating System**.

---

## PART 1: CORE KNOWLEDGE & STANDARDS

### 1.1 Architecture & Tech Stack
- Static HTML5 files for GitHub Pages / Cloudflare Pages / Vercel
- Tailwind CSS via CDN
- Google Fonts (JetBrains Mono + Space Grotesk — hacker aesthetic)
- Vanilla JavaScript only

### 1.2 Design System
- Hacker / terminal aesthetic: dark bg (#080B0F), green accents (#00FF88)
- 8-point grid, CSS variables
- Micro-interactions: scan lines, noise overlay, glow effects, countdowns
- Corner box decorations, capacity bars, modals with paywall

### 1.3 SEO
- Every page: title, meta description, OG tags, canonical, robots, JSON-LD
- sitemap.xml + robots.txt + llms.txt maintained at root

---

## PART 2: PROJECT — KURI-DEV SPRINT PAGE

### Offer
- **Product**: One-Week AI Application Sprint
- **Price**: $5,000 USD flat
- **Scarcity**: 1 client per month
- **CTA flow**: Pay ($5K via Coinbase Commerce) → Calendly link unlocked

### Payment Integration
- **Provider**: Coinbase Commerce (now part of Coinbase Business)
- Accepts USDC via wallet (MetaMask, Coinbase Wallet, Phantom, etc.)
- Also accepts credit card via onramp
- 1% fee on completed transactions
- Instant settlement on Base network
- **Setup**: Create account at commerce.coinbase.com, create a charge for $5,000, embed the hosted URL or use the JS widget
- Replace `YOUR_CHARGE_ID` in index.html with actual Coinbase Commerce charge ID
- After payment confirmed via webhook → send Calendly link via email

### Calendly Integration
- Abraham's Calendly: to be added (placeholder in place)
- After payment confirmed, redirect or email the Calendly link
- Optional: use Coinbase Commerce webhooks to automate this

### Brand
- Name: SYS.KURI // DEV_SPRINT
- Colors: bg #080B0F, surface #0D1117, green #00FF88, muted #8B949E
- Fonts: JetBrains Mono (mono/accents) + Space Grotesk (body)

---

## PART 3: FILE STRUCTURE

```
kuri-dev/
├── index.html          # Main landing page
├── robots.txt
├── sitemap.xml
├── llms.txt
├── _internal/
│   └── agent_instructions.md
└── assets/
    └── img/            # Future images (WebP/AVIF)
```

---

## PART 4: TODO / NEXT STEPS

1. [ ] Create Coinbase Commerce account → generate $5,000 charge → replace `YOUR_CHARGE_ID` in index.html
2. [ ] Add Calendly URL to the `onPaymentClick()` JS function
3. [ ] Set up Coinbase Commerce webhook to auto-send Calendly link on payment
4. [ ] Initialize git repo: `git init && git add . && git commit -m "init"`
5. [ ] Push to GitHub repo named `kuri-dev` under `kurenn` account
6. [ ] Enable GitHub Pages from Settings → Pages → main branch
7. [ ] Optional: add custom domain

---

## LESSONS LEARNED

- Terminal/hacker aesthetic: scan lines via CSS repeating-gradient work best as body::before
- Coinbase Commerce is the simplest off-the-shelf USDC + credit card solution (1% fee, no blockchain expertise needed)
- Scarcity elements: countdown timer + capacity bar + "1 slot" badge drive urgency effectively
- Paywall modal before Calendly is the right UX — pay first, then schedule

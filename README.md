# kuri-dev — Abraham Kuri Sprint Page

Personal one-week sprint offering page. $5,000 flat. 1 client/month.

## 🚀 Deploy to GitHub Pages

```bash
git init
git add .
git commit -m "init: launch sprint page"
git remote add origin https://github.com/kurenn/kuri-dev.git
git push -u origin main
```

Then: GitHub → Settings → Pages → Source: `main` branch → `/root` → Save.

Live at: `https://kurenn.github.io/kuri-dev/`

---

## 💳 Payment Setup (Coinbase Commerce)

1. Go to [commerce.coinbase.com](https://commerce.coinbase.com) and create an account
2. Create a new **Charge** → Product name: "One-Week AI Sprint" → Amount: $5,000 USDC
3. Copy your charge's hosted URL or charge ID
4. In `index.html`, replace:
   ```
   https://commerce.coinbase.com/checkout/YOUR_CHARGE_ID
   ```
   with your actual charge URL.
5. Set up a **Webhook** to trigger on `charge:confirmed` event
6. On webhook → send Calendly link to the payer's email

**Accepted payment methods:**
- USDC via MetaMask, Coinbase Wallet, Phantom, and 100+ wallets
- Credit card via Coinbase's built-in onramp (customer pays with card, receives/pays USDC)
- 1% fee on Coinbase Commerce transactions

---

## 📅 Calendly Integration

Add your Calendly URL to `index.html` in the `onPaymentClick()` function:

```js
function onPaymentClick() {
  // Redirect after payment confirmation
  window.location.href = 'https://calendly.com/YOUR_LINK';
}
```

Or automate via Coinbase Commerce webhooks.

---

## 📁 Structure

```
kuri-dev/
├── index.html           # Landing page
├── robots.txt
├── sitemap.xml
├── llms.txt             # AI crawler map
├── README.md
├── _internal/
│   └── agent_instructions.md
└── assets/img/
```

---

## ✏️ Customization Checklist

- [ ] Replace `YOUR_CHARGE_ID` with Coinbase Commerce charge URL
- [ ] Add Calendly URL to `onPaymentClick()`
- [ ] Update the countdown target date (currently: April 30, 2026)
- [ ] Update "APRIL SLOT" copy if month changes
- [ ] Add profile photo to `assets/img/` if desired

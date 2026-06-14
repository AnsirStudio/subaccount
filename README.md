# JioJio — Subscription & Account Manager

Track your subscriptions. Manage your accounts. Keep everything local.

Most apps help you track subscriptions. **JioJio** goes further — it also helps you manage the **accounts and login methods** behind them. Which email did you use? Which phone number? Did you sign up with Google, WeChat, or Apple ID? How many accounts do you have on the same platform? JioJio keeps all of this organized so you never lose track again.

## Why JioJio?

**You have more subscriptions than you think.** Video, music, AI tools, cloud storage, developer services — they add up fast. And each one has a login method, maybe multiple accounts, different billing cycles, different currencies.

**You forget which account you used.** Google login on one, WeChat on another, a third with your work email. JioJio lets you record and match every account to every subscription, so you always know where to log in.

**Your data stays yours.** Everything is stored locally on your device. No cloud sync, no account registration, no data collection.

## Features

### Subscription Tracking
- **50+ built-in service templates** across 9 categories (Video, AI, Developer, Cloud, Tools, Music, Social, Shopping) — with more being added regularly
- **Custom subscriptions** — add any service manually, not limited to built-in templates
- **Flexible billing cycles** — monthly, yearly, or custom days
- **Auto-renew tracking** and **expiry reminders** (same day, 1/3/7 days before)
- **Pin important subscriptions** to the top

### Account & Login Management
- Record **login methods** for each subscription — Phone, WeChat, Email, QQ, Gmail, Apple ID, GitHub
- Store **account identifiers** — know exactly which account is tied to which service
- Manage **multiple accounts** on the same platform without confusion

### Financial Overview
- **Dashboard** with monthly cost, annualized cost, and upcoming payments
- **Multi-currency support** (10+ currencies) with automatic conversion to your preferred base currency
- **Category breakdown** — see where your money goes
- **Cashflow timeline** — past 12 months actual + 3 months forecast

### Views & Filtering
- **Card view** and **Table view**
- **Sort** by end date, start date, monthly price, annual price
- **Filter** by billing cycle, payment method, category, auto-renew status, reminder status
- **Search** across all subscriptions

### Personalization
- **Bilingual UI** — Chinese (中文) / English
- **Theme** — System / Light / Dark
- **Custom exchange rates** — adjust currency conversion as needed

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Tauri 2](https://v2.tauri.app/) |
| Frontend | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| Icons | [Lucide React](https://lucide.dev/) + custom SVGs |
| Build | [Vite](https://vite.dev/) |
| Backend | [Rust](https://www.rust-lang.org/) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- [Tauri Prerequisites](https://v2.tauri.app/start/prerequisites/)

### Install & Run

```bash
git clone https://github.com/AnsirStudio/JioJio.git
cd JioJio
npm install
npm run tauri dev
```

### Build

```bash
npm run tauri build
```

## Data Storage

All data is stored locally in the browser's **localStorage**. Nothing is sent to any server. No account or registration required.

## Disclaimer

Third-party brand names, trademarks, and logos appearing in this application are used solely to help users identify their subscription services. All trademarks and logos are the property of their respective owners. This application is not affiliated with, sponsored by, authorized by, or in any official partnership with these brands, unless explicitly stated otherwise.

## License

[MIT License](https://opensource.org/licenses/MIT) — © AnsirStudio

<div align="center">

# Apsara Assistant — Web

**The seller back office and landing page for Apsara Assistant, an AI sales assistant for Cambodian online sellers.**

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)

</div>

---

## Overview

Apsara Assistant Web is the seller-facing dashboard for [Apsara Assistant](https://github.com/RithyBondeth/Apsara-Assistant-Backend). From one place, sellers manage their catalogue, inventory, customers, the unified Messenger and Telegram inbox, orders, purchasing, returns, analytics, integrations and settings. It is fully bilingual in Khmer and English.

## Features

- **Unified inbox** for Facebook Messenger and Telegram conversations, with AI replies and manual takeover.
- **Catalogue management:** products, variants, image management, and inventory adjustments.
- **Orders and customers,** with order details, receipts, and payment-QR management.
- **Operations:** purchasing, returns, and analytics dashboards with totals kept separately for each currency (USD and KHR).
- **Integrations** for connecting Messenger pages, Telegram bots, and Stripe.
- **Authentication:** sign-in, registration, one-time-code login, and password reset, using HttpOnly cookie sessions.
- **Khmer and English localization,** with a test that keeps both translation files in sync.
- **Deep links** from Telegram seller alerts straight to a conversation or an order.
- **Animated marketing landing page** with pricing, a feature showcase, and phone mockups (GSAP and Lenis).
- **Stripe Checkout result pages** for customers.

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui |
| State management | Zustand (one store per API area) |
| HTTP | Axios |
| Animation | GSAP, Lenis |
| Testing and CI | Vitest, ESLint, GitHub Actions |

## Getting Started

### Prerequisites

- Node.js and npm
- A running [Apsara-Assistant-Backend](https://github.com/RithyBondeth/Apsara-Assistant-Backend) API (default `http://localhost:8000`)

### Installation

```bash
git clone https://github.com/RithyBondeth/Apsara-Assistant-Web.git
cd Apsara-Assistant-Web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend API base URL (default `http://localhost:8000`) |

The API's `CORS_ORIGINS` must include this app's origin.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Vitest suite |
| `npx tsc --noEmit` | Type-check the project |

## Project Structure

```text
Apsara-Assistant-Web/
├── app/
│   ├── (auth)/          # login, register, OTP login, forgot and reset password
│   ├── (main)/          # dashboard, chat, products, inventory, customers, orders,
│   │                    # purchasing, returns, analytics, integrations, settings
│   └── (payment)/       # Stripe Checkout success and cancel pages
├── components/          # Feature components and shadcn/ui primitives
├── hooks/               # Translation, animation, and utility hooks
├── language/            # Khmer and English translation files
├── stores/apis/         # Zustand stores mirroring the backend routers
└── utils/               # API constants, interfaces, date and money helpers
```

## Related Repositories

- [Apsara-Assistant-Backend](https://github.com/RithyBondeth/Apsara-Assistant-Backend): the FastAPI backend

## Author

**Rithy Bondeth** — Full Stack Developer & AI Engineer

[![Portfolio](https://img.shields.io/badge/Portfolio-0A0A0A?style=for-the-badge&logo=vercel&logoColor=white)](https://bondeth.dev)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/RithyBondeth)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/rithy-bondeth-484073282/)

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.

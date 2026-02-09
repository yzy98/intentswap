# IntentSwap

A decentralized intent-based swap protocol that enables users to create conditional token swaps executed automatically when price conditions are met.

## Overview

IntentSwap allows users to:

- Create swap intents with specific price thresholds
- Set expiration dates for their intents
- Have swaps automatically executed by a bot when conditions are satisfied
- Use Chainlink oracles for reliable price feeds
- Swap tokens via Uniswap V3 with slippage protection

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         IntentSwap                              │
├─────────────────┬─────────────────┬─────────────────────────────┤
│    packages/    │    packages/    │         packages/           │
│    hardhat      │      web        │           bot               │
├─────────────────┼─────────────────┼─────────────────────────────┤
│ Smart Contracts │  Next.js App    │  Cloudflare Worker          │
│ - IntentFactory │  - Create UI    │  - Cron job monitoring      │
│ - IntentExecutor│  - Manage UI    │  - Intent execution         │
│ - Oracle        │  - Admin panel  │  - KV subscriptions         │
│ - Swapper       │                 │                             │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

## Smart Contracts

| Contract | Description |
|----------|-------------|
| `IntentFactory` | Creates and manages swap intents |
| `IntentExecutor` | Validates conditions and executes swaps |
| `Oracle` | Manages Chainlink price feed mappings |
| `UniswapV3Swapper` | Handles Uniswap V3 swap execution |

### How It Works

1. **User creates intent** via `IntentFactory.createIntent()`
   - Specifies token pair, amount, price threshold, expiration
   - Approves `IntentExecutor` to spend tokens

2. **Bot monitors intents** via Cloudflare Worker cron job
   - Subscribes to active intents
   - Checks price conditions against Chainlink oracles

3. **Execution** when conditions are met
   - `IntentExecutor` validates price threshold
   - Swaps via Uniswap V3 with slippage protection
   - Deducts execution fee and sends tokens to user

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- A wallet with testnet ETH (for Base Sepolia)

### Installation

```bash
# Clone the repository
git clone https://github.com/yzy98/intentswap.git
cd intentswap

# Install dependencies
pnpm install
```

### Environment Setup

Create `.env` files in each package:

**packages/web/.env**
```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_CHAIN_ID=11155111
```

**packages/bot/.env**
```env
PRIVATE_KEY=your_bot_private_key
RPC_URL=your_rpc_url
```

### Deploy Contracts

```bash
# Deploy to Base Sepolia testnet
pnpm deploy:baseSepolia

# Or deploy to localhost
pnpm node          # Start local node
pnpm deploy:localhost
```

### Run Development Servers

```bash
# Run web app
pnpm dev:web

# Run bot locally
pnpm dev:bot
```

## Project Structure

```
intentswap/
├── packages/
│   ├── hardhat/           # Smart contracts
│   │   ├── contracts/     # Solidity contracts
│   │   └── scripts/       # Deploy scripts
│   ├── web/               # Next.js frontend
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilities & types
│   └── bot/               # Cloudflare Worker
│       └── src/           # Worker source
├── package.json           # Root package.json
└── pnpm-workspace.yaml    # Workspace config
```

## Tech Stack

**Smart Contracts**
- Solidity 0.8.20
- Hardhat
- OpenZeppelin Contracts
- Chainlink Price Feeds
- Uniswap V3

**Frontend**
- Next.js 16
- React 19
- Wagmi / Viem
- RainbowKit
- TailwindCSS
- shadcn/ui

**Bot**
- Cloudflare Workers
- Hono
- Viem

## Networks

| Network | Chain ID | Status |
|---------|----------|--------|
| baseSepolia | 84532 | Testnet |
| Base    | 8453     | Mainnet (planned) |

## Scripts

```bash
# Linting
pnpm check        # Check code style
pnpm fix          # Fix code style

# Build
pnpm build        # Build contracts

# Test
pnpm test         # Run contract tests
```

## License

MIT

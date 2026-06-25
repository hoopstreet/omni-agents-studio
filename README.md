# Omni-Agents Studio

![Omni-Agents](https://img.shields.io/badge/Omni--Agents-Studio-blue)
![Monorepo](https://img.shields.io/badge/Monorepo-pnpm-green)
![License](https://img.shields.io/badge/License-MIT-blue)

**Omni-Agents Studio** is a production-ready AI Operating System platform featuring web and mobile applications with unified credential management, automatic token rotation, and multi-agent orchestration.

## 🏗️ Monorepo Structure

```
Omni-Agents/
├── web/                    # Next.js web application
│   ├── client/             # React frontend
│   ├── server/             # tRPC backend
│   ├── drizzle/            # Database schema
│   └── package.json
│
├── mobile/                 # React Native mobile app
│   ├── screens/            # Mobile screens
│   ├── services/           # API services
│   ├── store/              # State management
│   └── package.json
│
├── backend/                # Shared backend services
│   ├── gateway-key/        # Credential management
│   ├── connectors/         # Connector implementations
│   ├── routers/            # tRPC routers
│   └── package.json
│
├── shared/                 # Shared types and utilities
│   ├── types/              # TypeScript types
│   ├── utils/              # Utility functions
│   └── package.json
│
├── docs/                   # Documentation
│   ├── API.md
│   ├── DEPLOYMENT.md
│   ├── ARCHITECTURE.md
│   └── GATEWAY_KEYS.md
│
├── .github/                # GitHub Actions
│   └── workflows/
│
└── package.json            # Monorepo root
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/hoopstreet/Omni-Agents.git
cd Omni-Agents

# Install dependencies
pnpm install

# Start development servers
pnpm dev
```

### Development Commands

```bash
# Install all dependencies
pnpm install-all

# Start all dev servers
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Format code
pnpm format

# Type check
pnpm type-check
```

### Workspace-Specific Commands

```bash
# Web development
pnpm web:dev
pnpm web:build

# Mobile development
pnpm mobile:dev
pnpm mobile:build

# Backend development
pnpm backend:dev
pnpm backend:build
pnpm backend:test

# Shared package
pnpm shared:build
```

## 📦 Packages

### Web (`/web`)
- **Framework:** Next.js + React 19
- **Backend:** tRPC + Express
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui

**Features:**
- Chat with AI agents
- Agent management and creation
- Task tracking and management
- Project workspaces
- Knowledge base
- Connector management
- Marketplace
- Analytics dashboard

### Mobile (`/mobile`)
- **Framework:** React Native + Expo
- **Target:** Android API 28+ (Xiaomi A5 compatible)
- **State Management:** Zustand
- **API:** Axios with interceptors

**Features:**
- Native Android app
- Full API integration
- Offline support
- Dark mode optimization
- Real-time chat
- Agent management

### Backend (`/backend`)
- **Gateway Key System:** Automatic credential rotation
- **Connectors:** 15+ integrations
- **Routers:** tRPC procedures
- **Database:** Supabase integration

**Supported Connectors:**
- OpenRouter, GitHub, Supabase, Expo
- Google (Drive, Gmail, Calendar)
- Notion, Slack, Discord, Telegram
- Zapier, n8n, Make
- Webhooks, MCP Server

### Shared (`/shared`)
- TypeScript types
- Utility functions
- Constants and enums
- Shared business logic

## 🔐 Gateway Key System

Unified credential management with automatic rotation and revocation.

**Features:**
- Automatic token refresh
- Scheduled rotation (provider-specific intervals)
- Revocation and reconnection workflows
- AES-256-GCM encryption
- Audit logging
- Multi-account support

**Supported Providers:**
- GitHub, Supabase, Expo, OpenRouter
- Google, Notion, Slack, Discord, Telegram
- Zapier, n8n, Make, Stripe, Shopify

**Usage:**

```typescript
import { gatewayKeySystem } from '@backend/gateway-key';

// Store credential
const credential = await gatewayKeySystem.storeCredential(
  'github',
  'user-123',
  'access_token',
  'refresh_token',
  expiresAt
);

// Rotate credential
await gatewayKeySystem.rotateCredential(credential.id);

// Revoke credential
await gatewayKeySystem.revokeCredential(credential.id);

// Reconnect with new token
await gatewayKeySystem.reconnectCredential(
  credential.id,
  'new_access_token'
);
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

**Build & Release:**
- Triggers: Push to main/develop, version tags, manual dispatch
- Steps: Lint → Test → Build → Release
- Outputs: Web deployment, APK release

**Test & Security:**
- Lint: ESLint, Prettier
- Test: Jest, Vitest
- Security: npm audit, Snyk

### Deployment

**Web:**
- Hosted on Manus (https://omniagents-zycdtw8o.manus.space)
- Auto-deploy on main branch push

**Mobile:**
- APK releases on GitHub
- Download from Releases page
- Install on Android devices

**Backend:**
- tRPC API at `/api/trpc`
- Shared across web and mobile

## 📚 Documentation

- **[API Documentation](./docs/API.md)** - Complete API reference
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Deployment instructions
- **[Architecture](./docs/ARCHITECTURE.md)** - System architecture
- **[Gateway Keys](./docs/GATEWAY_KEYS.md)** - Credential management

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Commit Message Format

```
<type>: <subject>

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Code style
- refactor: Code refactor
- perf: Performance
- test: Tests
- chore: Maintenance
```

### Branch Strategy

```
main (production)
  ↑
  └── develop (staging)
        ↑
        └── feature/* (features)
        └── bugfix/* (bug fixes)
```

## 🔒 Security

- HTTPS-only communication
- JWT token authentication
- AES-256-GCM encryption
- Secure credential storage
- Automatic token rotation
- Audit logging
- Role-based access control

## 📊 Performance

- **Web:** Optimized for fast load times
- **Mobile:** <3s startup time, ~100-150MB RAM usage
- **API:** Sub-100ms response times
- **Database:** Indexed queries, connection pooling

## 🐛 Troubleshooting

### Installation Issues

```bash
# Clear pnpm cache
pnpm store prune

# Reinstall dependencies
rm -rf node_modules
pnpm install
```

### Build Errors

```bash
# Clean build artifacts
pnpm --recursive run clean

# Rebuild
pnpm build
```

### TypeScript Errors

```bash
# Type check all packages
pnpm type-check

# Generate types
pnpm --recursive run type-gen
```

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/hoopstreet/Omni-Agents/issues)
- **Discussions:** [GitHub Discussions](https://github.com/hoopstreet/Omni-Agents/discussions)
- **Email:** support@omni-agents.dev

## 📝 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://react.dev), [Next.js](https://nextjs.org), [React Native](https://reactnative.dev)
- Powered by [Supabase](https://supabase.com), [Expo](https://expo.dev)
- Inspired by [Manus.im](https://manus.im)

---

**Made with ❤️ by the Omni-Agents Team**

[Website](https://omni-agents.dev) • [GitHub](https://github.com/hoopstreet/Omni-Agents) • [Twitter](https://twitter.com/omni_agents)

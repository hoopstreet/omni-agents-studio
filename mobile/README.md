# Omni-Agents Studio - Mobile Application

![Omni-Agents Studio](https://img.shields.io/badge/Omni--Agents-Studio-blue)
![React Native](https://img.shields.io/badge/React%20Native-0.72+-green)
![Expo](https://img.shields.io/badge/Expo-Latest-blue)
![Android](https://img.shields.io/badge/Android-API%2028+-green)
![License](https://img.shields.io/badge/License-MIT-blue)

Omni-Agents Studio is a production-ready AI Operating System mobile application for Android devices. This is a React Native implementation optimized for Xiaomi A5 and compatible Android devices.

## 🚀 Features

- **AI Chat Interface** - Real-time conversations with AI agents
- **Agent Management** - Create, manage, and execute AI agents
- **Task Tracking** - Organize and track tasks with status updates
- **Project Workspace** - Manage projects and collaborate
- **Connector Integration** - Connect to 15+ external services
- **Knowledge Base** - Store and search knowledge documents
- **Marketplace** - Browse and install agents and skills
- **Settings & Preferences** - Customize your experience
- **Dark Theme** - Battery-optimized dark mode
- **Offline Support** - Works offline with local caching

## 📋 Requirements

- **Android:** API 28+ (Xiaomi A5 compatible)
- **RAM:** Minimum 2GB
- **Storage:** 100MB free space
- **Node.js:** 16+ (for development)
- **npm:** 7+ or yarn/pnpm

## 🛠️ Installation

### For End Users

1. **Download APK:**
   - Go to [GitHub Releases](https://github.com/YOUR_USERNAME/omni-agents-studio-mobile/releases)
   - Download latest `omni-agents.apk`

2. **Install on Android:**
   - Enable Unknown Sources (Settings → Security)
   - Open file manager
   - Tap APK file to install
   - Follow on-screen prompts

### For Developers

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/omni-agents-studio-mobile.git
cd omni-agents-studio-mobile

# Install dependencies
npm install

# Start development server
npm start

# Run on Android emulator
npm run android

# Build APK
npm run build:apk
```

## 📱 Usage

### First Launch

1. **Login:** Enter your credentials or use OAuth
2. **Explore:** Browse agents, tasks, and projects
3. **Chat:** Start chatting with AI agents
4. **Configure:** Set up connectors in Settings

### Chat

- Type messages to chat with AI
- View chat history
- Clear conversations
- Create new chat sessions

### Agents

- View available agents
- Create custom agents
- Execute agent actions
- Monitor agent performance

### Tasks

- Create and manage tasks
- Update task status
- Filter by status
- Set due dates

### Projects

- Create workspaces
- Organize chats and tasks
- Invite team members
- Manage project settings

### Connectors

- Connect to Google Drive, Gmail, GitHub, etc.
- Authenticate with OAuth
- Sync data automatically
- Manage connections

## 🔌 API Integration

The mobile app connects to the Omni-Agents Studio backend API.

**Backend URL:** `https://omniagents-zycdtw8o.manus.space/api/trpc`

**Features:**
- Automatic authentication
- Token refresh
- Error handling
- Offline support

See [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md) for detailed documentation.

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│   React Native UI Components        │
│  (Chat, Agents, Tasks, Projects)   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Zustand State Management          │
│  (Global state, async actions)      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   API Service Layer                 │
│  (Axios with interceptors)          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   tRPC Backend API                  │
│  (Omni-Agents Studio)               │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Supabase Database                 │
│  (PostgreSQL)                       │
└─────────────────────────────────────┘
```

## 📦 Project Structure

```
omni-agents-mobile/
├── App.js                    # Main app component
├── app.json                  # Expo configuration
├── eas.json                  # EAS build configuration
├── package.json              # Dependencies
├── screens/                  # Screen components
│   ├── ChatScreen.js
│   ├── AgentsScreen.js
│   ├── TasksScreen.js
│   ├── ProjectsScreen.js
│   └── SettingsScreen.js
├── services/                 # API services
│   └── api.js
├── store/                    # State management
│   └── index.js
├── .github/                  # GitHub Actions
│   └── workflows/
├── docs/                     # Documentation
└── README.md
```

## 🚀 Deployment

### GitHub Actions CI/CD

Automated builds on:
- Push to main/develop
- Pull requests
- Version tags

### Build APK

```bash
# Local build
npm run build:apk

# EAS build
eas build --platform android

# GitHub Actions (automatic)
git push origin main
```

### Release

```bash
# Create version tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# GitHub Actions automatically creates release
```

See [DEPLOYMENT_SETUP.md](./DEPLOYMENT_SETUP.md) for detailed instructions.

## 🔐 Security

- **HTTPS Only** - All API calls use HTTPS
- **Token Security** - JWT tokens stored securely
- **Input Validation** - All inputs validated
- **XSS Prevention** - Response sanitization
- **Credential Protection** - Encrypted storage

## 🧪 Testing

```bash
# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

## 📊 Performance

- **APK Size:** ~50-65MB
- **Startup Time:** <3 seconds
- **Memory Usage:** ~100-150MB
- **Battery Impact:** Minimal (dark mode optimized)

## 🐛 Troubleshooting

### App Won't Install

- Check Android version (API 28+)
- Enable Unknown Sources
- Clear cache: Settings → Apps → Clear Cache

### Can't Connect to Backend

- Check internet connection
- Verify backend URL
- Check firewall settings
- Review API logs

### Slow Performance

- Clear app cache
- Close background apps
- Update to latest version
- Check network connection

## 📚 Documentation

- [API Integration Guide](./API_INTEGRATION_GUIDE.md)
- [Android Build Guide](./ANDROID_BUILD_GUIDE.md)
- [Deployment Setup](./DEPLOYMENT_SETUP.md)
- [Backend API Docs](../API_DOCUMENTATION.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

## 🙋 Support

- **Issues:** [GitHub Issues](https://github.com/YOUR_USERNAME/omni-agents-studio-mobile/issues)
- **Discussions:** [GitHub Discussions](https://github.com/YOUR_USERNAME/omni-agents-studio-mobile/discussions)
- **Email:** support@omni-agents.dev

## 🎯 Roadmap

- [ ] iOS support
- [ ] Web version
- [ ] Desktop apps
- [ ] Advanced AI features
- [ ] Team collaboration
- [ ] Enterprise features
- [ ] Analytics dashboard
- [ ] Custom integrations

## 👥 Team

- **Omni-Agents Studio Team** - AI Platform Development
- **Manus** - Infrastructure and hosting

## 🙏 Acknowledgments

- Built with [React Native](https://reactnative.dev)
- Powered by [Expo](https://expo.dev)
- Backend: [Omni-Agents Studio](https://github.com/YOUR_USERNAME/omni-agents-studio)
- Inspired by [Manus.im](https://manus.im)

---

**Made with ❤️ by the Omni-Agents Team**

[Website](https://omni-agents.dev) • [GitHub](https://github.com/YOUR_USERNAME/omni-agents-studio-mobile) • [Twitter](https://twitter.com/omni_agents)

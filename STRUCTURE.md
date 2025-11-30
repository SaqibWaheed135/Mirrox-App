# Project Structure

This document describes the professional folder structure of the Mirrorx app.

## 📁 Directory Structure

```
Mirrox-app/
├── app/                    # Expo Router file-based routing
│   ├── _layout.tsx         # Root layout with font loading
│   ├── (tabs)/             # Tab navigation group
│   │   ├── _layout.tsx     # Tabs layout configuration
│   │   ├── home.tsx        # Home screen (main)
│   │   ├── index.tsx       # Camera screen (hidden)
│   │   ├── profile.tsx     # Profile screen
│   │   └── explore.tsx     # Gallery screen
│   ├── login.tsx           # Login/Signup screen
│   ├── splash.tsx          # Splash screen component
│   ├── haircut-details.tsx # Haircut details screen
│   ├── ai-mirror.tsx       # AI mirror screen
│   └── modal.tsx           # Modal screen
│
├── components/             # Reusable UI components
│   ├── common/             # Common/shared components
│   │   ├── external-link.tsx
│   │   ├── themed-text.tsx
│   │   └── themed-view.tsx
│   ├── layout/             # Layout components
│   │   └── parallax-scroll-view.tsx
│   ├── navigation/          # Navigation components
│   │   ├── bottom-nav.tsx  # Custom bottom navigation
│   │   └── haptic-tab.tsx
│   └── ui/                 # UI primitives
│       ├── collapsible.tsx
│       ├── icon-symbol.tsx
│       └── icon-symbol.ios.tsx
│
├── services/               # API and business logic services
│   ├── api.service.ts      # Base API service with interceptors
│   └── auth.service.ts     # Authentication service
│
├── lib/                    # Utility libraries and helpers
│   └── auth.ts             # Auth storage utilities
│
├── config/                 # Configuration files
│   └── api.ts              # API endpoints and configuration
│
├── constants/              # App constants
│   └── theme.ts            # Colors, fonts, theme constants
│
├── hooks/                  # Custom React hooks
│   ├── use-color-scheme.ts
│   ├── use-color-scheme.web.ts
│   └── use-theme-color.ts
│
├── types/                  # TypeScript type definitions
│   └── navigation.ts       # Navigation types
│
├── assets/                 # Static assets
│   ├── fonts/              # Poppins font family
│   ├── icons/              # App icons
│   └── images/             # Images and graphics
│
└── utils/                  # Legacy utilities (can be migrated to lib/)
    └── (empty - moved to lib/)
```

## 📂 Folder Descriptions

### `/app`
Expo Router file-based routing directory. All routes are defined here.
- `_layout.tsx`: Root layout with font loading and theme setup
- `(tabs)/`: Tab navigation group
- Other files are individual routes

### `/components`
Reusable UI components organized by category:
- **common/**: Shared components used across the app
- **layout/**: Layout-related components
- **navigation/**: Navigation-specific components
- **ui/**: Basic UI primitives

### `/services`
Business logic and API services:
- `api.service.ts`: Centralized HTTP client with interceptors
- `auth.service.ts`: Authentication-related API calls

### `/lib`
Utility libraries and helpers:
- `auth.ts`: Authentication storage utilities (AsyncStorage)

### `/config`
Application configuration:
- `api.ts`: API endpoints, base URLs, and configuration

### `/constants`
App-wide constants:
- `theme.ts`: Colors, fonts (Poppins), theme constants

### `/hooks`
Custom React hooks for reusable logic

### `/types`
TypeScript type definitions for better type safety

### `/assets`
Static assets (fonts, icons, images)

## 🔄 Import Paths

All imports use the `@/` alias which points to the project root:

```typescript
// Services
import { authService } from '@/services/auth.service';
import { apiService } from '@/services/api.service';

// Configuration
import { API_CONFIG, getApiUrl } from '@/config/api';

// Components
import { BottomNav } from '@/components/navigation/bottom-nav';
import { ThemedText } from '@/components/common/themed-text';

// Utilities
import { AuthService } from '@/lib/auth';

// Constants
import { Poppins, Colors } from '@/constants/theme';

// Types
import type { User } from '@/lib/auth';
```

## 🎯 Best Practices

1. **Services**: All API calls go through services in `/services`
2. **Components**: Reusable components in `/components` organized by category
3. **Configuration**: All config in `/config` for easy updates
4. **Types**: TypeScript types in `/types` for type safety
5. **Constants**: App constants in `/constants` for easy access
6. **Hooks**: Custom hooks in `/hooks` for reusable logic

## 📝 Notes

- The `utils/` folder is kept for backward compatibility but is deprecated
- All new utilities should go in `/lib`
- API configuration is centralized in `/config/api.ts`
- Bottom navigation is now a reusable component in `/components/navigation/bottom-nav.tsx`


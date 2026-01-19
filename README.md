# Noggin Web

A polished, interactive, browser-based word game experience built with modern web technologies.

![Noggin Web](https://via.placeholder.com/800x400?text=Noggin+Web)

## 🎮 Features

### Game Modes
- **Quick Play** - Endless rounds with no pressure, perfect for learning
- **Timed Sprint** - Race against the clock (30/60/120 seconds)
- **Daily Challenge** - Same puzzle for everyone, compare scores
- **Practice** - Focus on specific rule types

### Rules Engine
7 classic Noggin rules with intelligent validation:
- **BOOKEND** - Word starts with L1, ends with L2 (auto-validated)
- **MIDDLE LETTERS** - Both letters in the middle (semi-validated)
- **INITIALS** - Celebrity with those initials (semi-validated)
- **NEITHER LETTER** - Word contains neither letter (auto-validated)
- **WORD ASSOCIATION** - Two related words (manual)
- **WORD DISSOCIATION** - Two unrelated words (manual)
- **DESCRIBE** - Adjective + noun phrase (manual)

### Smart Validation
- **Auto-validation** for deterministic rules
- **Semi-validation** with heuristics and hints
- **Manual adjudication** UI for subjective rules

### Statistics & Analytics
- Per-rule performance tracking
- Letter pair heatmap
- Streak distribution
- Daily challenge history
- Export/import profile

### Accessibility
- High contrast theme
- Reduced motion option
- Keyboard controls
- Screen reader support
- 44px+ tap targets

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + CSS Variables |
| Animations | Framer Motion |
| State | Zustand |
| Sound | Howler.js |
| Storage | localStorage + IndexedDB |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd noggin

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play!

### Build for Production

```bash
npm run build
```

The static export will be in the `out/` directory.

## 📁 Project Structure

```
noggin/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   ├── play/page.tsx      # Game screen
│   └── stats/page.tsx     # Statistics dashboard
├── components/
│   ├── game/              # Game components
│   │   ├── LetterCard.tsx
│   │   ├── RuleCard.tsx
│   │   ├── InputDock.tsx
│   │   └── ...
│   ├── ui/                # Reusable UI components
│   └── settings/          # Settings components
├── lib/
│   ├── engine/            # Game engine
│   │   ├── rules/         # Rule definitions
│   │   ├── generator.ts   # Letter/rule generation
│   │   └── scoring.ts     # Score calculation
│   ├── store/             # Zustand stores
│   └── types/             # TypeScript types
└── public/                # Static assets
```

## 🎯 Architecture Highlights

### Event-Driven State
All game actions are logged as events, enabling:
- Replay functionality
- Analytics tracking
- Debugging
- Future multiplayer support

### Plugin-Based Rules
Each rule is a self-contained module with:
- Validation logic
- Input schema
- Render styles
- Examples and hints

### Tiered Validation
Solves the "subjective word game" problem:
1. Auto-validation for objective rules
2. Semi-validation with guidance
3. Manual adjudication with override tracking

## 🌐 Deployment

### Netlify (Recommended)

```bash
# Build and deploy
npm run build
netlify deploy --prod --dir=out
```

Or connect your repository for automatic deployments.

### Vercel

```bash
vercel
```

## 📊 Performance

- **First Contentful Paint**: < 1s
- **Time to Interactive**: < 2s
- **Bundle Size**: ~150KB (gzipped)
- **60 FPS** animations

## 🔮 Future Roadmap

- [ ] Multiplayer rooms
- [ ] Custom rule builder
- [ ] Rule pack marketplace
- [ ] Ghost mode (race your best time)
- [ ] Replay timeline viewer
- [ ] Mobile app (PWA)

## 📝 License

MIT

---

Built with ❤️ inspired by the Noggin card game.

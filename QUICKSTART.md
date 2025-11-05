# Quick Start Guide

## 🚀 For Development (Hot Reload)

### Single Command

```bash
pnpm dev
```

This runs:
- Library watcher (rebuilds on src/ changes)
- Example app (http://localhost:3000)

**How it works:**
1. Edit any file in `src/` 
2. Library auto-rebuilds to `dist/`
3. Example auto-reloads
4. See changes instantly!

### Separate Terminals (For Debugging)

**Terminal 1: Library Watcher**
```bash
pnpm run dev:lib
```
Watches `src/` and rebuilds `dist/` on every change.

**Terminal 2: Example App**
```bash
pnpm run dev:example
```
Runs example at http://localhost:3000

## 📦 For Publishing

### Build Library

```bash
pnpm build
```

Creates:
- `dist/index.js` (ESM)
- `dist/index.cjs` (CommonJS)
- `dist/index.d.ts` (Types)

### Publish to npm

```bash
npm version patch  # Bump version
npm publish --access public
```

## 🎯 Common Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run library watcher + example (hot reload) |
| `pnpm run dev:lib` | Only watch & rebuild library |
| `pnpm run dev:example` | Only run example app |
| `pnpm build` | Build library for production |
| `pnpm run build:check` | Check TypeScript errors |

## 📁 Where to Edit

**Library (what users import):**
- `src/components/ExpressionEditor.tsx` - Main component
- `src/lib/theme/` - Theme system
- `src/lib/autocomplete/` - Autocomplete system
- `src/index.ts` - Public exports

**Example (dev/demo only):**
- `example/src/ExpressionPlayground.tsx` - Demo app

## 🔥 Hot Reload in Action

```
Edit src/components/ExpressionEditor.tsx
              ↓
Library rebuilds (5-10 seconds)
              ↓
Example detects change
              ↓
Browser auto-refreshes
              ↓
See your changes! ✨
```

## 📖 Full Documentation

- [DEVELOPMENT.md](./DEVELOPMENT.md) - Detailed development guide
- [PUBLISHING.md](./PUBLISHING.md) - How to publish to npm
- [README.md](./README.md) - User documentation

## 🆘 Troubleshooting

### Hot reload not working?

```bash
# Kill all processes
pkill -f vite

# Rebuild & restart
pnpm build
pnpm dev
```

### Changes not showing?

```bash
# Check dist/ was updated
ls -lh dist/

# Manually rebuild
pnpm build
```

### Port already in use?

Edit `example/vite.config.ts`:
```ts
server: {
  port: 3001,  // Change this
}
```

## ✅ Success!

If you see:
- **Terminal 1:** `watching for file changes...`
- **Terminal 2:** `Local: http://localhost:3000/`
- **Browser:** Expression editor playground

**You're ready to develop!** 🎉

Make changes to `src/` and watch them appear instantly at http://localhost:3000

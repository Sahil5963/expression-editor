# Development Guide

## 🔧 Local Development with Hot Reload

### Option 1: Develop Library + Example Together (Recommended)

This runs both the library build watcher AND the example app with hot reload:

```bash
pnpm dev
```

This command does:
1. **Library watcher** - Rebuilds `dist/` when you edit library files in `src/`
2. **Example dev server** - Hot reloads when library rebuilds

**What this means:**
- Edit any file in `src/` (library code)
- Library auto-rebuilds to `dist/`
- Example app auto-reloads with changes
- See changes instantly at http://localhost:3000

### Option 2: Run Separately (More Control)

**Terminal 1: Library watcher**
```bash
pnpm run dev:lib
```
This watches `src/` and rebuilds `dist/` on changes.

**Terminal 2: Example app**
```bash
pnpm run dev:example
# or
cd example && pnpm dev
```
This runs the example at http://localhost:3000

### Option 3: Example Only (Library Already Built)

If you already built the library and just want to test:

```bash
cd example && pnpm dev
```

## 📁 Where to Edit

### Library Code (Hot Reloads)
```
src/
├── index.ts                    # Add exports here
├── components/
│   └── ExpressionEditor.tsx    # Main component
├── lib/
│   ├── theme/                  # Theme system
│   ├── autocomplete/           # Autocomplete
│   └── hooks/                  # React hooks
└── types/                      # TypeScript types
```

### Example/Demo Code
```
example/src/
├── ExpressionPlayground.tsx    # Demo app (hot reloads)
├── App.tsx
└── main.tsx
```

## 🔄 How Hot Reload Works

```
┌─────────────────────────────────────────────────┐
│  1. Edit src/components/ExpressionEditor.tsx   │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  2. Vite watcher rebuilds dist/index.js         │
│     (dev:lib command)                           │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  3. Example detects change in node_modules/     │
│     react-expression-editor                     │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  4. Browser auto-refreshes                      │
│     http://localhost:3000                       │
└─────────────────────────────────────────────────┘
```

## 🎯 Development Workflow

### 1. Start Development Mode

```bash
pnpm dev
```

### 2. Open Browser

Visit http://localhost:3000 to see the example playground.

### 3. Edit Library Code

Open any file in `src/` and save changes:

```tsx
// src/components/ExpressionEditor.tsx
export const ExpressionEditor = forwardRef<ExpressionEditorRef, ExpressionEditorProps>(
  (props, ref) => {
    // Make your changes here
    console.log('Testing hot reload!');
    // ...
  }
);
```

### 4. See Changes Instantly

The browser will automatically refresh with your changes!

## 🐛 Debugging Tips

### Check Library Build

```bash
# Terminal 1: Watch library build output
pnpm run dev:lib
```

You'll see:
```
vite v5.x.x building for development...
✓ 54 modules transformed.
dist/index.js  1.47 MB
```

### Check Example App

```bash
# Terminal 2: Watch example app
cd example && pnpm dev
```

You'll see:
```
VITE v5.x.x ready in 166 ms
➜  Local:   http://localhost:3000/
```

### Rebuild Library Manually

If hot reload isn't working:

```bash
# Kill all processes
pkill -f vite

# Rebuild library
pnpm build

# Start dev again
pnpm dev
```

## 📦 Testing Library Changes

### Test in Example App

1. Edit `src/components/ExpressionEditor.tsx`
2. Save (auto-rebuilds)
3. Check http://localhost:3000

### Test Build Output

```bash
# Build for production
pnpm build

# Check dist/
ls -lh dist/
```

### Test TypeScript

```bash
# Check types without building
pnpm run build:check
```

## 🚀 Common Development Tasks

### Add New Feature to Library

```bash
# 1. Create new file
touch src/lib/myFeature.ts

# 2. Implement feature
# (edit src/lib/myFeature.ts)

# 3. Export from index
# src/index.ts
export { myFeature } from './lib/myFeature';

# 4. Use in example
# example/src/ExpressionPlayground.tsx
import { myFeature } from 'react-expression-editor';
```

Changes auto-reload! ✨

### Add New Prop to ExpressionEditor

```tsx
// 1. Add to interface
export interface ExpressionEditorProps {
  // ...existing props
  myNewProp?: string; // Add this
}

// 2. Use in component
export const ExpressionEditor = forwardRef((props, ref) => {
  const { myNewProp, ...otherProps } = props;
  
  // Use myNewProp here
});

// 3. Test in example
<ExpressionEditor
  value={expr}
  onChange={setExpr}
  myNewProp="test" // Use new prop
/>
```

### Debug Library in Example

Add console logs or debugger:

```tsx
// src/components/ExpressionEditor.tsx
export const ExpressionEditor = forwardRef((props, ref) => {
  console.log('Props received:', props);
  debugger; // Pauses in browser DevTools
  
  // ...rest of code
});
```

Open browser DevTools to see logs!

## 🎨 Styling During Development

Since we use CSS-in-JS, no CSS imports needed!

Edit theme in library:
```tsx
// src/lib/theme/defaultTheme.ts
export const defaultTheme = {
  colors: {
    background: '#ff0000', // Change this
  }
};
```

Or override in example:
```tsx
// example/src/ExpressionPlayground.tsx
<ExpressionEditor
  theme={{
    colors: { background: '#00ff00' }
  }}
/>
```

## 📊 Performance Tips

### Build is Slow?

The library build includes all dependencies. This is normal for development.

Production build is optimized:
```bash
pnpm build  # Fast, optimized
```

### Example is Slow to Load?

Clear cache:
```bash
rm -rf example/node_modules/.vite
cd example && pnpm dev
```

## 🔥 Hot Reload Not Working?

1. **Check both processes are running:**
   ```bash
   # Should show 2 processes
   ps aux | grep vite
   ```

2. **Restart everything:**
   ```bash
   pkill -f vite
   pnpm dev
   ```

3. **Manual rebuild:**
   ```bash
   pnpm build
   cd example && pnpm dev
   ```

4. **Clear everything:**
   ```bash
   rm -rf dist/ example/node_modules/.vite
   pnpm install
   pnpm dev
   ```

## ✅ Ready to Publish?

Once you're happy with changes:

```bash
# 1. Build for production
pnpm build

# 2. Update version
npm version patch  # or minor/major

# 3. Publish
npm publish --access public
```

See [PUBLISHING.md](./PUBLISHING.md) for full guide.

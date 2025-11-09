# Publishing Guide

## How to Publish to npm

### Prerequisites

1. npm account: https://www.npmjs.com/signup
2. Verify email
3. Login: `npm login`

### Publishing Steps

#### 1. Update Version

```bash
# Update version in package.json
npm version patch  # 1.0.0 -> 1.0.1
# or
npm version minor  # 1.0.0 -> 1.1.0
# or
npm version major  # 1.0.0 -> 2.0.0
```

#### 2. Build the Library

```bash
pnpm build
```

This creates:
- `dist/index.js` - ESM bundle
- `dist/index.cjs` - CommonJS bundle
- `dist/index.d.ts` - TypeScript definitions

#### 3. Test Locally (Optional)

Link the package locally:

```bash
# In the library root
pnpm link --global

# In another project
pnpm link --global react-expression-editor
```

#### 4. Publish to npm

```bash
npm publish --access public
```

The `prepublishOnly` script will automatically run `pnpm build`.

### What Gets Published?

Only these files (defined in `package.json` "files" field):
```json
{
  "files": ["dist"]
}
```

So users get:
- `dist/` - Built JavaScript and TypeScript files
- `package.json`
- `README.md`

The `example/` folder is NOT published (development only).

### After Publishing

Users can install with:

```bash
npm install react-expression-editor
```

And use it:

```tsx
import { ExpressionEditor } from 'react-expression-editor';

<ExpressionEditor value={expr} onChange={setExpr} />
```

## Package Structure

```
react-expression-editor (published)
├── dist/
│   ├── index.js          # ESM entry
│   ├── index.cjs         # CommonJS entry
│   └── index.d.ts        # TypeScript definitions
├── package.json
└── README.md

example/ (NOT published, development only)
```

## Testing Before Publishing

### 1. Test Build

```bash
pnpm build
ls -la dist/
```

Verify dist/ contains:
- index.js
- index.cjs
- index.d.ts

### 2. Test in Example App

```bash
# Terminal 1: Build library
pnpm build

# Terminal 2: Run example
cd example && pnpm dev
```

Visit http://localhost:3000 and verify everything works.

### 3. Dry Run Publish

```bash
npm publish --dry-run
```

This shows what would be published without actually publishing.

## Troubleshooting

### "Package already exists"

You need to bump the version:
```bash
npm version patch
npm publish
```

### "No permission to publish"

Make sure:
1. You're logged in: `npm whoami`
2. You own the package or have permissions
3. Package is public: `npm publish --access public`

### TypeScript errors

Skip TypeScript check during build:
```bash
# Edit package.json
"build": "vite build"  # Remove "tsc &&"
```

## Version Strategy

- **Patch** (1.0.x): Bug fixes
- **Minor** (1.x.0): New features, backwards compatible
- **Major** (x.0.0): Breaking changes

## Changelog

Keep a CHANGELOG.md to track changes between versions:

```markdown
# Changelog

## [1.1.0] - 2024-01-15
### Added
- Custom theme support
- Drag & drop callbacks

### Fixed
- Autocomplete positioning

## [1.0.0] - 2024-01-01
- Initial release
```

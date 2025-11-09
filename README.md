# react-dynamic-expression-editor

A powerful React expression editor component with autocomplete, syntax highlighting, and customizable theming. **Zero CSS imports required!**

## ✨ Features

- **Zero CSS Imports** - All styles injected via CSS-in-JS
- **Fully Customizable Theming** - CSS variables, theme props, or class-based overrides
- **Smart Autocomplete** - Pluggable autocomplete system with deep object navigation
- **Drag & Drop Support** - Built-in drag and drop with customizable callbacks
- **Rich Text Editing** - CodeMirror-powered with syntax highlighting
- **Single & Multi-line Modes** - Flexible layout options
- **Read-only Mode** - Display expressions without editing
- **Hooks API** - Use the underlying hook for custom implementations
- **TypeScript First** - Full type safety out of the box

## 📦 Installation

```bash
npm install react-dynamic-expression-editor
# or
pnpm add react-dynamic-expression-editor
# or
yarn add react-dynamic-expression-editor
```

## 🚀 Quick Start

```tsx
import { ExpressionEditor } from 'react-dynamic-expression-editor';
import { useState } from 'react';

function App() {
  const [expression, setExpression] = useState('');

  return (
    <ExpressionEditor
      value={expression}
      onChange={({ value }) => setExpression(value)}
    />
  );
}
```

## 📖 Usage Examples

### With Autocomplete Data

```tsx
<ExpressionEditor
  value={expression}
  onChange={({ value, segments }) => setExpression(value)}
  autocompleteData={{
    user: { name: 'John', email: 'john@example.com' },
    product: { id: 123, title: 'Laptop', price: 999 },
    items: [{ id: 1 }, { id: 2 }]
  }}
/>
```

### Custom Theme (via Props)

```tsx
<ExpressionEditor
  value={expression}
  onChange={({ value }) => setExpression(value)}
  theme={{
    colors: {
      background: '#282c34',
      text: '#abb2bf',
      primary: '#61afef',
      caretColor: '#528bff'
    },
    typography: {
      fontSize: '14px',
      fontFamily: 'Fira Code, monospace'
    }
  }}
/>
```

### Custom Theme (via CSS Variables)

```tsx
<div style={{
  '--expr-editor-bg': '#000',
  '--expr-editor-text': '#0f0',
  '--expr-editor-caret': '#f00'
}}>
  <ExpressionEditor
    value={expression}
    onChange={({ value }) => setExpression(value)}
  />
</div>
```

### With Drag & Drop

```tsx
<ExpressionEditor
  value={expression}
  onChange={({ value }) => setExpression(value)}
  enableDragDrop={true}
  onDrop={(value, position) => {
    console.log('Dropped:', value, 'at position:', position);
  }}
/>
```

## 📚 API Reference

See full API documentation in the [repository](https://github.com/yourusername/expression-editor).

### Main Props

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string` | Current value (controlled) |
| `onChange` | `function` | Callback when value changes |
| `autocompleteData` | `object` | Data for autocomplete |
| `theme` | `ThemeConfig` | Theme configuration |
| `rows` | `number` | Number of rows (1 for single-line) |
| `readOnly` | `boolean` | Read-only mode |

[See full props list](https://github.com/yourusername/expression-editor#api)

## 🏗️ Development

This project uses pnpm workspaces:

```bash
# Install dependencies
pnpm install

# Run example app
pnpm dev

# Build library
pnpm build

# The example app imports the library via workspace:*
cd example && pnpm dev
```

### Project Structure

```
expression-editor/
├── src/                 # Library source
│   ├── components/      # ExpressionEditor component
│   ├── lib/            # Theme, autocomplete, hooks
│   └── index.ts        # Main exports
├── example/            # Demo application (separate package)
│   ├── src/
│   │   └── ExpressionPlayground.tsx
│   └── package.json    # Uses workspace:* for library
└── dist/               # Built library output
```

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

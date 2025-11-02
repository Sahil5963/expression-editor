# @n8n/react-expression-editor

A powerful React package for n8n Expression Editor with full autocomplete, syntax highlighting, and CodeMirror 6 support.

## Features

✨ **Full-featured Expression Editor** - Drop-in React component with all n8n expression features
🔍 **Smart Autocomplete** - Intelligent suggestions based on your data structure
🎨 **Syntax Highlighting** - Beautiful highlighting for n8n expression syntax
🖱️ **Drag & Drop Support** - Built-in handlers for variable insertion
⚡ **TypeScript First** - Full type safety for all props and data structures
🎯 **Flexible API** - Customizable theming, extensions, and callbacks
📦 **Framework Agnostic Core** - CodeMirror logic separated for potential reuse

## Installation

```bash
npm install @n8n/react-expression-editor
# or
pnpm add @n8n/react-expression-editor
# or
yarn add @n8n/react-expression-editor
```

## Basic Usage

```tsx
import { ExpressionEditor } from '@n8n/react-expression-editor';
import '@n8n/react-expression-editor/styles.css';

function MyComponent() {
  const [expression, setExpression] = useState('{{json.name}}');

  const handleChange = (data) => {
    console.log('New value:', data.value);
    setExpression(data.value);
  };

  const workflowData = {
    json: {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30
    }
  };

  return (
    <ExpressionEditor
      value={expression}
      onChange={handleChange}
      additionalData={workflowData}
    />
  );
}
```

## Advanced Usage

### With Refs

```tsx
import { useRef } from 'react';
import { ExpressionEditor, ExpressionEditorRef } from '@n8n/react-expression-editor';

function AdvancedComponent() {
  const editorRef = useRef<ExpressionEditorRef>(null);

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  return (
    <div>
      <button onClick={focusEditor}>Focus Editor</button>

      <ExpressionEditor
        ref={editorRef}
        value="{{json.name}}"
        onChange={(data) => console.log(data)}
      />
    </div>
  );
}
```

### With Complex Data

```tsx
const complexData = {
  json: {
    user: {
      name: 'John Doe',
      address: {
        city: 'San Francisco',
        coordinates: {
          lat: 37.7749,
          lng: -122.4194
        }
      }
    },
    orders: [
      { id: 1, product: 'Laptop', price: 1299.99 },
      { id: 2, product: 'Mouse', price: 29.99 }
    ]
  }
};

<ExpressionEditor
  value="{{json.user.address.city}}"
  onChange={handleChange}
  additionalData={complexData}
  rows={5}
/>
```

## API Reference

### ExpressionEditor Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | The current expression value |
| `onChange` | `(data: { value: string; segments: Segment[] }) => void` | required | Callback fired when value changes |
| `onSelectionChange` | `(data: { state: EditorState; selection: SelectionRange }) => void` | - | Callback fired when selection changes |
| `onFocus` | `() => void` | - | Callback fired when editor gains focus |
| `path` | `string` | `'expression'` | Parameter path for telemetry |
| `rows` | `number` | `5` | Number of rows (height of editor) |
| `readOnly` | `boolean` | `false` | Whether editor is read-only |
| `additionalData` | `IDataObject` | `{}` | Data structure for autocomplete |
| `placeholder` | `string` | - | Placeholder text |
| `className` | `string` | `''` | Additional CSS class name |

### ExpressionEditorRef Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `focus()` | - | Focus the editor |
| `setCursorPosition()` | `position: 'lastExpression' \| number` | Set cursor position |
| `handleDrop()` | `event: React.DragEvent` | Handle drop event |

## Development

### Running the Demo

```bash
pnpm install
pnpm dev
```

Visit `http://localhost:3000` to see the interactive playground.

### Building the Package

```bash
pnpm build
```

This creates:
- ESM build: `dist/index.js`
- CJS build: `dist/index.cjs`
- Type declarations: `dist/index.d.ts`
- Styles: `dist/style.css`

## Project Structure

```
src/
├── index.ts                    # Package entry point
├── components/
│   ├── ExpressionEditor.tsx    # Main React component
│   ├── ExpressionEditor.module.scss
│   └── customAutocomplete.ts   # Autocomplete logic
├── lib/
│   ├── hooks/
│   │   └── useExpressionEditor.ts    # React hook
│   ├── codemirror-plugins/    # All CodeMirror extensions
│   └── theme/                 # Editor theme
├── types/                     # TypeScript types
├── demo/                      # Demo application
│   ├── main.tsx              # Demo entry point
│   ├── App.tsx               # Demo root component
│   ├── ExpressionPlayground.tsx
│   └── ExpressionPlayground.css
└── styles/                    # Base styles
```

## License

Same as n8n

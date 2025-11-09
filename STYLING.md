# Styling Guide

## Default Styling

The Expression Editor comes with sensible defaults:

- **Border Radius:** 4px (rounded corners)
- **Background:** Dark theme (#1a202c)
- **Text Color:** Light gray (#e2e8f0)
- **Border:** 1px solid (#2d3748)
- **Font:** Monaco, Menlo, monospace
- **Font Size:** 12px

## Customization Methods

The editor supports **5 ways** to customize styling, in order of priority:

### 1. CSS Variables (Highest Priority) ✨

Override any CSS variable to customize globally or per-instance:

```tsx
<div style={{ 
  '--expr-editor-bg': '#000',
  '--expr-editor-text': '#0f0',
  '--expr-editor-radius': '12px'
}}>
  <ExpressionEditor value={expr} onChange={setExpr} />
</div>
```

**Available CSS Variables:**
```css
--expr-editor-bg              /* Background color */
--expr-editor-text            /* Text color */
--expr-editor-caret           /* Cursor color */
--expr-editor-primary         /* Primary/accent color */
--expr-editor-border          /* Border color */
--expr-editor-radius          /* Border radius */
--expr-editor-font-size       /* Font size */
--expr-editor-font-family     /* Font family */
--expr-editor-line-height     /* Line height */
```

### 2. Theme Prop

Pass a theme object for programmatic customization:

```tsx
<ExpressionEditor
  value={expr}
  onChange={setExpr}
  theme={{
    colors: {
      background: '#282c34',
      text: '#abb2bf',
      primary: '#61afef',
      caretColor: '#528bff',
      border: '#3e4451',
    },
    typography: {
      fontSize: '14px',
      fontFamily: 'Fira Code, monospace',
      lineHeight: '1.5',
    },
    border: {
      radius: '8px',    // Custom border radius
      width: '2px',
    },
  }}
/>
```

### 3. Inline Style Prop

Apply inline styles directly to the wrapper:

```tsx
<ExpressionEditor
  value={expr}
  onChange={setExpr}
  style={{ 
    borderRadius: '16px',
    border: '2px solid #667eea',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  }}
/>
```

### 4. className Prop (Tailwind/Utility Classes)

Use Tailwind or custom CSS classes:

```tsx
// With Tailwind
<ExpressionEditor
  value={expr}
  onChange={setExpr}
  className="rounded-xl border-2 border-blue-500 shadow-lg"
/>

// With custom CSS
<ExpressionEditor
  value={expr}
  onChange={setExpr}
  className="my-custom-editor"
/>
```

```css
/* Custom CSS */
.my-custom-editor .cm-editor {
  border-radius: 12px !important;
  border: 2px solid #667eea !important;
}
```

### 5. Target CodeMirror Classes Directly

For advanced customization, target CodeMirror's built-in classes:

```css
.expression-editor .cm-editor {
  border-radius: 20px !important;
  background: linear-gradient(135deg, #667eea, #764ba2) !important;
}

.expression-editor .cm-content {
  color: white !important;
  font-weight: bold !important;
}

.expression-editor .cm-cursor {
  border-left-color: #ffd700 !important;
}
```

## Border Radius Examples

### Default (4px)

```tsx
<ExpressionEditor value={expr} onChange={setExpr} />
```

### Via CSS Variable

```tsx
<div style={{ '--expr-editor-radius': '12px' }}>
  <ExpressionEditor value={expr} onChange={setExpr} />
</div>
```

### Via Theme Prop

```tsx
<ExpressionEditor
  value={expr}
  onChange={setExpr}
  theme={{ border: { radius: '16px' } }}
/>
```

### Via Inline Style

```tsx
<ExpressionEditor
  value={expr}
  onChange={setExpr}
  style={{ borderRadius: '20px' }}
/>
```

### Via Tailwind Classes

```tsx
// Setup (in your CSS or component)
<style>{`
  .rounded-xl .cm-editor {
    border-radius: 0.75rem !important;
  }
  .rounded-full .cm-editor {
    border-radius: 9999px !important;
  }
`}</style>

<ExpressionEditor
  value={expr}
  onChange={setExpr}
  className="rounded-xl"
/>
```

## Preset Themes

Import and use preset themes:

```tsx
import { 
  ExpressionEditor, 
  darkTheme,    // Dark theme
  lightTheme,   // Light theme  
  n8nTheme      // n8n branded theme
} from '@n8n/react-expression-editor';

<ExpressionEditor theme={darkTheme} />
<ExpressionEditor theme={lightTheme} />
<ExpressionEditor theme={n8nTheme} />
```

## Class Names for Targeting

```typescript
import { EDITOR_CLASS_NAMES } from '@n8n/react-expression-editor';

// Available constants:
EDITOR_CLASS_NAMES.ROOT              // 'expression-editor'
EDITOR_CLASS_NAMES.INPUT             // 'expression-editor__input'
EDITOR_CLASS_NAMES.AUTOCOMPLETE      // 'cm-tooltip-autocomplete'
EDITOR_CLASS_NAMES.AUTOCOMPLETE_ITEM // 'cm-completionLabel'
```

## Common CodeMirror Classes

Target these for fine-grained control:

```css
.cm-editor          /* Main editor container */
.cm-content         /* Content area */
.cm-line            /* Individual lines */
.cm-cursor          /* Cursor */
.cm-focused         /* When editor has focus */
.cm-scroller        /* Scrollable area */
```

## Priority Order

When multiple styling methods are used, this is the priority (highest to lowest):

1. CSS Variables (`--expr-editor-*`)
2. Inline `style` prop
3. `className` with `!important`
4. `theme` prop
5. Default theme

## Best Practices

### Use CSS Variables for Global Theming

```tsx
// App wrapper
<div style={{ 
  '--expr-editor-bg': '#1a202c',
  '--expr-editor-text': '#e2e8f0',
  '--expr-editor-radius': '8px'
}}>
  <App />
</div>
```

All editors inherit these values!

### Use Theme Prop for Instance-Level Theming

```tsx
<ExpressionEditor theme={darkTheme} />
<ExpressionEditor theme={lightTheme} />
```

### Use className for Utility Classes

```tsx
<ExpressionEditor className="rounded-lg shadow-md" />
```

### Use style Prop for One-Off Customizations

```tsx
<ExpressionEditor style={{ borderRadius: '24px' }} />
```

## Complete Example

```tsx
import { ExpressionEditor, darkTheme } from '@n8n/react-expression-editor';

function App() {
  return (
    <div style={{ 
      // Global CSS variables
      '--expr-editor-radius': '12px'
    }}>
      {/* Preset theme */}
      <ExpressionEditor theme={darkTheme} />
      
      {/* Custom theme */}
      <ExpressionEditor
        theme={{
          colors: { primary: '#ff6d4d' },
          border: { radius: '16px' }
        }}
      />
      
      {/* Tailwind classes */}
      <ExpressionEditor className="rounded-xl shadow-lg" />
      
      {/* Inline style */}
      <ExpressionEditor style={{ borderRadius: '20px' }} />
    </div>
  );
}
```

## See Examples

Visit http://localhost:3000 → **🎨 Themed Examples** to see all styling methods in action!

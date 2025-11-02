# n8n Expression Playground - Standalone

A fully standalone Vue 3 application showcasing the n8n Expression Editor with all features:

- ✅ Multiple editor variants (inline, multiline, readonly, large)
- ✅ Custom autocomplete with nested data structures
- ✅ Drag & drop variables from sidebar
- ✅ Example expressions library
- ✅ Live output preview
- ✅ Dark theme styling

## Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

The playground will be available at **http://localhost:3000**

## Features

### Editor Types
- **Inline**: Compact single-line editor
- **Multiline**: Full-featured editor with 5 rows
- **Complex**: For advanced expressions
- **Readonly**: Display-only mode
- **Large**: 10-row text area for complex code

### Autocomplete
Type `{{ $` to see all available variables. The editor supports nested property completion:
- `$json.` - Access current item data
- `$input.` - Input node data
- `$prevNode.` - Previous node output
- `$execution.` - Execution metadata
- `$workflow.` - Workflow properties
- `$vars.` - Environment variables

### Drag & Drop
Drag variables from the left sidebar directly into any editor.

## Project Structure

```
src/
├── main.ts                    # App entry point
├── App.vue                    # Root component
├── pages/
│   └── ExpressionPlayground.vue  # Main playground page
├── components/
│   ├── StandaloneExpressionEditor.vue  # Custom editor with autocomplete
│   └── customAutocomplete.ts           # Autocomplete logic
├── lib/
│   ├── codemirror-plugins/    # All CodeMirror extensions
│   ├── composables/           # Vue composables
│   └── theme/                 # Editor theme
├── types/                     # TypeScript types
└── styles/                    # CSS variables & styles
```

## Technologies

- Vue 3 (Composition API with `<script setup>`)
- TypeScript
- CodeMirror 6
- Vite

## License

Same as n8n

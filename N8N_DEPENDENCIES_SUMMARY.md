# N8N Dependencies - Quick Reference

## At a Glance

The CodemMirror plugins have **deep, tightly-coupled n8n dependencies** that are core to functionality:

```
    175+ i18n keys      3 store functions      2 package imports
    (hardcoded)         (tightly coupled)      (type definitions)
        |                    |                       |
        v                    v                       v
    [Completions]     [Workflow Context]      [Type System]
```

## The 3 N8N Store Hooks

All located in `/src/lib/stores.ts` - currently stubbed but unused:

### 1. useNDVStore() - Node Details View
- **Provides:** Node editing context  
- **Used by:** completions/utils.ts (6x), dragAndDrop.ts (1x), typescript/client/useTypescript.ts (2x)
- **Critical?** YES - controls expression resolution and pagination detection
- **Can remove?** NO - core to completion logic

```typescript
// Example usage in completions/utils.ts
const ndvStore = useNDVStore();
const inputData = ndvStore.isInputParentOfActiveNode
  ? { targetItem: ndvStore.expressionTargetItem, ... }
  : {};
```

### 2. useWorkflowsStore() - Workflow Structure
- **Provides:** Node relationships, workflow structure
- **Used by:** completions/utils.ts (5x)
- **Critical?** YES - determines available nodes for completions
- **Can remove?** NO - core to completion filtering

```typescript
// Example usage in completions/utils.ts
useWorkflowsStore().getNodeByName(nodeName);
useWorkflowsStore().workflowObject.getParentNodesByDepth(nodeName);
```

### 3. useExternalSecretsStore() - Feature Flag
- **Provides:** Enterprise secrets feature flag
- **Used by:** dollar.completions.ts (1x)
- **Critical?** NO - only conditional rendering
- **Can remove?** MAYBE - could default to false

```typescript
// Example usage in dollar.completions.ts
return useExternalSecretsStore().isEnterpriseExternalSecretsEnabled
  ? [{ label: '$vars', ... }, { label: '$secrets', ... }]
  : [];
```

## The i18n Problem

**175+ hardcoded i18n keys** throughout completions:

```
File                    | Keys  | Example
------------------------|-------|----------------------------------
constants.ts            | 50+   | 'codeNodeEditor.completer.$json'
luxon.static.docs.ts    | 400+  | 'codeNodeEditor.completer.luxon...'
luxon.instance.docs.ts  | 300+  | 'codeNodeEditor.completer.luxon...'
dollar.completions.ts   | 7     | 'codeNodeEditor.completer.$vars'
infoBoxRenderer.ts      | 5     | 'codeNodeEditor.optional'
nonDollar.completions.ts| 3     | 'codeNodeEditor.completer.dateTime'
nativesAutocompleteDocs/| 100+  | Various Luxon methods
```

**Current stub:** Just returns the key as string:
```typescript
export const i18n = {
  baseText: (key: string) => key,  // Returns key, not translation!
};
```

**Impact:** UI shows translation keys instead of readable labels!

## Type Definition Issues

### Missing Types
- `TargetNodeParameterContext` - Used in 5 files, not defined
- `Schema` - Used in 2 files, not defined  
- `TargetItem` - Used in expressions.ts, not defined

### Partially Defined
- `DocMetadata` - Defined locally but also imported from 'n8n-workflow'
- `Basic` - Defined locally but also imported from '@/Interface'

## File-by-File Impact

```
CRITICAL (can't work without):
├─ completions/utils.ts          [useNDVStore, useWorkflowsStore]
├─ completions/constants.ts      [50+ i18n keys]
└─ completions/dollar.completions.ts [7 i18n keys, 1 store]

HIGH IMPACT (significant functionality):
├─ completions/infoBoxRenderer.ts [5 i18n keys]
├─ dragAndDrop.ts                [useNDVStore]
└─ typescript/client/useTypescript.ts [useNDVStore, useWorkflowsStore]

MEDIUM IMPACT (can degrade gracefully):
├─ completions/nativesAutocompleteDocs/*.ts [100+ i18n keys]
└─ completions/nonDollar.completions.ts [3 i18n keys]
```

## The Core Problem

This library was **directly extracted from n8n** without abstraction:

1. ✅ Files copied as-is
2. ✅ Stubs created for stores
3. ❌ **NO abstraction layer**
4. ❌ **NO dependency injection**  
5. ❌ **NO configuration system**

Result: **This is an n8n-specific library, not a standalone one.**

## Quick Decision Matrix

| Goal | Can Achieve | Effort | Impact |
|------|-----------|--------|--------|
| **Standalone lib** | YES | 6-8 hours | Refactor dependencies into abstractions |
| **N8N integration** | YES | 2-3 hours | Complete stubs + define types |
| **Minimal working** | YES | 4-5 hours | Remove i18n, simplify stores |
| **Current state** | NO | N/A | Broken with incomplete stubs |

## What Needs To Change

### For Standalone Library:
1. Abstract stores into context/config object
2. Make i18n pluggable with default implementation
3. Define all missing type definitions
4. Remove n8n-workflow package imports

### For N8N Library:
1. Complete all store stub implementations  
2. Add proper type definitions
3. Document n8n-specific features
4. Connect to actual n8n stores

## File Locations

- Analysis document: `/N8N_DEPENDENCIES_ANALYSIS.md`
- Store stubs: `/src/lib/stores.ts`
- I18N stub: `/src/lib/i18n.ts`
- Type definitions: `/src/types/`
- Main problem files:
  - `/src/lib/codemirror-plugins/completions/utils.ts`
  - `/src/lib/codemirror-plugins/completions/constants.ts`
  - `/src/lib/codemirror-plugins/completions/dollar.completions.ts`

---

**Status:** Library requires 6-8 hour refactor OR acceptance as n8n-specific tool.


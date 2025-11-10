# N8N Dependency Graph

## Visual Dependency Map

```
┌─────────────────────────────────────────────────────────────┐
│           CodemirrorPlugins & Completions System            │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                v             v             v
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │  i18n Keys   │ │  Store Hooks │ │  Type System │
        │  (175+)      │ │  (3 stores)  │ │  (imports)   │
        └──────────────┘ └──────────────┘ └──────────────┘
                │             │                    │
                │             ├────────┬───────┐   │
                │             │        │       │   │
                v             v        v       v   v
            [UI Text]   [useNDV] [useWF] [useSec] [Types]
```

## Dependency Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Top Level: ExpressionEditor Component                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            v
        ┌───────────────────────────────────────┐
        │ useExpressionEditor Hook              │
        │ (initializes CodeMirror)              │
        └───────────────────────────────────────┘
                            │
                            v
        ┌───────────────────────────────────────┐
        │ CodeMirror Extensions & Plugins       │
        └───────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            v               v               v
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │ Completions  │ │ Drag & Drop  │ │ Syntax Highlight
    │ (utils.ts)   │ │ (dragAndDrop)│ │ (n8nLang.ts)
    └──────────────┘ └──────────────┘ └──────────────┘
            │               │
            │               v
            │       ┌─────────────────┐
            │       │ useNDVStore     │
            │       │ (node context)  │
            │       └─────────────────┘
            │
            v
    ┌──────────────────────────────────┐
    │ dollarCompletions()              │
    │ ├─ i18n.baseText() [7 keys]      │
    │ ├─ useExternalSecretsStore()     │
    │ ├─ isInHttpNodePagination()      │
    │ └─ autocompletableNodeNames()    │
    └──────────────────────────────────┘
            │
            v
    ┌──────────────────────────────────┐
    │ constants.ts                      │
    │ ├─ ROOT_DOLLAR_COMPLETIONS       │
    │ │  └─ 50+ i18n.baseText() calls  │
    │ ├─ CompletionSections            │
    │ │  └─ 8 more i18n calls          │
    │ └─ COMPLETION_SECTIONS           │
    │    └─ 10+ i18n.baseText() calls  │
    └──────────────────────────────────┘
            │
            v
    ┌──────────────────────────────────┐
    │ createInfoBoxRenderer()          │
    │ ├─ i18n.baseText() [5 calls]     │
    │ └─ Doc Metadata Rendering        │
    └──────────────────────────────────┘
```

## File Dependency Tree

```
src/lib/codemirror-plugins/
│
├─ completions/
│  ├─ dollar.completions.ts
│  │  ├─ imports: i18n [7x]
│  │  ├─ imports: useExternalSecretsStore [1x]
│  │  ├─ uses: isInHttpNodePagination()
│  │  ├─ uses: autocompletableNodeNames()
│  │  └─ uses: createInfoBoxRenderer()
│  │
│  ├─ utils.ts [CRITICAL HUB]
│  │  ├─ imports: useNDVStore [3x]
│  │  ├─ imports: useWorkflowsStore [5x]
│  │  ├─ exports: resolveAutocompleteExpression()
│  │  ├─ exports: autocompletableNodeNames()
│  │  ├─ exports: hasActiveNode()
│  │  └─ exports: isInHttpNodePagination()
│  │
│  ├─ constants.ts [CRITICAL]
│  │  └─ imports: i18n [50+ keys]
│  │
│  ├─ infoBoxRenderer.ts
│  │  └─ imports: i18n [5x]
│  │
│  ├─ nonDollar.completions.ts
│  │  └─ imports: i18n [3x]
│  │
│  └─ nativesAutocompleteDocs/
│     ├─ luxon.static.docs.ts
│     │  └─ imports: i18n [400+ keys]
│     └─ luxon.instance.docs.ts
│        └─ imports: i18n [300+ keys]
│
├─ dragAndDrop.ts
│  └─ imports: useNDVStore [1x in class]
│
└─ typescript/
   └─ client/
      └─ useTypescript.ts
         ├─ imports: useNDVStore [2x]
         └─ imports: useWorkflowsStore [1x]
```

## Store Usage Heat Map

```
Store Function              Used In                     Usage Count  Criticality
────────────────────────────────────────────────────────────────────────────────
useNDVStore():
  - activeNode              utils.ts, useTypescript.ts      2×       HIGH
  - isInputParentOfActiveNode utils.ts                      1×       CRITICAL
  - expressionTargetItem    utils.ts                        1×       CRITICAL
  - ndvInput*               utils.ts                        3×       CRITICAL
  - isDraggableDragging     dragAndDrop.ts                  1×       MEDIUM
  Total: 8 usages across 4 files

useWorkflowsStore():
  - getNodeByName()         utils.ts, useTypescript.ts      2×       CRITICAL
  - workflow.nodes          utils.ts                        1×       HIGH
  - workflowObject.*        utils.ts                        2×       CRITICAL
  Total: 5 usages across 2 files

useExternalSecretsStore():
  - isEnterpriseExternalSecretsEnabled  dollar.completions.ts  1×   MEDIUM
  Total: 1 usage in 1 file
```

## I18N Key Distribution

```
File                          Total Keys    Pattern
──────────────────────────────────────────────────────────
luxon.static.docs.ts          ~400          'codeNodeEditor.completer.luxon...'
luxon.instance.docs.ts        ~300          'codeNodeEditor.completer.luxon...'
constants.ts                  ~50           'codeNodeEditor.completer.*'
nativesAutocompleteDocs/*     Variable      'codeNodeEditor.completer.*'
dollar.completions.ts         7             'codeNodeEditor.completer.$*'
infoBoxRenderer.ts            5             'codeNodeEditor.*'
nonDollar.completions.ts      3             'codeNodeEditor.completer.*'
utils.test.ts                 ~15           Various

TOTAL: ~775+ i18n keys hardcoded across 7 files
```

## Dependency Coupling Strength

```
                     Coupling Analysis
        ┌────────────────────────────────────┐
        │   Tightness  │  Abstraction Level │
        ├──────────────┼────────────────────┤
Store Dependencies:
  useNDVStore        │ ██████████ TIGHT    │ ❌ None
  useWorkflowsStore  │ ██████████ TIGHT    │ ❌ None
  useExtSecStore     │ ███░░░░░░░ LOOSE    │ ⚠️  Minimal
                     
Type Dependencies:
  n8n-workflow       │ ████░░░░░░ MEDIUM   │ ⚠️  Partial
  @/Interface        │ ████░░░░░░ MEDIUM   │ ⚠️  Partial
  
I18N Dependencies:
  hardcoded keys     │ ██████░░░░ TIGHT    │ ❌ None

Other:
  resolveParameter   │ ███░░░░░░░ LOOSE    │ ⚠️  Stub exists
```

## Resolution Path Analysis

```
User Input
    │
    v
[CodeMirror Editor]
    │
    ├─── Need Completions?
    │        │
    │        v
    │    dollarCompletions()
    │        │
    │        ├─── Check Secrets?
    │        │   │
    │        │   └─ useExternalSecretsStore()
    │        │
    │        ├─── Check Node Active?
    │        │   │
    │        │   ├─ hasActiveNode() 
    │        │   │   │
    │        │   │   ├─ useNDVStore()
    │        │   │   └─ useWorkflowsStore()
    │        │   │
    │        │   └─ getAvailableNodes()
    │        │       │
    │        │       └─ autocompletableNodeNames()
    │        │           │
    │        │           ├─ useNDVStore()
    │        │           └─ useWorkflowsStore()
    │        │
    │        └─── Render Completions
    │            │
    │            ├─ Get Labels (constants.ts)
    │            │  │
    │            │  └─ i18n.baseText() [50+ keys]
    │            │
    │            └─ Create Info Boxes
    │               │
    │               └─ i18n.baseText() [5 keys]
    │
    └─── Render Editor
        │
        └─ Syntax Highlighting
           │
           └─ n8nLang.ts [no n8n deps]
```

## Abstraction Opportunities

```
Current:
┌──────────────────────────────────┐
│  Plugin Code                     │
│  (completions, dragAndDrop, etc) │
└──────────────────────────────────┘
         │      │      │
         v      v      v
    [Stores] [i18n] [Types]
    (tightly coupled)

Recommended:
┌──────────────────────────────────┐
│  Plugin Code                     │
│  (completions, dragAndDrop, etc) │
└──────────────────────────────────┘
         │
         v
┌──────────────────────────────────┐
│  Abstraction Layer               │
│  (IExpressionContext interface)  │
└──────────────────────────────────┘
         │      │      │
         v      v      v
    [Config] [i18n] [Types]
    (loosely coupled)
         │      │      │
         v      v      v
    [n8n   ] [Locale] [Defs]
    Stores   Keys    itions
```

---

**Legend:**
- `✅` = Fully implemented
- `⚠️` = Partially stubbed  
- `❌` = Missing/Not abstracted


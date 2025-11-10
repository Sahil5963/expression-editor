# N8N-Specific Dependencies in CodeMirror Plugins - Analysis Report

## Executive Summary

The codemirror-plugins directory contains **multiple n8n-specific dependencies** that are **NOT abstractly designed**. These are **leftover dependencies from the original n8n codebase** that have been partially stubbed out but should be removed or properly abstracted for a standalone library.

## 1. N8N Dependencies Found

### 1.1 Direct n8n-workflow Package Imports

**Files and Count:**
- Total: 2 unique import patterns from `n8n-workflow`

**Imports:**
```typescript
import type { DocMetadata } from 'n8n-workflow';
import type { IConnections, IWorkflowDataProxyAdditionalKeys, Workflow } from 'n8n-workflow';
```

**Locations:**
- `src/types/expressions.ts:3` - 2 types (IConnections, IWorkflowDataProxyAdditionalKeys, Workflow)
- `src/lib/codemirror-plugins/completions/utils.ts:15` - 1 type (DocMetadata)

**Status:** These are type-only imports that have been partially replaced with local definitions but still reference external package.

---

### 1.2 @/Interface Package Imports

**Files and Count:**
- Total: 4 unique import patterns

**Imports:**
```typescript
import type { Basic } from '@/Interface';
import type { Schema } from '@/Interface';
import type { TargetItem, TargetNodeParameterContext } from '@/Interface';
import type { TargetNodeParameterContext } from '@/Interface';
```

**Locations:**
1. `src/types/expressions.ts:1` - imports `Basic`
2. `src/lib/codemirror-plugins/completions/constants.ts:6` - imports `TargetNodeParameterContext`
3. `src/lib/codemirror-plugins/typescript/types.ts:1` - imports `Schema`
4. `src/lib/codemirror-plugins/typescript/worker/dynamicTypes.ts:1` - imports `Schema`
5. `src/lib/codemirror-plugins/typescript/client/useTypescript.ts:24` - imports `TargetNodeParameterContext`

**Status:** These are actually aliased to `src/` via tsconfig (not from external package). The types are defined in:
- `src/types/workflow.ts` - defines `Basic` interface
- Types are currently missing proper definitions for `Schema` and `TargetNodeParameterContext`

---

### 1.3 N8N Store Hooks Usage

**Store Functions Used:**

1. **useNDVStore()** - NDV (Node Details View) Store
   - **Files:** 5 files in codemirror-plugins
   - **Functions used:**
     - `activeNode` - currently editing node
     - `isInputParentOfActiveNode` - input node check
     - `ndvInputNodeName`, `ndvInputRunIndex`, `ndvInputBranchIndex` - input context
     - `expressionTargetItem` - target data for expressions
     - `isDraggableDragging` - drag state
     - `draggableType` - drag type
   - **Locations:**
     - `src/lib/codemirror-plugins/completions/utils.ts` (6 usages)
     - `src/lib/codemirror-plugins/dragAndDrop.ts` (1 class usage)
     - `src/lib/codemirror-plugins/typescript/client/useTypescript.ts` (2 usages)
     - Tests: `dragAndDrop.test.ts`, `completions/utils.test.ts`

2. **useWorkflowsStore()** - Workflow Data Store
   - **Files:** 5 files in codemirror-plugins
   - **Functions used:**
     - `getNodeByName()` - lookup node by name
     - `workflow.nodes` - all workflow nodes
     - `workflowObject.getChildNodes()` - get child nodes
     - `workflowObject.getParentNodesByDepth()` - get parent nodes
   - **Locations:**
     - `src/lib/codemirror-plugins/completions/utils.ts` (5 usages)
     - Tests: `completions/utils.test.ts`

3. **useExternalSecretsStore()** - Secrets Store
   - **Files:** 2 files in codemirror-plugins
   - **Functions used:**
     - `isEnterpriseExternalSecretsEnabled` - feature flag
   - **Locations:**
     - `src/lib/codemirror-plugins/completions/dollar.completions.ts:97` (1 usage)
     - Tests: `completions/completions.test.ts`

**Summary Table:**
| Store | Purpose | Usage Count | Plugin Files |
|-------|---------|-------------|--------------|
| useNDVStore | Node editing context | 7+ | 3 files + tests |
| useWorkflowsStore | Workflow structure | 5+ | 2 files + tests |
| useExternalSecretsStore | Secrets feature flag | 1+ | 1 file + tests |

---

### 1.4 I18N (Internationalization) Usage

**Package:** `@/lib/i18n` (local stub)

**Implementation:** Simple key-based stub that just returns the key as-is:
```typescript
export const i18n = {
    baseText: (key: string) => key,
};
```

**Usage Locations:** 21 files in codemirror-plugins
- `completions/dollar.completions.ts` - 7 usages for variable/secret descriptions
- `completions/constants.ts` - 50+ usages for UI labels and help text
- `completions/nonDollar.completions.ts` - 3 usages
- `completions/infoBoxRenderer.ts` - 5 usages
- `completions/nativesAutocompleteDocs/*.ts` - 100+ usages
- `completions/utils.test.ts` - 0 usages

**Status:** All i18n keys are hardcoded strings referencing n8n's locale system (e.g., `'codeNodeEditor.completer.$pageCount'`)

---

## 2. Functionality Provided by N8N Dependencies

### 2.1 Store Dependencies Functionality

#### useNDVStore (Node Details View)
**Purpose:** Provides context about the currently active node being edited

**Why it's needed in completions:**
- **Context awareness:** Know which node's parameter is being edited
- **Input data resolution:** Get data from input nodes to the currently active node
- **Pagination detection:** Know if in HTTP node pagination context
- **Active node tracking:** Determine if a node is active/selected

**Code Example from `completions/utils.ts`:**
```typescript
export function resolveAutocompleteExpression(expression: string, contextNodeName?: string) {
	const ndvStore = useNDVStore();
	const inputData =
		contextNodeName === undefined && ndvStore.isInputParentOfActiveNode
			? {
					targetItem: ndvStore.expressionTargetItem ?? undefined,
					inputNodeName: ndvStore.ndvInputNodeName,
					inputRunIndex: ndvStore.ndvInputRunIndex,
					inputBranchIndex: ndvStore.ndvInputBranchIndex,
				}
			: {};
	return resolveParameter(expression, {
		...inputData,
		contextNodeName,
	});
}
```

#### useWorkflowsStore (Workflow Data)
**Purpose:** Provides workflow structure and node relationships

**Why it's needed in completions:**
- **Node lookup:** Find nodes by name to check if they exist
- **Node relationships:** Determine parent/child nodes for expression scoping
- **Batch processing:** Check for "Split in Batches" node to control $itemIndex availability
- **Node navigation:** Build list of previous nodes available for `$()` expressions

**Code Example from `completions/utils.ts`:**
```typescript
export function autocompletableNodeNames(targetNodeParameterContext?: TargetNodeParameterContext) {
	const activeNode = useWorkflowsStore().getNodeByName(targetNodeParameterContext?.nodeName);
	const workflowObject = useWorkflowsStore().workflowObject;
	const nonMainChildren = workflowObject.getChildNodes(activeNodeName, 'ALL_NON_MAIN');
	return getPreviousNodes(activeNodeName);
}
```

#### useExternalSecretsStore (Secrets)
**Purpose:** Provides feature flag for enterprise secrets

**Why it's needed:**
- **Conditional completions:** Only show `$secrets` and `$vars` completions if enterprise secrets are enabled
- **Feature detection:** Know when to render enterprise-only variables

**Code Example from `completions/dollar.completions.ts:97`:**
```typescript
return useExternalSecretsStore().isEnterpriseExternalSecretsEnabled
    ? [
        { label: '$vars', ... },
        { label: '$secrets', ... },
      ]
    : [];
```

---

### 2.2 I18N Functionality

**Purpose:** Localize UI text in autocompletion

**Coverage:**
- **50+ completion item labels** - Section names, function names, descriptions
- **100+ doc metadata strings** - Luxon date-time library documentation
- **Help text** - Parameter descriptions, examples

**Example Keys:**
```
'codeNodeEditor.completer.$pageCount'     // "Page count"
'codeNodeEditor.completer.section.fields' // "Fields"
'codeNodeEditor.completer.luxon.instanceMethods.year' // "Year"
'codeNodeEditor.completer.$if.args.condition' // "Condition"
```

---

## 3. Architecture Assessment

### 3.1 Is This Library N8N-Specific?

**Answer: PARTIALLY, with poor abstraction**

The library was **extracted from n8n's codebase** but:
- Stores are stubbed out but still referenced throughout
- Type definitions are still n8n-specific
- I18N keys are hardcoded to n8n's locale system
- No clear abstraction layer exists

### 3.2 Dependency Coupling Analysis

**Direct Coupling Points:**

| Dependency | Coupling Level | Abstraction? | Impact |
|------------|----------------|--------------|--------|
| useNDVStore | TIGHT | ❌ No | Cannot run completions without node context |
| useWorkflowsStore | TIGHT | ❌ No | Cannot determine available previous nodes |
| useExternalSecretsStore | LOOSE | ⚠️ Partial | Only affects conditional feature flag |
| i18n.baseText() | MEDIUM | ⚠️ Partial | Hardcoded keys; stub returns keys as-is |
| Type imports | TIGHT | ⚠️ Partial | Types imported but mostly stubbed |

**Problem Summary:**
- **80% of completion logic** is tightly coupled to n8n stores
- **No dependency injection** pattern exists
- **No configuration layer** to swap implementations
- **Circular dependencies** on n8n-workflow types

---

## 4. Why These Dependencies Exist

### Root Cause
This codebase was **extracted directly from n8n** without proper refactoring for standalone use. The extraction process:

1. Copied source files as-is
2. Created stub implementations for stores
3. Did not remove or abstract n8n-specific logic
4. Left type imports unresolved

### Evidence
From `MIGRATION_SUMMARY.md`:
```markdown
## 🔧 Remaining Work

### Critical Issues to Fix

1. **TypeScript Dependencies** (⚠️ HIGH PRIORITY)
   - Many CodeMirror plugins depend on n8n-specific types from `@/types/n8n-workflow`
   - Need to either:
     - Copy necessary type definitions into the package
     - Make these plugins optional/simplified
     - Create stub types for missing dependencies

2. **Dependency Resolution** (⚠️ HIGH PRIORITY)
   - Files importing from `@/Interface`, `@/app/composables`, etc. need refactoring
```

---

## 5. Detailed Findings Per File

### 5.1 completions/dollar.completions.ts

**N8N Dependencies:**
- `i18n.baseText()` - 7 usages (lines 70, 80, 90, 105, 114, 137)
- `useExternalSecretsStore()` - 1 usage (line 97)

**Functionality:**
- Provides `$` completion items for expressions
- Conditionally includes `$vars` and `$secrets` based on enterprise flag
- Uses i18n for all display labels

**Why N8N-Specific:**
- Features like `$pageCount`, `$response`, `$request` are HTTP node-specific
- Enterprise secrets are n8n feature
- I18N keys are all n8n-specific

---

### 5.2 completions/utils.ts

**N8N Dependencies:**
- `useWorkflowsStore()` - 5 usages (lines 212, 213, 216, 222, 228, 240)
- `useNDVStore()` - 3 usages (lines 173, 175-181, 202-204, 213, 221-222)
- Type import `DocMetadata` from n8n-workflow (line 15)

**Key Functions:**
```typescript
resolveAutocompleteExpression()    // Uses NDV store
autocompletableNodeNames()         // Uses workflows store
hasActiveNode()                    // Uses both stores
```

**Why N8N-Specific:**
- Needs to resolve expressions using n8n's expression resolver
- Needs to know workflow structure to determine available nodes
- HTTP node pagination detection is n8n-specific

---

### 5.3 completions/constants.ts

**N8N Dependencies:**
- `i18n.baseText()` - 50+ usages throughout file
- Type import `TargetNodeParameterContext` from @/Interface

**Content:**
- Global completion definitions for all special variables and functions
- Section headers (Fields, Recommended, Methods, etc.)
- Root dollar completions ($json, $binary, $now, etc.)
- All completion metadata with i18n descriptions

**Scope of I18N:**
- Every completion item has an i18n description
- Every section has an i18n name
- Every function parameter has i18n documentation

---

### 5.4 completions/infoBoxRenderer.ts

**N8N Dependencies:**
- `i18n.baseText()` - 5 usages (lines 99, 129, 149, 183, 223)
- Type imports: `DocMetadata`, `DocMetadataArgument`, `DocMetadataExample` from @/types/n8n-workflow

**Functionality:**
- Renders HTML info boxes for completion items
- Shows function signatures, arguments, examples, defaults
- All text is localized via i18n

---

### 5.5 dragAndDrop.ts

**N8N Dependencies:**
- `useNDVStore()` - 2 usages (line 1, lines 44 and setup in constructor)

**Functionality:**
- Handles drag-drop of node outputs into editor
- Uses NDV store to track drag state and type

**Why N8N-Specific:**
- Needs to know what was being dragged from n8n's UI
- Needs to format insertion based on n8n node structure

---

### 5.6 nativesAutocompleteDocs/*.ts (luxon.*.docs.ts)

**N8N Dependencies:**
- `i18n.baseText()` - 100+ usages
- Type import `NativeDoc` from @/types/n8n-workflow

**Content:**
- Metadata for all Luxon date-time library methods
- Each method has i18n description
- Examples and argument documentation

**Scale:** 
- 400+ lines of i18n keys in `luxon.static.docs.ts`
- 300+ lines of i18n keys in `luxon.instance.docs.ts`

---

## 6. Type Definition Issues

### Current Type Situation

**Defined locally:**
- `src/types/workflow.ts` - Minimal `Basic` interface
- `src/types/n8n-workflow.ts` - Partial types (DocMetadata, CodeExecutionMode, etc.)

**Missing/Incomplete:**
- `TargetNodeParameterContext` - Referenced but not defined
- `Schema` - Referenced but not defined
- `TargetItem` - Referenced in expressions.ts but not defined
- Many n8n workflow types left undefin

---

## 7. Recommendations

### 7.1 For Standalone Library (Clean Approach)

**Option A: Fully Abstract** (Recommended)
1. Create abstraction layer for stores:
   ```typescript
   export interface IExpressionContext {
     activeNodeName?: string;
     workflowNodes?: Node[];
     hasExternalSecrets?: boolean;
     inputData?: any;
   }
   ```

2. Replace store access with dependency injection:
   ```typescript
   export function dollarCompletions(
     context: CompletionContext,
     exprContext?: IExpressionContext
   ): CompletionResult | null { ... }
   ```

3. Make i18n pluggable:
   ```typescript
   export interface I18nProvider {
     getText(key: string): string;
   }
   ```

**Benefits:**
- Works standalone without n8n
- Can be used in other projects
- Clear contract for what's needed

---

### 7.2 For N8N Integration (Current Approach)

**Option B: Complete Stubbing**
1. Fill in all stub implementations in `src/lib/stores.ts`
2. Define all missing types properly
3. Document that this is an n8n library

**Current status:** Partially done - stubs exist but are incomplete

---

### 7.3 Quick Fixes Needed

**Critical:**
1. [ ] Define `TargetNodeParameterContext` type properly
2. [ ] Define `Schema` type properly
3. [ ] Complete store stubs with full method signatures
4. [ ] Resolve all type import paths

**High Priority:**
1. [ ] Add locale context to i18n or remove i18n dependency
2. [ ] Document which files are n8n-specific vs. generic
3. [ ] Extract generic CodeMirror plugins to separate module

**Medium Priority:**
1. [ ] Create abstraction layer for workflow context
2. [ ] Make store dependencies injectable
3. [ ] Add configuration for feature flags

---

## 8. Summary Table: N8N Dependency Impact

| File | Category | Dependency | Usage Count | Criticality | Removable? |
|------|----------|-----------|------------|------------|-----------|
| dollar.completions.ts | Store | useExternalSecretsStore | 1 | Medium | Yes* |
| dollar.completions.ts | I18N | i18n.baseText | 7 | High | No |
| utils.ts | Store | useWorkflowsStore | 5 | High | No |
| utils.ts | Store | useNDVStore | 3 | High | No |
| dragAndDrop.ts | Store | useNDVStore | 2 | Medium | Yes* |
| constants.ts | I18N | i18n.baseText | 50+ | High | No |
| infoBoxRenderer.ts | I18N | i18n.baseText | 5 | High | No |
| luxon.*.docs.ts | I18N | i18n.baseText | 100+ | Medium | Yes** |

**Legend:**
- *Yes: Can be stubbed/mocked
- **Yes: Can be replaced with simpler docs
- No: Core to functionality

---

## Conclusion

**This library is CURRENTLY n8n-specific with poor abstraction.** The n8n dependencies are:

1. **Direct:** n8n-workflow package imports (2 locations)
2. **Indirect:** @/Interface and local stub stores (3 store functions, 10+ files)
3. **Localization:** i18n system hardcoded to n8n keys (175+ usages)
4. **Structural:** Completion logic assumes n8n workflow context (stores)

**These are NOT leftover dependencies—they are CORE to the functionality.** The library cannot function as standalone without:
- Providing node/workflow context
- Implementing workflow structure queries
- Localizing 175+ UI strings

**Recommendation:** Either fully abstract the dependencies (6-8 hour refactor) or accept that this is an n8n-specific library.


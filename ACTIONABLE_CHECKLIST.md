# Actionable Checklist: N8N Dependencies Resolution

## Quick Summary

You have **3 n8n store hooks** and **775+ i18n keys** deeply embedded in the codemirror plugins. These are **core to functionality**, not leftover dependencies.

Choose your path below:

---

## Path A: Make It Standalone (RECOMMENDED)
**Effort:** 6-8 hours | **Result:** Works anywhere | **Complexity:** Medium

### Phase 1: Abstraction Layer (2-3 hours)

- [ ] Create `src/lib/expressionContext.ts`:
  ```typescript
  export interface IExpressionContext {
    activeNodeName?: string;
    workflowNodes: WorkflowNode[];
    hasExternalSecrets: boolean;
    inputData?: any;
    getNodeByName(name: string): WorkflowNode | null;
    getParentNodes(nodeName: string): WorkflowNode[];
    getChildNodes(nodeName: string): WorkflowNode[];
  }
  
  export const defaultExpressionContext: IExpressionContext = {
    workflowNodes: [],
    hasExternalSecrets: false,
    getNodeByName: () => null,
    getParentNodes: () => [],
    getChildNodes: () => [],
  };
  ```

- [ ] Create `src/lib/i18nProvider.ts`:
  ```typescript
  export interface I18nProvider {
    getText(key: string): string;
  }
  
  export const defaultI18nProvider: I18nProvider = {
    getText: (key: string) => {
      // Extract last part of key as fallback
      return key.split('.').pop() || key;
    }
  };
  ```

- [ ] Update `src/lib/codemirror-plugins/completions/utils.ts`:
  - Replace all `useNDVStore()` calls with context parameter
  - Replace all `useWorkflowsStore()` calls with context parameter
  - Update function signatures:
    ```typescript
    export function resolveAutocompleteExpression(
      expression: string,
      contextNodeName?: string,
      exprContext?: IExpressionContext
    )
    ```

### Phase 2: Update I18N System (1-2 hours)

- [ ] Modify `src/lib/i18n.ts` to accept provider:
  ```typescript
  let i18nProvider: I18nProvider = defaultI18nProvider;
  
  export function setI18nProvider(provider: I18nProvider) {
    i18nProvider = provider;
  }
  
  export const i18n = {
    baseText: (key: string) => i18nProvider.getText(key),
  };
  ```

- [ ] Update all i18n calls in completion files (no code changes needed, just testing)

### Phase 3: Fix Types (1 hour)

- [ ] Define `TargetNodeParameterContext` in `src/types/workflow.ts`:
  ```typescript
  export interface TargetNodeParameterContext {
    nodeName: string;
    parameterPath: string;
  }
  ```

- [ ] Define `Schema` in `src/types/workflow.ts`:
  ```typescript
  export type Schema = Record<string, any>;
  ```

- [ ] Define `TargetItem` in `src/types/workflow.ts`:
  ```typescript
  export interface TargetItem {
    json: Record<string, any>;
    binary?: Record<string, any>;
  }
  ```

### Phase 4: Connect Context (1-2 hours)

- [ ] Update `useExpressionEditor` hook to accept context:
  ```typescript
  export interface UseExpressionEditorOptions {
    value?: string;
    expressionContext?: IExpressionContext;
    i18nProvider?: I18nProvider;
  }
  ```

- [ ] Pass context through to completion functions

- [ ] Update tests to use new context pattern

### Testing Phase 1

- [ ] Run `npm run build:types`
- [ ] Run `npm run build`
- [ ] Verify no TypeScript errors
- [ ] Create demo with custom context
- [ ] Verify completions work with custom nodes

---

## Path B: Make It N8N-Specific
**Effort:** 2-3 hours | **Result:** Works with n8n | **Complexity:** Low

### Step 1: Complete Store Stubs (1 hour)

- [ ] Fill `src/lib/stores.ts` with full implementations:
  ```typescript
  export const useNDVStore = () => ({
    hasInputData: false,
    isInputParentOfActiveNode: false,
    activeNode: null,
    ndvInputNodeName: '',
    ndvInputRunIndex: 0,
    ndvInputBranchIndex: 0,
    expressionTargetItem: null,
    isDraggableDragging: false,
    draggableType: null,
    focusedInputPath: '',
  });
  
  export const useWorkflowsStore = () => ({
    getWorkflowExecution: null,
    getWorkflowRunData: null,
    workflowExecutionData: null,
    getNodeByName: (name: string) => null,
    workflow: { nodes: [] },
    workflowObject: {
      getChildNodes: (nodeId: string, mode: string) => [],
      getParentNodesByDepth: (nodeId: string) => [],
    },
  });
  
  export const useExternalSecretsStore = () => ({
    isEnterpriseExternalSecretsEnabled: false,
    secretNames: [],
  });
  ```

- [ ] Add comment: "Connect to real n8n stores by importing from @n8n/sdks"

### Step 2: Define Missing Types (0.5 hours)

- [ ] Add to `src/types/workflow.ts`:
  ```typescript
  export interface TargetNodeParameterContext {
    nodeName: string;
    parameterPath: string;
  }
  
  export type Schema = Record<string, any>;
  
  export interface TargetItem {
    json: Record<string, any>;
    binary?: Record<string, any>;
  }
  ```

### Step 3: Document N8N Specifics (0.5 hours)

- [ ] Create `src/lib/codemirror-plugins/README.md`:
  ```markdown
  # N8N Expression Completions
  
  These plugins are designed for n8n's expression language.
  
  ## Dependencies
  - useNDVStore: Node Details View context
  - useWorkflowsStore: Workflow structure
  - useExternalSecretsStore: Feature flags
  - i18n: N8N localization
  
  To use with real n8n, connect the stores from @n8n/sdks.
  ```

### Step 4: Connect Real Stores (Optional - when integrating with n8n)

- [ ] Replace store stubs with imports from n8n main package
- [ ] Update i18n stub with real translations

### Testing Phase B

- [ ] Run `npm run build:types` - should pass
- [ ] Run `npm run build` - should pass
- [ ] Run example app - should show UI labels (as keys until translations added)
- [ ] Verify structure is correct for n8n integration

---

## Path C: Minimal Quick Fix
**Effort:** 1-2 hours | **Result:** Compiles | **Complexity:** Very Low

Just make it compile without breaking anything:

- [ ] Define missing types only (30 mins)
  - Add `TargetNodeParameterContext`, `Schema`, `TargetItem` to `src/types/workflow.ts`

- [ ] Document as n8n-specific (30 mins)
  - Add notes to `README.md` that this requires n8n context

- [ ] Update package.json (30 mins)
  - Add note: "Currently n8n-specific, requires refactoring for standalone use"

**Result:** Library compiles but doesn't work standalone. Good for code review.

---

## Decision Tree

```
Do you want to publish as standalone library?
├─ YES → Path A (Abstraction)
│        └─ 6-8 hours
│        └─ Works anywhere
│        └─ Clean architecture
│        └─ Future-proof
│
└─ NO → Do you want n8n integration ready?
   ├─ YES → Path B (N8N-Specific)
   │        └─ 2-3 hours
   │        └─ Works with n8n
   │        └─ Less refactoring
   │        └─ Clear design intent
   │
   └─ NO → Path C (Minimal)
            └─ 1-2 hours
            └─ Just compiles
            └─ Needs work still
```

---

## File Checklist by Path

### Path A Files

```
CREATE:
- [ ] src/lib/expressionContext.ts (100 lines)
- [ ] src/lib/i18nProvider.ts (50 lines)

MODIFY:
- [ ] src/lib/codemirror-plugins/completions/utils.ts (add context parameter)
- [ ] src/lib/codemirror-plugins/completions/dollar.completions.ts (add context)
- [ ] src/lib/codemirror-plugins/dragAndDrop.ts (add context)
- [ ] src/lib/codemirror-plugins/typescript/client/useTypescript.ts (add context)
- [ ] src/lib/i18n.ts (make pluggable)
- [ ] src/lib/hooks/useExpressionEditor.ts (accept context)
- [ ] src/types/workflow.ts (add missing types)

TESTS:
- [ ] Update tests to use context
- [ ] Add context provider tests
- [ ] Add i18n provider tests
```

### Path B Files

```
MODIFY:
- [ ] src/lib/stores.ts (complete implementations)
- [ ] src/types/workflow.ts (add missing types)
- [ ] src/lib/codemirror-plugins/README.md (create with docs)
- [ ] README.md (document n8n specificity)

VERIFY:
- [ ] All types compile
- [ ] All stores have correct signatures
```

### Path C Files

```
MODIFY:
- [ ] src/types/workflow.ts (add 3 type definitions)
- [ ] README.md (add note about n8n specificity)

DONE! (minimal)
```

---

## Verification Checklist

After completing your chosen path:

### Compilation
- [ ] `npm run build:types` passes
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors in IDE

### Functionality
- [ ] Example app runs without crashes
- [ ] Autocomplete appears on '$' in editor
- [ ] Completion items show (keys or labels depending on i18n)
- [ ] No runtime errors in console

### Quality
- [ ] Code compiles without warnings
- [ ] Types are properly defined
- [ ] Dependencies are clearly documented
- [ ] Abstraction (if Path A) is clean

---

## Git Workflow Recommendation

### Commit Points

```
Path A:
1. feat: Add expression context abstraction
2. feat: Make i18n system pluggable
3. fix: Define missing type definitions
4. refactor: Update completions to use context injection
5. test: Add context and i18n provider tests

Path B:
1. fix: Complete store stub implementations
2. fix: Define missing type definitions
3. docs: Add N8N-specific documentation

Path C:
1. fix: Define missing type definitions
2. docs: Add note about n8n specificity
```

---

## Timeline Estimates

| Task | Path A | Path B | Path C |
|------|--------|--------|--------|
| Abstraction layer | 2-3h | - | - |
| Update completions | 2h | - | - |
| I18N system | 1-2h | - | - |
| Types | 1h | 0.5h | 0.5h |
| Store stubs | - | 1h | - |
| Testing | 1-2h | 0.5h | 0.5h |
| Documentation | 0.5h | 0.5h | 0.5h |
| **TOTAL** | **6-8h** | **2-3h** | **1-2h** |

---

## Questions to Answer

Before starting, answer these:

1. **Target Use:** Will this be published to npm for general use?
   - YES → Choose Path A
   - NO → Choose Path B or C

2. **Timeline:** How much time do you have?
   - <2 hours → Path C
   - 2-3 hours → Path B
   - 6-8 hours → Path A

3. **Scope:** What's the minimum viable product?
   - Works anywhere → Path A
   - Works with n8n → Path B
   - Just compiles → Path C

---

## Success Criteria

### Path A Success
- Library compiles and runs without n8n
- Can pass custom context with nodes
- Can pass custom i18n provider
- Works in standalone React app
- Documented abstraction pattern

### Path B Success
- Library compiles with n8n context
- Runs with stub stores
- Ready for n8n integration
- Documented as n8n-specific
- Clear path to connect real stores

### Path C Success
- Library compiles without errors
- Documentation updated
- Types defined and correct
- Ready for next developer

---

## Next Steps

1. **Decide:** Which path matches your goals?
2. **Estimate:** Do you have time for that path?
3. **Start:** Pick the first unchecked item from your chosen path
4. **Test:** Run verification checklist after each section
5. **Commit:** Make meaningful commits as you go
6. **Document:** Update documentation as you work

Good luck!


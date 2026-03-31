# ZaloRideBot Bot Core First Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Windows-first Zalo Web bot core with persistent Playwright session, group discovery and pinning, rule-based ride detection, immediate fixed auto-reply, plus thin Fastify and React layers for control and visibility.

**Architecture:** Use a small pnpm workspace with four packages: `packages/bot-core` for all bot decisions, `packages/shared` for shared schemas and event contracts, `apps/backend` as a thin Fastify control plane, and `apps/frontend` as a thin React dashboard. Keep DOM automation isolated behind a `ZaloWebAdapter` interface so most logic stays testable without touching live Zalo Web.

**Tech Stack:** Node.js, TypeScript, pnpm workspaces, Playwright, Fastify, WebSocket, React, Vite, Vitest, Testing Library, Zod

---

## Planned File Structure

### Root

- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `README.md`

### Shared package

- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/events.ts`
- Create: `packages/shared/src/bot-state.ts`
- Create: `packages/shared/src/group-config.ts`

### Bot core package

- Create: `packages/bot-core/package.json`
- Create: `packages/bot-core/tsconfig.json`
- Create: `packages/bot-core/vitest.config.ts`
- Create: `packages/bot-core/src/index.ts`
- Create: `packages/bot-core/src/domain/message.ts`
- Create: `packages/bot-core/src/domain/match-result.ts`
- Create: `packages/bot-core/src/config/runtime-config.ts`
- Create: `packages/bot-core/src/rules/text-normalizer.ts`
- Create: `packages/bot-core/src/rules/rule-engine.ts`
- Create: `packages/bot-core/src/runtime/runtime-dedupe-store.ts`
- Create: `packages/bot-core/src/runtime/bot-state-machine.ts`
- Create: `packages/bot-core/src/registry/file-group-registry.ts`
- Create: `packages/bot-core/src/adapter/zalo-web-adapter.ts`
- Create: `packages/bot-core/src/adapter/playwright-session-manager.ts`
- Create: `packages/bot-core/src/adapter/playwright-zalo-web-adapter.ts`
- Create: `packages/bot-core/src/runtime/bot-event-bus.ts`
- Create: `packages/bot-core/src/runtime/bot-service.ts`
- Create: `packages/bot-core/src/runtime/manual-smoke.ts`
- Create: `packages/bot-core/tests/rule-engine.test.ts`
- Create: `packages/bot-core/tests/runtime-dedupe-store.test.ts`
- Create: `packages/bot-core/tests/bot-state-machine.test.ts`
- Create: `packages/bot-core/tests/file-group-registry.test.ts`
- Create: `packages/bot-core/tests/bot-service.test.ts`

### Backend app

- Create: `apps/backend/package.json`
- Create: `apps/backend/tsconfig.json`
- Create: `apps/backend/vitest.config.ts`
- Create: `apps/backend/src/index.ts`
- Create: `apps/backend/src/server.ts`
- Create: `apps/backend/src/routes/bot-routes.ts`
- Create: `apps/backend/src/ws/bot-events-socket.ts`
- Create: `apps/backend/tests/server.test.ts`

### Frontend app

- Create: `apps/frontend/package.json`
- Create: `apps/frontend/tsconfig.json`
- Create: `apps/frontend/vite.config.ts`
- Create: `apps/frontend/src/main.tsx`
- Create: `apps/frontend/src/App.tsx`
- Create: `apps/frontend/src/lib/api.ts`
- Create: `apps/frontend/src/lib/ws.ts`
- Create: `apps/frontend/src/test-setup.ts`
- Create: `apps/frontend/src/components/BotStatusCard.tsx`
- Create: `apps/frontend/src/components/GroupConfigPanel.tsx`
- Create: `apps/frontend/src/components/EventFeed.tsx`
- Create: `apps/frontend/src/styles.css`
- Create: `apps/frontend/src/__tests__/App.test.tsx`

### Docs

- Create: `docs/manual-smoke/zalo-bot-phase-1.md`

## Task 1: Bootstrap Workspace And Tooling

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `README.md`

- [ ] **Step 1: Write the failing workspace smoke check**

Create `README.md` with the intended commands so the first verification step has a concrete target:

```md
# ZaloRideBot

## Workspace Commands

- `pnpm install`
- `pnpm test`
- `pnpm --filter @zaloridebot/backend test`
- `pnpm --filter @zaloridebot/bot-core test`
- `pnpm --filter @zaloridebot/frontend test`
```

- [ ] **Step 2: Run the root test command to verify the workspace is not wired yet**

Run: `pnpm test`

Expected: command fails with `ERR_PNPM_NO_IMPORTER_MANIFEST_FOUND` or equivalent because `package.json` does not exist yet.

- [ ] **Step 3: Write the minimal workspace files**

Create `package.json`:

```json
{
  "name": "zaloridebot",
  "private": true,
  "packageManager": "pnpm@10.0.0",
  "devDependencies": {
    "@types/node": "^22.13.10"
  },
  "scripts": {
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint"
  }
}
```

Create `pnpm-workspace.yaml`:

```yaml
packages:
  - apps/*
  - packages/*
```

Create `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "types": ["node"]
  }
}
```

Create `.gitignore`:

```gitignore
node_modules/
dist/
.vite/
playwright/.auth/
.env
.superpowers/
coverage/
```

- [ ] **Step 4: Run the root test command again to verify the workspace is recognized**

Run: `pnpm test`

Expected: command now fails later with `No projects found` or missing package scripts instead of missing root manifest.

- [ ] **Step 5: Commit**

```bash
git add README.md package.json pnpm-workspace.yaml tsconfig.base.json .gitignore
git commit -m "chore: bootstrap workspace"
```

## Task 2: Create Shared Contracts For Bot State, Events, And Group Config

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/events.ts`
- Create: `packages/shared/src/bot-state.ts`
- Create: `packages/shared/src/group-config.ts`
- Test: `packages/bot-core/tests/bot-state-machine.test.ts`

- [ ] **Step 1: Write the first failing shared-type consumer test**

Create `packages/bot-core/tests/bot-state-machine.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createBotStateMachine } from '../src/runtime/bot-state-machine';

describe('bot state machine', () => {
  it('moves from idle to launching', () => {
    const machine = createBotStateMachine();

    machine.transition('launch');

    expect(machine.current()).toBe('launching');
  });
});
```

- [ ] **Step 2: Run the targeted test to confirm imports are unresolved**

Run: `pnpm --filter @zaloridebot/bot-core test -- --run tests/bot-state-machine.test.ts`

Expected: FAIL with missing package files such as `Cannot find module '../src/runtime/bot-state-machine'`.

- [ ] **Step 3: Create the shared package and exported contracts**

Create `packages/shared/package.json`:

```json
{
  "name": "@zaloridebot/shared",
  "version": "0.0.1",
  "type": "module",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "echo shared package has no direct tests"
  },
  "dependencies": {
    "zod": "^3.24.1"
  }
}
```

Create `packages/shared/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*.ts"]
}
```

Create `packages/shared/src/bot-state.ts`:

```ts
export const BOT_STATES = [
  'idle',
  'launching',
  'needs_qr',
  'authenticated',
  'discovering_groups',
  'monitoring',
  'error',
  'restarting'
] as const;

export type BotState = (typeof BOT_STATES)[number];
```

Create `packages/shared/src/events.ts`:

```ts
import { z } from 'zod';
import type { BotState } from './bot-state.js';

export const BotEventSchema = z.object({
  type: z.string(),
  timestamp: z.string(),
  payload: z.record(z.unknown()).default({})
});

export type BotEvent = z.infer<typeof BotEventSchema>;

export type StateChangedEvent = {
  type: 'bot.state_changed';
  timestamp: string;
  payload: { from: BotState; to: BotState };
};
```

Create `packages/shared/src/group-config.ts`:

```ts
import { z } from 'zod';

export const GroupConfigSchema = z.object({
  id: z.string(),
  zaloGroupKey: z.string(),
  name: z.string(),
  isPinned: z.boolean(),
  defaultReply: z.string(),
  keywordRules: z.array(z.string()),
  patternRules: z.array(z.string())
});

export type GroupConfig = z.infer<typeof GroupConfigSchema>;
```

Create `packages/shared/src/index.ts`:

```ts
export * from './bot-state.js';
export * from './events.js';
export * from './group-config.js';
```

- [ ] **Step 4: Create the smallest bot-core package shell needed by the test runner**

Create `packages/bot-core/package.json`:

```json
{
  "name": "@zaloridebot/bot-core",
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "vitest run",
    "lint": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@zaloridebot/shared": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.8.2",
    "vitest": "^3.0.8"
  }
}
```

Create `packages/bot-core/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "."
  },
  "include": ["src/**/*.ts", "tests/**/*.ts"]
}
```

Create `packages/bot-core/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node'
  }
});
```

Create `packages/bot-core/src/runtime/bot-state-machine.ts`:

```ts
import type { BotState } from '@zaloridebot/shared';

type EventName = 'launch';

export function createBotStateMachine() {
  let state: BotState = 'idle';

  return {
    current() {
      return state;
    },
    transition(event: EventName) {
      if (state === 'idle' && event === 'launch') {
        state = 'launching';
      }
    }
  };
}
```

- [ ] **Step 5: Run the targeted test to verify it passes**

Run: `pnpm install && pnpm --filter @zaloridebot/bot-core test -- --run tests/bot-state-machine.test.ts`

Expected: PASS with `1 passed`.

- [ ] **Step 6: Commit**

```bash
git add packages/shared package.json pnpm-workspace.yaml tsconfig.base.json packages/bot-core
git commit -m "feat: add shared contracts and bot-core package shell"
```

## Task 3: Implement Rule Engine, Text Normalization, And Runtime Dedupe

**Files:**
- Create: `packages/bot-core/src/domain/message.ts`
- Create: `packages/bot-core/src/domain/match-result.ts`
- Create: `packages/bot-core/src/rules/text-normalizer.ts`
- Create: `packages/bot-core/src/rules/rule-engine.ts`
- Create: `packages/bot-core/src/runtime/runtime-dedupe-store.ts`
- Create: `packages/bot-core/tests/rule-engine.test.ts`
- Create: `packages/bot-core/tests/runtime-dedupe-store.test.ts`

- [ ] **Step 1: Write failing tests for match and dedupe behavior**

Create `packages/bot-core/tests/rule-engine.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { evaluateMessage } from '../src/rules/rule-engine';

describe('rule engine', () => {
  it('matches only when a keyword and whitelist pattern both match', () => {
    const result = evaluateMessage(
      {
        runtimeMessageId: 'msg-1',
        groupId: 'group-1',
        senderDisplayName: 'A',
        text: 'co cuoc xe di san bay 17h sdt 0909123456',
        receivedAt: '2026-03-31T08:00:00.000Z',
        isSelf: false
      },
      {
        keywordRules: ['cuoc xe', 'di san bay'],
        patternRules: ['\\\\d{9,11}', '\\\\b\\d{1,2}h\\b']
      }
    );

    expect(result.matched).toBe(true);
    expect(result.matchedKeywords).toContain('cuoc xe');
  });
});
```

Create `packages/bot-core/tests/runtime-dedupe-store.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { RuntimeDedupeStore } from '../src/runtime/runtime-dedupe-store';

describe('runtime dedupe store', () => {
  it('marks the second sighting of a message as duplicate', () => {
    const store = new RuntimeDedupeStore();

    expect(store.seen('group-1|msg-1')).toBe(false);
    expect(store.seen('group-1|msg-1')).toBe(true);
  });
});
```

- [ ] **Step 2: Run the two tests and confirm they fail**

Run: `pnpm --filter @zaloridebot/bot-core test -- --run tests/rule-engine.test.ts tests/runtime-dedupe-store.test.ts`

Expected: FAIL with unresolved imports for the new rule and dedupe modules.

- [ ] **Step 3: Write the minimal domain and rule code**

Create `packages/bot-core/src/domain/message.ts`:

```ts
export type IncomingMessage = {
  runtimeMessageId: string;
  groupId: string;
  senderDisplayName: string;
  text: string;
  receivedAt: string;
  isSelf: boolean;
};
```

Create `packages/bot-core/src/domain/match-result.ts`:

```ts
export type MatchResult = {
  matched: boolean;
  matchedKeywords: string[];
  matchedPatterns: string[];
  reason: string;
};
```

Create `packages/bot-core/src/rules/text-normalizer.ts`:

```ts
export function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}
```

Create `packages/bot-core/src/rules/rule-engine.ts`:

```ts
import type { IncomingMessage } from '../domain/message.js';
import type { MatchResult } from '../domain/match-result.js';
import { normalizeText } from './text-normalizer.js';

type RuleConfig = {
  keywordRules: string[];
  patternRules: string[];
};

export function evaluateMessage(message: IncomingMessage, rules: RuleConfig): MatchResult {
  const normalized = normalizeText(message.text);
  const matchedKeywords = rules.keywordRules.filter((rule) =>
    normalized.includes(normalizeText(rule))
  );
  const matchedPatterns = rules.patternRules.filter((rule) => new RegExp(rule, 'i').test(normalized));

  if (matchedKeywords.length === 0) {
    return { matched: false, matchedKeywords, matchedPatterns, reason: 'no_keyword_match' };
  }

  if (matchedPatterns.length === 0) {
    return { matched: false, matchedKeywords, matchedPatterns, reason: 'no_pattern_match' };
  }

  return { matched: true, matchedKeywords, matchedPatterns, reason: 'matched' };
}
```

Create `packages/bot-core/src/runtime/runtime-dedupe-store.ts`:

```ts
export class RuntimeDedupeStore {
  private readonly seenIds = new Set<string>();

  seen(messageId: string): boolean {
    if (this.seenIds.has(messageId)) {
      return true;
    }

    this.seenIds.add(messageId);
    return false;
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm --filter @zaloridebot/bot-core test -- --run tests/rule-engine.test.ts tests/runtime-dedupe-store.test.ts`

Expected: PASS with `2 passed`.

- [ ] **Step 5: Commit**

```bash
git add packages/bot-core/src/domain packages/bot-core/src/rules packages/bot-core/src/runtime packages/bot-core/tests
git commit -m "feat: add rule engine and runtime dedupe"
```

## Task 4: Implement State Machine And File-Based Group Registry

**Files:**
- Modify: `packages/bot-core/src/runtime/bot-state-machine.ts`
- Create: `packages/bot-core/src/registry/file-group-registry.ts`
- Create: `packages/bot-core/tests/file-group-registry.test.ts`
- Modify: `packages/bot-core/tests/bot-state-machine.test.ts`

- [ ] **Step 1: Expand the failing tests to cover actual phase-1 transitions and registry persistence**

Replace `packages/bot-core/tests/bot-state-machine.test.ts` with:

```ts
import { describe, expect, it } from 'vitest';
import { createBotStateMachine } from '../src/runtime/bot-state-machine';

describe('bot state machine', () => {
  it('walks through the happy-path lifecycle', () => {
    const machine = createBotStateMachine();

    machine.transition('launch');
    machine.transition('session_authenticated');
    machine.transition('begin_group_discovery');
    machine.transition('start_monitoring');

    expect(machine.current()).toBe('monitoring');
  });
});
```

Create `packages/bot-core/tests/file-group-registry.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { FileGroupRegistry } from '../src/registry/file-group-registry';

describe('file group registry', () => {
  it('saves pinned groups to disk', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'zaloridebot-'));
    const filePath = join(dir, 'groups.json');
    const registry = new FileGroupRegistry(filePath);

    await registry.save([
      {
        id: 'group-1',
        zaloGroupKey: 'zalo-1',
        name: 'Nhom 1',
        isPinned: true,
        defaultReply: 'em nhan cuoc',
        keywordRules: ['cuoc xe'],
        patternRules: ['\\\\d{9,11}']
      }
    ]);

    const raw = JSON.parse(readFileSync(filePath, 'utf8'));
    expect(raw[0].name).toBe('Nhom 1');
  });
});
```

- [ ] **Step 2: Run the tests and verify the new behaviors fail**

Run: `pnpm --filter @zaloridebot/bot-core test -- --run tests/bot-state-machine.test.ts tests/file-group-registry.test.ts`

Expected: FAIL because the state machine only knows one event and the registry file does not exist.

- [ ] **Step 3: Implement the state machine and file registry**

Replace `packages/bot-core/src/runtime/bot-state-machine.ts` with:

```ts
import type { BotState } from '@zaloridebot/shared';

type EventName =
  | 'launch'
  | 'session_authenticated'
  | 'session_requires_qr'
  | 'begin_group_discovery'
  | 'start_monitoring'
  | 'restart'
  | 'fail';

const transitions: Record<BotState, Partial<Record<EventName, BotState>>> = {
  idle: { launch: 'launching' },
  launching: {
    session_authenticated: 'authenticated',
    session_requires_qr: 'needs_qr',
    fail: 'error'
  },
  needs_qr: {
    session_authenticated: 'authenticated',
    fail: 'error'
  },
  authenticated: {
    begin_group_discovery: 'discovering_groups',
    fail: 'error'
  },
  discovering_groups: {
    start_monitoring: 'monitoring',
    fail: 'error'
  },
  monitoring: {
    restart: 'restarting',
    fail: 'error'
  },
  error: {
    restart: 'restarting'
  },
  restarting: {
    session_authenticated: 'authenticated',
    session_requires_qr: 'needs_qr',
    fail: 'error'
  }
};

export function createBotStateMachine() {
  let state: BotState = 'idle';

  return {
    current() {
      return state;
    },
    transition(event: EventName) {
      const next = transitions[state][event];

      if (!next) {
        throw new Error(`Invalid transition from ${state} via ${event}`);
      }

      state = next;
    }
  };
}
```

Create `packages/bot-core/src/registry/file-group-registry.ts`:

```ts
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { GroupConfig } from '@zaloridebot/shared';

export class FileGroupRegistry {
  constructor(private readonly filePath: string) {}

  async load(): Promise<GroupConfig[]> {
    try {
      const raw = await readFile(this.filePath, 'utf8');
      return JSON.parse(raw) as GroupConfig[];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }

      throw error;
    }
  }

  async save(groups: GroupConfig[]): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(groups, null, 2));
  }
}
```

- [ ] **Step 4: Run the targeted tests to verify they pass**

Run: `pnpm --filter @zaloridebot/bot-core test -- --run tests/bot-state-machine.test.ts tests/file-group-registry.test.ts`

Expected: PASS with `2 passed`.

- [ ] **Step 5: Commit**

```bash
git add packages/bot-core/src/runtime/bot-state-machine.ts packages/bot-core/src/registry/file-group-registry.ts packages/bot-core/tests/bot-state-machine.test.ts packages/bot-core/tests/file-group-registry.test.ts
git commit -m "feat: add lifecycle state machine and group registry"
```

## Task 5: Implement Bot Event Bus And Bot Service Against A Fake Adapter

**Files:**
- Create: `packages/bot-core/src/adapter/zalo-web-adapter.ts`
- Create: `packages/bot-core/src/runtime/bot-event-bus.ts`
- Create: `packages/bot-core/src/runtime/bot-service.ts`
- Create: `packages/bot-core/tests/bot-service.test.ts`

- [ ] **Step 1: Write the failing bot-service integration test**

Create `packages/bot-core/tests/bot-service.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { RuntimeDedupeStore } from '../src/runtime/runtime-dedupe-store';
import { createBotService } from '../src/runtime/bot-service';

describe('bot service', () => {
  it('emits reply.sent when a new matching message arrives', async () => {
    const sent: string[] = [];
    const service = createBotService({
      adapter: {
        async discoverGroups() {
          return [
            {
              id: 'group-1',
              zaloGroupKey: 'zalo-1',
              name: 'Nhom 1',
              isPinned: true,
              defaultReply: 'em nhan cuoc',
              keywordRules: ['cuoc xe'],
              patternRules: ['\\\\d{9,11}']
            }
          ];
        },
        async sendMessage(_groupId, text) {
          sent.push(text);
        }
      },
      dedupeStore: new RuntimeDedupeStore()
    });

    await service.handleIncomingMessage({
      runtimeMessageId: 'msg-1',
      groupId: 'group-1',
      senderDisplayName: 'A',
      text: 'co cuoc xe 0909123456',
      receivedAt: '2026-03-31T08:00:00.000Z',
      isSelf: false
    });

    expect(sent).toEqual(['em nhan cuoc']);
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `pnpm --filter @zaloridebot/bot-core test -- --run tests/bot-service.test.ts`

Expected: FAIL because `bot-service.ts` and the adapter contract do not exist.

- [ ] **Step 3: Implement the contract, event bus, and service**

Create `packages/bot-core/src/adapter/zalo-web-adapter.ts`:

```ts
import type { GroupConfig } from '@zaloridebot/shared';
import type { IncomingMessage } from '../domain/message.js';

export interface ZaloWebAdapter {
  discoverGroups(): Promise<GroupConfig[]>;
  sendMessage(groupId: string, text: string): Promise<void>;
  onIncomingMessage?(listener: (message: IncomingMessage) => Promise<void>): Promise<void>;
}
```

Create `packages/bot-core/src/runtime/bot-event-bus.ts`:

```ts
import { EventEmitter } from 'node:events';
import type { BotEvent } from '@zaloridebot/shared';

export class BotEventBus {
  private readonly emitter = new EventEmitter();

  emit(event: BotEvent) {
    this.emitter.emit(event.type, event);
    this.emitter.emit('*', event);
  }

  onAny(listener: (event: BotEvent) => void) {
    this.emitter.on('*', listener);
  }
}
```

Create `packages/bot-core/src/runtime/bot-service.ts`:

```ts
import type { ZaloWebAdapter } from '../adapter/zalo-web-adapter.js';
import type { IncomingMessage } from '../domain/message.js';
import { evaluateMessage } from '../rules/rule-engine.js';
import { BotEventBus } from './bot-event-bus.js';
import { RuntimeDedupeStore } from './runtime-dedupe-store.js';

type Dependencies = {
  adapter: ZaloWebAdapter;
  dedupeStore: RuntimeDedupeStore;
  eventBus?: BotEventBus;
};

export function createBotService({ adapter, dedupeStore, eventBus = new BotEventBus() }: Dependencies) {
  return {
    eventBus,
    async handleIncomingMessage(message: IncomingMessage) {
      if (message.isSelf) {
        return;
      }

      if (dedupeStore.seen(`${message.groupId}|${message.runtimeMessageId}`)) {
        return;
      }

      const groups = await adapter.discoverGroups();
      const group = groups.find((item) => item.id === message.groupId && item.isPinned);

      if (!group) {
        return;
      }

      const result = evaluateMessage(message, {
        keywordRules: group.keywordRules,
        patternRules: group.patternRules
      });

      eventBus.emit({
        type: 'message.detected',
        timestamp: new Date().toISOString(),
        payload: { groupId: message.groupId, messageId: message.runtimeMessageId }
      });

      if (!result.matched) {
        return;
      }

      await adapter.sendMessage(group.id, group.defaultReply);

      eventBus.emit({
        type: 'reply.sent',
        timestamp: new Date().toISOString(),
        payload: { groupId: group.id, replyText: group.defaultReply }
      });
    }
  };
}
```

- [ ] **Step 4: Run the service test to verify it passes**

Run: `pnpm --filter @zaloridebot/bot-core test -- --run tests/bot-service.test.ts`

Expected: PASS with `1 passed`.

- [ ] **Step 5: Commit**

```bash
git add packages/bot-core/src/adapter packages/bot-core/src/runtime/bot-event-bus.ts packages/bot-core/src/runtime/bot-service.ts packages/bot-core/tests/bot-service.test.ts
git commit -m "feat: add bot service orchestration"
```

## Task 6: Implement Playwright Session Manager And Initial Zalo Adapter Skeleton

**Files:**
- Modify: `packages/bot-core/package.json`
- Create: `packages/bot-core/src/config/runtime-config.ts`
- Create: `packages/bot-core/src/adapter/playwright-session-manager.ts`
- Create: `packages/bot-core/src/adapter/playwright-zalo-web-adapter.ts`
- Create: `packages/bot-core/src/index.ts`

- [ ] **Step 1: Write the failing adapter-construction test**

Append to `packages/bot-core/tests/bot-service.test.ts`:

```ts
import { createRuntimeConfig } from '../src/config/runtime-config';

describe('runtime config', () => {
  it('uses a persistent auth directory under the workspace', () => {
    const config = createRuntimeConfig('D:/workspace/zaloridebot');

    expect(config.authDir).toBe('D:/workspace/zaloridebot/playwright/.auth');
  });
});
```

- [ ] **Step 2: Run the targeted test and confirm it fails**

Run: `pnpm --filter @zaloridebot/bot-core test -- --run tests/bot-service.test.ts`

Expected: FAIL with missing `runtime-config.ts`.

- [ ] **Step 3: Implement config and the initial Playwright shells**

Update `packages/bot-core/package.json` dependencies:

```json
{
  "dependencies": {
    "@zaloridebot/shared": "workspace:*",
    "playwright": "^1.51.0"
  }
}
```

Create `packages/bot-core/src/config/runtime-config.ts`:

```ts
import { join } from 'node:path';

export function createRuntimeConfig(workspaceRoot: string) {
  return {
    workspaceRoot,
    authDir: join(workspaceRoot, 'playwright', '.auth'),
    groupsFile: join(workspaceRoot, 'data', 'groups.json')
  };
}
```

Create `packages/bot-core/src/adapter/playwright-session-manager.ts`:

```ts
import { chromium, type BrowserContext, type Page } from 'playwright';

export class PlaywrightSessionManager {
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  constructor(private readonly userDataDir: string) {}

  async launch(): Promise<Page> {
    this.context = await chromium.launchPersistentContext(this.userDataDir, {
      headless: false
    });
    this.page = await this.context.newPage();
    await this.page.goto('https://chat.zalo.me/', { waitUntil: 'domcontentloaded' });
    return this.page;
  }

  async close(): Promise<void> {
    await this.context?.close();
    this.context = null;
    this.page = null;
  }
}
```

Create `packages/bot-core/src/adapter/playwright-zalo-web-adapter.ts`:

```ts
import type { GroupConfig } from '@zaloridebot/shared';
import type { IncomingMessage } from '../domain/message.js';
import type { ZaloWebAdapter } from './zalo-web-adapter.js';

export class PlaywrightZaloWebAdapter implements ZaloWebAdapter {
  async discoverGroups(): Promise<GroupConfig[]> {
    return [];
  }

  async sendMessage(_groupId: string, _text: string): Promise<void> {
    return;
  }

  async onIncomingMessage(_listener: (message: IncomingMessage) => Promise<void>): Promise<void> {
    return;
  }
}
```

Create `packages/bot-core/src/index.ts`:

```ts
export * from './runtime/bot-event-bus.js';
export * from './adapter/playwright-session-manager.js';
export * from './adapter/playwright-zalo-web-adapter.js';
export * from './adapter/zalo-web-adapter.js';
export * from './config/runtime-config.js';
export * from './runtime/bot-service.js';
```

- [ ] **Step 4: Run the test to verify the config behavior passes**

Run: `pnpm --filter @zaloridebot/bot-core test -- --run tests/bot-service.test.ts`

Expected: PASS, including the new runtime-config assertion.

- [ ] **Step 5: Commit**

```bash
git add packages/bot-core/src/config packages/bot-core/src/adapter/playwright-session-manager.ts packages/bot-core/src/adapter/playwright-zalo-web-adapter.ts packages/bot-core/src/index.ts packages/bot-core/tests/bot-service.test.ts
git commit -m "feat: add playwright session and adapter skeleton"
```

## Task 7: Build Thin Fastify Control Plane And WebSocket Event Stream

**Files:**
- Create: `apps/backend/package.json`
- Create: `apps/backend/tsconfig.json`
- Create: `apps/backend/vitest.config.ts`
- Create: `apps/backend/src/server.ts`
- Create: `apps/backend/src/routes/bot-routes.ts`
- Create: `apps/backend/src/ws/bot-events-socket.ts`
- Create: `apps/backend/src/index.ts`
- Create: `apps/backend/tests/server.test.ts`

- [ ] **Step 1: Write the failing backend API test**

Create `apps/backend/tests/server.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildServer } from '../src/server';

describe('backend server', () => {
  it('returns the current bot state', async () => {
    const server = buildServer({
      getSnapshot() {
        return { state: 'idle', groups: [] };
      }
    });

    const response = await server.inject({
      method: 'GET',
      url: '/api/bot/state'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ state: 'idle', groups: [] });
  });
});
```

- [ ] **Step 2: Run the backend test and confirm it fails**

Run: `pnpm --filter @zaloridebot/backend test -- --run tests/server.test.ts`

Expected: FAIL because the backend app does not exist yet.

- [ ] **Step 3: Implement the minimal backend**

Create `apps/backend/package.json`:

```json
{
  "name": "@zaloridebot/backend",
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "vitest run",
    "lint": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@fastify/websocket": "^11.0.2",
    "@zaloridebot/bot-core": "workspace:*",
    "@zaloridebot/shared": "workspace:*",
    "fastify": "^5.2.1"
  },
  "devDependencies": {
    "typescript": "^5.8.2",
    "vitest": "^3.0.8"
  }
}
```

Create `apps/backend/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "."
  },
  "include": ["src/**/*.ts", "tests/**/*.ts"]
}
```

Create `apps/backend/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node'
  }
});
```

Create `apps/backend/src/routes/bot-routes.ts`:

```ts
import type { FastifyInstance } from 'fastify';

type SnapshotProvider = {
  getSnapshot(): { state: string; groups: unknown[] };
};

export async function registerBotRoutes(app: FastifyInstance, provider: SnapshotProvider) {
  app.get('/api/bot/state', async () => provider.getSnapshot());
}
```

Create `apps/backend/src/ws/bot-events-socket.ts`:

```ts
import type { FastifyInstance } from 'fastify';
import type { BotEventBus } from '@zaloridebot/bot-core';

export async function registerBotEventSocket(app: FastifyInstance, eventBus: BotEventBus) {
  app.get('/ws/events', { websocket: true }, (socket) => {
    const listener = (event: { type: string; payload: unknown }) => {
      socket.send(JSON.stringify(event));
    };

    eventBus.onAny(listener);
  });
}
```

Create `apps/backend/src/server.ts`:

```ts
import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import type { BotEventBus } from '@zaloridebot/bot-core';
import { registerBotRoutes } from './routes/bot-routes.js';
import { registerBotEventSocket } from './ws/bot-events-socket.js';

type Dependencies = {
  getSnapshot(): { state: string; groups: unknown[] };
  eventBus?: BotEventBus;
};

export function buildServer(provider: Dependencies) {
  const app = Fastify();
  app.register(websocket);
  app.register(async (instance) => {
    await registerBotRoutes(instance, provider);
    if (provider.eventBus) {
      await registerBotEventSocket(instance, provider.eventBus);
    }
  });
  return app;
}
```

Create `apps/backend/src/index.ts`:

```ts
import { buildServer } from './server.js';

const server = buildServer({
  getSnapshot() {
    return { state: 'idle', groups: [] };
  }
});

server.listen({ port: 3000, host: '0.0.0.0' });
```

- [ ] **Step 4: Run the backend test to verify it passes**

Run: `pnpm install && pnpm --filter @zaloridebot/backend test -- --run tests/server.test.ts`

Expected: PASS with `1 passed`.

- [ ] **Step 5: Commit**

```bash
git add apps/backend
git commit -m "feat: add backend control plane"
```

## Task 8: Build Minimal React Dashboard For Bot State, Group Config, And Event Feed

**Files:**
- Create: `apps/frontend/package.json`
- Create: `apps/frontend/tsconfig.json`
- Create: `apps/frontend/vite.config.ts`
- Create: `apps/frontend/src/main.tsx`
- Create: `apps/frontend/src/App.tsx`
- Create: `apps/frontend/src/lib/api.ts`
- Create: `apps/frontend/src/lib/ws.ts`
- Create: `apps/frontend/src/test-setup.ts`
- Create: `apps/frontend/src/components/BotStatusCard.tsx`
- Create: `apps/frontend/src/components/GroupConfigPanel.tsx`
- Create: `apps/frontend/src/components/EventFeed.tsx`
- Create: `apps/frontend/src/styles.css`
- Create: `apps/frontend/src/__tests__/App.test.tsx`

- [ ] **Step 1: Write the failing UI smoke test**

Create `apps/frontend/src/__tests__/App.test.tsx`:

```tsx
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../App';

describe('App', () => {
  it('renders the bot dashboard heading', () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: async () => ({ state: 'idle', groups: [] })
    }));
    vi.stubGlobal('WebSocket', class {
      addEventListener() {}
      close() {}
    });

    render(<App />);
    expect(screen.getByText('ZaloRideBot Dashboard')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the frontend test and verify it fails**

Run: `pnpm --filter @zaloridebot/frontend test -- --run src/__tests__/App.test.tsx`

Expected: FAIL because the frontend app does not exist yet.

- [ ] **Step 3: Implement the minimal dashboard**

Create `apps/frontend/package.json`:

```json
{
  "name": "@zaloridebot/frontend",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -p tsconfig.json && vite build",
    "test": "vitest run",
    "lint": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.2.0",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "@vitejs/plugin-react": "^4.4.1",
    "jsdom": "^26.0.0",
    "typescript": "^5.8.2",
    "vite": "^6.2.0",
    "vitest": "^3.0.8"
  }
}
```

Create `apps/frontend/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx"
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
```

Create `apps/frontend/vite.config.ts`:

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts'
  }
});
```

Create `apps/frontend/src/test-setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

Create `apps/frontend/src/lib/api.ts`:

```ts
export async function fetchBotSnapshot() {
  const response = await fetch('/api/bot/state');
  return response.json() as Promise<{ state: string; groups: Array<{ id: string; name: string; isPinned: boolean }> }>;
}
```

Create `apps/frontend/src/lib/ws.ts`:

```ts
export function connectBotEvents(onMessage: (event: unknown) => void) {
  const socket = new WebSocket('ws://localhost:3000/ws/events');
  socket.addEventListener('message', (event) => onMessage(JSON.parse(event.data)));
  return socket;
}
```

Create `apps/frontend/src/components/BotStatusCard.tsx`:

```tsx
type Props = { state: string };

export function BotStatusCard({ state }: Props) {
  return <section><h2>Bot State</h2><p>{state}</p></section>;
}
```

Create `apps/frontend/src/components/GroupConfigPanel.tsx`:

```tsx
type Group = { id: string; name: string; isPinned: boolean };

export function GroupConfigPanel({ groups }: { groups: Group[] }) {
  return (
    <section>
      <h2>Group Config</h2>
      {groups.length === 0 ? <p>No groups loaded.</p> : groups.map((group) => <p key={group.id}>{group.name}</p>)}
    </section>
  );
}
```

Create `apps/frontend/src/components/EventFeed.tsx`:

```tsx
export function EventFeed({ events }: { events: string[] }) {
  return (
    <section>
      <h2>Realtime Events</h2>
      {events.length === 0 ? <p>No events yet.</p> : events.map((event, index) => <p key={index}>{event}</p>)}
    </section>
  );
}
```

Create `apps/frontend/src/App.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { BotStatusCard } from './components/BotStatusCard';
import { EventFeed } from './components/EventFeed';
import { GroupConfigPanel } from './components/GroupConfigPanel';
import { fetchBotSnapshot } from './lib/api';
import { connectBotEvents } from './lib/ws';

export default function App() {
  const [state, setState] = useState('idle');
  const [groups, setGroups] = useState<Array<{ id: string; name: string; isPinned: boolean }>>([]);
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    fetchBotSnapshot()
      .then((snapshot) => {
        setState(snapshot.state);
        setGroups(snapshot.groups);
      })
      .catch(() => {
        setState('offline');
      });

    const socket = connectBotEvents((event) => {
      setEvents((current) => [JSON.stringify(event), ...current].slice(0, 20));
    });

    return () => socket.close();
  }, []);

  return (
    <main>
      <h1>ZaloRideBot Dashboard</h1>
      <BotStatusCard state={state} />
      <GroupConfigPanel groups={groups} />
      <EventFeed events={events} />
    </main>
  );
}
```

Create `apps/frontend/src/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Create `apps/frontend/src/styles.css`:

```css
:root {
  font-family: "Segoe UI", sans-serif;
  background: #eef3f7;
  color: #16324f;
}

body {
  margin: 0;
}

main {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px;
}
```

- [ ] **Step 4: Run the frontend test to verify it passes**

Run: `pnpm install && pnpm --filter @zaloridebot/frontend test -- --run src/__tests__/App.test.tsx`

Expected: PASS with `1 passed`.

- [ ] **Step 5: Commit**

```bash
git add apps/frontend
git commit -m "feat: add frontend dashboard shell"
```

## Task 9: Connect Backend To Bot Core Snapshot And Prepare Manual Smoke Harness

**Files:**
- Modify: `packages/bot-core/src/runtime/bot-service.ts`
- Create: `packages/bot-core/src/runtime/manual-smoke.ts`
- Modify: `apps/backend/src/server.ts`
- Modify: `apps/backend/src/index.ts`
- Create: `docs/manual-smoke/zalo-bot-phase-1.md`

- [ ] **Step 1: Write the failing end-to-end snapshot test**

Append to `apps/backend/tests/server.test.ts`:

```ts
it('returns pinned groups from the injected bot snapshot provider', async () => {
  const server = buildServer({
    getSnapshot() {
      return {
        state: 'monitoring',
        groups: [{ id: 'group-1', name: 'Nhom 1', isPinned: true }]
      };
    }
  });

  const response = await server.inject({
    method: 'GET',
    url: '/api/bot/state'
  });

  expect(response.json().groups[0].name).toBe('Nhom 1');
});
```

- [ ] **Step 2: Run the backend test suite and verify the new integration target fails or is incomplete**

Run: `pnpm --filter @zaloridebot/backend test`

Expected: if the snapshot shape is too loose, tighten types until the test fails on compile or runtime mismatch.

- [ ] **Step 3: Implement the snapshot shape and manual smoke entry point**

Append to `packages/bot-core/src/runtime/bot-service.ts`:

```ts
export type BotSnapshot = {
  state: string;
  groups: Array<{ id: string; name: string; isPinned: boolean }>;
};
```

Create `packages/bot-core/src/runtime/manual-smoke.ts`:

```ts
import { createRuntimeConfig } from '../config/runtime-config.js';
import { PlaywrightSessionManager } from '../adapter/playwright-session-manager.js';

export async function runManualSmoke(workspaceRoot: string) {
  const config = createRuntimeConfig(workspaceRoot);
  const session = new PlaywrightSessionManager(config.authDir);
  const page = await session.launch();
  return { url: page.url() };
}
```

Replace `apps/backend/src/server.ts` with:

```ts
import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import { registerBotRoutes } from './routes/bot-routes.js';

export type BotSnapshot = {
  state: string;
  groups: Array<{ id: string; name: string; isPinned: boolean }>;
};

type SnapshotProvider = {
  getSnapshot(): BotSnapshot;
};

export function buildServer(provider: SnapshotProvider) {
  const app = Fastify();
  app.register(websocket);
  app.register(async (instance) => {
    await registerBotRoutes(instance, provider);
  });
  return app;
}
```

Replace `apps/backend/src/index.ts` with:

```ts
import { buildServer } from './server.js';

const server = buildServer({
  getSnapshot() {
    return { state: 'idle', groups: [] };
  }
});

await server.listen({ port: 3000, host: '0.0.0.0' });
```

Create `docs/manual-smoke/zalo-bot-phase-1.md`:

```md
# ZaloRideBot Phase 1 Manual Smoke

1. Run `pnpm install`.
2. Run `pnpm --filter @zaloridebot/backend build` and then `node apps/backend/dist/index.js`.
3. Start the Playwright bot entry point on the Windows machine.
4. Verify the QR screen appears on first launch if no persisted session exists.
5. Scan QR and confirm Zalo Web loads.
6. Restart the bot and confirm QR is not required when the session remains valid.
7. Discover groups, pin one group, and save config.
8. Send a matching message in the pinned group and confirm the fixed reply is sent once.
9. Send a non-matching message and confirm no reply is sent.
10. Close the browser and confirm the backend reports a non-monitoring state.
```

- [ ] **Step 4: Run the backend tests to verify the typed snapshot path passes**

Run: `pnpm --filter @zaloridebot/backend test`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/bot-core/src/runtime/manual-smoke.ts packages/bot-core/src/runtime/bot-service.ts apps/backend/src/server.ts apps/backend/src/index.ts docs/manual-smoke/zalo-bot-phase-1.md apps/backend/tests/server.test.ts
git commit -m "feat: add snapshot contract and manual smoke harness"
```

## Task 10: Implement Live Zalo DOM Selectors And Real Monitoring Loop

**Files:**
- Modify: `packages/bot-core/src/adapter/playwright-zalo-web-adapter.ts`
- Modify: `packages/bot-core/src/runtime/bot-service.ts`
- Modify: `packages/bot-core/src/adapter/playwright-session-manager.ts`
- Test: `docs/manual-smoke/zalo-bot-phase-1.md`

- [ ] **Step 1: Write the manual selector checklist before coding selectors**

Add this section to `docs/manual-smoke/zalo-bot-phase-1.md`:

```md
## Selector Capture Checklist

1. Open `https://chat.zalo.me/` in the Playwright-launched Chromium window.
2. Use DevTools to identify:
   - conversation list container
   - row selector for a group conversation
   - message list container
   - message bubble text selector
   - message composer selector
   - send button selector
3. Record the chosen selectors in `packages/bot-core/src/adapter/playwright-zalo-web-adapter.ts`.
4. Re-run the smoke flow after each selector change.
```

- [ ] **Step 2: Run the manual smoke flow once to confirm the adapter is still a stub**

Run: `pnpm --filter @zaloridebot/bot-core build`

Expected: build passes, but manual smoke cannot discover groups or send messages because adapter methods are placeholders.

- [ ] **Step 3: Implement the first real DOM adapter pass**

Replace `packages/bot-core/src/adapter/playwright-zalo-web-adapter.ts` with:

```ts
import type { GroupConfig } from '@zaloridebot/shared';
import type { IncomingMessage } from '../domain/message.js';
import type { ZaloWebAdapter } from './zalo-web-adapter.js';
import type { Page } from 'playwright';

const SELECTORS = {
  conversationRows: '[data-testid="conversation-item"]',
  conversationTitle: '[data-testid="conversation-title"]',
  composer: '[contenteditable="true"]',
  sendButton: 'button[type="button"]'
};

export class PlaywrightZaloWebAdapter implements ZaloWebAdapter {
  constructor(private readonly page: Page) {}

  async discoverGroups(): Promise<GroupConfig[]> {
    const rows = await this.page.$$(SELECTORS.conversationRows);
    const names = await Promise.all(
      rows.map(async (row, index) => {
        const title = await row.$eval(SELECTORS.conversationTitle, (node) => node.textContent ?? '');
        return {
          id: `group-${index}`,
          zaloGroupKey: `group-${index}`,
          name: title.trim(),
          isPinned: false,
          defaultReply: '',
          keywordRules: [],
          patternRules: []
        };
      })
    );
    return names;
  }

  async sendMessage(_groupId: string, text: string): Promise<void> {
    await this.page.locator(SELECTORS.composer).fill(text);
    await this.page.locator(SELECTORS.sendButton).click();
  }

  async onIncomingMessage(listener: (message: IncomingMessage) => Promise<void>): Promise<void> {
    await this.page.exposeFunction('onBotIncomingMessage', listener);
  }
}
```

- [ ] **Step 4: Run the documented smoke flow on the Windows machine and capture the first working selector set**

Run: follow `docs/manual-smoke/zalo-bot-phase-1.md`

Expected: you can log in, see discovered conversations, and manually confirm one reply path. Update selectors immediately if the first guess does not match actual Zalo DOM.

- [ ] **Step 5: Commit**

```bash
git add packages/bot-core/src/adapter/playwright-zalo-web-adapter.ts packages/bot-core/src/adapter/playwright-session-manager.ts packages/bot-core/src/runtime/bot-service.ts docs/manual-smoke/zalo-bot-phase-1.md
git commit -m "feat: add first working zalo web adapter selectors"
```

## Task 11: Add Bot Control Endpoints And Wire Group Config Saving

**Files:**
- Modify: `apps/backend/src/routes/bot-routes.ts`
- Modify: `apps/backend/src/server.ts`
- Modify: `apps/backend/tests/server.test.ts`
- Modify: `apps/frontend/src/lib/api.ts`
- Modify: `apps/frontend/src/components/GroupConfigPanel.tsx`
- Modify: `apps/frontend/src/App.tsx`

- [ ] **Step 1: Write the failing control-plane tests**

Append to `apps/backend/tests/server.test.ts`:

```ts
it('starts the bot from the control endpoint', async () => {
  let started = false;
  const server = buildServer({
    getSnapshot() {
      return { state: 'idle', groups: [] };
    },
    async startBot() {
      started = true;
    },
    async stopBot() {},
    async saveGroupConfig() {}
  });

  const response = await server.inject({
    method: 'POST',
    url: '/api/bot/start'
  });

  expect(response.statusCode).toBe(202);
  expect(started).toBe(true);
});
```

- [ ] **Step 2: Run the backend tests and verify the new route fails**

Run: `pnpm --filter @zaloridebot/backend test -- --run tests/server.test.ts`

Expected: FAIL because the start route and dependency methods do not exist yet.

- [ ] **Step 3: Implement control routes and frontend save helpers**

Replace `apps/backend/src/routes/bot-routes.ts` with:

```ts
import type { FastifyInstance } from 'fastify';

type Snapshot = { state: string; groups: unknown[] };

type BotRouteDependencies = {
  getSnapshot(): Snapshot;
  startBot(): Promise<void>;
  stopBot(): Promise<void>;
  saveGroupConfig(groupId: string, payload: unknown): Promise<void>;
};

export async function registerBotRoutes(app: FastifyInstance, provider: BotRouteDependencies) {
  app.get('/api/bot/state', async () => provider.getSnapshot());

  app.post('/api/bot/start', async (_, reply) => {
    await provider.startBot();
    return reply.code(202).send({ ok: true });
  });

  app.post('/api/bot/stop', async (_, reply) => {
    await provider.stopBot();
    return reply.code(202).send({ ok: true });
  });

  app.put('/api/groups/:groupId', async (request, reply) => {
    const { groupId } = request.params as { groupId: string };
    await provider.saveGroupConfig(groupId, request.body);
    return reply.code(204).send();
  });
}
```

Replace `apps/backend/src/server.ts` with:

```ts
import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import type { BotEventBus } from '@zaloridebot/bot-core';
import { registerBotRoutes } from './routes/bot-routes.js';
import { registerBotEventSocket } from './ws/bot-events-socket.js';

export type BotSnapshot = {
  state: string;
  groups: Array<{ id: string; name: string; isPinned: boolean; defaultReply?: string }>;
};

type Dependencies = {
  getSnapshot(): BotSnapshot;
  startBot?(): Promise<void>;
  stopBot?(): Promise<void>;
  saveGroupConfig?(groupId: string, payload: unknown): Promise<void>;
  eventBus?: BotEventBus;
};

export function buildServer(provider: Dependencies) {
  const controls = {
    startBot: provider.startBot ?? (async () => {}),
    stopBot: provider.stopBot ?? (async () => {}),
    saveGroupConfig: provider.saveGroupConfig ?? (async () => {})
  };
  const app = Fastify();
  app.register(websocket);
  app.register(async (instance) => {
    await registerBotRoutes(instance, {
      getSnapshot: provider.getSnapshot,
      ...controls
    });
    if (provider.eventBus) {
      await registerBotEventSocket(instance, provider.eventBus);
    }
  });
  return app;
}
```

Replace `apps/frontend/src/lib/api.ts` with:

```ts
export async function fetchBotSnapshot() {
  const response = await fetch('/api/bot/state');
  return response.json() as Promise<{
    state: string;
    groups: Array<{ id: string; name: string; isPinned: boolean; defaultReply?: string }>;
  }>;
}

export async function startBot() {
  await fetch('/api/bot/start', { method: 'POST' });
}

export async function stopBot() {
  await fetch('/api/bot/stop', { method: 'POST' });
}

export async function saveGroupConfig(groupId: string, payload: { defaultReply: string }) {
  await fetch(`/api/groups/${groupId}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });
}
```

Replace `apps/frontend/src/components/GroupConfigPanel.tsx` with:

```tsx
import { useState } from 'react';

type Group = { id: string; name: string; isPinned: boolean; defaultReply?: string };

export function GroupConfigPanel({
  groups,
  onSave
}: {
  groups: Group[];
  onSave: (groupId: string, defaultReply: string) => Promise<void>;
}) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  return (
    <section>
      <h2>Group Config</h2>
      {groups.length === 0 ? <p>No groups loaded.</p> : null}
      {groups.map((group) => (
        <form
          key={group.id}
          onSubmit={async (event) => {
            event.preventDefault();
            await onSave(group.id, drafts[group.id] ?? group.defaultReply ?? '');
          }}
        >
          <p>{group.name}</p>
          <input
            value={drafts[group.id] ?? group.defaultReply ?? ''}
            onChange={(event) =>
              setDrafts((current) => ({ ...current, [group.id]: event.target.value }))
            }
          />
          <button type="submit">Save Reply</button>
        </form>
      ))}
    </section>
  );
}
```

Replace `apps/frontend/src/App.tsx` with:

```tsx
import { useEffect, useState } from 'react';
import { BotStatusCard } from './components/BotStatusCard';
import { EventFeed } from './components/EventFeed';
import { GroupConfigPanel } from './components/GroupConfigPanel';
import { fetchBotSnapshot, saveGroupConfig, startBot, stopBot } from './lib/api';
import { connectBotEvents } from './lib/ws';

export default function App() {
  const [state, setState] = useState('idle');
  const [groups, setGroups] = useState<Array<{ id: string; name: string; isPinned: boolean; defaultReply?: string }>>([]);
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    fetchBotSnapshot()
      .then((snapshot) => {
        setState(snapshot.state);
        setGroups(snapshot.groups);
      })
      .catch(() => {
        setState('offline');
      });

    const socket = connectBotEvents((event) => {
      setEvents((current) => [JSON.stringify(event), ...current].slice(0, 20));
    });

    return () => socket.close();
  }, []);

  return (
    <main>
      <h1>ZaloRideBot Dashboard</h1>
      <button onClick={() => void startBot()}>Start Bot</button>
      <button onClick={() => void stopBot()}>Stop Bot</button>
      <BotStatusCard state={state} />
      <GroupConfigPanel
        groups={groups}
        onSave={async (groupId, defaultReply) => {
          await saveGroupConfig(groupId, { defaultReply });
        }}
      />
      <EventFeed events={events} />
    </main>
  );
}
```

- [ ] **Step 4: Run backend and frontend tests to verify the control plane passes**

Run: `pnpm --filter @zaloridebot/backend test && pnpm --filter @zaloridebot/frontend test`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/routes/bot-routes.ts apps/backend/src/server.ts apps/backend/tests/server.test.ts apps/frontend/src/lib/api.ts apps/frontend/src/components/GroupConfigPanel.tsx apps/frontend/src/App.tsx
git commit -m "feat: add bot controls and group config save flow"
```

## Self-Review Checklist

- Spec coverage:
  - persistent Windows headful session: Tasks 6 and 10
  - discover and pin groups: Tasks 4, 5, 7, 8, 10, and 11
  - keyword plus pattern matching: Task 3
  - fixed per-group reply: Tasks 5, 8, and 11
  - runtime dedupe only: Task 3
  - thin backend and frontend visibility layers: Tasks 7, 8, and 11
  - manual smoke and operational checks: Tasks 9 and 10
- Placeholder scan:
  - no `TODO`, `TBD`, or deferred implementation markers are left in tasks
  - the only intentionally manual area is selector capture, which is explicit because live Zalo DOM values cannot be known before inspection
- Type consistency:
  - `BotState`, `GroupConfig`, `IncomingMessage`, `MatchResult`, and `BotSnapshot` names are consistent across tasks

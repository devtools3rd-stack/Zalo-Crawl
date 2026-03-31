# ZaloRideBot Bot Core Phase 1 Design

Date: 2026-03-31
Status: Draft approved in terminal, written for review
Scope: Bot core first for ZaloRideBot. Backend and frontend are limited to thin control and visibility layers that support the bot core.

## 1. Goal

Build a Playwright-based bot core for Zalo Web that:

- runs on a local Windows machine
- uses one persistent Zalo account session
- discovers available group chats and lets an operator pin selected groups
- monitors only pinned groups
- detects ride-related messages using keyword rules plus whitelist patterns
- sends one fixed auto-reply per group immediately when a message matches
- persists browser session locally so restart usually does not require QR login again

Phase 1 explicitly optimizes for a stable single-account operator workflow rather than multi-account orchestration.

## 2. Non-Goals

The following are out of scope for phase 1:

- multi-account or multi-session support
- full backend platform orchestration
- complex message template variables
- NLP, scoring, or ML-based message classification
- persistent dedupe across restarts
- replaying old messages at startup
- full containerized deployment

## 3. Operating Constraints

- Zalo group access is through Zalo Web automation only. There is no public API for this use case.
- The bot must assume Zalo Web DOM structure can change at any time.
- The bot runs in Chromium with Playwright in headful mode and stays visible for the operator.
- The initial deployment target is a local Windows machine.
- The bot must use a persistent local browser profile to preserve login state when possible.

## 4. Recommended Approach

Phase 1 uses a hybrid stateful bot design.

Reasoning:

- direct DOM automation is unavoidable, but should be isolated behind a single adapter boundary
- business logic such as rule evaluation, dedupe, and lifecycle state should remain independent from DOM selectors
- this design keeps phase 1 practical while leaving a clean path for backend and frontend integration later

Alternative approaches considered and rejected for phase 1:

- DOM-driven bot without clear boundaries: faster to start, but too fragile and hard to evolve
- large workflow script: quickest to prototype, but poor maintainability once reconnect, events, and configuration are added

## 5. High-Level Architecture

The bot core runs as one Node.js process and is split into six focused modules.

### 5.1 SessionManager

Responsibilities:

- launch Playwright with a persistent Chromium profile
- determine whether the bot is authenticated or needs QR login
- surface session-related state transitions
- detect session expiry, browser closure, and login loss

Key states:

- `idle`
- `launching`
- `needs_qr`
- `authenticated`
- `session_expired`
- `browser_closed`
- `error`

### 5.2 ZaloWebAdapter

This is the only layer allowed to touch Zalo Web DOM details.

Responsibilities:

- navigate Zalo Web
- discover available groups
- open a target group
- detect new incoming messages from the UI
- send a reply message
- hide DOM selectors and page interaction details from the rest of the system

Public capability surface should be high-level, for example:

- `discoverGroups()`
- `openGroup()`
- `watchIncomingMessages()`
- `readLatestMessages()`
- `sendMessage()`

### 5.3 GroupRegistry

Responsibilities:

- store discovered groups
- store operator-pinned groups
- store one fixed `defaultReply` per pinned group
- store keyword rules and pattern rules per group

Phase 1 storage can be a local JSON file. A database is unnecessary at this stage.

### 5.4 MessagePipeline

Responsibilities:

- normalize raw message data coming from the adapter
- discard empty messages
- discard self-authored messages
- create a runtime identifier used for dedupe
- forward normalized messages to rule evaluation

### 5.5 RuleEngine

Responsibilities:

- apply ride-detection rules deterministically
- require at least one keyword hit and at least one whitelist pattern hit
- return a match result with explicit reasons

Phase 1 keeps rule logic explainable and deterministic. No fuzzy scoring or NLP is used.

### 5.6 ReplyOrchestrator

Responsibilities:

- receive match decisions from the rule engine
- load the pinned group's fixed default reply
- send the reply through the adapter
- emit success or failure events

## 6. Runtime Data Flow

The runtime flow is:

`Playwright session -> ZaloWebAdapter -> MessagePipeline -> RuleEngine -> ReplyOrchestrator -> ZaloWebAdapter`

This flow keeps automation concerns isolated while preserving a simple path from UI event to business action.

## 7. Lifecycle and State Machine

The bot uses a simple operational state machine:

`idle -> launching -> needs_qr | authenticated -> discovering_groups -> monitoring -> error -> restarting`

### 7.1 Launch and Authentication

- On startup, the bot opens Chromium in headful mode using a persistent profile directory.
- If the stored session is still valid, the bot transitions directly to `authenticated`.
- If the session is missing or invalid, the bot transitions to `needs_qr`.
- Once the operator scans the QR code and Zalo Web is authenticated, the bot transitions back into normal runtime flow.

### 7.2 Group Discovery and Pinning

- After authentication, the bot scans the available conversation and group list in Zalo Web.
- The adapter returns normalized discovered group records.
- The operator selects which groups should be monitored.
- The pinned group set is written to the group registry.

Phase 1 monitors only pinned groups, not every group in the account.

### 7.3 Monitoring Model

- The bot processes new messages only.
- When a group is opened for monitoring, the adapter establishes a ready point and ignores older visible history.
- No historical replay is attempted on startup or reconnect.
- The bot uses a central watcher strategy: detect group activity from the conversation list, enter active groups, collect newly arrived messages, and process them through the pipeline.

### 7.4 Recovery Model

- Short transient failures use bounded retries with small backoff.
- Browser closure, tab crash, or visible logout transitions the bot to `error` and then `restarting`.
- Restart logic attempts to reuse the persisted profile first.
- If the session is no longer valid, the bot returns to `needs_qr`.

Phase 1 does not require a complex external supervisor. Recovery can remain inside the bot process.

## 8. Internal Data Model

### 8.1 BotGroup

- `id`: internal stable key
- `zaloGroupKey`: source-derived identifier if available, otherwise a local fingerprint
- `name`
- `isPinned`
- `defaultReply`
- `keywordRules`
- `patternRules`

### 8.2 IncomingMessage

- `runtimeMessageId`
- `groupId`
- `senderDisplayName`
- `text`
- `receivedAt`
- `isSelf`

### 8.3 MatchResult

- `matched`
- `matchedKeywords`
- `matchedPatterns`
- `reason`

### 8.4 ReplyAttempt

- `messageId`
- `groupId`
- `replyText`
- `status`: `queued | sent | failed`
- `error`

## 9. Message Detection and Matching Rules

### 9.1 Rule Strategy

A message is considered a ride candidate only when both conditions are true:

- at least one keyword rule matches
- at least one whitelist pattern matches

This reduces false positives compared with keyword-only matching.

### 9.2 Rule Types

Supported phase 1 rule types:

- simple string keyword checks
- lightweight regex keyword rules
- whitelist regex patterns for fields such as:
  - phone number
  - time expression
  - price expression
  - ride pickup or destination wording

### 9.3 Reply Strategy

- each pinned group has one fixed reply text
- when a message matches, the bot sends that group's fixed reply immediately
- phase 1 does not interpolate variables from the message into the reply

## 10. Dedupe Behavior

Phase 1 dedupe applies only during the current runtime session.

### 10.1 Preferred Identifier

If Zalo Web exposes a stable message-level marker in the DOM, that marker should be used as the primary message identity.

### 10.2 Fallback Fingerprint

If no stable message identifier is available, the bot should generate a fingerprint using a combination of:

- group identity
- sender display name
- normalized message text
- timestamp bucket or adjacent message timing signal

### 10.3 Accepted Limitation

Because dedupe is not persisted, a restart may cause the same visible message to be processed again if it is rediscovered by the UI. This is accepted in phase 1.

## 11. Error Handling

Errors are handled in three classes.

### 11.1 Recoverable Errors

Examples:

- selector not found temporarily
- group content still loading
- first send attempt fails due to timing

Handling:

- short retries
- explicit timeout per action
- event emission for observability

### 11.2 Session Errors

Examples:

- QR screen appears again
- stored session becomes invalid
- visible logout state

Handling:

- transition to `needs_qr` or `restarting`
- pause reply activity until authentication is restored

### 11.3 Fatal Adapter Errors

Examples:

- Zalo Web DOM changed enough that discovery or message extraction no longer works
- the adapter can no longer determine group or message context safely

Handling:

- move the bot into degraded or error state
- stop auto-reply instead of guessing
- emit a high-signal error event and log entry

## 12. Observability

Phase 1 needs event emission plus structured logs.

### 12.1 Core Events

- `bot.state_changed`
- `auth.qr_required`
- `auth.logged_in`
- `groups.discovered`
- `groups.pinned_changed`
- `message.detected`
- `message.matched`
- `reply.sent`
- `reply.failed`
- `bot.error`

### 12.2 Logging

Logs should be structured or at least consistent enough to answer:

- what state the bot was in
- which group was being processed
- whether a message matched or was skipped
- whether a reply was sent or failed
- whether failure came from auth, DOM interaction, or rule logic

## 13. Backend and Frontend Boundary

Phase 1 backend and frontend exist to control and observe the bot core, not to own the ride-detection logic.

### 13.1 Backend Responsibilities

The Fastify backend should remain thin and limited to:

- start and stop bot lifecycle
- expose current bot state
- expose QR-required or authenticated status
- return discovered groups
- save pinned groups and their configuration
- stream realtime events over WebSocket

### 13.2 Frontend Responsibilities

The React dashboard should remain thin and limited to:

- display bot state
- display login state
- show discovered groups
- allow pinning groups
- edit per-group default reply, keywords, and patterns
- display realtime events and recent message activity

### 13.3 Boundary Rule

The backend and frontend must not implement message matching or reply decision logic. That logic stays in the bot core to avoid split-brain behavior.

## 14. ToS and Operational Risk Posture

Because this system relies on unofficial browser automation:

- keep interaction cadence human-like
- avoid spammy repeated sends
- keep phase 1 to a single account session
- provide a kill switch that can disable auto-reply quickly
- expect periodic maintenance when Zalo Web changes

## 15. Testing Strategy

Testing for phase 1 should stay practical and aligned with the real risks.

### 15.1 Unit Tests

Strong automated coverage should exist for:

- rule engine
- text normalization
- runtime dedupe
- group configuration validation
- lifecycle state transition logic

### 15.2 Adapter Contract Tests

Use a fake or mock adapter to verify the core logic around:

- message entering the pipeline
- match and skip behavior
- duplicate suppression inside one runtime session
- reply success and failure event emission
- session state transitions reported by the adapter

### 15.3 Manual Smoke Tests on Real Zalo Web

Required manual checks on Windows:

- first-time QR login works
- restart keeps the session when Zalo still accepts it
- group discovery works
- pinning groups works
- matching messages trigger replies
- non-matching messages do not trigger replies
- self-authored bot messages are ignored
- browser closure or logout produces the correct bot state

## 16. Definition of Done for Phase 1

Phase 1 is complete when all of the following are true:

- the bot runs on a local Windows machine using Chromium in headful always-on mode
- one Zalo account session can persist locally across restart when still valid
- the operator can discover available groups and pin selected groups for monitoring
- the bot monitors only pinned groups
- the bot processes new messages only
- detection uses keyword rules plus whitelist patterns
- each pinned group has one fixed auto-reply
- runtime dedupe prevents duplicate replies inside one running session
- event emission and logs are sufficient for backend and frontend visibility
- the manual smoke checklist passes

## 17. Known Limitations Accepted in Phase 1

- DOM fragility remains the largest operational risk
- dedupe does not survive process restart
- no multi-session or multi-account support
- no reply templates with extracted variables
- no historical replay or unread catch-up logic
- Windows local operation is the only target environment

## 18. Implementation Readiness Summary

This design is intentionally narrow. It aims to produce a bot core that is:

- operationally simple enough to ship first
- modular enough to survive UI change and future backend/frontend integration
- honest about the risks of unofficial Zalo Web automation

The next step after spec approval is to write an implementation plan for this bot-core-first phase.

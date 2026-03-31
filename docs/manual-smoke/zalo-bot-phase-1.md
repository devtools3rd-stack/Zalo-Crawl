# ZaloRideBot Phase 1 Manual Smoke

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

1. Run `pnpm install`.
2. Run `pnpm.cmd --filter @zaloridebot/backend build` and then `node apps/backend/dist/index.js`.
3. In a second terminal, run `pnpm.cmd --filter @zaloridebot/bot-core build` and then `node packages/bot-core/dist/src/runtime/manual-smoke-cli.js`.
4. Verify the QR screen appears on first launch if no persisted session exists.
5. Scan QR and confirm Zalo Web loads.
6. Restart the bot and confirm QR is not required when the session remains valid.
7. Discover groups, pin one group, and save config.
8. Send a matching message in the pinned group and confirm the fixed reply is sent once.
9. Send a non-matching message and confirm no reply is sent.
10. Close the browser and confirm the backend reports a non-monitoring state.

## Task 10 Verification Notes

### Code Implemented

- `discoverGroups()` now derives first-pass runtime-stable `id` and `zaloGroupKey` values from conversation-row metadata instead of using row index only.
- `sendMessage(groupId, text)` now attempts to focus the matching conversation for the requested `groupId` before typing into the composer and clicking send.
- `onIncomingMessage()` now registers an exposed bridge and installs a page-side `MutationObserver` watcher that can forward newly added message rows through that bridge.
- The selector set is still a first-pass provisional baseline because it was implemented without access to an authenticated Zalo conversation view.

### Live Verified On April 1, 2026

- Playwright can launch Chromium and reach `https://chat.zalo.me/`.
- The page available during manual smoke was the unauthenticated login screen with title `Zalo - Đăng nhập Zalo`.

### Still Requires Authenticated-Session Rerun

- Confirm the provisional conversation list, row/title, message list, message row/text, composer, and send button selectors against the authenticated Zalo Web DOM.
- Confirm that discovered group ids map back to real conversations closely enough for `sendMessage()` targeting in a live session.
- Confirm that the installed DOM observer emits incoming messages once per newly added message row in a live authenticated chat view.

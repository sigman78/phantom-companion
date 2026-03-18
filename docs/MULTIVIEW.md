# LAN Multi-View Synchronization Research

## 1. Problem Statement

The Phantom Companion app is a fully static Astro + Svelte SPA. All game state
lives in Svelte stores backed by `localStorage` in a single browser tab on a
single device. There is no server, no API, and no networking layer.

**Goal**: share live game state to other LAN devices in real-time (or
near-real-time) — one game-master device controls the game, other
tablets/laptops follow along as read-only displays.

Two sub-questions must be answered:
- **(a) Topology** — who can write state, who can only read it?
- **(b) Sync mechanism** — how does state travel between devices?


## 2. Topology Options

| Topology | Complexity | Conflict risk | Notes |
|----------|------------|---------------|-------|
| 1 controller + N read-only followers | Low | None | Recommended |
| All-equal (any peer can write) | High | Yes — needs CRDT / locks | Not needed for tabletop use |

**Conclusion**: controller + followers matches the use case perfectly. A
tabletop companion app has a single game master who owns the game state. Peers
never need to write independently, so there is no reason to pay the complexity
cost of a CRDT or locking scheme.


## 3. Five Approaches

---

### A. Standalone WebSocket Relay Server (Bun/Node) — SIMPLEST LOCAL SETUP

Keep Astro fully static (no build changes). Add a single `server/relay.ts`
(~60 lines, Bun or Node `ws` package).

**How it works:**
- Controller connects as `"host"`, followers connect as `"viewer"`.
- On any store change the controller serializes `SavedState` (already produced
  by `persistence.ts`) and sends it to the relay.
- The relay broadcasts the snapshot to all connected viewers.
- Viewer instances receive the snapshot and call `restoreFromSave()` (already
  exists in `gameStore`).
- Followers suppress their own store mutations via a read-only mode flag.
- Run with: `bun run server/relay.ts`
- Discovery: manual LAN IP entry, or the Astro app can embed the WS URL as a
  configurable setting.

**Pros:**
- Zero Astro build changes.
- Reuses existing `persistence.ts` / `restoreFromSave()` — tiny integration
  surface.
- Small blast radius; relay is throwaway code (~60 lines).

**Cons:**
- Requires running a second process on the host device.
- Followers must know the host LAN IP address.

---

### B. Astro SSR + Node Adapter with WebSocket Endpoint

Convert Astro to SSR mode with `@astrojs/node`. Add an API route or middleware
that upgrades an HTTP connection to a WebSocket. The relay logic lives inside
the Astro process.

**Pros:**
- Single process; no second port.

**Cons:**
- Astro SSR adds build and deployment overhead to a previously static app.
- WebSocket handling inside Astro middleware is not officially documented and
  may require low-level Node HTTP server access.
- Highest complexity of all options.

---

### C. Server-Sent Events (SSE) Relay — Cleanest Read-Only Protocol

Same standalone relay concept as A, but uses HTTP SSE instead of WebSocket.

**How it works:**
- Controller POSTs the serialized `SavedState` to a `/state` endpoint.
- The relay streams the update to all followers via SSE (`text/event-stream`).
- Followers call `restoreFromSave()` on each SSE message.
- SSE is one-directional by design — followers cannot accidentally send
  commands over the same channel.
- Browsers auto-reconnect SSE streams without extra client code.

**Pros:**
- Semantically enforces read-only direction on the wire.
- Plain HTTP; works through most proxies and firewalls.
- Built-in browser auto-reconnect.

**Cons:**
- Requires an extra POST leg from the controller (vs. a single WS message in A).
- Slightly more relay code than a pure WebSocket relay.

---

### D. WebRTC Peer-to-Peer with QR Code Signaling — NO LOCAL SERVER

Uses browser-native `RTCPeerConnection` and data channels. No server is
required after the initial handshake.

**How it works:**
- Controller generates an SDP offer, encodes it as a QR code displayed in-app.
- Follower scans the QR code, generates an SDP answer, and displays its own QR.
- Controller scans the answer QR — the P2P data channel is established.
- Chrome generates mDNS ICE candidates since v76 (August 2019), enabling LAN
  P2P connections without a STUN server.
- On each store change, the controller sends the serialized `SavedState` over
  the data channel; the follower calls `restoreFromSave()`.

**Note on automatic discovery**: Browsers have no mDNS/UDP multicast API for
security reasons. True zero-config LAN discovery is not possible from a pure
browser context. Manual QR exchange is the practical serverless alternative.

**Pros:**
- No server process required — truly serverless after the initial handshake.
- State never leaves the LAN.

**Cons:**
- One QR exchange required per follower per session (one-time setup friction).
- Firefox LAN/mDNS WebRTC support is partial.
- No automatic discovery possible.

---

### E. Cloudflare Pages + Durable Objects — BEST SETUP UX

Deploy the Astro static build to Cloudflare Pages. Add a Cloudflare Worker
with a Durable Object as the coordination layer.

#### E1: CF Durable Object as WebRTC Signaling Room (P2P data on LAN)

- Controller creates a room via `POST /api/room` and receives a short code
  (e.g., `abc123`).
- Controller and followers open a WebSocket to the Durable Object room
  identified by that code.
- The Durable Object relays SDP offer/answer and ICE candidates between peers.
- Once the WebRTC handshake completes, actual game data flows P2P directly over
  the LAN. The signaling WebSocket to Cloudflare can then be closed.
- Followers join by entering the room code or scanning a QR of the room URL.

Benefit: no local server; no manual IP entry; no per-peer QR exchange.

#### E2: CF Durable Object as Full Relay (simpler, works over internet)

Skip WebRTC entirely. The Durable Object WebSocket room acts as the relay
itself:
- `controller -> Cloudflare DO -> followers`
- All traffic is routed through Cloudflare even when devices are on the same
  LAN (internet roundtrip).
- Typical added latency: 50-100 ms. Irrelevant for a turn-based tabletop game.
- Significantly simpler code than E1 — no ICE negotiation, no data channels.
- Works from anywhere, not just a local LAN: bonus for playing remotely with
  friends.

**Pros (both E variants):**
- Best discovery UX — a short room code is all followers need.
- No local server process on the host device.
- CF free tier covers Durable Objects at 100k requests/day.
- App can be publicly hosted and usable from any location.

**Cons (both E variants):**
- Requires internet access for signaling (not offline-capable).
- Requires a Cloudflare account and Workers/Pages setup.
- Adds a cloud dependency and associated CORS / auth considerations.


## 4. State Sync Mechanics (Applies to All Approaches)

**What to sync**: `SavedState` (phase + turn data) — already produced and
consumed by `persistence.ts`. No schema changes needed.

**What NOT to sync across devices**:
- `selectedUnitId` — local per follower so each can independently browse card
  detail without disrupting the controller or other followers.
- `jsonCache` — followers fetch card JSON themselves from static assets (CF
  Pages or local dev server); no need to transfer over the wire.
- `setup` state — controller-only; followers always join a game already in
  progress.

**Shuffle integrity**: deck shuffle happens on the controller only. Followers
receive the already-shuffled deck state via `restoreFromSave()`. Followers do
not need their own RNG.

**Sync frequency**: subscribe to every `gameStore` tick; debounce 100-200 ms
to avoid flooding the relay on rapid successive updates.

**Follower UI changes required**:
- Disable all action buttons (draw, end turn, etc.).
- Show a persistent "following [host]" indicator.
- Keep local `selectedUnitId` reactive for independent detail browsing.


## 5. Comparison Table

| Approach | Server needed | Setup UX | Offline play | Code complexity | Best for |
|----------|--------------|----------|--------------|-----------------|----------|
| A: WS relay (Bun/Node) | Local process | Know LAN IP | Yes | Low | Home LAN, dev use |
| B: Astro SSR + WS | Local (in Astro) | Know LAN IP | Yes | High | Single-process fans |
| C: SSE relay | Local process | Know LAN IP | Yes | Low | Explicit read-only |
| D: WebRTC + QR | None after connect | QR scan | Yes (after connect) | Medium | No-server purists |
| E1: CF Pages + DO (WebRTC signaling) | CF (cloud) | Room code | No | Medium-high | Best LAN latency, hosted |
| E2: CF Pages + DO (full relay) | CF (cloud) | Room code | No | Medium | Best UX, hosted, remote play |


## 6. Recommendation

**For local home LAN sessions**: Start with **Approach A** (standalone WS
relay). No Astro changes required; reuses existing `restoreFromSave()` and
`persistence.ts`; a single ~60-line Bun script is the entire server. Lowest
risk, easiest to verify.

**For a hosted app (Cloudflare Pages deployment)**: **Approach E2** (CF Durable
Object as full relay) gives the best user experience. A short room code is all
followers need to join. Internet-roundtrip latency is irrelevant for a
turn-based tabletop game. Approach E1 (WebRTC P2P signaling) is more complex
(ICE negotiation, data channels) for a marginal latency benefit that does not
matter in this use case.

**If no server of any kind is acceptable**: **Approach D** (WebRTC + QR). The
QR exchange is a one-time friction per session per follower, which is
acceptable in a game-table setup context.


## 7. Open Questions and Future Work

- **Late-join**: a follower connecting mid-battle should receive an immediate
  state snapshot from the controller. All approaches support this with a
  simple "send current state on new connection" trigger.
- **Mobile follower UI**: full app in read-only mode, or a stripped display
  view? The full app with read-only flag is the path of least resistance.
- **CF approach security**: add room expiry (TTL on the Durable Object) and a
  simple password or PIN for the room to prevent unauthorized followers from
  joining a public room code.

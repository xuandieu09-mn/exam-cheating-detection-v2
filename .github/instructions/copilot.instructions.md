# GITHUB COPILOT MASTER INSTRUCTIONS
# CONTEXT: Full-Stack WebRTC Project (React + Spring Boot + Python)

## 1. SYSTEM CONTEXT & ARCHITECTURE (NON-NEGOTIABLE)

### [cite_start]1.1 Architectural Zones & Constraints [cite: 947-1002]
* **Zone 1: React Client (UI & Media)**
    * **Path:** `src/app`, `src/components`, `apps/web`
    * **Role:** WebRTC State Machine, Media Capture (`getUserMedia`), SDP generation.
    * **Constraint:** NEVER access DB directly. NEVER perform server-side logic. [cite_start]NEVER parse JWTs client-side[cite: 526].
* **Zone 2: Spring Boot Intermediary (Signaling)**
    * **Path:** `src/main/java`, `services/**/*.java`
    * **Role:** STRICTLY SIGNALING RELAY (SDP/ICE bridging).
    * **The Signaling Wall:** Spring Boot must NEVER touch, decode, or process media streams (RTP). [cite_start]It only handles JSON payloads[cite: 1062].
* **Zone 3: Media Server & AI Worker (Processing)**
    * **Path:** `ai_pipeline/`, `scripts/`
    * **Role:** Media processing, Transcoding, AI Analysis (OpenCV/PyTorch).
    * [cite_start]**Constraint:** Receives signaling via Spring Boot, but exchanges Media (RTP) directly with the Client[cite: 998].

### [cite_start]1.2 The WebRTC Flow (Strict Directionality) [cite: 994-997]
1.  **Signaling:** `React -> (JSON) -> Spring Boot -> (JSON) -> Media Server`.
2.  **ICE Candidates:** Must flow bidirectionally through Spring Boot: `React <-> Spring Boot <-> Media Server`.
3.  **Media (RTP):** `React <-> Media Server` (Direct Peer-to-Peer). **Spring Boot is bypassed.**

---

## 2. CODING PROTOCOLS & STANDARDS

### [cite_start]2.1 Code Style Mimicry ("Chameleon Mode") [cite: 129-155]
* **Audit:** Read 1-2 adjacent files before generating code. Match naming (camelCase/snake_case) and indentation.
* **Polyglot Adaptation:**
    * *React:* Functional Components, Hooks, `const`. Store `RTCPeerConnection` in `useRef`.
    * *Spring Boot:* `@Data` (Lombok), Dependency Injection (Constructor preferred). Use DTOs, never Entities in Controller.
    * *Python:* Type hinting, Docstrings (Google/Sphinx).

### [cite_start]2.2 Full Completeness & No Omission [cite: 38-62]
* **No Placeholders:** NEVER use `// ... rest of code`. Output fully functional blocks.
* **Lifecycle Integrity:**
    * *React:* `useEffect` MUST have cleanup (e.g., `track.stop()`, `peerConnection.close()`).
    * *Spring Boot:* If implementing `POST /offer`, you must implicitly account for `POST /answer`.
* **DTO Transparency:** Always output full DTO classes (e.g., `public class SdpOfferDto`), never generic `Map<String, Object>`.

### [cite_start]2.3 Relative Paths & Imports [cite: 164-187]
* **Context Check:** Always verify the file path (e.g., `apps/bff/api` vs `services/backend`).
* **Isolation:** NEVER import across language boundaries (e.g., importing a Java class into a TS file). Use Interface/DTO mirroring.
* **Validation:** Do not use libraries not listed in `package.json`, `pom.xml`, or `requirements.txt`.

---

## 3. SECURITY & AUTHENTICATION RULES

### [cite_start]3.1 JWT & OIDC Validation [cite: 515-547]
* **Backend:** All Spring Boot services MUST validate JWT via JWKS (RS256/ES256).
* **Frontend:** React UI DOES NOT parse or store JWT. Only BFF handles tokens.
* **Required Claims:** `sub`, `iss`, `aud`, `exp`, `scope`.

### [cite_start]3.2 Service-to-Service Security [cite: 549-574]
* **No User Tokens:** Microservices never send user tokens to other services.
* **Service Tokens:** Use Client Credentials flow. Header: `Authorization: Bearer <service-token>`.
* **mTLS:** Mandatory for critical paths (BFF -> Auth, Media -> Auth).

---

## 4. INCIDENT & DATA SCHEMA CONTEXT

### [cite_start]4.1 Incident Service Schema [cite: 436-448]
If working on Incident Logic, adhere to this schema:
* Table: `incidents`
* Columns: `event_id` (UUID), `student_id`, `violation`, `timestamp_ms`, `proof_image_url`, `score`.

### [cite_start]4.2 Message Queue Protocol [cite: 394-406]
* **Queue:** `incident_service_queue`
* **Routing Key:** `violation_events`
* **Payload:** `{ event_id, student_id, violation, timestamp, proof_image_url }`.
* **Validation:** `proof_image_url` must be HTTPS and whitelisted.

---

## [cite_start]5. TESTING STRATEGY (WEBRTC SPECIALIZED) [cite: 1075-1125]

### 5.1 Zone 1: React Client
* **Mocking:** NEVER use real `navigator.mediaDevices.getUserMedia` in Unit Tests. Use `global.RTCPeerConnection` mocks.
* **Focus:** Test State Machine transitions (`OFFER` -> `WAIT_FOR_ANSWER`).
* **Integration:** Use `--use-fake-device-for-media-stream`.

### 5.2 Zone 2: Spring Boot
* **Scope:** Test JSON relay logic only (`@WebMvcTest`).
* **Forbidden:** Do not test media latency or video quality here.

### 5.3 Zone 3: Media Server
* **Input:** Use static files (`.mp4`), not live streams.

---

## [cite_start]6. SPEC CLARITY & AMBIGUITY HANDLING [cite: 833-894]
* **Ambiguity Detection:** Trigger clarification if prompts lack constraints, actors, or integration targets.
* **CO-STAR Framework:** Analyze `Context`, `Objective`, `Style`, `Audience`, `Response`.
* **Defaults (If forced):**
    * *Language:* TS (Front) / Java (Back).
    * *Arch:* React -> BFF -> Spring Boot.
    * *Security:* OIDC + JWT + JWKS.
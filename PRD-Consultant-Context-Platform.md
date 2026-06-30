# Product Requirements Document
## Consultant Context & Client Relationship Platform ("ContextOS")

**Version:** 0.1 (Draft)
**Owner:** Product
**Status:** Draft for review
**Last updated:** June 29, 2026

---

## 1. Background & Problem Statement

Independent consultants — Medical, Legal, IT, Physiotherapy, Homeopathy, Astrology — manage many client relationships in parallel. Each relationship carries its own history: promises made, advice given, diagnoses or recommendations recorded, and ongoing conversations across multiple sessions.

As a consultant's client base grows, the bottleneck is **not identity** (knowing who a client is) but **context**:
- What was discussed last time
- What was promised or committed to
- What advice or diagnosis was given, and why
- What still needs to happen next (tasks, follow-ups, deadlines)

Today this context lives in scattered notepads, WhatsApp threads, memory, and disconnected files. There is no single timeline per client that captures interactions, commitments, tasks, and documents — and no way to quickly recap before the next session.

## 2. Objective

Build a single platform where, for every client relationship, a consultant can:
1. See a **chronological timeline** of everything that happened (appointments, notes, recordings, commitments, tasks, documents).
2. **Capture** new interactions during/after a session (audio → transcript, notes, files).
3. **Track commitments and tasks** with deadlines and get notified before they're missed.
4. Use an **AI assistant (RAG-based)** scoped to a client's history to get a recap, ask questions, or summarize "what happened and what's next."
5. Let clients **discover, book, and pay** consultants, and manage the appointment lifecycle (approve/reschedule/reject).

**North Star metric:** Time for a consultant to feel "fully briefed" before a session, and number of commitments/deadlines met (not missed) per consultant.

## 3. Users & Personas

| Persona | Description | Key needs |
|---|---|---|
| **Consultant** | Medical, Legal, IT, Physiotherapy, Homeopathy, or Astrology professional, solo practice | Never lose context; manage schedule; get paid; recap fast |
| **Client** | Person seeking consultation, may work with multiple consultants over time | Easy booking, transparency on commitments/advice given, document sharing |
| **Platform Admin** | Internal ops/support | Manage consultant onboarding/verification, disputes, payments, compliance |
| *(Future)* **Consultant's Assistant/Staff** | Delegate for scheduling/admin | Limited-scope access to calendar & docs |

## 4. Scope

### In scope (v1)
- Consultant & client onboarding and profiles
- Consultant discovery & search (by category/specialization)
- Availability/slot management & booking lifecycle (request → approve/reschedule/reject)
- Session/interaction logging: audio recording → transcription, manual notes, document upload
- Commitments & Tasks with deadlines, linked to a client/case
- Dashboard with upcoming deadlines & notifications
- Per-client timeline aggregating all of the above
- AI chat (RAG) scoped per client/consultant for recap, Q&A, summarization
- Payments via Razorpay (appointment fees)
- Role-based access control (consultant only sees their own clients; client only sees their own consultants)

### Out of scope (v1, candidates for v2+)
- Multi-consultant clinics / teams / shared staff access
- Native mobile apps (responsive web only in v1)
- Insurance billing / claims integration
- E-prescriptions with regulatory/legal medical compliance (e-signature, controlled substances)
- Video calling embedded in-platform (assume external tools like Zoom/Meet for now; platform stores notes/recording *about* the call, not the call itself, unless explicitly decided)
- International payment rails beyond Razorpay (multi-currency)
- Group/family sessions as a first-class entity

## 5. Core Workflow (v1)

1. **Client onboarding** — signs up, fills profile (name, contact, optional category preference).
2. **Discover/choose consultant** — browse by category (Medical/Legal/IT/Physio/Homeo/Astrology), view profile, ratings, availability.
3. **Book appointment** — client selects an open slot from consultant's published availability.
4. **Consultant responds** — Approve / Reschedule (propose new time) / Reject (with reason). Client notified at each step.
5. **Session happens**:
   - Consultant starts the appointment session in-app.
   - Records audio (→ transcribed via Whisper), and/or types notes.
   - Uploads supporting documents (reports, prescriptions, contracts, scans, etc.).
   - Logs **commitments** ("I will send the revised contract by Friday") and **tasks** for the client ("Get blood test done by next week").
6. **Case/timeline updates** — every interaction, commitment, task, and document attaches to the Client–Consultant relationship (a "Case") and appears on a shared chronological timeline.
7. **AI assistant** — consultant (and optionally client, with restrictions) asks the AI chat: "What did I promise this client last time?" / "Summarize this client's case so far." AI answers using RAG over that client's timeline only.
8. **Deadlines & notifications** — dashboard surfaces upcoming/overdue commitments and tasks; notifications fire via email/push/in-app.
9. **Payment** — appointment fee collected via Razorpay at booking or post-session (configurable by consultant).

## 6. Entities & Attributes (Data Model)

> Designed to map cleanly to Prisma schemas / PostgreSQL (Supabase). IDs are UUIDs unless noted. Timestamps `createdAt`/`updatedAt` implied on all entities.

### 6.1 User (base auth identity)
- `id`, `email`, `phone`, `passwordHash` / authProviderId, `role` (`CLIENT` | `CONSULTANT` | `ADMIN`), `isVerified`, `isActive`, `lastLoginAt`

### 6.2 ClientProfile
- `id`, `userId` (FK), `fullName`, `dob`, `gender`, `address`, `emergencyContact`, `preferredLanguage`, `timezone`, `profilePhotoUrl`, `kycStatus` (if required for medical/legal), `guardianInfo` (nullable, for minors)

### 6.3 ConsultantProfile
- `id`, `userId` (FK), `fullName`, `category` (`MEDICAL` | `LEGAL` | `IT` | `PHYSIOTHERAPY` | `HOMEOPATHY` | `ASTROLOGY`), `subSpecialization` (e.g., "Cardiology", "Corporate Law"), `bio`, `qualifications[]`, `licenseNumber`, `licenseDocUrl`, `verificationStatus` (`PENDING`|`VERIFIED`|`REJECTED`), `yearsOfExperience`, `consultationFee`, `currency`, `languagesSpoken[]`, `timezone`, `ratingAvg`, `ratingCount`, `payoutAccountDetails`, `isAcceptingNewClients`

### 6.4 Availability / Slot
- `id`, `consultantId` (FK), `dayOfWeek` / `specificDate`, `startTime`, `endTime`, `slotDurationMins`, `isRecurring`, `bufferBeforeMins`, `bufferAfterMins`, `status` (`OPEN`|`BOOKED`|`BLOCKED`), `maxBookingsPerSlot` (default 1)

### 6.5 Case (the Client–Consultant relationship container)
- `id`, `clientId` (FK), `consultantId` (FK), `category` (snapshot of consultant category at case creation), `status` (`ACTIVE`|`CLOSED`|`ARCHIVED`), `openedAt`, `closedAt`, `closureReason`, `tags[]`
- *Rationale:* A "Case" is the anchor for the timeline — one per client-consultant pair (or per matter, if a client has multiple distinct matters with the same consultant, e.g. a lawyer handling two unrelated legal issues for the same client).

### 6.6 Appointment
- `id`, `caseId` (FK), `clientId`, `consultantId`, `slotId` (nullable after slot system evolves), `scheduledStart`, `scheduledEnd`, `status` (`REQUESTED`|`APPROVED`|`RESCHEDULE_PROPOSED`|`RESCHEDULED`|`REJECTED`|`CANCELLED`|`COMPLETED`|`NO_SHOW`), `rejectionReason`, `rescheduleReason`, `rescheduleProposedBy`, `mode` (`IN_PERSON`|`AUDIO`|`VIDEO_EXTERNAL`), `meetingLink` (nullable), `feeAmount`, `paymentStatus` (`UNPAID`|`PAID`|`REFUNDED`|`PARTIAL`)

### 6.7 Interaction (a logged session/encounter, may or may not map 1:1 to an Appointment)
- `id`, `caseId` (FK), `appointmentId` (nullable FK — supports ad-hoc logging outside a formal appointment), `consultantId`, `type` (`RECORDED_AUDIO`|`NOTE`|`FOLLOW_UP_CALL`|`MESSAGE`), `occurredAt`, `rawAudioUrl` (S3), `transcriptText`, `transcriptStatus` (`PENDING`|`PROCESSING`|`COMPLETED`|`FAILED`), `transcriptLanguage`, `notesText` (rich text), `durationSeconds`, `consentGiven` (boolean, for recording), `visibility` (`CONSULTANT_ONLY`|`SHARED_WITH_CLIENT`)

### 6.8 Commitment (promise made — typically by consultant to client)
- `id`, `caseId` (FK), `interactionId` (nullable FK, source context), `madeBy` (`CONSULTANT`|`CLIENT`), `description`, `dueDate`, `status` (`PENDING`|`IN_PROGRESS`|`FULFILLED`|`MISSED`|`CANCELLED`), `fulfilledAt`, `priority` (`LOW`|`MEDIUM`|`HIGH`)

### 6.9 Task (action item, typically assigned to client, but could be internal)
- `id`, `caseId` (FK), `interactionId` (nullable FK), `assignedTo` (`CLIENT`|`CONSULTANT`), `title`, `description`, `dueDate`, `status` (`OPEN`|`IN_PROGRESS`|`DONE`|`OVERDUE`|`CANCELLED`), `completedAt`, `reminderSentAt[]`

### 6.10 Document
- `id`, `caseId` (FK), `interactionId` (nullable FK), `uploadedBy` (`CONSULTANT`|`CLIENT`), `fileUrl` (S3), `fileType`, `fileSizeBytes`, `fileName`, `category` (`PRESCRIPTION`|`REPORT`|`CONTRACT`|`ID_PROOF`|`OTHER`), `version`, `previousVersionId` (nullable), `scanStatus` (`PENDING`|`CLEAN`|`INFECTED`), `accessLevel` (`PRIVATE_TO_CONSULTANT`|`SHARED_WITH_CLIENT`)

### 6.11 AISummary
- `id`, `caseId` (FK), `generatedAt`, `summaryType` (`SESSION_RECAP`|`FULL_CASE_SUMMARY`|`ON_DEMAND_QUERY`), `inputInteractionIds[]`, `outputText`, `modelUsed`, `sourceCitations[]` (which interactions/docs were used), `consultantFeedback` (`HELPFUL`|`NOT_HELPFUL`|null), `wasEdited` (boolean, did consultant manually correct it)

### 6.12 ChatMessage (AI assistant conversation log)
- `id`, `caseId` (FK), `userId` (who asked), `role` (`USER`|`ASSISTANT`), `content`, `retrievedSourceIds[]` (RAG citations), `createdAt`

### 6.13 Notification
- `id`, `userId` (FK, recipient), `type` (`APPOINTMENT_REQUEST`|`APPOINTMENT_APPROVED`|`RESCHEDULE`|`COMMITMENT_DUE`|`TASK_DUE`|`TASK_OVERDUE`|`PAYMENT_RECEIVED`|`DOCUMENT_UPLOADED`|`AI_SUMMARY_READY`), `relatedEntityType`, `relatedEntityId`, `channel` (`IN_APP`|`EMAIL`|`SMS`|`PUSH`), `status` (`PENDING`|`SENT`|`FAILED`|`READ`), `scheduledFor`, `sentAt`

### 6.14 Payment / Transaction
- `id`, `appointmentId` (FK), `clientId`, `consultantId`, `razorpayOrderId`, `razorpayPaymentId`, `amount`, `currency`, `status` (`CREATED`|`SUCCESS`|`FAILED`|`REFUNDED`|`PARTIALLY_REFUNDED`), `refundAmount`, `refundReason`, `platformFee`, `consultantPayoutAmount`, `payoutStatus`

### 6.15 Review (post-appointment)
- `id`, `appointmentId` (FK), `clientId`, `consultantId`, `rating` (1–5), `comment`, `isVisible` (moderation flag)

### 6.16 AuditLog (compliance — important given medical/legal data)
- `id`, `actorUserId`, `action`, `entityType`, `entityId`, `ipAddress`, `timestamp`, `metadata` (JSON)

---

## 7. Functional Requirements

### 7.1 Onboarding & Profiles
- FR1: Client and Consultant sign up with email/phone + OTP or password; role selected at signup.
- FR2: Consultant must select **exactly one primary category** at onboarding (Medical/Legal/IT/Physio/Homeopathy/Astrology); sub-specialization is free text or curated list per category.
- FR3: Consultant onboarding requires uploading license/qualification proof; account enters `PENDING` verification until Admin approves. Consultant cannot accept bookings until `VERIFIED`.
- FR4: Client profile fields adapt based on which category of consultant they're booking (e.g., medical history fields only shown/required when booking a Medical consultant) — implemented as optional/conditional profile sections, not hard requirements at signup.

### 7.2 Discovery & Booking
- FR5: Clients can search/filter consultants by category, sub-specialization, language, fee range, rating, availability.
- FR6: Consultants define recurring weekly availability plus date-specific overrides (vacation blocks, one-off extra slots).
- FR7: Client books an open slot → Appointment created in `REQUESTED` state (or `APPROVED` directly if consultant has enabled auto-approve).
- FR8: Consultant can Approve, Propose Reschedule (with new time + reason), or Reject (with mandatory reason) any `REQUESTED` appointment.
- FR9: Client can Accept or Decline a proposed reschedule; decline returns appointment to a state requiring rebooking or cancellation.
- FR10: Both parties can cancel an `APPROVED` appointment up to a configurable cutoff (e.g., 2 hours before); cancellation reason required.

### 7.3 Session Logging
- FR11: Consultant can "Start Session" on an approved Appointment (or create an ad-hoc Interaction not tied to any appointment, e.g., a follow-up phone call).
- FR12: Consultant can record audio in-browser; on stop, audio uploads to S3 and is queued for transcription via Hugging Face Whisper (async job).
- FR13: Transcription status visible to consultant (`PENDING`/`PROCESSING`/`COMPLETED`/`FAILED`); failed jobs are retryable and consultant can fall back to manual notes.
- FR14: Consultant can take free-text/rich-text notes independent of or alongside recordings.
- FR15: Consultant can upload one or more documents per Interaction/Case, tagged by category, with version history if re-uploading a corrected file.
- FR16: Consultant explicitly marks each Document/Interaction as visible to client or consultant-only.

### 7.4 Commitments & Tasks
- FR17: Consultant can log a Commitment (what *they* promised) with a due date, linked to the current Interaction and Case.
- FR18: Consultant can assign a Task to the client (e.g., "complete X by date"), or to themselves as an internal follow-up.
- FR19: Commitments/Tasks change status automatically to `MISSED`/`OVERDUE` when due date passes without completion, triggering a notification.
- FR20: Dashboard widget lists upcoming and overdue Commitments/Tasks across all of a consultant's clients, sortable by due date/priority.

### 7.5 Timeline & Case View
- FR21: For each Case, a unified chronological timeline renders Appointments, Interactions (notes/transcripts), Commitments, Tasks, and Documents as timeline events.
- FR22: Timeline is filterable by event type and date range, and searchable by keyword (matches against notes/transcript text).

### 7.6 AI Assistant (RAG)
- FR23: AI chat is scoped per Case — retrieval only pulls from that Case's interactions, notes, transcripts, commitments, tasks, and documents (never cross-client).
- FR24: Consultant can ask free-form questions ("What did I tell them about dosage last time?") and receive answers with citations linking back to the source Interaction/Document.
- FR25: One-click "Generate session recap" before an upcoming appointment, producing a structured summary: what happened, commitments made (by whom), open tasks, key documents.
- FR26: Consultant can give a thumbs up/down on AI summaries; flagged-as-bad summaries are logged for review and excluded from being treated as ground truth elsewhere.
- FR27: AI must visibly disclose it is an assistant summarizing recorded data, not providing independent medical/legal/professional advice.
- FR28: (Optional, client-facing, configurable per consultant) Clients may view AI-generated summaries the consultant has explicitly shared, but cannot query the consultant's private notes.

### 7.7 Notifications
- FR29: In-app + email notifications for: appointment requested/approved/rescheduled/rejected, commitment/task due soon (configurable lead time, e.g., 24h) and overdue, document uploaded by the other party, payment success/failure.
- FR30: Notification preferences configurable per user per channel.

### 7.8 Payments
- FR31: Razorpay integration for appointment fee collection — order created on booking, payment captured before appointment is marked `APPROVED`-and-paid (configurable: pay-on-booking vs pay-after-session).
- FR32: Refund flow for cancellations per policy (full/partial/none based on cancellation timing).
- FR33: Consultant payout ledger (gross fee – platform commission) viewable by consultant; actual payout disbursement may be manual/batched in v1.
- FR34: Invoices/receipts auto-generated per successful payment.

### 7.9 Access Control & Admin
- FR35: Consultant sees only their own Cases/Clients. Client sees only their own Cases/Consultants. No cross-tenant visibility.
- FR36: Admin can view verification queue, suspend accounts, mediate disputes (e.g., payment disputes, no-show claims), and access audit logs — but not raw clinical/legal notes unless escalated for a specific dispute, logged in AuditLog.

---

## 8. Non-Functional Requirements
- **Data sensitivity & compliance:** Medical and Legal categories involve sensitive personal data. Encrypt data at rest (S3 SSE, Postgres column-level encryption for highly sensitive fields) and in transit (TLS). Maintain audit logs for access to clinical/legal records. Plan for region-specific regulations (e.g., India's DPDP Act; HIPAA-equivalent considerations if expanding beyond India).
- **Data isolation:** Strict row-level security in Supabase/Postgres so a consultant's queries can never return another consultant's case data.
- **Availability:** Booking and dashboard should target high uptime; transcription/AI pipelines can be async/best-effort with visible status rather than blocking the UI.
- **Performance:** Timeline view should paginate/lazy-load for clients with long histories (hundreds of interactions).
- **Scalability:** Transcription and AI summarization run as background jobs/queues, not synchronous request-response, to handle spikes.
- **Retention & deletion:** Support data export and account/data deletion requests in line with privacy regulations, while respecting any legal record-retention obligations for Medical/Legal consultants (these can conflict — needs explicit policy, see open questions).
- **Auditability:** Every access to a client's sensitive record (especially by Admin) is logged.
- **Localization:** Multi-language support for transcription and UI, given Astrology/Homeopathy/Legal practices vary heavily by region/language in India.

---

## 9. Edge Cases

### Booking & Scheduling
1. Two clients attempt to book the same slot simultaneously → only one should succeed; the other sees "slot no longer available" (handle via DB-level locking/unique constraint, not just UI checks).
2. Consultant edits/removes availability *after* a slot is already booked → existing appointment must NOT be silently cancelled; requires explicit reschedule/cancel flow with client notification.
3. Client books across two different consultants for overlapping time slots → allowed (platform doesn't own the client's full calendar), but a warning could be shown if detected.
4. Consultant fails to respond to a booking request within X hours/days → auto-expire the request and notify client to rebook or pick another consultant.
5. Reschedule proposed by consultant, but client doesn't respond → auto-expire after a configurable window, appointment reverts to cancelled, both notified.
6. Time zone mismatches between client and consultant → all displayed times must be explicitly zone-labeled; stored in UTC.
7. Appointment time arrives but neither party "starts" the session → mark as `NO_SHOW` after grace period; allow either party to dispute/flag.
8. Consultant wants to block out time (vacation) after appointments are already booked in that window → must trigger reschedule/cancel workflow for affected appointments, not a silent delete.
9. Daylight saving transitions affecting recurring weekly slots.
10. Client cancels repeatedly / no-shows repeatedly → consultant should be able to flag or restrict that client (future: trust score), without it being silent.

### Recording, Transcription & Notes
11. Client does not consent to being recorded → must be capturable (consent flag) and recording must not proceed/be stored if consent is explicitly denied, where legally required.
12. Audio recording fails mid-session (browser crash, network drop) → partial audio should still be salvaged/uploaded if possible; consultant notified of partial capture rather than silent data loss.
13. Whisper transcription fails or returns low-confidence/garbled output (heavy accents, multiple speakers talking over each other, regional language) → status shown as `FAILED` or "low confidence," consultant can manually edit/retype, original audio remains source of truth.
14. Very long recordings (e.g., > 1 hour) → chunked upload/transcription, progress indicator, avoid timeout failures.
15. Multiple speakers in one recording (e.g., client + family member) → transcript may not distinguish speakers in v1; document this as a known limitation.
16. Consultant accidentally deletes a note/recording → soft-delete with recovery window before hard delete.
17. Sensitive verbal disclosures (e.g., mental health, legal admissions) captured in transcript → access must respect the same confidentiality controls as written notes; not exposed even to Admin without dispute escalation.

### Commitments & Tasks
18. Commitment due date passes with no update → auto-flag `MISSED`, notify consultant; consider also notifying client transparently if the consultant has promised something and missed it.
19. Consultant marks a Commitment "fulfilled" but client disputes it never happened → no built-in arbitration in v1; log timestamps/audit trail as the system of record, surface clearly who marked what.
20. Task assigned to client requires client login/engagement, but many clients (especially older demographics in Astrology/Homeopathy) may not check the platform → notification channel fallback (SMS/WhatsApp/email) needed beyond in-app only.
21. Duplicate/conflicting tasks across multiple sessions (e.g., same task logged twice) → no automatic dedup in v1, but UI should make it easy to spot duplicates on the timeline.
22. Case is closed/archived but has open Commitments/Tasks → require explicit confirmation/resolution prompt before allowing case closure.

### Documents
23. Client uploads a malicious file (malware) or oversized file → enforce file type allow-list, size limits, and a scan step before the file is marked accessible.
24. Same document re-uploaded with corrections → version history rather than overwrite, so historical version used in past advice isn't silently altered.
25. Consultant uploads a document but mis-tags its visibility (accidentally shares a private clinical note with client) → require explicit confirm step on "share with client," and allow un-sharing (though already-viewed content can't be un-seen).
26. Document storage costs/limits per consultant/client → consider quotas and lifecycle policies (e.g., archive older files to cheaper storage tiers).

### AI Assistant / RAG
27. AI hallucinates a commitment or detail not actually present in the underlying notes/transcript → every AI output must show citations back to source Interactions; consultant should be able to flag inaccurate summaries, and flagged summaries should not be reused as a future RAG source.
28. Client tries to use AI chat to extract another client's data via prompt injection or clever phrasing → RAG retrieval must be hard-scoped at the query layer (DB filter by caseId/consultantId), not just prompt-level instruction, since prompt-level restriction alone is not reliable.
29. AI is asked to give direct medical/legal/diagnostic advice rather than summarize → AI should decline to give new clinical/legal advice itself and redirect to "ask your consultant"; it summarizes recorded human judgment, it doesn't substitute for it.
30. Very large case history exceeds context window for summarization → chunking/hierarchical summarization strategy needed (e.g., summarize per-session, then summarize the summaries).
31. Consultant deletes an Interaction that was already used to generate a past AI summary → decide whether existing summaries are retroactively invalidated or remain as historical snapshots (recommend: keep summary but mark source as deleted/unavailable).

### Payments
32. Payment succeeds on Razorpay but webhook/callback fails to reach the platform → reconciliation job needed to avoid "paid but appointment still shows unpaid" state.
33. Client disputes a charge after the session already happened → refund policy must be explicit (e.g., no refund post-session-start) and enforced, with Admin override path for genuine disputes.
34. Currency/region: Razorpay is India-centric — international clients/consultants are out of scope for payments in v1; must be explicitly stated to avoid silent failures.
35. Partial refund scenarios (e.g., consultant joined late, session cut short) → needs a manual Admin-mediated partial refund flow, not fully automated in v1.
36. Consultant's payout account details invalid/missing → block payout, notify consultant, don't lose the transaction record.

### Access, Identity & Compliance
37. A client books the same consultant under two different categories of need over time, or the consultant changes their listed category → Case model should allow multiple Cases between the same Client–Consultant pair if the nature of the relationship genuinely differs (e.g., legal matter A vs legal matter B), rather than forcing one merged timeline.
38. Minor clients (especially relevant for Medical/Legal) → need guardian/parent account linkage and consent handling; not just a flagged date-of-birth field.
39. Consultant account gets suspended/deleted while having active Cases → client must retain access to their own historical data (timeline, documents) even if the consultant is removed from the platform.
40. Client requests full data deletion ("right to be forgotten") but consultant has a legal/medical obligation to retain certain records → conflict must be resolved via policy (e.g., anonymize client-identifying fields but retain clinical/legal record per regulation, rather than full deletion).
41. Admin investigating a dispute needs to view a Case's sensitive content → must go through a logged, justified-access flow (AuditLog), not unrestricted admin visibility by default.
42. Astrology/Homeopathy consultants may operate with looser regulatory oversight than Medical/Legal → verification requirements (FR3) should be tiered by category rather than one-size-fits-all (e.g., Medical/Legal require license verification; Astrology may only require identity verification).

---

## 10. Success Metrics
- % of appointments where a consultant generates/views an AI recap before the session.
- Reduction in missed commitments/tasks (rate of `MISSED`/`OVERDUE` over total).
- Average time-to-brief: time spent reading/listening to recap vs. raw history before a session.
- Booking funnel conversion (search → book → approved → completed).
- Transcription success rate and average turnaround time.
- Payment success rate and refund/dispute rate.
- Consultant retention (active weekly) and client repeat-booking rate.

## 11. Open Questions
1. Should video calling be embedded in-platform in v1, or strictly external (Zoom/Meet links) with the platform only storing post-call artifacts?
2. What is the legal data-retention requirement per category (Medical/Legal especially) in the target jurisdiction(s), and how does it reconcile with client deletion rights?
3. Should clients be able to see consultant-authored "private" notes at all, ever, or only AI summaries explicitly shared by the consultant?
4. Tiered verification: what specific documents are required per category (Medical license vs Legal bar registration vs Astrology — possibly none)?
5. Is multi-speaker diarization in transcription a v1 requirement or acceptable as a v2 improvement?
6. Pricing model for the platform itself — commission per transaction, subscription for consultants, or both?
7. Should an Admin/dispute-resolution workflow be fully specified in v1, or stubbed with manual processes initially?

## 12. Tech Stack (as provided)
- **Frontend:** Next.js, Tailwind CSS
- **Backend/DB:** Prisma (schema/ORM), Supabase, PostgreSQL
- **Storage:** S3-compatible buckets (audio, documents)
- **Transcription:** Hugging Face Whisper (async pipeline)
- **AI Chat / RAG:** LLM + vector retrieval scoped per Case (provider-agnostic; embeddings over transcripts/notes/documents)
- **Payments:** Razorpay (India)
- **Notifications:** Email/SMS/push provider (TBD) + in-app

---

*This PRD is a draft. Section 9 (Edge Cases) and Section 11 (Open Questions) should be reviewed with legal/compliance input before implementation, given the Medical and Legal consultant categories.*

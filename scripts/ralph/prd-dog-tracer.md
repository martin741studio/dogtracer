# PRD: Dog Tracer (Camera + Timeline + Daily Summary)

## Introduction

Dog Tracer is a mobile-first app that helps dog owners document and understand their dog's day using camera photos, timestamps, and GPS locations. The app captures "moments" throughout the day, detects entities (dogs, humans) via cloud processing, and produces personalized end-of-day reports shaped by the dog's personality profile.

**Platform:** Cross-platform mobile (React Native or Flutter)  
**Data Strategy:** Local-first with optional cloud backup  
**Entity Detection:** Cloud API for photo processing  
**Summary Generation:** Rule-based templates driven by owner questionnaire  

---

## Goals

- Capture moments (photo + time + GPS + notes) with minimal friction
- Automatically detect and track dogs and humans in photos via cloud API
- Cluster moments into sessions (walk, play, training, rest, social)
- Build a dog personality profile through owner questionnaire
- Generate end-of-day summaries that match the dog's character
- Provide actionable insights and recommendations
- Export data in multiple formats (PDF, JSON, photo timeline)

---

## User Stories

### US-001: Project Setup and Navigation Shell
**Description:** As a developer, I need the app skeleton with navigation so other features can be built on top.

**Acceptance Criteria:**
- [ ] Cross-platform project initialized (React Native or Flutter)
- [ ] Bottom tab navigation: Home, Timeline, Encounters, Profile
- [ ] Basic app theming and typography established
- [ ] Typecheck/lint passes
- [ ] App launches on iOS and Android simulators

---

### US-002: Moment Capture - Photo + Timestamp
**Description:** As a dog owner, I want to capture a photo with automatic timestamp so I can document my dog's day.

**Acceptance Criteria:**
- [ ] Camera button on home screen opens native camera
- [ ] Photo saved with local time + ISO timestamp
- [ ] Moment stored in local database (SQLite / Hive / similar)
- [ ] Confirmation feedback after capture
- [ ] Typecheck passes

---

### US-003: Moment Capture - GPS Location
**Description:** As a dog owner, I want each moment to include GPS location so I know where events happened.

**Acceptance Criteria:**
- [ ] Request location permission on first capture
- [ ] Store latitude, longitude, accuracy (meters) with each moment
- [ ] Auto-generate place label ("Home", "Beach", "Park") using reverse geocoding
- [ ] Handle location unavailable gracefully
- [ ] Typecheck passes

---

### US-004: Moment Capture - Quick Tags and Notes
**Description:** As a dog owner, I want to add quick tags and notes to moments for context.

**Acceptance Criteria:**
- [ ] After photo capture, show tag selection screen
- [ ] Preset tags: walk, play, rest, training, feeding, vet, bath, social, stress
- [ ] Optional free-text notes field
- [ ] Tags and notes saved with moment
- [ ] Typecheck passes

---

### US-005: Local Database Schema
**Description:** As a developer, I need a robust local database schema for moments, entities, sessions, and profiles.

**Acceptance Criteria:**
- [ ] Moments table: id, photo_path, timestamp, gps, place_label, tags, notes, mood, confidence
- [ ] Entities table: id, type (dog/human), name, metadata (breed, sex, size, relationship)
- [ ] Sessions table: id, type, start_time, end_time, moment_ids, key_photos, behavior_flags
- [ ] DogProfile table: name, age, temperament, triggers, goals
- [ ] Migrations work cleanly
- [ ] Typecheck passes

---

### US-006: Cloud Entity Detection API Integration
**Description:** As a developer, I need to send photos to a cloud API for dog/human detection.

**Acceptance Criteria:**
- [ ] Photo uploaded to cloud detection endpoint after capture
- [ ] API returns detected entities: type (dog/human), bounding box, confidence
- [ ] Results stored locally linked to moment
- [ ] Handle API errors gracefully (retry, offline queue)
- [ ] Typecheck passes

---

### US-007: Entity Detection - Dog Labeling
**Description:** As a dog owner, I want detected dogs labeled so I can identify my dog vs others.

**Acceptance Criteria:**
- [ ] Primary dog labeled as [PRIMARY_DOG] (set in profile)
- [ ] Other dogs labeled as [OTHER_DOG_1], [OTHER_DOG_2], etc.
- [ ] Visual indicator on photo showing detected dogs
- [ ] Typecheck passes

---

### US-008: Entity Detection - Human Labeling
**Description:** As a dog owner, I want detected humans labeled so I can track encounters.

**Acceptance Criteria:**
- [ ] Humans labeled as [PERSON_1], [PERSON_2], etc.
- [ ] Visual indicator on photo showing detected humans
- [ ] Privacy: no automatic identity guessing
- [ ] Typecheck passes

---

### US-009: Identity Management - Name Assignment
**Description:** As a dog owner, I want to assign names to detected dogs and people so I can track them.

**Acceptance Criteria:**
- [ ] Tap on detected entity to open naming dialog
- [ ] For dogs: name, breed (optional), sex (optional), size, relationship (friend/neutral/conflict/unknown)
- [ ] For humans: name, relationship (owner/friend/stranger/neighbor/vet/trainer)
- [ ] Notes field for interaction details
- [ ] Named entities remembered for future photos
- [ ] Typecheck passes

---

### US-010: Timeline View - Daily Moments
**Description:** As a dog owner, I want to see today's moments in chronological order.

**Acceptance Criteria:**
- [ ] Timeline screen shows all moments for selected day
- [ ] Each moment shows: thumbnail, time, place label, tags
- [ ] Tap moment to view full details
- [ ] Date picker to view other days
- [ ] Typecheck passes

---

### US-011: Session Clustering
**Description:** As a developer, I need to automatically group moments into sessions based on time and location.

**Acceptance Criteria:**
- [ ] Moments within 30 min and 100m clustered into session
- [ ] Session types: walk, play, training, rest, social
- [ ] Session stores: start_time, end_time, key_photos (up to 3), behavior_flags
- [ ] Sessions displayed on timeline with visual grouping
- [ ] Typecheck passes

---

### US-012: Dog Mood Inference
**Description:** As a dog owner, I want the app to infer my dog's mood from photos so I can track patterns.

**Acceptance Criteria:**
- [ ] Cloud API returns mood inference: calm, excited, alert, anxious, tired, playful
- [ ] Confidence score (0-100) stored with inference
- [ ] Mood displayed on moment card
- [ ] User can override mood manually
- [ ] Typecheck passes

---

### US-013: Dog Character Profile - Questionnaire
**Description:** As a dog owner, I want to fill out a questionnaire about my dog so the app understands their personality.

**Acceptance Criteria:**
- [ ] Profile setup flow with questions:
  - Dog name
  - Age (optional)
  - Temperament (multi-select): confident, shy, curious, protective, social, independent, high-energy, calm, anxious, reactive
  - Known triggers (free-text list)
  - Training goals (free-text list)
- [ ] Profile editable from settings
- [ ] Profile stored locally
- [ ] Typecheck passes

---

### US-014: Daily Summary - Template Engine
**Description:** As a developer, I need a rule-based template engine to generate daily summaries.

**Acceptance Criteria:**
- [ ] Template system that fills in data from moments, sessions, entities
- [ ] Template variations based on dog temperament:
  - "curious + social" → upbeat, playful narrative
  - "anxious + reactive" → supportive, calm tone
  - "protective" → focus on boundaries
- [ ] Output sections: Overview, Timeline Highlights, Social Map, Behavior Insights, Recommendations
- [ ] Typecheck passes

---

### US-015: Daily Summary - Overview Section
**Description:** As a dog owner, I want a daily overview showing activity stats.

**Acceptance Criteria:**
- [ ] Total moments captured
- [ ] Active time vs rest time (estimated from sessions)
- [ ] Session counts by type (walks, play, training)
- [ ] Distance if GPS route available
- [ ] Top mood of the day + notable shifts
- [ ] Typecheck passes

---

### US-016: Daily Summary - Timeline Highlights
**Description:** As a dog owner, I want chronological session highlights in my daily summary.

**Acceptance Criteria:**
- [ ] Each session shows: time range, location label, geo marker
- [ ] 1-3 representative photos per session
- [ ] Short description in dog's character tone
- [ ] Interactions with named dogs/people listed
- [ ] Tags: ✅ win, ⚠️ trigger, 🐾 social, 🧠 training, 🥣 food, 💤 rest
- [ ] Typecheck passes

---

### US-017: Daily Summary - Social Map
**Description:** As a dog owner, I want to see all dogs and people encountered today.

**Acceptance Criteria:**
- [ ] Dogs encountered: names, encounter count, outcome (play/neutral/conflict)
- [ ] People encountered: names, context/relationship
- [ ] Visual cards for each entity
- [ ] Tap to see all moments with that entity
- [ ] Typecheck passes

---

### US-018: Daily Summary - Behavior Insights
**Description:** As a dog owner, I want behavior insights based on today's data.

**Acceptance Criteria:**
- [ ] Pattern detection rules (e.g., "more reactive after long rest")
- [ ] Trigger events highlighted with evidence moments
- [ ] Wins / progress markers based on goals
- [ ] Insights written in dog's character tone
- [ ] Typecheck passes

---

### US-019: Daily Summary - Recommendations
**Description:** As a dog owner, I want actionable recommendations for tomorrow.

**Acceptance Criteria:**
- [ ] 3-7 suggestions aligned with dog's profile and goals
- [ ] Examples: "short decompression walk", "practice 'look at me' near scooters"
- [ ] Recommendations generated from rule-based templates
- [ ] Typecheck passes

---

### US-020: Generate Summary Command
**Description:** As a dog owner, I want to trigger summary generation on demand.

**Acceptance Criteria:**
- [ ] "Generate daily summary" button on home/timeline screen
- [ ] Summary displayed in scrollable view
- [ ] Auto-generate option at configurable time (e.g., 9pm)
- [ ] Typecheck passes

---

### US-021: Encounters Screen
**Description:** As a dog owner, I want a dedicated screen to see all dogs and people my dog has met.

**Acceptance Criteria:**
- [ ] List all named entities (dogs and humans)
- [ ] Show encounter count, last seen date, relationship
- [ ] Filter by type (dogs only, humans only)
- [ ] Tap to see all moments with that entity
- [ ] Typecheck passes

---

### US-022: Export - JSON Log
**Description:** As a dog owner, I want to export my data as JSON for backup or analysis.

**Acceptance Criteria:**
- [ ] "Export as JSON" command in settings
- [ ] JSON includes: moments, sessions, entities, profile
- [ ] File saved to device / share sheet
- [ ] Typecheck passes

---

### US-023: Export - PDF Summary
**Description:** As a dog owner, I want to export daily summaries as PDF to share with trainers/vets.

**Acceptance Criteria:**
- [ ] "Export as PDF" button on daily summary screen
- [ ] PDF includes all summary sections with photos
- [ ] Branded header with dog name and date
- [ ] File saved to device / share sheet
- [ ] Typecheck passes

---

### US-024: Export - Photo Timeline
**Description:** As a dog owner, I want to export a visual photo timeline.

**Acceptance Criteria:**
- [ ] Photo collage or grid export option
- [ ] Photos labeled with time and place
- [ ] Shareable as image or PDF
- [ ] Typecheck passes

---

### US-025: Cloud Backup (Optional)
**Description:** As a dog owner, I want to optionally backup my data to the cloud.

**Acceptance Criteria:**
- [ ] Toggle in settings: "Enable cloud backup"
- [ ] Sync moments, entities, sessions, profile to cloud
- [ ] Restore from cloud on new device
- [ ] End-to-end encryption for privacy
- [ ] Typecheck passes

---

### US-026: Offline Mode
**Description:** As a dog owner, I want the app to work offline and sync when connected.

**Acceptance Criteria:**
- [ ] Moments captured offline stored locally
- [ ] Entity detection queued for when online
- [ ] Sync indicator shows pending uploads
- [ ] No data loss when offline
- [ ] Typecheck passes

---

## Functional Requirements

- FR-1: Capture photo with timestamp (local + ISO) and GPS coordinates
- FR-2: Auto-generate place labels via reverse geocoding
- FR-3: Store moments in local SQLite/Hive database
- FR-4: Upload photos to cloud API for entity detection (dog/human)
- FR-5: Label primary dog vs other dogs; label humans with privacy
- FR-6: Allow user to name and annotate detected entities
- FR-7: Cluster moments into sessions by time (30 min) and location (100m)
- FR-8: Infer dog mood from photo with confidence score
- FR-9: Store dog personality profile from owner questionnaire
- FR-10: Generate daily summary using rule-based templates
- FR-11: Customize summary tone based on dog temperament
- FR-12: Display timeline, encounters, and summary screens
- FR-13: Export data as JSON, PDF, and photo timeline
- FR-14: Support offline capture with queued cloud processing
- FR-15: Optional cloud backup with encryption

---

## Non-Goals

- ❌ No real-time GPS tracking / live map
- ❌ No social features (sharing with other users)
- ❌ No AI/LLM for summary generation (rule-based only)
- ❌ No automatic identity guessing for humans (privacy)
- ❌ No video capture (photos only for MVP)
- ❌ No multi-dog profiles (single primary dog for MVP)
- ❌ No wearable/collar integration

---

## Technical Considerations

- **Framework:** React Native or Flutter for cross-platform
- **Local DB:** SQLite (via Drift/sqflite) or Hive for offline-first
- **Cloud Detection API:** Custom backend or third-party (AWS Rekognition, Google Vision, Roboflow)
- **Geocoding:** Google Maps / Mapbox reverse geocoding API
- **Cloud Backup:** Firebase, Supabase, or custom backend with E2E encryption
- **PDF Generation:** react-native-pdf-lib or flutter pdf package
- **Permissions:** Camera, Location, Storage (handle gracefully)

---

## Success Metrics

- Moment capture takes < 5 seconds (photo to saved)
- Entity detection returns within 10 seconds
- Daily summary generates in < 3 seconds
- User can name an entity in < 3 taps
- Export works offline for local data
- 95%+ crash-free sessions

---

## Open Questions

1. Which cloud detection API to use? (AWS Rekognition vs Google Vision vs Roboflow vs custom model)
2. Should session clustering use ML or simple time/distance rules?
3. How to handle multiple dogs in household (future feature)?
4. Should mood inference be a separate API call or bundled with entity detection?
5. What's the backup storage limit for free vs paid users?

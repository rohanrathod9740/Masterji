# Consulting Client Management System - Development Instructions

## Purpose

Build a lightweight consulting execution platform focused on managing client delivery workflows.

This is **not a CRM**.

The primary objective is to help the consulting company head manage:

* Clients
* Interactions
* Tasks
* Follow-ups
* Appointments

from a single source of truth.

---

# Product Principles

## Core Principle

Everything revolves around the Client.

Every record in the system must be traceable to a client.

A user should never need to search multiple locations to understand:

* who the client is
* what was discussed
* what tasks exist
* what is due next
* when the next interaction will occur

---

## Simplicity First

The application is intended for daily operational use.

Speed is more important than feature richness.

Avoid unnecessary workflows, confirmations, or complex forms.

The most common actions must be executable in seconds.

---

## Quick Capture Philosophy

The system must support rapid data entry.

Target:

* Log interaction in under 5 seconds
* Create task in under 5 seconds
* Schedule follow-up in under 5 seconds

Required implementation:

* Global floating action button
* Available on every authenticated screen
* Opens:

  * Add Task
  * Log Interaction
  * Schedule Follow-Up

Only required fields should be mandatory.

---

# Core Domain Model

## Client

Represents a person or company receiving consulting services.

### Required Fields

```text
client_id
name
phone
email
company_name
client_type
tags
address
status
pinned_notes
```

### Client Types

```text
consulting_client
retained_client
one_time_client
lead
other
```

### Status Values

```text
active
inactive
archived
```

---

## Interaction

Represents a consulting conversation or engagement event.

### Required Fields

```text
interaction_id
client_id
interaction_type
notes
interaction_date
```

### Optional Fields

```text
audio_recording
transcription
attachments
```

### Interaction Types

```text
consultation
meeting
phone_call
video_call
treatment_session
review_meeting
project_discussion
support_call
```

---

## Task

Represents work assigned to either:

* the client
* the consulting company head

### Required Fields

```text
task_id
client_id
title
due_date
priority
status
```

### Optional Fields

```text
description
interaction_id
```

### Priority Values

```text
low
medium
high
critical
```

### Status Values

```text
pending
in_progress
done
overdue
```

### Rules

* Task belongs to exactly one client.
* Task may optionally reference an interaction.
* Task should be visible in client portal.
* Overdue status should be assigned automatically.

---

## Appointment / Follow-Up

Represents future client engagement.

### Required Fields

```text
appointment_id
client_id
appointment_type
appointment_date
duration
meeting_mode
status
```

### Optional Fields

```text
meeting_link
```

### Meeting Modes

```text
in_person
phone
video
other
```

### Status Values

```text
scheduled
completed
rescheduled
cancelled
missed
```

---

## Client Portal User

Represents client login access.

### Initial Scope

Read-only access.

Clients can see:

* Assigned tasks
* Due dates
* Upcoming appointments
* Follow-up schedule

Clients cannot see:

* Internal notes
* Internal interactions
* Internal comments

---

# Application Screens

## Dashboard

Purpose: Daily command center.

### Must Display

#### Tasks Due Today

Sort by:

1. Critical
2. High
3. Medium
4. Low

#### Overdue Tasks

Display:

* task title
* client
* days overdue

#### Upcoming Follow-Ups

Show:

* next 7 days

#### Recent Interactions

Reverse chronological order.

#### Global Search

Must search:

* client names
* interaction notes

#### Floating Quick Add Button

Always visible.

---

## Client Directory

### Features

Search clients in real time.

Filter by:

* type
* status
* tags

### Actions

* create client
* edit client
* archive client

---

## Client Profile

This is the most important screen.

### Layout

#### Header

Display:

* name
* company
* tags
* contact information
* pinned notes

#### Main Content

Interaction timeline.

Requirements:

* reverse chronological order
* newest first
* attachment support

#### Sidebar

Open tasks.

Display:

* title
* due date
* status

#### Sidebar

Upcoming appointments.

Display:

* date
* type
* status

#### Quick Actions

Buttons:

* Log Interaction
* Create Task
* Schedule Follow-Up

---

## Client Portal

### Mobile First

Design for phone screens first.

### Client Visibility

Client sees:

* assigned tasks
* instructions
* due dates
* upcoming appointments

Client does not see:

* internal notes
* interaction notes
* staff-only information

---

# Attachments

Support uploads for:

* clients
* interactions
* tasks

Supported types:

```text
PDF
PNG
JPG
JPEG
DOCX
```

Store metadata separately from records.

---

# Notifications

## Daily Reminder

Run every day at 9:00 AM.

Include:

* tasks due today
* overdue tasks

### Delivery

Phase 1:

* Email

Future:

* WhatsApp

---

## Follow-Up Reminder

When follow-up is scheduled:

Optionally create reminder.

Reminder should trigger before appointment date.

---

# Search Requirements

Global search must support:

## Client Search

Search fields:

* name
* company
* phone
* email

## Interaction Search

Search fields:

* notes
* transcription

Search should return:

* matching client
* matching interaction

---

# Security Requirements

## Authentication

Required for all internal users.

Must support:

* login
* logout
* session management

---

## Authorization

Clients can access only:

* their own tasks
* their own appointments

Never expose:

* other clients
* internal notes
* staff data

---

# Audit Requirements

Track:

* record creation
* updates
* deletions

For:

* clients
* interactions
* tasks
* appointments

Minimum fields:

```text
record_type
record_id
action
user
timestamp
```

---

# Non-Goals for V1

Do NOT build:

* AI summaries
* AI chat
* Invoice management
* Billing
* Team collaboration
* Multi-tenant support
* Calendar integrations
* Workflow automation engines

Any implementation effort spent on these features before V1 completion is out of scope.

---

# Development Roadmap

## Phase 1 — Core

Deliver:

* Authentication
* Client CRUD
* Interaction CRUD
* Client profile
* Interaction timeline
* Dashboard foundation

Phase 1 must be usable before Phase 2 starts.

---

## Phase 2 — Delivery Workflow

Deliver:

* Task management
* Appointment management
* Dashboard widgets
* Global search
* Client portal

Phase 2 must be usable before Phase 3 starts.

---

## Phase 3 — Reliability

Deliver:

* Automated reminders
* Overdue automation
* Mobile QA
* Permission audit
* Real user testing

---

## Phase 4 — Intelligence

Future features:

* Client summaries
* Assignment summaries
* Follow-up intelligence
* Weekly digest generation

Do not begin until earlier phases are stable.

---

# Acceptance Criteria

The system is considered successful when:

1. The consulting company head uses it daily for one week.

2. A new interaction can be logged in under 5 seconds.

3. A task appears in the client portal immediately after creation.

4. Upcoming follow-up dates are visible internally and externally.

5. Overdue tasks are visible immediately when opening the dashboard.

6. A complete client history can be understood from a single client profile page.

---

# Guiding Question

For every feature implementation ask:

> Does this help the consulting company head understand what happened, what is assigned, and what happens next for a client?

If the answer is no, it probably does not belong in V1.


# Mood2do — Project Handover Notes

## What is this?
Mood2do is a web app to help people with ADHD manage their day. It is a completely standalone
app — no connection to the PTM/Prism/Vigil suite. New Supabase project, own auth, own everything.

## Domain
ADHDay.co.uk (bought, hosted on 123-reg, same account as pokingthemachine.com). Not yet configured.

## Jira
A Jira project called ADHDay (Kanban, company managed) has been created. Use it for tickets as we build.

## Tech stack
- Next.js (App Router) + TypeScript — same pattern as Prism/Vigil
- Supabase — NEW project, not shared with PTM suite
- Tailwind CSS v4
- Tiptap (rich text editor for task notes)

## The brief (Terry's words)

### Core concept
- Users create a big flat list of to-dos
- Instead of priority/time-blocking, each task is tagged:
  - **Category**: Work or Personal
  - **Deadline**: optional, only if it genuinely has one
  - **Mood tags**: Focussed, Bored, Distracted, Anxious, Creative, etc.

### Main dashboard
- Two pages: Work and Personal
- Mood picker on each page — app shows tasks matching the current mood
- Task timer — tracks how long each task takes
- Pomodoro timer and clock widget

### Features built
- Mood-based task filtering
- Task timer with pause/complete/cancel
- Pomodoro timer (clock face design)
- Brain dump bar
- Snooze tasks (1 day / 3 days / 1 week)
- Task age badges
- "Done today" panel
- Pattern nudge (suggests mood based on historical data)
- Insights page with timing charts
- Settings: name, mood labels, task count per mood
- Welcome modal for new users

## About Terry
- Near-novice developer — plain language, one step at a time
- Has ADHD himself — so he is the target user
- Free tools preferred

-- Grain test data — completed tasks with moods, spread over Oct 2025–Mar 2026
-- Patterns built in:
--   Focussed  → Wed/Thu mornings (9–11am)
--   Creative  → Mon/Tue late morning (10am–1pm)
--   Energised → Mon/Tue early morning (8–10am)
--   Bored     → Fri afternoons (2–4pm)
--   Tired     → Thu/Fri late afternoon (4–6pm)
--   Anxious   → Sun/Mon early morning (7–9am)
--   Distracted→ Wed/Thu afternoons (2–4pm)

-- First clean up any orphaned tasks from deleted users
DELETE FROM tasks WHERE user_id NOT IN (SELECT id FROM auth.users);

WITH u AS (SELECT '75e8c8e1-71d7-4e76-9e53-41a031ab256b'::uuid AS id)
INSERT INTO tasks (id, user_id, title, category, mood_tags, completed, completed_mood, completed_at)
SELECT gen_random_uuid(), u.id, t.title, t.category, t.mood_tags::text[], true, t.mood, t.completed_at::timestamptz
FROM u, (VALUES

  -- FOCUSSED — Wed/Thu 9–11am (work)
  ('Review quarterly targets',        'work',     '{Focussed}', 'Focussed', '2025-10-01 09:30:00+00'),
  ('Write technical spec',            'work',     '{Focussed}', 'Focussed', '2025-10-02 10:15:00+00'),
  ('Code review session',             'work',     '{Focussed}', 'Focussed', '2025-10-08 09:45:00+00'),
  ('Finish budget proposal',          'work',     '{Focussed}', 'Focussed', '2025-10-09 10:30:00+00'),
  ('Draft project brief',             'work',     '{Focussed}', 'Focussed', '2025-10-15 09:20:00+00'),
  ('Update documentation',            'work',     '{Focussed}', 'Focussed', '2025-10-16 10:00:00+00'),
  ('Prepare presentation slides',     'work',     '{Focussed}', 'Focussed', '2025-11-05 09:50:00+00'),
  ('Write performance review',        'work',     '{Focussed}', 'Focussed', '2025-11-06 10:20:00+00'),
  ('Plan sprint backlog',             'work',     '{Focussed}', 'Focussed', '2025-11-12 09:30:00+00'),
  ('Analyse data from survey',        'work',     '{Focussed}', 'Focussed', '2025-11-19 10:10:00+00'),
  ('Write up test cases',             'work',     '{Focussed}', 'Focussed', '2025-12-03 09:40:00+00'),
  ('Review contracts',                'work',     '{Focussed}', 'Focussed', '2025-12-10 10:00:00+00'),
  ('Deep dive into analytics',        'work',     '{Focussed}', 'Focussed', '2026-01-07 09:30:00+00'),
  ('Write API documentation',         'work',     '{Focussed}', 'Focussed', '2026-01-14 10:15:00+00'),
  ('Review architecture diagram',     'work',     '{Focussed}', 'Focussed', '2026-02-04 09:45:00+00'),
  ('Finish risk assessment',          'work',     '{Focussed}', 'Focussed', '2026-02-11 10:30:00+00'),
  ('Write release notes',             'work',     '{Focussed}', 'Focussed', '2026-03-04 09:20:00+00'),
  ('Plan Q2 roadmap',                 'work',     '{Focussed}', 'Focussed', '2026-03-11 10:00:00+00'),

  -- CREATIVE — Mon/Tue 10am–1pm (mixed)
  ('Brainstorm campaign ideas',       'work',     '{Creative}', 'Creative', '2025-10-06 10:30:00+00'),
  ('Sketch wireframes',               'work',     '{Creative}', 'Creative', '2025-10-07 11:45:00+00'),
  ('Write blog post draft',           'personal', '{Creative}', 'Creative', '2025-10-13 12:00:00+00'),
  ('Design new logo concepts',        'work',     '{Creative}', 'Creative', '2025-10-20 10:15:00+00'),
  ('Write poem for birthday card',    'personal', '{Creative}', 'Creative', '2025-10-21 11:30:00+00'),
  ('Storyboard video content',        'work',     '{Creative}', 'Creative', '2025-11-03 10:45:00+00'),
  ('Write newsletter copy',           'work',     '{Creative}', 'Creative', '2025-11-10 11:00:00+00'),
  ('Plan children book chapter',      'personal', '{Creative}', 'Creative', '2025-11-17 12:15:00+00'),
  ('Develop new feature concept',     'work',     '{Creative}', 'Creative', '2025-12-01 10:30:00+00'),
  ('Write social media posts',        'work',     '{Creative}', 'Creative', '2025-12-08 11:45:00+00'),
  ('Illustrate character sketch',     'personal', '{Creative}', 'Creative', '2026-01-05 10:00:00+00'),
  ('Draft marketing email',           'work',     '{Creative}', 'Creative', '2026-01-12 11:30:00+00'),
  ('Write short story outline',       'personal', '{Creative}', 'Creative', '2026-02-02 12:00:00+00'),
  ('Design event poster',             'work',     '{Creative}', 'Creative', '2026-02-09 10:45:00+00'),
  ('Brainstorm app name ideas',       'personal', '{Creative}', 'Creative', '2026-03-02 11:15:00+00'),
  ('Write product descriptions',      'work',     '{Creative}', 'Creative', '2026-03-09 10:30:00+00'),

  -- ENERGISED — Mon/Tue 8–10am (work)
  ('Run team standup',                'work',     '{Energised}', 'Energised', '2025-10-06 08:30:00+00'),
  ('Kick off new project',            'work',     '{Energised}', 'Energised', '2025-10-07 09:00:00+00'),
  ('Network coffee chat',             'work',     '{Energised}', 'Energised', '2025-10-13 08:45:00+00'),
  ('Present to stakeholders',         'work',     '{Energised}', 'Energised', '2025-10-20 09:15:00+00'),
  ('Lead workshop session',           'work',     '{Energised}', 'Energised', '2025-11-03 08:30:00+00'),
  ('Cold call new prospects',         'work',     '{Energised}', 'Energised', '2025-11-10 09:00:00+00'),
  ('Run gym session',                 'personal', '{Energised}', 'Energised', '2025-11-17 08:00:00+00'),
  ('Morning run',                     'personal', '{Energised}', 'Energised', '2025-12-01 07:45:00+00'),
  ('Tackle inbox zero',               'work',     '{Energised}', 'Energised', '2025-12-08 08:30:00+00'),
  ('Plan week ahead',                 'work',     '{Energised}', 'Energised', '2026-01-05 09:00:00+00'),
  ('Onboard new team member',         'work',     '{Energised}', 'Energised', '2026-01-12 08:45:00+00'),
  ('Send weekly update email',        'work',     '{Energised}', 'Energised', '2026-02-02 09:15:00+00'),
  ('Book dentist appointment',        'personal', '{Energised}', 'Energised', '2026-02-09 08:30:00+00'),
  ('Reorganise desk',                 'personal', '{Energised}', 'Energised', '2026-03-02 08:00:00+00'),

  -- BORED — Fri afternoons 2–4pm (mixed)
  ('Clear email backlog',             'work',     '{Bored}', 'Bored', '2025-10-03 14:30:00+00'),
  ('File expense receipts',           'work',     '{Bored}', 'Bored', '2025-10-10 15:00:00+00'),
  ('Update contact list',             'work',     '{Bored}', 'Bored', '2025-10-17 14:15:00+00'),
  ('Tidy downloads folder',           'personal', '{Bored}', 'Bored', '2025-10-24 15:30:00+00'),
  ('Renew subscriptions',             'personal', '{Bored}', 'Bored', '2025-10-31 14:45:00+00'),
  ('Archive old files',               'work',     '{Bored}', 'Bored', '2025-11-07 15:00:00+00'),
  ('Update passwords',                'personal', '{Bored}', 'Bored', '2025-11-14 14:30:00+00'),
  ('Sort through old emails',         'work',     '{Bored}', 'Bored', '2025-11-21 15:15:00+00'),
  ('Check browser bookmarks',         'personal', '{Bored}', 'Bored', '2025-12-05 14:00:00+00'),
  ('Update app store listings',       'work',     '{Bored}', 'Bored', '2025-12-12 15:30:00+00'),
  ('Clear notification backlog',      'personal', '{Bored}', 'Bored', '2026-01-09 14:45:00+00'),
  ('Review saved articles',           'personal', '{Bored}', 'Bored', '2026-01-16 15:00:00+00'),
  ('Sort receipts folder',            'personal', '{Bored}', 'Bored', '2026-02-06 14:30:00+00'),
  ('Update CV',                       'personal', '{Bored}', 'Bored', '2026-02-13 15:15:00+00'),
  ('Tidy desktop icons',              'personal', '{Bored}', 'Bored', '2026-03-06 14:00:00+00'),
  ('Log hours in timesheet',          'work',     '{Bored}', 'Bored', '2026-03-13 15:30:00+00'),

  -- TIRED — Thu/Fri late afternoon 4–6pm (personal)
  ('Watch tutorial video',            'personal', '{Tired}', 'Tired', '2025-10-02 16:30:00+00'),
  ('Read industry newsletter',        'personal', '{Tired}', 'Tired', '2025-10-03 17:00:00+00'),
  ('Check social media mentions',     'work',     '{Tired}', 'Tired', '2025-10-09 16:15:00+00'),
  ('Review notes from today',         'work',     '{Tired}', 'Tired', '2025-10-10 17:30:00+00'),
  ('Listen to podcast',               'personal', '{Tired}', 'Tired', '2025-10-16 16:45:00+00'),
  ('Read bedside book chapter',       'personal', '{Tired}', 'Tired', '2025-11-06 17:00:00+00'),
  ('Scroll saved reading list',       'personal', '{Tired}', 'Tired', '2025-11-13 16:30:00+00'),
  ('Watch short documentary',         'personal', '{Tired}', 'Tired', '2025-11-20 17:15:00+00'),
  ('Review tomorrow calendar',        'work',     '{Tired}', 'Tired', '2025-12-04 16:00:00+00'),
  ('Low-energy admin tasks',          'work',     '{Tired}', 'Tired', '2025-12-11 17:30:00+00'),
  ('Tidy kitchen',                    'personal', '{Tired}', 'Tired', '2026-01-08 16:45:00+00'),
  ('Water plants',                    'personal', '{Tired}', 'Tired', '2026-01-15 17:00:00+00'),
  ('Gentle evening walk',             'personal', '{Tired}', 'Tired', '2026-02-05 16:30:00+00'),
  ('Pack bag for tomorrow',           'personal', '{Tired}', 'Tired', '2026-02-12 17:15:00+00'),
  ('Check tomorrow prep',             'work',     '{Tired}', 'Tired', '2026-03-05 16:00:00+00'),
  ('Wind down reading',               'personal', '{Tired}', 'Tired', '2026-03-12 17:30:00+00'),

  -- ANXIOUS — Sun/Mon early morning 7–9am (personal)
  ('Write worry list to clear head',  'personal', '{Anxious}', 'Anxious', '2025-10-05 07:30:00+00'),
  ('Review upcoming deadlines',       'work',     '{Anxious}', 'Anxious', '2025-10-06 08:00:00+00'),
  ('Plan the week',                   'personal', '{Anxious}', 'Anxious', '2025-10-12 07:15:00+00'),
  ('Chase overdue invoice',           'work',     '{Anxious}', 'Anxious', '2025-10-13 08:30:00+00'),
  ('Check bank balance',              'personal', '{Anxious}', 'Anxious', '2025-10-19 07:45:00+00'),
  ('Reply to difficult email',        'work',     '{Anxious}', 'Anxious', '2025-11-02 08:00:00+00'),
  ('Prepare for difficult meeting',   'work',     '{Anxious}', 'Anxious', '2025-11-09 07:30:00+00'),
  ('Sort out insurance renewal',      'personal', '{Anxious}', 'Anxious', '2025-11-16 08:15:00+00'),
  ('Review overdue tasks',            'work',     '{Anxious}', 'Anxious', '2025-12-07 07:45:00+00'),
  ('Chase missing delivery',          'personal', '{Anxious}', 'Anxious', '2025-12-14 08:00:00+00'),
  ('Book medical appointment',        'personal', '{Anxious}', 'Anxious', '2026-01-11 07:30:00+00'),
  ('File tax documents',              'personal', '{Anxious}', 'Anxious', '2026-01-18 08:15:00+00'),
  ('Respond to complaint',            'work',     '{Anxious}', 'Anxious', '2026-02-08 07:45:00+00'),
  ('Sort car insurance',              'personal', '{Anxious}', 'Anxious', '2026-02-15 08:00:00+00'),
  ('Chase unpaid invoice',            'work',     '{Anxious}', 'Anxious', '2026-03-08 07:30:00+00'),
  ('Review overdue project tasks',    'work',     '{Anxious}', 'Anxious', '2026-03-15 08:15:00+00'),

  -- DISTRACTED — Wed/Thu afternoons 2–4pm (mixed)
  ('Quick Slack catchup',             'work',     '{Distracted}', 'Distracted', '2025-10-01 14:30:00+00'),
  ('Browse competitor sites',         'work',     '{Distracted}', 'Distracted', '2025-10-02 15:00:00+00'),
  ('Watch how-to video',              'personal', '{Distracted}', 'Distracted', '2025-10-08 14:15:00+00'),
  ('Check Twitter mentions',          'work',     '{Distracted}', 'Distracted', '2025-10-09 15:30:00+00'),
  ('Skim-read new articles',          'personal', '{Distracted}', 'Distracted', '2025-10-15 14:45:00+00'),
  ('Reorganise Notion board',         'work',     '{Distracted}', 'Distracted', '2025-11-05 15:00:00+00'),
  ('Scroll through Feedly',           'personal', '{Distracted}', 'Distracted', '2025-11-12 14:30:00+00'),
  ('Low focus admin',                 'work',     '{Distracted}', 'Distracted', '2025-11-19 15:15:00+00'),
  ('Browse tools and apps',           'personal', '{Distracted}', 'Distracted', '2025-12-03 14:00:00+00'),
  ('Clean up old Slack channels',     'work',     '{Distracted}', 'Distracted', '2025-12-10 15:30:00+00'),
  ('Review saved YouTube videos',     'personal', '{Distracted}', 'Distracted', '2026-01-07 14:45:00+00'),
  ('Tidy project folders',            'work',     '{Distracted}', 'Distracted', '2026-01-14 15:00:00+00'),
  ('Look up random topics',           'personal', '{Distracted}', 'Distracted', '2026-02-04 14:30:00+00'),
  ('Check product hunt',              'work',     '{Distracted}', 'Distracted', '2026-02-11 15:15:00+00'),
  ('Reorganise bookmarks',            'personal', '{Distracted}', 'Distracted', '2026-03-04 14:00:00+00'),
  ('Browse design inspiration',       'work',     '{Distracted}', 'Distracted', '2026-03-11 15:30:00+00')

) AS t(title, category, mood_tags, mood, completed_at);

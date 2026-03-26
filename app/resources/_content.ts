export type Section = {
  heading: string
  body: string[]
  list?: string[]
}

export type Article = {
  slug: string
  title: string
  intro: string
  image?: string
  sections: Section[]
}

export const articles: Article[] = [
  {
    slug: 'getting-started',
    title: 'Getting started with Mood2do',
    intro: 'New to Mood2do? This overview explains what Mood2do is, who it\'s for, and what to do first.',
    sections: [
      {
        heading: 'What is Mood2do?',
        body: [
          'Mood2do is a task app built specifically for people with ADHD — or anyone who finds that traditional to-do lists make things worse, not better.',
          'The core idea is simple: instead of showing you everything you need to do, Mood2do asks how you\'re feeling and shows you a small set of tasks that match that mood. No overwhelm. No guilt-inducing backlog. Just the right things for right now.',
        ],
      },
      {
        heading: 'Who is it for?',
        body: [
          'Mood2do is for anyone whose brain doesn\'t work well with rigid schedules and priority rankings. If you\'ve ever opened a to-do app, felt immediately overwhelmed, and closed it again — this was built for you.',
        ],
      },
      {
        heading: 'What to do first',
        body: ['Here\'s the recommended order for getting set up:'],
        list: [
          'Create your free account',
          'Set your name in Settings',
          'Add a handful of tasks in Task list',
          'Tag each task as Work or Personal',
          'Tag each task with the moods that suit it',
          'Open Work or Personal, pick your mood, and start',
        ],
      },
    ],
  },
  {
    slug: 'adding-tasks',
    title: 'Adding your first tasks',
    intro: 'Tasks are the foundation of Mood2do. Here\'s how to add them and what each field means.',
    image: '/guide-adding-tasks.png',
    sections: [
      {
        heading: 'Where to add tasks',
        body: [
          'Go to Task list in the navigation menu. You\'ll see a list of all your tasks and an "+ Add task" button in the top right.',
          'Click it to open the add form.',
        ],
      },
      {
        heading: 'Filling in the form',
        body: ['Each task has a few fields:'],
        list: [
          'Title — what the task actually is. Keep it specific enough that you know what to do when you see it.',
          'Category — Work or Personal. This determines which page the task appears on.',
          'Mood tags — which moods suit this task (see the Mood tags guide for more).',
          'Deadline — only set this if the task genuinely has one. Don\'t fake deadlines to force yourself.',
          'Notes — extra detail, context, or links. Supports bold, italic, and bullet lists.',
        ],
      },
      {
        heading: 'Repeating tasks',
        body: [
          'If a task happens regularly — a weekly report, a daily check-in — tick "Repeating task" and set a frequency and date range. Mood2do will generate the full series automatically.',
        ],
      },
      {
        heading: 'How many tasks should I add?',
        body: [
          'Add as many as you like — but don\'t feel you need to add everything at once. Start with the things that are actually on your mind right now. You can always add more later.',
          'Free accounts can hold up to 25 tasks. Pro accounts are unlimited.',
        ],
      },
    ],
  },
  {
    slug: 'mood-tags',
    title: 'Tagging tasks with moods',
    intro: 'Mood tags are what make Mood2do work. They\'re the link between how you feel and what you do.',
    image: '/guide-mood-tags.png',
    sections: [
      {
        heading: 'What are mood tags?',
        body: [
          'Every task can be tagged with one or more moods. When you tell Mood2do how you\'re feeling, it shows you tasks that match that mood.',
          'Think of them as a label for the mental state this task requires — not how you want to feel, but what the task actually demands.',
        ],
      },
      {
        heading: 'Examples',
        body: ['Here\'s how you might tag a few typical tasks:'],
        list: [
          '"Write quarterly report" → Focused',
          '"Reply to emails" → Low energy, Distracted',
          '"Tidy my desk" → Restless',
          '"Brainstorm new ideas" → Creative',
          '"Pay a bill online" → Low energy',
        ],
      },
      {
        heading: 'Tagging tips',
        body: [
          'Give each task more than one mood tag where possible. The more you tag, the more likely Mood2do is to find something suitable when you check in.',
          'Don\'t over-think it. If a task feels like it could work for a mood, tag it. You can always edit later.',
        ],
      },
      {
        heading: 'Customising your mood labels',
        body: [
          'The default mood labels are a starting point. Go to Settings → Mood labels to add your own, remove ones that don\'t fit, or rename them to language that makes more sense to your brain.',
        ],
      },
    ],
  },
  {
    slug: 'mood-picker',
    title: 'Picking your mood',
    intro: 'The mood picker is how you tell Mood2do where you\'re at. Here\'s how to use it well.',
    image: '/guide-mood-picker.png',
    sections: [
      {
        heading: 'Where to find it',
        body: [
          'Open Work or Personal from the home screen. Before showing you any tasks, Mood2do asks how you\'re feeling right now. The mood picker shows all your active mood labels as buttons.',
        ],
      },
      {
        heading: 'Pick honestly, not aspirationally',
        body: [
          'This is important: pick the mood that reflects how you actually feel right now — not how you wish you felt, and not the mood with the most tasks.',
          'If you\'re tired and scattered, pick Low energy or Distracted. Mood2do will find you something that actually suits that state. Pretending to be Focused when you\'re not just means you\'ll stare at a task you can\'t face.',
        ],
      },
      {
        heading: 'Changing your mood mid-day',
        body: [
          'Your mood will change. That\'s fine. The "Go with your mood!" button at the top of your task list lets you change mood at any time. Mood2do will show you a fresh set of tasks for the new mood.',
        ],
      },
      {
        heading: 'How many tasks will I see?',
        body: [
          'By default, Mood2do shows you 5 tasks. You can change this in Settings — anywhere from 1 to 10.',
        ],
      },
    ],
  },
  {
    slug: 'timer',
    title: 'Starting and timing a task',
    intro: 'When you find a task you can do right now, the timer helps you stay on it — and builds up a picture of how you work.',
    image: '/guide-timer.png',
    sections: [
      {
        heading: 'Starting a task',
        body: [
          'On your task list, each task has an "I\'ll do this" button. Hitting it starts the timer and switches the timer widget to the Task tab so you can see it running.',
        ],
      },
      {
        heading: 'While the timer is running',
        body: ['You have three options while a task is active:'],
        list: [
          'Pause — stops the clock without abandoning the task. Hit Resume to carry on.',
          'Complete task — marks the task as done and saves the timing data.',
          'Cancel task — stops the timer and puts the task back in your list without marking it complete.',
        ],
      },
      {
        heading: 'Adjusting the estimate',
        body: [
          'Every task has an estimated time. If you\'re running over — or realise it\'ll take less time than you thought — use the +/- buttons on the Task tab to adjust the estimate mid-task.',
          'These adjustments are recorded and show up in your Insights so you can see where your estimates tend to go wrong.',
        ],
      },
      {
        heading: 'Why does timing matter?',
        body: [
          'Every task you time contributes to your Insights. Over time, Mood2do builds up a picture of which moods lead to your fastest work, when you tend to underestimate, and when you\'re most productive.',
          'The more you use it, the more useful it becomes.',
        ],
      },
    ],
  },
  {
    slug: 'pomodoro',
    title: 'The Pomodoro timer',
    intro: 'The Pomodoro timer gives you a time-boxed focus session — useful when you need a container, not a commitment.',
    image: '/guide-pomodoro.png',
    sections: [
      {
        heading: 'What is Pomodoro?',
        body: [
          'The Pomodoro technique is a way of working in short, focused bursts with breaks in between. The idea is that committing to just 25 minutes of work is much easier than committing to "getting things done".',
          'Mood2do\'s Pomodoro timer is built into the timer widget at the top of every page.',
        ],
      },
      {
        heading: 'How to use it',
        body: [
          'Click the Pomodoro tab in the timer widget. Use the − and + buttons to set your session length (anywhere from 5 to 60 minutes). Then hit Start.',
          'The clock face fills like a pie chart showing how much time remains — mapped to actual clock positions, so 25 minutes starts at the 5 o\'clock mark.',
        ],
      },
      {
        heading: 'Pausing and stopping',
        body: [
          'You can Pause the timer at any point and Resume it later from where it stopped. Hit Stop to cancel the session entirely and reset.',
        ],
      },
      {
        heading: 'When the time is up',
        body: [
          'The clock face turns green and shows a ✓. Take a break, then either reset and go again, or switch to a task.',
        ],
      },
    ],
  },
  {
    slug: 'snooze',
    title: 'Snoozing tasks',
    intro: 'Not every task is right for today. Snooze sends it away and brings it back when you\'re ready.',
    image: '/guide-snooze.png',
    sections: [
      {
        heading: 'What snoozing does',
        body: [
          'Snoozing hides a task from your lists until a date you choose. The task doesn\'t disappear — it just gets out of your way.',
          'This is useful when you know a task isn\'t happening today (or this week) but you don\'t want to delete it.',
        ],
      },
      {
        heading: 'How to snooze a task',
        body: [
          'On the Work or Personal page, each task row has a 💤 button. Click it to see snooze options: Tomorrow, 3 days, or 1 week.',
          'Once snoozed, the task disappears from your mood lists until the snooze expires.',
        ],
      },
      {
        heading: 'Waking a task up early',
        body: [
          'Go to Task list. Snoozed tasks show an amber "Snoozed until…" badge. Click the badge to wake the task up immediately.',
        ],
      },
    ],
  },
  {
    slug: 'brain-dump',
    title: 'Brain dump',
    intro: 'Got something buzzing around your head? Get it out fast before it distracts you.',
    sections: [
      {
        heading: 'What it\'s for',
        body: [
          'The brain dump bar sits at the top of the Work and Personal pages. It\'s a quick way to capture a task without going through the full add form.',
          'Type whatever is in your head, hit Add, and it goes straight into your task list. You can fill in the details — mood tags, deadline, notes — later.',
        ],
      },
      {
        heading: 'Why this matters for ADHD',
        body: [
          'One of the biggest focus-killers is the nagging feeling that you\'re forgetting something. Brain dump gives you a way to offload that thought immediately and get back to what you were doing.',
          'Think of it as an inbox for your brain.',
        ],
      },
    ],
  },
  {
    slug: 'insights',
    title: 'Reading your insights',
    intro: 'Insights shows you patterns in how you work — built up over time from the tasks you\'ve timed.',
    image: '/guide-insights.png',
    sections: [
      {
        heading: 'Where to find it',
        body: [
          'Click Insights in the navigation menu. The page shows data from your completed, timed tasks.',
        ],
      },
      {
        heading: 'What you\'ll see',
        body: ['The Insights page includes:'],
        list: [
          'How many tasks you\'ve timed in total',
          'Your average over or underrun vs your estimates',
          'Which mood tends to lead to the biggest underestimates',
          'A bar chart of each timed task showing actual vs estimated time',
          'Markers showing where you adjusted your estimate mid-task',
        ],
      },
      {
        heading: 'Pattern nudge',
        body: [
          'If you\'ve built up enough history, Mood2do will notice patterns — for example, that you tend to do your best Focused work on Wednesday mornings. When it spots a pattern, it shows a subtle suggestion in your mood panel.',
        ],
      },
      {
        heading: 'How much data do I need?',
        body: [
          'The insights become meaningful after you\'ve timed around 10 tasks. The pattern nudge requires at least 10 completed tasks before it activates.',
        ],
      },
    ],
  },
  {
    slug: 'custom-tags',
    title: 'Using custom tags as a traditional task manager',
    intro: 'Mood2do is built around mood — but sometimes you just need to see all your garden tasks in one place. Custom tags let you do both.',
    sections: [
      {
        heading: 'The problem with pure mood-based lists',
        body: [
          'Mood2do is great at surfacing the right task for how you feel right now. But sometimes you want a more traditional view — a project list, a shopping list, all your errands for Saturday.',
          'Custom tags give you that without changing how the mood system works.',
        ],
      },
      {
        heading: 'What are custom tags?',
        body: [
          'Custom tags are free-text labels you add to individual tasks — things like "garden", "admin", "shed", "shopping", or "holiday prep". They\'re completely separate from mood tags and never appear in the mood picker.',
          'You can add as many tags as you like to a task, and a task can have multiple tags — for example "garden" and "shed" on the same task.',
        ],
      },
      {
        heading: 'How to add a tag',
        body: [
          'When adding or editing a task, scroll to the Tags field. You\'ll see any tags you\'ve already used as clickable pills — click one to add it to the task.',
          'To create a new tag, type it in the text box and press Enter. Tags are saved in lowercase automatically.',
        ],
      },
      {
        heading: 'Filtering by tag',
        body: [
          'Go to Task list. Once you have at least one tag in use, it appears as a green filter button in the filter bar — alongside the existing Work, Personal, and mood filters.',
          'Click a tag to filter to tasks with that tag. Click multiple tags to see tasks that match any of them.',
          'Tags disappear from the filter bar automatically when no tasks use them — so the list stays clean.',
        ],
      },
      {
        heading: 'A practical example',
        body: [
          'Say you\'re planning a day in the garden. You\'ve tagged several tasks with "garden" — mow the lawn, clear the shed, plant the tomatoes, fix the fence.',
          'Open Task list, click the "garden" filter, and you have your focused gardening list for the day — no mood required.',
        ],
      },
      {
        heading: 'Tags and moods work together',
        body: [
          'You don\'t have to choose between mood-based and tag-based working. A task can have both mood tags and custom tags.',
          'On a normal day, pick your mood and let Mood2do surface the right tasks. On a project day, filter by tag and work through the list. Same app, two different ways of working.',
        ],
      },
    ],
  },
  {
    slug: 'settings',
    title: 'Settings',
    intro: 'Mood2do can be personalised to fit how your brain works. Here\'s what you can change.',
    image: '/guide-settings.png',
    sections: [
      {
        heading: 'Your name',
        body: [
          'Go to Settings → Profile to set your name. Mood2do uses it on the home screen greeting. If you haven\'t set it yet, the home screen will prompt you.',
        ],
      },
      {
        heading: 'Tasks shown per mood',
        body: [
          'By default, Mood2do shows 5 tasks when you pick a mood. You can change this to anywhere between 1 and 10 in Settings.',
          'If you find 5 tasks overwhelming, try 3. If you want more choice, try 7 or 8.',
        ],
      },
      {
        heading: 'Mood labels',
        body: [
          'The mood labels are fully customisable. In Settings → Mood labels you can:',
        ],
        list: [
          'Remove preset moods that don\'t apply to you',
          'Add presets back if you remove them by mistake',
          'Create your own custom mood labels',
        ],
      },
      {
        heading: 'App tour',
        body: [
          'If you want to replay the intro walkthrough, go to Settings → App tour and click "Show intro again".',
        ],
      },
    ],
  },
]

export function getArticle(slug: string): Article | undefined {
  return articles.find(a => a.slug === slug)
}

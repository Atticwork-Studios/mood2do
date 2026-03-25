'use client'

import { useState, useEffect, useRef } from 'react'

type TaskTimerProps = {
  taskTitle: string
  elapsed: number
  paused: boolean
  overdue: boolean
  estimatedMinutes: number
  onPause: () => void
  onResume: () => void
  onStop: () => void
  onComplete: () => void
  onAddMinutes: (mins: number) => void
}

export default function TimerWidget({ taskTimer }: { taskTimer?: TaskTimerProps | null }) {
  const [mode, setMode] = useState<'clock' | 'pomodoro' | 'task'>('clock')
  const [now, setNow] = useState(new Date())
  const [pomMinutes, setPomMinutes] = useState(25)
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const [running, setRunning] = useState(false)
  const [pomPaused, setPomPaused] = useState(false)
  const endTimeRef = useRef<number | null>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Switch to task tab only when a timer first starts (taskId changes)
  const prevTaskId = useRef<string | null>(null)
  useEffect(() => {
    if (taskTimer && taskTimer.taskTitle !== prevTaskId.current) {
      prevTaskId.current = taskTimer.taskTitle
      setMode('task')
    }
    if (!taskTimer) prevTaskId.current = null
  }, [taskTimer?.taskTitle, taskTimer])

  // Clock tick
  useEffect(() => {
    if (mode !== 'clock') return
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [mode])

  // Pomodoro tick
  useEffect(() => {
    if (running) {
      tickRef.current = setInterval(() => {
        const left = Math.max(0, Math.ceil(((endTimeRef.current ?? 0) - Date.now()) / 1000))
        setSecondsLeft(left)
        if (left === 0) {
          if (tickRef.current) clearInterval(tickRef.current)
          setRunning(false)
        }
      }, 500)
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [running])

  function startPomodoro() {
    const totalSeconds = pomMinutes * 60
    endTimeRef.current = Date.now() + totalSeconds * 1000
    setSecondsLeft(totalSeconds)
    setRunning(true)
  }

  function pausePomodoro() {
    if (tickRef.current) clearInterval(tickRef.current)
    setRunning(false)
    setPomPaused(true)
    // secondsLeft stays as-is so we can resume from here
  }

  function resumePomodoro() {
    if (secondsLeft === null) return
    endTimeRef.current = Date.now() + secondsLeft * 1000
    setPomPaused(false)
    setRunning(true)
  }

  function stopPomodoro() {
    if (tickRef.current) clearInterval(tickRef.current)
    setRunning(false)
    setPomPaused(false)
    setSecondsLeft(null)
  }

  function adjustMinutes(delta: number) {
    setPomMinutes(m => Math.max(5, Math.min(60, m + delta)))
    stopPomodoro()
    setSecondsLeft(null)
  }

  function formatElapsed(secs: number) {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const clockStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const displaySeconds = secondsLeft ?? pomMinutes * 60
  const mins = Math.floor(displaySeconds / 60)
  const secs = displaySeconds % 60
  const pomLabel = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  const progress = secondsLeft !== null ? (secondsLeft / (pomMinutes * 60)) * 100 : 100

  const btnClass = (variant: 'primary' | 'secondary' | 'danger') => {
    const base = 'text-sm px-3 py-1.5 rounded-lg font-medium transition-colors'
    if (variant === 'primary') return `${base} text-white hover:opacity-90`
    if (variant === 'danger') return `${base} bg-red-50 border border-red-200 text-red-600 hover:bg-red-100`
    return `${base} bg-gray-100 text-gray-700 hover:bg-gray-200`
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
      {/* Mode toggle */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => { setMode('clock'); stopPomodoro() }}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${mode === 'clock' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Clock
        </button>
        <button
          onClick={() => setMode('pomodoro')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${mode === 'pomodoro' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Pomodoro
        </button>
        <button
          onClick={() => setMode('task')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${mode === 'task' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Task{taskTimer ? ' •' : ''}
        </button>
      </div>

      {mode === 'clock' && (
        <div className="text-4xl font-mono font-bold text-gray-900 tracking-tight">{clockStr}</div>
      )}

      {mode === 'pomodoro' && (() => {
        const cx = 90, cy = 90, sectorR = 76, outerR = 84
        // Map to actual clock face: full circle = 60 minutes
        const frac = secondsLeft !== null ? secondsLeft / 3600 : pomMinutes / 60
        const isDone = secondsLeft === 0

        function clockPt(angleDeg: number, radius: number) {
          return {
            x: cx + radius * Math.sin((angleDeg * Math.PI) / 180),
            y: cy - radius * Math.cos((angleDeg * Math.PI) / 180),
          }
        }

        function sectorPath(fraction: number): string {
          if (fraction <= 0 || fraction >= 1) return ''
          const endAngle = fraction * 360
          const start = clockPt(0, sectorR)
          const end = clockPt(endAngle, sectorR)
          const large = endAngle > 180 ? 1 : 0
          return `M ${cx} ${cy} L ${start.x} ${start.y} A ${sectorR} ${sectorR} 0 ${large} 1 ${end.x} ${end.y} Z`
        }

        const sectorColour = isDone ? '#22c55e' : '#c4783c'

        return (
          <div className="flex flex-col items-center">
            <svg width="180" height="180" viewBox="0 0 180 180" className="mb-2">
              {/* Clock face background */}
              <circle cx={cx} cy={cy} r={outerR} fill="#f9fafb" stroke="#d1d5db" strokeWidth="1.5" />

              {/* Coloured sector — full circle or arc */}
              {frac >= 1 && (
                <circle cx={cx} cy={cy} r={sectorR} fill={sectorColour} opacity="0.9" />
              )}
              {frac > 0 && frac < 1 && (
                <path d={sectorPath(frac)} fill={sectorColour} opacity="0.9" />
              )}

              {/* Tick marks on top */}
              {Array.from({ length: 60 }, (_, i) => {
                const angle = i * 6
                const isMajor = i % 5 === 0
                const inner = clockPt(angle, isMajor ? 68 : 73)
                const outer = clockPt(angle, 80)
                return (
                  <line
                    key={i}
                    x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                    stroke="white"
                    strokeWidth={isMajor ? 2.5 : 1}
                    opacity={isMajor ? 1 : 0.75}
                  />
                )
              })}

              {/* Outer bezel ring */}
              <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="#9ca3af" strokeWidth="1" />

              {/* Centre white disc */}
              <circle cx={cx} cy={cy} r={48} fill="white" />

              {/* Time text */}
              <text
                x={cx} y={cy + 2}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="24" fontWeight="bold" fontFamily="monospace"
                fill={isDone ? '#22c55e' : '#1c1917'}
              >
                {isDone ? '✓' : pomLabel}
              </text>
            </svg>

            {/* Duration controls */}
            {!running && !pomPaused && secondsLeft === null && (
              <div className="flex items-center gap-2 mb-3">
                <button onClick={() => adjustMinutes(-5)} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm flex items-center justify-center">−</button>
                <span className="text-sm font-medium text-gray-700 w-16 text-center">{pomMinutes} min</span>
                <button onClick={() => adjustMinutes(5)} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm flex items-center justify-center">+</button>
              </div>
            )}

            {isDone ? (
              <div className="text-center">
                <p className="text-sm text-green-600 font-medium mb-2">Time&apos;s up!</p>
                <button onClick={stopPomodoro} className={btnClass('secondary')}>Reset</button>
              </div>
            ) : running ? (
              <div className="flex gap-2">
                <button onClick={pausePomodoro} className={btnClass('secondary')}>Pause</button>
                <button onClick={stopPomodoro} className={btnClass('danger')}>Stop</button>
              </div>
            ) : pomPaused ? (
              <div className="flex gap-2">
                <button onClick={resumePomodoro} style={{ background: 'var(--grain-primary)' }} className={btnClass('primary')}>Resume</button>
                <button onClick={stopPomodoro} className={btnClass('danger')}>Stop</button>
              </div>
            ) : (
              <button onClick={startPomodoro} style={{ background: 'var(--grain-primary)' }} className={btnClass('primary')}>Start</button>
            )}
          </div>
        )
      })()}

      {mode === 'task' && (
        <div>
          {!taskTimer ? (
            <p className="text-sm text-gray-400">No task running — click &quot;I&apos;ll do this&quot; on a task to start.</p>
          ) : (
            <div>
              <p className="text-xs text-gray-500 mb-1">Timing:</p>
              <p className="text-sm font-semibold text-gray-900 mb-3 truncate">{taskTimer.taskTitle}</p>

              <div style={taskTimer.overdue ? {} : { color: 'var(--grain-primary)' }} className={`text-4xl font-mono font-bold mb-1 ${taskTimer.overdue ? 'text-red-500' : ''}`}>
                {formatElapsed(taskTimer.elapsed)}
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Estimated: {taskTimer.estimatedMinutes} min{taskTimer.estimatedMinutes !== 1 ? 's' : ''}
              </p>

              {taskTimer.overdue && (
                <p className="text-xs text-amber-600 font-medium mb-3">
                  ⏰ You thought you&apos;d be finished by now — still going?
                </p>
              )}

              <div className="flex gap-2 mb-4">
                {taskTimer.paused
                  ? <button onClick={taskTimer.onResume} style={{ background: 'var(--grain-primary)' }} className={btnClass('primary')}>Resume</button>
                  : <button onClick={taskTimer.onPause} className={btnClass('secondary')}>Pause</button>
                }
                <button onClick={taskTimer.onComplete} style={{ background: 'var(--grain-primary)' }} className={btnClass('primary')}>Complete task</button>
                <button onClick={taskTimer.onStop} className={btnClass('danger')}>Cancel task</button>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-2">Adjust estimate</p>
                <div className="flex gap-2">
                  {[-15, -10, -5, 5, 10, 15].map(m => (
                    <button
                      key={m}
                      onClick={() => taskTimer.onAddMinutes(m)}
                      className={btnClass('secondary')}
                    >
                      {m > 0 ? `+${m}` : m} min
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

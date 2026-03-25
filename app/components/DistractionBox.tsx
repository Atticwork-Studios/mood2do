'use client'

import { useState, useEffect, useRef } from 'react'
import { DISTRACTIONS } from '@/lib/distractions'

function randomDistraction(exclude?: string) {
  const pool = exclude ? DISTRACTIONS.filter(d => d !== exclude) : DISTRACTIONS
  return pool[Math.floor(Math.random() * pool.length)]
}

export default function DistractionBox() {
  const [activity, setActivity] = useState<string | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [running, setRunning] = useState(false)
  const endTimeRef = useRef<number | null>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function start(current?: string) {
    const picked = randomDistraction(current)
    setActivity(picked)
    const end = Date.now() + 5 * 60 * 1000
    endTimeRef.current = end
    setSecondsLeft(300)
    setRunning(true)
  }

  function dismiss() {
    if (tickRef.current) clearInterval(tickRef.current)
    setActivity(null)
    setRunning(false)
    setSecondsLeft(0)
    endTimeRef.current = null
  }

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

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const timerLabel = `${mins}:${String(secs).padStart(2, '0')}`
  const progress = (secondsLeft / 300) * 100

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
      <h2 className="font-semibold text-amber-900 mb-1">Need a break?</h2>
      <p className="text-xs text-amber-700 mb-3">Step away for exactly 5 minutes then come back.</p>

      {!activity ? (
        <button
          onClick={() => start()}
          className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-600"
        >
          Distract me for 5 minutes
        </button>
      ) : (
        <div>
          {/* Timer ring */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#fde68a" strokeWidth="6" />
                <circle
                  cx="32" cy="32" r="28"
                  fill="none"
                  stroke={secondsLeft === 0 ? '#22c55e' : '#f59e0b'}
                  strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.5s linear' }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-amber-800">
                {secondsLeft === 0 ? '✓' : timerLabel}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-800">{activity}</p>
          </div>

          {secondsLeft === 0 ? (
            <div className="flex gap-2">
              <p className="text-sm text-green-600 font-medium flex-1">Time&apos;s up — welcome back!</p>
              <button onClick={dismiss} className="text-sm text-gray-500 hover:text-gray-700">Done</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => start(activity)}
                className="text-sm border border-amber-300 text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-100"
              >
                Not feeling it
              </button>
              <button
                onClick={dismiss}
                className="text-sm text-gray-400 hover:text-gray-600 px-3 py-1.5"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useTranscriber } from '@/hooks/useTranscriber'
import { SpeakerLoudIcon, StopIcon, PauseIcon, PlayIcon, ReloadIcon, CheckIcon, Cross1Icon } from '@radix-ui/react-icons'

interface VoiceTextareaProps {
  name: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  rows?: number
  className?: string
}

type RecordingState = 'idle' | 'recording' | 'paused' | 'recorded' | 'transcribing'

export default function VoiceTextarea({
  name,
  value,
  onChange,
  placeholder,
  maxLength,
  rows = 4,
  className = '',
}: VoiceTextareaProps) {
  const transcriber = useTranscriber()

  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [recordingTime, setRecordingTime] = useState(0)
  const [micError, setMicError] = useState<string | null>(null)
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // When Whisper finishes, append transcribed text to value
  useEffect(() => {
    if (transcriber.output?.text && recordingState === 'transcribing') {
      const transcribed = transcriber.output.text.trim()
      onChange(value ? `${value}\n${transcribed}` : transcribed)
      setRecordingState('idle')
      cleanupAudio()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcriber.output])

  const cleanupAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    setAudioBuffer(null)
    setRecordingTime(0)
  }

  const startRecording = async () => {
    setMicError(null)
    cleanupAudio()
    transcriber.onInputChange()
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)

        const fileReader = new FileReader()
        fileReader.onloadend = async () => {
          const audioCTX = new AudioContext({ sampleRate: 16000 })
          const decoded = await audioCTX.decodeAudioData(fileReader.result as ArrayBuffer)
          setAudioBuffer(decoded)
          setRecordingState('recorded')
        }
        fileReader.readAsArrayBuffer(blob)
      }

      mediaRecorder.start()
      setRecordingState('recording')
      setRecordingTime(0)
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000)
    } catch (e: unknown) {
      if (e instanceof DOMException) {
        if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
          setMicError('No microphone found.')
        } else if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
          setMicError('Microphone access denied.')
        } else {
          setMicError(`Microphone error: ${e.message}`)
        }
      }
    }
  }

  const pauseRecording = () => {
    if (!mediaRecorderRef.current) return
    if (recordingState === 'paused') {
      mediaRecorderRef.current.resume()
      setRecordingState('recording')
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000)
    } else {
      mediaRecorderRef.current.pause()
      setRecordingState('paused')
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return
    mediaRecorderRef.current.stop()
    if (timerRef.current) clearInterval(timerRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
  }

  const transcribeAudio = () => {
    if (!audioBuffer) return
    setRecordingState('transcribing')
    transcriber.start(audioBuffer)
  }

  const discardRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    mediaRecorderRef.current = null
    cleanupAudio()
    setRecordingState('idle')
    setMicError(null)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  const isVoiceActive = recordingState !== 'idle'

  return (
    <div className="voice-textarea-wrapper">
      {/* Textarea */}
      <div className="relative">
        <textarea
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={rows}
          className={`${className} pr-12`}
        />
        {/* Mic trigger button */}
        {!isVoiceActive && (
          <button
            type="button"
            onClick={startRecording}
            title="Record voice note"
            className="voice-mic-btn"
          >
            <SpeakerLoudIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Inline voice recorder panel */}
      {isVoiceActive && (
        <div className="voice-recorder-panel">
          {/* Recording controls */}
          {(recordingState === 'recording' || recordingState === 'paused') && (
            <div className="voice-recorder-row">
              <span className="voice-recorder-indicator">
                {recordingState === 'recording' && (
                  <span className="voice-dot" />
                )}
                <span className="voice-timer font-mono">{formatTime(recordingTime)}</span>
              </span>

              <div className="voice-recorder-actions">
                <button
                  type="button"
                  onClick={pauseRecording}
                  className="voice-btn voice-btn-ghost"
                  title={recordingState === 'paused' ? 'Resume' : 'Pause'}
                >
                  {recordingState === 'paused' ? (
                    <PlayIcon className="w-4 h-4" />
                  ) : (
                    <PauseIcon className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="voice-btn voice-btn-stop"
                  title="Stop recording"
                >
                  <StopIcon className="w-4 h-4" />
                  <span>Stop</span>
                </button>
                <button
                  type="button"
                  onClick={discardRecording}
                  className="voice-btn voice-btn-discard"
                  title="Discard"
                >
                  <Cross1Icon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Recorded state: audio preview + transcribe / discard */}
          {recordingState === 'recorded' && (
            <div className="voice-recorded-panel">
              <div className="voice-recorded-header">
                <span className="voice-recorded-label">Recording ready</span>
                <span className="voice-timer font-mono">{formatTime(recordingTime)}</span>
              </div>
              {audioUrl && (
                <audio controls src={audioUrl} className="voice-audio-player" />
              )}
              <div className="voice-recorded-actions">
                <button
                  type="button"
                  onClick={transcribeAudio}
                  disabled={transcriber.isModeLoading}
                  className="voice-btn voice-btn-transcribe"
                  title="Transcribe with Whisper"
                >
                  {transcriber.isModeLoading ? (
                    <>
                      <ReloadIcon className="w-4 h-4 animate-spin" />
                      <span>Loading model…</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      <span>Transcribe</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={discardRecording}
                  className="voice-btn voice-btn-discard"
                >
                  <Cross1Icon className="w-3.5 h-3.5" />
                  <span>Discard</span>
                </button>
              </div>
            </div>
          )}

          {/* Transcribing state */}
          {recordingState === 'transcribing' && (
            <div className="voice-transcribing-panel">
              <ReloadIcon className="w-4 h-4 animate-spin" style={{ color: '#3b82f6' }} />
              <span>Transcribing with Whisper…</span>
              {transcriber.modelLoadingProgress < 100 && (
                <div className="voice-progress-bar">
                  <div
                    className="voice-progress-fill"
                    style={{ width: `${transcriber.modelLoadingProgress}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {micError && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <Cross1Icon className="w-3 h-3" />
          {micError}
        </p>
      )}

      <style>{`
        .voice-textarea-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .voice-mic-btn {
          position: absolute;
          right: 10px;
          bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #2563eb;
          cursor: pointer;
          transition: background 0.15s, transform 0.15s;
        }
        .voice-mic-btn:hover {
          background: #dbeafe;
          transform: scale(1.08);
        }
        .voice-recorder-panel {
          margin-top: 6px;
          border: 1px solid #bfdbfe;
          border-radius: 10px;
          background: #eff6ff;
          padding: 10px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .voice-recorder-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .voice-recorder-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .voice-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ef4444;
          animation: pulse 1s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .voice-timer {
          font-size: 13px;
          font-weight: 600;
          color: #1e3a5f;
          letter-spacing: 0.05em;
        }
        .voice-recorder-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .voice-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          border-radius: 7px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid transparent;
          transition: background 0.15s, opacity 0.15s;
        }
        .voice-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .voice-btn-ghost {
          background: transparent;
          border-color: #bfdbfe;
          color: #1d4ed8;
        }
        .voice-btn-ghost:hover { background: #dbeafe; }
        .voice-btn-stop {
          background: #ef4444;
          color: white;
          border-color: #dc2626;
        }
        .voice-btn-stop:hover { background: #dc2626; }
        .voice-btn-discard {
          background: transparent;
          border-color: #fca5a5;
          color: #dc2626;
        }
        .voice-btn-discard:hover { background: #fee2e2; }
        .voice-btn-transcribe {
          background: #2563eb;
          color: white;
          border-color: #1d4ed8;
          padding: 6px 14px;
        }
        .voice-btn-transcribe:hover:not(:disabled) { background: #1d4ed8; }
        .voice-recorded-panel {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .voice-recorded-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .voice-recorded-label {
          font-size: 12px;
          font-weight: 600;
          color: #1e40af;
        }
        .voice-audio-player {
          width: 100%;
          height: 32px;
          border-radius: 6px;
          accent-color: #2563eb;
        }
        .voice-recorded-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .voice-transcribing-panel {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #1e40af;
          font-weight: 500;
        }
        .voice-progress-bar {
          flex: 1;
          height: 4px;
          background: #bfdbfe;
          border-radius: 9999px;
          overflow: hidden;
        }
        .voice-progress-fill {
          height: 100%;
          background: #2563eb;
          border-radius: 9999px;
          transition: width 0.3s ease;
        }
      `}</style>
    </div>
  )
}

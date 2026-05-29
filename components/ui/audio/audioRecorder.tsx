'use client'

interface AudioRecorderProps {
    onRecordingComplete:(blob:Blob) => void
}


import { Button } from '../button'
import { PauseIcon, PlayIcon, SpeakerLoudIcon, StopIcon } from '@radix-ui/react-icons'
import React, { useEffect, useRef, useState } from 'react'

export default function AudioRecorder({onRecordingComplete}:AudioRecorderProps) {

    const [isRecording, setIsRecording] = useState(false)
    const [isPaused,setIsPaused] = useState(false)
    const [recordingTime,setRecordingTime] = useState(0)
    const [micError, setMicError] = useState<string|null>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const streamRef = useRef<MediaStream | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const startRecording = async() =>{
        setMicError(null)
        try{
            const stream = await navigator.mediaDevices.getUserMedia({audio:true})
            streamRef.current = stream
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            audioChunksRef.current = []
            mediaRecorder.ondataavailable = event =>{
                if(event.data.size>0) audioChunksRef.current.push(event.data)
            }
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, {type:'audio/wav'})
                onRecordingComplete(audioBlob)
            }

            mediaRecorder.start()
            setIsRecording(true)
            setIsPaused(false)
            setRecordingTime(0)
            timerRef.current = setInterval(()=> setRecordingTime(p => p+1),1000)
        }catch(e:unknown){
            console.error(e)
            if(e instanceof DOMException){
                if(e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError'){
                    setMicError('No microphone found. Please connect a microphone and try again.')
                } else if(e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError'){
                    setMicError('Microphone access denied. Please allow microphone permission in your browser.')
                } else {
                    setMicError(`Microphone error: ${e.message}`)
                }
            }
        }
    }

    const pauseRecording = () =>{
        if (!mediaRecorderRef.current || !isRecording) return
        if(isPaused){
            mediaRecorderRef.current.resume()
            setIsPaused(false)
            timerRef.current = setInterval(()=>setRecordingTime(p=>p+1),1000)
        }else{
            mediaRecorderRef.current.pause()
            setIsPaused(true)
            if(timerRef.current) clearInterval(timerRef.current)
        }
    }

    const stopRecording = () =>{
        if(!mediaRecorderRef.current || !isRecording) return
        mediaRecorderRef.current.stop()
        setIsRecording(false)
        setIsPaused(false)
        if(timerRef.current) clearInterval(timerRef.current)
        streamRef.current?.getTracks().forEach(t=> t.stop())
    }

    useEffect(()=>{
        return ()=>{
            if(timerRef.current) clearInterval(timerRef.current)
            streamRef.current?.getTracks().forEach(t=>t.stop())
        }
    },[])

  return (
    <div className="flex w-full flex-col items-center space-y-4">
        <div className="flex items-center justify-center space-x-2 font-mono-text-lg">
            <span>{Math.floor(recordingTime/60).toString().padStart(2,'0')}:
                {(recordingTime % 60).toString().padStart(2,'0')}
            </span>
            {isRecording && !isPaused && <span className='h-2.5 w-2.5 animate-pulse rounded-full bg-red-600'/>}

            <div className="flex space-x-4">
                {!isRecording ? (
                    <Button onClick={startRecording} size='icon'>
                        <SpeakerLoudIcon className='h-4 w-4'/>
                    </Button>
                ):(
                    <>
                    <Button onClick={pauseRecording} size='icon' variant='outline'>
                        {isPaused? <PlayIcon className='h-4 w-4'/> : <PauseIcon className='h-4 w-4'/>}
                    </Button>
                    <Button onClick={stopRecording} size='icon' variant='destructive'>
                        <StopIcon className='h-4 w-4'/>
                    </Button>
                    </>
                )}
            </div>
        </div>
        {micError && (
            <p className="text-sm text-destructive text-center px-2">{micError}</p>
        )}
    </div>
  )
}

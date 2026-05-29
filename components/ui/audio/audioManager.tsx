'use client'

import { Transcriber } from '@/types'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import AudioPlayer from '@/components/ui/audio/audio-player'
import { AudioRecorderDialog } from '@/components/ui/audio/audio-recorder-dialog'
import { ReloadIcon } from '@radix-ui/react-icons'


interface AudioData {
  buffer: AudioBuffer
  url: string
  mimeType: string
}

export default function AudioManager({
  transcriber
}: {
  transcriber: Transcriber
}) {
  const [audioData, setAudioData] = useState<AudioData | undefined>(undefined)

  const resetAudio = () => {
    transcriber.onInputChange()
    setAudioData(undefined)
  }

  const setAudioFromRecording = async (data: Blob) => {
    resetAudio()

    const blobUrl = URL.createObjectURL(data)
    const fileReader = new FileReader()

    fileReader.onloadend = async () => {
      const audioCTX = new AudioContext({ sampleRate: 16000 })
      const arrayBuffer = fileReader.result as ArrayBuffer
      const decoded = await audioCTX.decodeAudioData(arrayBuffer)

      setAudioData({
        buffer: decoded,
        url: blobUrl,
        mimeType: data.type
      })
    }

    fileReader.readAsArrayBuffer(data)
  }

  return (
    <section className='w-full max-w-2xl rounded-lg border p-6 shadow-md'>
      <div className='flex h-full flex-col items-start gap-6'>
        <div className='flex w-full items-center justify-between'>
          <h2 className='text-lg font-semibold'>Voice Input</h2>
          <AudioRecorderDialog
            onLoad={data => {
              transcriber.onInputChange()
              setAudioFromRecording(data)
            }}
          />
        </div>

        {audioData && (
          <>
            <AudioPlayer
              audioUrl={audioData.url}
              mimeType={audioData.mimeType}
            />

            <div className='mt-auto flex w-full items-center justify-between'>
              <Button type="button" onClick={() => transcriber.start(audioData.buffer)}>
                {transcriber.isModeLoading ? (
                  <>
                    <ReloadIcon className='animate-spin' />
                    <span>Loading model</span>
                  </>
                ) : transcriber.isProcessing ? (
                  <>
                    <ReloadIcon className='animate-spin' />
                    <span>Transcribing</span>
                  </>
                ) : (
                  <span>Transcribe</span>
                )}
              </Button>

              <Button variant='outline' onClick={resetAudio}>
                Reset
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
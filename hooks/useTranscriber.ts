import { Transcriber, TranscriberData } from "@/types";
import { useCallback, useEffect, useState,useMemo } from "react";
import { useWorker } from "./useWorker";

export function useTranscriber():Transcriber{
    const [output,setOutput] = useState<TranscriberData | undefined>()
    const [isProcessing, setIsProcessing] = useState(false)
    const [isModeLoading,setIsModelLoading] = useState(false)
    const [modelLoadingProgress, setModelLoadingProgress] = useState(0)

    const webWorker = useWorker(event=>{
        const message = event.data;
        switch(message.status){
            case 'progress':
                setModelLoadingProgress(message.progress)
                break
            case 'initiate':
                setIsModelLoading(true)
                break
            case 'ready':
                setIsModelLoading(false)
                console.log('ready')
                break
            case 'complete':
                setOutput(message.data)
                setIsProcessing(false)
                break
            case 'error':
                setIsProcessing(false)
                break
        }
    })

    // Pre-load the model as soon as the worker is available
    useEffect(() => {
        if (webWorker) {
            webWorker.postMessage({ init: true })
        }
    }, [webWorker])

    const onInputChange = useCallback(()=>{
        setOutput(undefined)
    },[])

    const start = useCallback(
        async (audioData:AudioBuffer | undefined)=>{
            if(!audioData) return
            setOutput(undefined)
            setIsProcessing(true)
            let audio:Float32Array
            if (audioData.numberOfChannels === 2){
                const SCALING_FACTOR = Math.sqrt(2)
                const left = audioData.getChannelData(0)
                const right = audioData.getChannelData(1)
                audio = new Float32Array(left.length)
                for(let i=0;i<audioData.length;++i)
                {
                    audio[i] = (SCALING_FACTOR *(left[i]+right[i]))/2
                }
            }else{
                audio = audioData.getChannelData(0)
            }
            webWorker?.postMessage({audio})
        },
        [webWorker]
    )

    return useMemo(
  () => ({
    onInputChange,
    isProcessing,
    isModeLoading,
    modelLoadingProgress,
    start,
    output,
  }),
  [
    onInputChange,
    isProcessing,
    isModeLoading,
    modelLoadingProgress,
    start,
    output,
  ]
) 
}
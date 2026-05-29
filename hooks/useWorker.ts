'use client'
import { useState } from "react";

export interface MessageEventHandler {
    (event:MessageEvent):void
}

export function useWorker(messageEventHandler:MessageEventHandler): Worker | null {
    const [worker] = useState(()=> createWorker(messageEventHandler))
    return worker
}

function createWorker(messageEventHandler:MessageEventHandler):Worker|null{
    if(typeof window==='undefined') return null

    // Use /worker.js from public/ — NOT bundled by Turbopack, so @xenova/transformers works correctly
    const worker = new Worker('/worker.js', {
        type: 'module'
    })
    worker.addEventListener('message',messageEventHandler)
    return worker
}
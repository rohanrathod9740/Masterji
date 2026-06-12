'use client'

import Lenis from 'lenis'
import { useEffect, useRef } from 'react'

/**
 * Mounts a Lenis smooth-scroll instance for the landing page.
 * Uses RAF loop so Lenis drives every frame at 60 fps.
 * Cleans up on unmount so it doesn't leak into authenticated routes.
 */
export default function LenisProvider({ children }: { children: React.ReactNode }) {
    const lenisRef = useRef<Lenis | null>(null)

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            // Anchor links inside the page will be handled automatically
            anchors: true,
        })

        lenisRef.current = lenis

        let rafId: number

        function raf(time: number) {
            lenis.raf(time)
            rafId = requestAnimationFrame(raf)
        }

        rafId = requestAnimationFrame(raf)

        return () => {
            cancelAnimationFrame(rafId)
            lenis.destroy()
            lenisRef.current = null
        }
    }, [])

    return <>{children}</>
}

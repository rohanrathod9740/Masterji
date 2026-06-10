import React from 'react'
import { HeroHeader } from '@/components/landing-page/header'
import HeroSection from '@/components/landing-page/hero-section-one'
import HowItWorks from '@/components/landing-page/how-it-works'
import FeaturesSection from '@/components/landing-page/features-three'
import FAQs from '@/components/landing-page/faqs-section-one'
import FooterSection from '@/components/landing-page/footer-one'
import LenisProvider from '@/components/landing-page/lenis-provider'

export const metadata = {
    title: 'Masterji — B2B Client Management Platform',
    description:
        'A lightweight consulting execution platform. Manage clients, log interactions, track tasks, and schedule follow-ups from one source of truth.',
}

export default function LandingPage() {
    return (
        <LenisProvider>
            <HeroHeader />
            <HeroSection />
            <FAQs />
            <FooterSection />
        </LenisProvider>
    )
}

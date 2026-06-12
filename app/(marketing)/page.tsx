import React from 'react'
import { HeroHeader } from '@/components/marketing/header'
import HeroSection from '@/components/marketing/hero-section-one'
import HowItWorks from '@/components/marketing/how-it-works'
import FeaturesSection from '@/components/marketing/features-three'
import FAQs from '@/components/marketing/faqs-section-one'
import FooterSection from '@/components/marketing/footer-one'
import LenisProvider from '@/components/marketing/lenis-provider'

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

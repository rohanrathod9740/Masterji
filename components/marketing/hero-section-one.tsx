import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import LandingBackground from '@/components/svgs/landing_background.jpg'
import { ChevronRight, ArrowRight, MousePointer2, Sparkles } from 'lucide-react'
import LogoCloud from "@/components/marketing/logo-cloud-two";


export default function HeroSection() {
    return (
        <main className="overflow-hidden">
            <section className="relative bg-linear-to-b to-muted from-background pt-24 md:pt-32 pb-20 lg:pb-32">
                <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                    {/* Background orbs */}
                    <div
                        className="absolute w-[600px] h-[400px] -top-32 -left-32 opacity-60 blur-[80px]"
                        style={{ background: 'radial-gradient(circle, color-mix(in oklch, var(--primary) 20%, transparent), transparent 70%)' }}
                    />
                    <div
                        className="absolute w-[500px] h-[500px] top-1/2 -right-32 opacity-60 blur-[80px]"
                        style={{ background: 'radial-gradient(circle, color-mix(in oklch, var(--chart-2) 20%, transparent), transparent 70%)' }}
                    />
                </div>

                <div className="relative z-10 mx-auto w-full max-w-7xl px-6">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-16">

                        {/* Left: Copy */}
                        <div className="flex-1 max-w-2xl fade-up">
                                <h1 className="text-balance text-4xl font-black md:text-5xl lg:text-6xl leading-[1.1] tracking-tight">
                                    AI Assistance that uplevels your{' '}
                                    <span className="grad-text">Consultancy Services</span>{' '}
                                    <br/>
                                </h1>

                                <p className="text-muted-foreground my-8 max-w-xl text-balance text-lg leading-relaxed">
                                    A lightweight consulting execution platform. Manage clients, log interactions, track tasks, and schedule follow-ups — all from a single source of truth.
                                </p>

                                <div className="flex flex-wrap items-center gap-4">
                                    <Button asChild size="lg" className="pr-5 h-12 text-base rounded-full shadow-lg shadow-primary/20">
                                        <Link href="/user/register">
                                            <span className="text-nowrap">Consultant Onboard</span>
                                            <ChevronRight className="opacity-50 ml-1" />
                                        </Link>
                                    </Button>
                                    <Button asChild size="lg" className="pr-5 h-12 text-base rounded-full shadow-lg shadow-primary/20">
                                        <Link href="client/onboard">
                                            <span className="text-nowrap">Client Onboard</span>
                                            <ChevronRight className="opacity-50 ml-1" />
                                        </Link>
                                    </Button>
                                    <Button asChild size="lg" variant="outline" className="gap-2 h-12 text-base rounded-full">
                                        <Link href="#features">
                                            <span className="text-nowrap">See Features</span>
                                            <ArrowRight className="size-4 opacity-60" />
                                        </Link>
                                    </Button>
                                </div>

                                {/* Social proof */}
                                <div className="mt-10 flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex -space-x-2">
                                        {['AS', 'RM', 'PK', 'NJ'].map((init) => (
                                            <div
                                                key={init}
                                                className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-primary-foreground"
                                                style={{ background: 'var(--primary)' }}>
                                                {init}
                                            </div>
                                        ))}
                                    </div>
                                    <span>Trusted by consulting teams daily</span>
                                </div>
                            </div>

                        {/* Right: Feature Highlights over Photo */}
                        <div className="flex-1 w-full max-w-2xl lg:ml-8 flex justify-center lg:justify-end fade-up delay-4">
                            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-muted group">
                                
                                {/* Background Photo */}
                                <Image
                                    src={LandingBackground}
                                    alt="Masterji in Action"
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
                                    priority
                                />
                                
                                {/* Overlay gradient for better contrast */}
                                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-background/10 pointer-events-none" />

                                {/* Floating Feature 1: Interaction Logging */}
                                <div className="absolute top-8 left-6 sm:left-10 glass p-3 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'color-mix(in oklch, var(--chart-2) 20%, transparent)' }}>
                                        <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: 'var(--chart-2)' }} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-foreground">Interaction Logged</p>
                                        <p className="text-[10px] text-muted-foreground">Session notes saved</p>
                                    </div>
                                </div>

                                {/* Floating Feature 2: Task Assignment */}
                                <div className="absolute top-[40%] right-6 sm:right-10 glass p-3.5 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 flex flex-col gap-2 animate-in fade-in slide-in-from-right-8 duration-700 delay-500 w-44">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-md flex items-center justify-center text-primary" style={{ background: 'color-mix(in oklch, var(--primary) 20%, transparent)' }}>
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <p className="text-xs font-bold text-foreground">Task Assigned</p>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-medium">Send onboarding intake form</p>
                                </div>

                                {/* Floating Feature 3: Appointment */}
                                <div className="absolute bottom-8 left-8 sm:left-12 glass p-3.5 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 flex items-center gap-3.5 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-700">
                                    <div className="w-11 h-11 rounded-xl flex flex-col items-center justify-center shadow-inner" style={{ background: 'color-mix(in oklch, var(--chart-1) 15%, transparent)' }}>
                                        <p className="text-[9px] font-bold uppercase leading-none mb-0.5" style={{ color: 'var(--chart-1)' }}>OCT</p>
                                        <p className="text-base font-black leading-none" style={{ color: 'var(--chart-1)' }}>24</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-foreground">Follow-up Scheduled</p>
                                        <p className="text-[10px] text-muted-foreground font-medium">Next week, 10:00 AM</p>
                                    </div>
                                </div>
                                {/* Floating Feature 4: AI Insights*/}
                                <div className="absolute top-[15%] left-[55%] sm:left-[65%] glass p-3 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-8 duration-700 delay-1000">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-500/20 text-purple-600 dark:text-purple-400">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-foreground">AI Insights</p>
                                        <p className="text-[10px] text-muted-foreground font-medium">Drafting follow-up email...</p>
                                    </div>
                                </div>
                                {/* Animated Mouse Pointer */}
                                <div className="absolute z-30 pointer-events-none drop-shadow-2xl transition-all duration-1000 ease-out top-[75%] left-[30%] group-hover:top-[43%] group-hover:right-[15%] group-hover:left-auto">
                                    <MousePointer2 className="w-8 h-8 text-black fill-white -rotate-[15deg]" />
                                    <div className="absolute top-7 left-5 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg whitespace-nowrap">
                                        Assign
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
                <LogoCloud/>
            </section>
        </main>
    )
}

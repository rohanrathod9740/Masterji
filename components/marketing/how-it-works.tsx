import React from 'react'

const steps = [
    {
        step: '01',
        title: 'Add a Client',
        description:
            'Create a client profile in seconds. Record name, company, contact info, type, and tags. Every subsequent action links back to this profile.',
        color: 'var(--chart-1)',
    },
    {
        step: '02',
        title: 'Log Every Interaction',
        description:
            'After every call, meeting, or consultation, log the interaction with notes and attachments. Build a complete, searchable history for each client.',
        color: 'var(--chart-2)',
    },
    {
        step: '03',
        title: 'Track Tasks & Follow-Ups',
        description:
            'Create tasks with priority levels and due dates. Schedule follow-up appointments. The dashboard surfaces what needs attention today — nothing falls through the cracks.',
        color: 'var(--chart-3)',
    },
]

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24">
            <div className="mx-auto w-full max-w-5xl px-6">
                {/* Section header */}
                <div className="mb-14 max-w-2xl">
                    <span
                        className="chip mb-4"
                        style={{
                            background: 'color-mix(in oklch, var(--chart-4) 15%, transparent)',
                            color: 'var(--chart-4)',
                        }}>
                        ✦ How It Works
                    </span>
                    <h2 className="text-foreground mt-3 text-4xl font-semibold leading-tight">
                        Simple by design.{' '}
                        <span className="grad-text">Powerful in practice.</span>
                    </h2>
                    <p className="text-muted-foreground mt-4 text-balance text-lg">
                        Three simple actions. One complete picture of every client relationship.
                    </p>
                </div>

                {/* Steps */}
                <div className="relative grid gap-8 md:grid-cols-3">
                    {/* Connector line */}
                    <div className="hidden md:block absolute top-8 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px bg-border" />

                    {steps.map((s, i) => (
                        <div key={i} className="feat-card group relative flex flex-col gap-4">
                            {/* Step number bubble */}
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black text-primary-foreground shadow-lg transition-transform group-hover:scale-105"
                                style={{ background: s.color }}>
                                {s.step}
                            </div>

                            <div>
                                <h3 className="text-foreground text-xl font-semibold mb-2">{s.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{s.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

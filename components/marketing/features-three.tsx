'use client'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import {
    PersonIcon,
    ChatBubbleIcon,
    CheckboxIcon,
    CalendarIcon,
    MagnifyingGlassIcon,
    LightningBoltIcon,
} from '@radix-ui/react-icons'

const features = [
    {
        icon: PersonIcon,
        title: 'Client Directory',
        description:
            'Maintain a searchable, filterable client registry. Filter by type, status, or tags. Create, edit, and archive clients in seconds.',
        color: 'var(--chart-1)',
    },
    {
        icon: ChatBubbleIcon,
        title: 'Interaction Timeline',
        description:
            'Log every consultation, call, or meeting against a client. Reverse-chronological history with attachment support — always at your fingertips.',
        color: 'var(--chart-2)',
    },
    {
        icon: CheckboxIcon,
        title: 'Task Management',
        description:
            'Assign tasks to clients or yourself. Set priorities (Critical → Low), track status, and see overdue items the moment you open the dashboard.',
        color: 'var(--chart-3)',
    },
    {
        icon: CalendarIcon,
        title: 'Appointments & Follow-Ups',
        description:
            'Schedule in-person, phone, or video appointments. View all upcoming follow-ups for the next 7 days in one glance.',
        color: 'var(--chart-4)',
    },
    {
        icon: MagnifyingGlassIcon,
        title: 'Global Search',
        description:
            'Instantly find clients by name, company, phone or email. Search interaction notes and transcriptions across your entire history.',
        color: 'var(--chart-5)',
    },
    {
        icon: LightningBoltIcon,
        title: 'Quick Capture',
        description:
            'Log an interaction, create a task, or schedule a follow-up in under 5 seconds via the global floating action button available on every screen.',
        color: 'var(--primary)',
    },
]

export default function FeaturesSection() {
    return (
        <section id="features" className="py-24 bg-muted/40">
            <div className="mx-auto w-full max-w-5xl px-6">
                {/* Section header */}
                <div className="mb-14 max-w-2xl">
                    <span
                        className="chip mb-4"
                        style={{
                            background: 'color-mix(in oklch, var(--chart-2) 15%, transparent)',
                            color: 'var(--chart-2)',
                        }}>
                        ✦ Core Features
                    </span>
                    <h2 className="text-foreground mt-3 text-4xl font-semibold leading-tight">
                        Client centric{' '}
                        <span className="grad-text">execution</span>
                    </h2>
                    <p className="text-muted-foreground mt-4 text-balance text-lg">
                        Every record is traceable to a client. No more switching between tools to understand who they are, what was discussed, and what's due next.
                    </p>
                </div>

                {/* Feature grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feat, i) => {
                        const Icon = feat.icon
                        return (
                            <Card
                                key={i}
                                className={cn('feat-card p-6 group cursor-default')}>
                                <div
                                    className="mb-4 inline-flex items-center justify-center w-10 h-10 rounded-xl transition-transform group-hover:scale-110"
                                    style={{
                                        background: `color-mix(in oklch, ${feat.color} 15%, transparent)`,
                                    }}>
                                    <Icon
                                        className="w-5 h-5"
                                        style={{ color: feat.color }}
                                    />
                                </div>
                                <h3 className="text-foreground text-lg font-semibold mb-2">{feat.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{feat.description}</p>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

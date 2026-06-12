'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Link from 'next/link'

export default function FAQs() {
    const faqItems = [
        {
            id: 'item-1',
            question: 'Who is this platform built for?',
            answer:
                'This platform is built for consulting company heads and small service businesses who need a single place to manage clients, log interactions, track tasks, and schedule follow-ups. It is not a CRM — it is a daily execution tool focused on client delivery.',
        },
        {
            id: 'item-2',
            question: 'What is the Client Portal?',
            answer:
                'The Client Portal gives your clients read-only access to their assigned tasks, due dates, and upcoming appointments. Clients cannot see internal notes, interaction logs, or any information about other clients. It is designed mobile-first so clients can check in from their phone.',
        },
        {
            id: 'item-3',
            question: 'How fast can I log an interaction?',
            answer:
                'The platform is designed around a Quick Capture philosophy — logging an interaction, creating a task, or scheduling a follow-up should take under 5 seconds. A global floating action button is available on every authenticated screen so you never lose momentum.',
        },
        {
            id: 'item-4',
            question: 'What types of interactions can I log?',
            answer:
                'You can log: Consultation, Meeting, Phone Call, Video Call, Treatment Session, Review Meeting, Project Discussion, and Support Call. Each interaction is linked to a specific client and can include notes, attachments, and optional audio recordings.',
        },
        {
            id: 'item-5',
            question: 'Does it support file attachments?',
            answer:
                'Yes. You can attach files (PDF, PNG, JPG, JPEG, DOCX) to clients, interactions, and tasks. File metadata is stored separately from the records for clean organisation.',
        }
    ]

    return (
        <section id="faqs" className="bg-muted py-16 md:py-24">
            <div className="mx-auto max-w-5xl px-4 md:px-6">
                <div className="mb-12">
                    <span
                        className="chip mb-4"
                        style={{
                            background: 'color-mix(in oklch, var(--chart-3) 15%, transparent)',
                            color: 'var(--chart-3)',
                        }}>
                        ✦ FAQs
                    </span>
                    <h2 className="text-foreground mt-3 text-4xl font-semibold">Frequently Asked Questions</h2>
                    <p className="text-muted-foreground mt-4 text-balance text-lg">
                        Everything you need to know about the platform before getting started.
                    </p>
                </div>

                <div>
                    <Accordion
                        type="single"
                        collapsible
                        className="bg-card ring-foreground/5 rounded-(--radius) w-full border border-transparent px-8 py-3 shadow ring-1">
                        {faqItems.map((item) => (
                            <AccordionItem
                                key={item.id}
                                value={item.id}
                                className="border-dotted">
                                <AccordionTrigger className="cursor-pointer text-base hover:no-underline">{item.question}</AccordionTrigger>
                                <AccordionContent>
                                    <p className="text-base text-muted-foreground leading-relaxed">{item.answer}</p>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>

                    <p className="text-muted-foreground mt-6">
                        Still have questions?{' '}
                        <Link
                            href="/login"
                            className="text-primary font-medium hover:underline">
                            Sign in to explore the platform
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    )
}

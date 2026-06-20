import Link from 'next/link'

const links = [
    { title: 'Features',     href: '#features' },
    { title: 'How It Works', href: '#how-it-works' },
    { title: 'FAQs',         href: '#faqs' },
    { title: 'Sign In',      href: '/login' },
    { title: 'Client Portal',href: '/client' },
]

export default function FooterSection() {
    return (
        <footer className="bg-muted py-16">
            <div className="mx-auto max-w-5xl px-6">
                <Link
                    href="/"
                    aria-label="go home"
                    className="mx-auto block size-fit">
                    <span className="bg-linear-to-r font-bold text-4xl tracking-tight from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Ayushman.
                    </span>
                </Link>

                <div className="my-8 flex flex-wrap justify-center gap-6">
                    {links.map((link, index) => (
                        <Link
                            key={index}
                            href={link.href}
                            className="text-muted-foreground hover:text-primary block duration-150">
                            <span>{link.title}</span>
                        </Link>
                    ))}
                </div>

                <div className="my-6 text-center text-sm text-muted-foreground max-w-md mx-auto">
                    A focused client execution platform for consulting teams. Not a CRM — a daily operations tool.
                </div>

                <span className="text-muted-foreground block text-center text-sm">
                    © {new Date().getFullYear()} Masterji. All rights reserved.
                </span>
            </div>
        </footer>
    )
}

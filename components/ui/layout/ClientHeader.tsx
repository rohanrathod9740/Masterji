'use client'
import Link from 'next/link'
import { Menu, X, LogOut } from 'lucide-react'
import React from 'react'
import { cn } from '@/lib/utils'
import { PersonIcon } from '@radix-ui/react-icons'
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/layout/dialog'
import { useClient } from '@/lib/ClientProvider'
import { useRouter } from 'next/navigation'

const sideBarItems = [
    { name: 'Appointments', href: '#appointments' },
    { name: 'Documents',    href: '#documents' },
    { name: 'Profile',      href: '#profile' },
]

function ClientHeader() {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)
    const { client } = useClient()
    const router = useRouter()

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleLogout = async () => {
        await fetch('/api/client/auth/logout', { method: 'POST' })
        router.push('/tenant/client/login')
    }

    return (
        <header>
            {/* Overlay */}
            {menuState && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 lg:hidden"
                    onClick={() => setMenuState(false)}
                />
            )}

            <nav
                className={cn('fixed z-50 w-full transition-all duration-300 bg-blue-800', isScrolled && 'bg-background/75 border-b border-black/5 backdrop-blur-lg')}>
                <div className="w-full px-6 md:px-10 lg:px-16">
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0">
                        <div className="flex w-full items-center justify-between gap-6">
                            <Link
                                href="/tenant/client/dashboard"
                                aria-label="home"
                                className="flex items-center space-x-2"
                            >
                                <span className="select-none bg-primary text-white bg-clip-text text-transparent font-bold text-xl tracking-tight inline-block transition-transform duration-300">
                                    Ayushman
                                </span>
                            </Link>

                            <div className="flex items-center gap-4">
                                {/* Mobile hamburger */}
                                <button
                                    onClick={() => setMenuState(!menuState)}
                                    aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                                    className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
                                >
                                    <Menu
                                        className={cn(
                                            'm-auto size-6 duration-200 transition-all text-white',
                                            menuState && 'rotate-180 scale-0 opacity-0'
                                        )}
                                    />
                                    <X
                                        width={50}
                                        height={20}
                                        className={cn(
                                            'absolute inset-0 m-auto size-6 duration-200 transition-all -rotate-180 scale-0 opacity-0 m-6 text-white',
                                            menuState && 'rotate-0 scale-100 opacity-100'
                                        )}
                                    />
                                </button>

                                {/* Desktop profile dialog */}
                                <div className="hidden lg:flex">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <button className="p-2 rounded-full flex hover:bg-gray-200 transition-colors duration-200">
                                                <PersonIcon width={36} height={36} className="cursor-pointer px-2 bg-white rounded-3xl" />
                                            </button>
                                        </DialogTrigger>

                                        <DialogContent>
                                            <DialogTitle>Account</DialogTitle>
                                            <DialogDescription>Client Profile</DialogDescription>
                                            {client ? (
                                                <div className="space-y-4 pt-1">
                                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                                                            {client.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-900">{client.name}</div>
                                                            <div className="text-xs text-gray-500">{client.email}</div>
                                                        </div>
                                                    </div>
                                                    {client.companyName && (
                                                        <div className="text-sm text-gray-600 px-1">
                                                            <span className="font-medium">Company:</span> {client.companyName}
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={handleLogout}
                                                        id="client-logout-btn"
                                                        className="w-full flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        Sign out
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="py-4">Not signed in</div>
                                            )}
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Sidebar */}
            <div
                className={cn(
                    'fixed top-0 right-0 h-screen w-80 flex flex-col justify-center bg-white z-40 shadow-lg transition-transform duration-300 ease-in-out',
                    menuState ? 'translate-x-0' : 'translate-x-full'
                )}>
                <span className="p-6 mt-8 bg-linear-to-r select-none font-bold text-3xl from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Ayushman.
                </span>
                <hr className="border-gray-300 my-4" />
                <div className="flex flex-col h-full overflow-y-auto">
                    {/* Menu items */}
                    <div className="flex-1 px-6 py-6 space-y-2">
                        {sideBarItems.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                className="block px-4 py-3 text-lg font-medium text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                onClick={() => setMenuState(false)}>
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Client profile section */}
                    <div className="border-t border-gray-200 p-6">
                        <Dialog>
                            <DialogTrigger asChild>
                                <button className='w-full flex flex-row items-center gap-3 p-4 rounded-lg hover:bg-gray-100 transition-colors'>
                                    <PersonIcon width={40} height={40} className='flex-shrink-0' />
                                    <div className="text-left flex-1">
                                        <div className="font-semibold text-gray-900">{client?.name || 'Client'}</div>
                                        <div className="text-xs text-gray-600">{client?.email || 'View profile'}</div>
                                    </div>
                                </button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogTitle>Account</DialogTitle>
                                <DialogDescription>Client Profile</DialogDescription>
                                {client ? (
                                    <div className="space-y-4 pt-1">
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                                                {client.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{client.name}</div>
                                                <div className="text-xs text-gray-500">{client.email}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign out
                                        </button>
                                    </div>
                                ) : (
                                    <div className="py-4">Not signed in</div>
                                )}
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default ClientHeader
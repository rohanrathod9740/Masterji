'use client'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import React from 'react'
import { cn } from '@/lib/utils'
import { PersonIcon } from "@radix-ui/react-icons"
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogDescription
} from "@/components/ui/layout/dialog";
import UserCard from "@/components/ui/UserCard";
import { useUser } from '@/lib/UserProvider'

const sideBarItems= [
    { name: 'Appointments', href: '#appointments' },
    { name: 'Commitments', href: '#commitments' },
    { name: 'Interactions', href: '#interactions' },
    { name: 'Clients', href: '#clients' },
]


function Header() {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)
    const { user } = useUser();

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

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
        href="/"
        aria-label="home"
        className="flex items-center space-x-2"
    >
        <span className="select-none bg-primary text-white bg-clip-text text-transparent font-bold text-xl tracking-tight inline-block transition-transform duration-300">
            Ayushman
        </span>
    </Link>

    <div className="flex items-center gap-4">
        <button
            onClick={() => setMenuState(!menuState)}
            aria-label={menuState ? 'Close Menu' : 'Open Menu'}
            className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
        >
            <Menu
                className={cn(
                    'm-auto size-6 duration-200 transition-all',
                    menuState && 'rotate-180 scale-0 opacity-0'
                )}
            />
            <X
                width={50}
                height={20}
                className={cn(
                    'absolute inset-0 m-auto size-6  duration-200 transition-all -rotate-180 scale-0 opacity-0 m-6',
                    menuState && 'rotate-0 scale-100 opacity-100'
                )}
            />
        </button>

        <div className="hidden lg:flex">
            <Dialog>
                <DialogTrigger asChild>
                    <button className="p-2 rounded-full flex hover:bg-gray-200 transition-colors duration-200">
                        <PersonIcon width={36} height={36} className="cursor-pointer px-2 bg-white rounded-3xl" />
                    </button>
                </DialogTrigger>

                <DialogContent>
                    <DialogTitle>Account</DialogTitle>
                    <DialogDescription>User Profile</DialogDescription>
                    {user ? <UserCard /> : <div className="py-4">Not signed in</div>}
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

                    {/* User profile section */}
                    <div className="border-t border-gray-200 p-6">
                        <Dialog>
                            <DialogTrigger asChild>
                                <button className='w-full flex flex-row items-center gap-3 p-4 rounded-lg hover:bg-gray-100 transition-colors'>
                                    <PersonIcon width={40} height={40} className='flex-shrink-0' />
                                    <div className="text-left flex-1">
                                        <div className="font-semibold text-gray-900">{user?.email || 'User'}</div>
                                        <div className="text-xs text-gray-600">{user?.email || 'View profile'}</div>
                                    </div>
                                </button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogTitle>Account</DialogTitle>
                                <DialogDescription>User Profile</DialogDescription>
                                {user ? <UserCard /> : <div className="py-4">Not signed in</div>}
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
        </header>
    )
}
export default Header;
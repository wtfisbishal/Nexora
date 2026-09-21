'use client'
import { ArrowLeftRight, Calendar, ChartLine, User, ChartPie, Home, Bot, CodeXml, CreditCard, Brain } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

const Navbar = () => {
    const path = usePathname()
    const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 })

    const itemRefs = useRef<(HTMLAnchorElement | null)[]>([])
    const profileRef = useRef<HTMLAnchorElement | null>(null)

    const navItems = [
        { href: '/dashboard', icon: Brain , title: 'Train'},
        { href: '/my-chatbot', icon: Bot , title: 'Bots'},
        { href: '/scripts', icon: CodeXml , title: 'Scripts'},
        { href: '/pricing', icon: CreditCard , title: 'pricing'},
    ]

    useEffect(() => {
        const activeIndex = navItems.findIndex((item) => item.href === path)

        if (activeIndex !== -1) {
            const el = itemRefs.current[activeIndex]
            if (el) {
                setPillStyle({
                    left: el.offsetLeft,
                    width: el.offsetWidth,
                    opacity: 1,
                })
            }
        } else {
            setPillStyle({ left: 0, width: 0, opacity: 0 })
        }
    }, [path])

    return (
        <div className='fixed top-5 z-[100]  buttombar w-full flex justify-center gap-5 h-[60px]  '>
 
            <div className='pointer-events-auto backdrop-blur-[10px] bg-[#8c8c8c3d]  relative flex items-center p-1 border border-[#d3d3d325] rounded-full'>

                {pillStyle.opacity === 1 && (
                    <div
                        className="absolute h-[calc(100%-10px)] top-1 rounded-full bg-[#E5F5AD] transition-all duration-500 ease-in-out -z-10"
                        style={{
                            left: `${pillStyle.left}px`,
                            width: `${pillStyle.width}px`,
                        }}
                    />
                )}

                {navItems.map((item, index) => {
                    const isActive = path === item.href
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            ref={(el) => { itemRefs.current[index] = el }}
                            className={`relative px-6 py-2 center flex-col rounded-full transition-all duration-300   ${
                                isActive ? 'text-[#517533]' : 'text-[#333333f0] '
                            }`}
                        >
                            <Icon size={24} />
                            <p className=' !text-[9px]  '>
                                {item.title}
                            </p>
                        </Link>
                    )
                })}
            </div> 
             <div className='pointer-events-auto backdrop-blur-[10px] bg-[#8c8c8c3d] relative flex items-center justify-center w-16 h-16 border border-[#d3d3d325] p-1  rounded-full'>
                <Link
                    ref={profileRef}
                    href='/profile'
                    className={`relative w-full h-full center rounded-full  ${
                        path === '/profile' ? ' bg-[#E5F5AD] border-none text-[#517533]' : 'text-[#333333f0] hover:text-white'
                    }`}
                >
                    <User size={24} />
                </Link>
            </div>

        </div>
    )
}

export default Navbar
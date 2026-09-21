"use client"

import React, { useEffect, useId, useRef, useState, type RefObject } from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

export interface AnimatedBeamProps {
    className?: string
    containerRef: RefObject<HTMLElement | null>  
    fromRef: RefObject<HTMLElement | null>
    toRef: RefObject<HTMLElement | null>
    curvature?: number
    reverse?: boolean
    pathColor?: string
    pathWidth?: number
    pathOpacity?: number
    gradientStartColor?: string
    gradientStopColor?: string
    delay?: number
    duration?: number
    repeat?: number
    repeatDelay?: number
    startXOffset?: number
    startYOffset?: number
    endXOffset?: number
    endYOffset?: number
}

export const AnimatedBeam: React.FC<AnimatedBeamProps> = ({
    className,
    containerRef,
    fromRef,
    toRef,
    curvature = 0,
    reverse = false,  
    duration = 7,
    delay = 0,
    pathColor = "gray",
    pathWidth = 2,
    pathOpacity = 0.2,
    gradientStartColor = "#ffaa40",
    gradientStopColor = "#9c40ff",
    repeat = Infinity,
    repeatDelay = 0,
    startXOffset = 0,
    startYOffset = 0,
    endXOffset = 0,
    endYOffset = 0,
}) => {
    const id = useId()
    const [pathD, setPathD] = useState("")
    const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 })
 
    const gradientCoordinates = reverse
        ? {
            x1: ["90%", "-10%"],
            x2: ["100%", "0%"],
            y1: ["0%", "0%"],
            y2: ["0%", "0%"],
        }
        : {
            x1: ["10%", "110%"],
            x2: ["0%", "100%"],
            y1: ["0%", "0%"],
            y2: ["0%", "0%"],
        }

    useEffect(() => {
        const updatePath = () => {
            if (containerRef.current && fromRef.current && toRef.current) {
                const containerRect = containerRef.current.getBoundingClientRect()
                const rectA = fromRef.current.getBoundingClientRect()
                const rectB = toRef.current.getBoundingClientRect()

                const svgWidth = containerRect.width
                const svgHeight = containerRect.height
                setSvgDimensions({ width: svgWidth, height: svgHeight })

                const startX =
                    rectA.left - containerRect.left + rectA.width / 2 + startXOffset
                const startY =
                    rectA.top - containerRect.top + rectA.height / 2 + startYOffset
                const endX =
                    rectB.left - containerRect.left + rectB.width / 2 + endXOffset
                const endY =
                    rectB.top - containerRect.top + rectB.height / 2 + endYOffset

                const controlY = startY - curvature
                const d = `M ${startX},${startY} Q ${(startX + endX) / 2
                    },${controlY} ${endX},${endY}`
                setPathD(d)
            }
        } 
        const resizeObserver = new ResizeObserver(() => {
            updatePath()
        })
 
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current)
        }
 
        updatePath()
 
        return () => {
            resizeObserver.disconnect()
        }
    }, [
        containerRef,
        fromRef,
        toRef,
        curvature,
        startXOffset,
        startYOffset,
        endXOffset,
        endYOffset,
    ])

    return (
        <svg
            fill="none"
            width={svgDimensions.width}
            height={svgDimensions.height}
            xmlns="http://www.w3.org/2000/svg"
            className={cn(
                "pointer-events-none absolute top-0 left-0 transform-gpu stroke-2",
                className
            )}
            viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
        >
            <path
                d={pathD}
                stroke={pathColor}
                strokeWidth={pathWidth}
                strokeOpacity={pathOpacity}
                strokeLinecap="round"
            />
            <path
                d={pathD}
                strokeWidth={pathWidth}
                stroke={`url(#${id})`}
                strokeOpacity="1"
                strokeLinecap="round"
            />
            <defs>
                <motion.linearGradient
                    className="transform-gpu"
                    id={id}
                    gradientUnits={"userSpaceOnUse"}
                    initial={{
                        x1: "0%",
                        x2: "0%",
                        y1: "0%",
                        y2: "0%",
                    }}
                    animate={{
                        x1: gradientCoordinates.x1,
                        x2: gradientCoordinates.x2,
                        y1: gradientCoordinates.y1,
                        y2: gradientCoordinates.y2,
                    }}
                    transition={{
                        delay,
                        duration,
                        ease: [0.16, 1, 0.3, 1],  
                        repeat,
                        repeatDelay,
                    }}
                >
                    <stop stopColor={gradientStartColor} stopOpacity="0"></stop>
                    <stop stopColor={gradientStartColor}></stop>
                    <stop offset="32.5%" stopColor={gradientStopColor}></stop>
                    <stop
                        offset="100%"
                        stopColor={gradientStopColor}
                        stopOpacity="0"
                    ></stop>
                </motion.linearGradient>
            </defs>
        </svg>
    )
}


const Circle = React.forwardRef<
    HTMLDivElement,
    { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => (
    <div
        ref={ref}
        className={cn(
            "z-10 flex size-15 items-center justify-center rounded-full border-2 border-[#0000003d] bg-[#64716a98] backdrop-blur-3xl p-2 shadow-[-5px_1px_10px_2px_#00000030]",
            className
        )}
    >
        {children}
    </div>
))
Circle.displayName = "Circle"

export function AnimatedBeamMultipleOutputDemo({
    className,
}: {
    className?: string
}) {
    const containerRef = useRef<HTMLDivElement>(null)
    const div1Ref = useRef<HTMLDivElement>(null)
    const div2Ref = useRef<HTMLDivElement>(null)
    const div3Ref = useRef<HTMLDivElement>(null)
    const div4Ref = useRef<HTMLDivElement>(null)
    const div5Ref = useRef<HTMLDivElement>(null)
    const div6Ref = useRef<HTMLDivElement>(null)
    const div7Ref = useRef<HTMLDivElement>(null)

    return (
        <div
            className={cn(
                "relative   flex h-[500px] w-full items-center justify-center overflow-hidden rounded-lg p-10",
                className
            )}
            ref={containerRef}
        > 
            <div className="flex flex-col justify-center gap-6"> 
                <Circle ref={div1Ref}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#ef4444" opacity=".15"/><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round"/><path d="M14 2v6h6" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round"/><text x="6" y="19" fontSize="5.5" fontWeight="bold" fill="#ef4444" fontFamily="sans-serif">PDF</text>
                    </svg>
                </Circle> 
                <Circle ref={div2Ref}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="18" height="18" rx="2" fill="#6366f1" opacity=".15"/><rect x="3" y="3" width="18" height="18" rx="2" stroke="#6366f1" strokeWidth="1.5"/><path d="M7 8h10M7 12h10M7 16h6" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                </Circle> 
                <Circle ref={div3Ref}>
                    <svg viewBox="0 0 24 24" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" fill="#ff0000"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#fff"/>
                    </svg>
                </Circle>
                 <Circle ref={div4Ref}>
                    <svg viewBox="0 0 24 24" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" fill="#24292f"/>
                    </svg>
                </Circle>
                 <Circle ref={div5Ref}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="#0ea5e9" strokeWidth="1.5"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="#0ea5e9" strokeWidth="1.5"/>
                    </svg>
                </Circle>
            </div>
 
            <div className="flex flex-col items-center justify-center mx-16">
                <Circle ref={div6Ref} className="size-16">
                    <img className="w-10 h-10 object-contain" src="/logo2.png" alt="Nexora" />
                </Circle>
            </div>

             <div className="flex flex-col justify-center">
                <Circle ref={div7Ref}>
                    <h2 className="whitespace-nowrap text-sm font-semibold">Ask Ai</h2>
                </Circle>
            </div>

 
            <AnimatedBeam containerRef={containerRef} fromRef={div1Ref} toRef={div6Ref} />
            <AnimatedBeam containerRef={containerRef} fromRef={div2Ref} toRef={div6Ref} />
            <AnimatedBeam containerRef={containerRef} fromRef={div3Ref} toRef={div6Ref} />
            <AnimatedBeam containerRef={containerRef} fromRef={div4Ref} toRef={div6Ref} />
            <AnimatedBeam containerRef={containerRef} fromRef={div5Ref} toRef={div6Ref} />
 
            <AnimatedBeam containerRef={containerRef} fromRef={div6Ref} toRef={div7Ref} />
        </div>
    )
}

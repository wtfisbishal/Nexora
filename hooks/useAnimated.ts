'use client'
import { useLayoutEffect, RefObject } from "react";
import gsap from 'gsap';


export const useAnimated = (root: RefObject<HTMLDivElement | null>) => {
 
    useLayoutEffect(() => {
  const ctx = gsap.context(() => {
    gsap.fromTo(
      ".dash-reveal",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.65, stagger: 0.1, ease: "power3.out" }
    );
    gsap.fromTo(
      ".dash-cd",
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.08,
        delay: 0.28,
        ease: "power2.out",
      }
    );
  }, root);
  return () => ctx.revert();
}, []);

  
};

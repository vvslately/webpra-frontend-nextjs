import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Transition utility classes for common animations
 */
export const transitions = {
  // Basic transitions
  all: "transition-all duration-200 ease-in-out",
  colors: "transition-colors duration-200 ease-in-out",
  opacity: "transition-opacity duration-200 ease-in-out",
  transform: "transition-transform duration-200 ease-in-out",
  width: "transition-width duration-200 ease-in-out",
  height: "transition-height duration-200 ease-in-out",
  
  // Fast transitions
  fast: {
    all: "transition-all duration-150 ease-in-out",
    colors: "transition-colors duration-150 ease-in-out",
    transform: "transition-transform duration-150 ease-in-out",
  },
  
  // Slow transitions
  slow: {
    all: "transition-all duration-300 ease-in-out",
    colors: "transition-colors duration-300 ease-in-out",
    transform: "transition-transform duration-300 ease-in-out",
  },
  
  // Sidebar specific
  sidebar: {
    open: "transition-[width,left,right] duration-200 ease-linear",
    content: "transition-[margin,opacity] duration-200 ease-linear",
  },
  
  // Page transitions
  page: {
    fade: "animate-in fade-in-0 duration-300",
    slideUp: "animate-in slide-in-from-bottom-4 fade-in-0 duration-300",
    slideDown: "animate-in slide-in-from-top-4 fade-in-0 duration-300",
    slideLeft: "animate-in slide-in-from-right-4 fade-in-0 duration-300",
    slideRight: "animate-in slide-in-from-left-4 fade-in-0 duration-300",
  },
  
  // Hover effects
  hover: {
    scale: "transition-transform duration-200 ease-in-out hover:scale-105",
    lift: "transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-md",
    glow: "transition-shadow duration-200 ease-in-out hover:shadow-lg hover:shadow-primary/20",
  },
  
  // Focus effects
  focus: {
    ring: "transition-all duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    outline: "transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2",
  },
}

/**
 * Animation variants for framer-motion
 */
export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  
  scaleUp: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.1 },
  },
}

/**
 * Transition timing functions
 */
export const easing = {
  linear: "linear",
  easeIn: "ease-in",
  easeOut: "ease-out",
  easeInOut: "ease-in-out",
  spring: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
}

/**
 * Combine transition classes with custom classes
 */
export function transition(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Create a transition class with custom duration and easing
 */
export function createTransition(
  properties: string[] = ["all"],
  duration: number = 200,
  easing: string = "ease-in-out"
) {
  const props = properties.join(", ")
  return `transition-[${props}] duration-${duration} ${easing}`
}

/**
 * Stagger animation delay for children
 */
export function staggerDelay(index: number, delay: number = 50) {
  return {
    transitionDelay: `${index * delay}ms`,
  }
}


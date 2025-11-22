"use client"

import { motion } from "framer-motion"
import React, { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface FadeUpProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  y?: number
  once?: boolean
}

export function FadeUp({
  children,
  className,
  delay = 0,
  duration = 0.5,
  y = 20,
  once = true,
}: FadeUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.4, 0, 0.2, 1],
      }}
      viewport={{ once }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}

interface FadeUpStaggerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
  duration?: number
  y?: number
  once?: boolean
}

export function FadeUpStagger({
  children,
  className,
  staggerDelay = 0.1,
  duration = 0.5,
  y = 20,
  once = true,
}: FadeUpStaggerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      viewport={{ once }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={cn(className)}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration,
                ease: [0.4, 0, 0.2, 1],
              },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}


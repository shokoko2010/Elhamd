'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion'
import { ChevronDown, ChevronUp, ArrowRight, ArrowLeft, Plus, Minus } from 'lucide-react'

// Fade in animation component
interface FadeInProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  className?: string
}

export function FadeIn({ 
  children, 
  delay = 0, 
  duration = 0.6, 
  direction = 'up', 
  className = '' 
}: FadeInProps) {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    if (isInView) {
      controls.start('visible')
    }
  }, [controls, isInView])

  const getVariants = () => {
    const baseHidden = { opacity: 0 }
    const baseVisible = { opacity: 1, transition: { duration, delay } }

    switch (direction) {
      case 'up':
        return {
          hidden: { ...baseHidden, y: 50 },
          visible: { ...baseVisible, y: 0 }
        }
      case 'down':
        return {
          hidden: { ...baseHidden, y: -50 },
          visible: { ...baseVisible, y: 0 }
        }
      case 'left':
        return {
          hidden: { ...baseHidden, x: 50 },
          visible: { ...baseVisible, x: 0 }
        }
      case 'right':
        return {
          hidden: { ...baseHidden, x: -50 },
          visible: { ...baseVisible, x: 0 }
        }
      default:
        return {
          hidden: baseHidden,
          visible: baseVisible
        }
    }
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={controls}
      variants={getVariants()}
    >
      {children}
    </motion.div>
  )
}

// Stagger animation for lists
interface StaggerContainerProps {
  children: React.ReactNode
  staggerDelay?: number
  className?: string
}

export function StaggerContainer({ 
  children, 
  staggerDelay = 0.1, 
  className = '' 
}: StaggerContainerProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay
      }
    }
  }

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  )
}

interface StaggerItemProps {
  children: React.ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}

export function StaggerItem({ 
  children, 
  delay = 0, 
  direction = 'up' 
}: StaggerItemProps) {
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 30 : direction === 'down' ? -30 : 0,
      x: direction === 'left' ? 30 : direction === 'right' ? -30 : 0
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration: 0.5,
        delay
      }
    }
  }

  return (
    <motion.div variants={itemVariants}>
      {children}
    </motion.div>
  )
}

// Hover animation component
interface HoverScaleProps {
  children: React.ReactNode
  scale?: number
  duration?: number
  className?: string
}

export function HoverScale({ 
  children, 
  scale = 1.05, 
  duration = 0.3, 
  className = '' 
}: HoverScaleProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale }}
      transition={{ duration }}
    >
      {children}
    </motion.div>
  )
}

// Slide in animation for modals and drawers
interface SlideInProps {
  children: React.ReactNode
  isOpen: boolean
  direction: 'left' | 'right' | 'up' | 'down'
  onClose?: () => void
  className?: string
}

export function SlideIn({ 
  children, 
  isOpen, 
  direction, 
  onClose, 
  className = '' 
}: SlideInProps) {
  const getVariants = () => {
    switch (direction) {
      case 'left':
        return {
          hidden: { x: '-100%' },
          visible: { x: 0 }
        }
      case 'right':
        return {
          hidden: { x: '100%' },
          visible: { x: 0 }
        }
      case 'up':
        return {
          hidden: { y: '100%' },
          visible: { y: 0 }
        }
      case 'down':
        return {
          hidden: { y: '-100%' },
          visible: { y: 0 }
        }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            className={`fixed z-50 ${className}`}
            variants={getVariants()}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Pulse animation for attention grabbing
interface PulseProps {
  children: React.ReactNode
  className?: string
  intensity?: 'low' | 'medium' | 'high'
}

export function Pulse({ 
  children, 
  className = '', 
  intensity = 'medium' 
}: PulseProps) {
  const pulseVariants = {
    low: {
      scale: [1, 1.02, 1],
      opacity: [1, 0.8, 1],
      transition: { duration: 2, repeat: Infinity }
    },
    medium: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.7, 1],
      transition: { duration: 1.5, repeat: Infinity }
    },
    high: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.6, 1],
      transition: { duration: 1, repeat: Infinity }
    }
  }

  return (
    <motion.div
      className={className}
      variants={pulseVariants}
      animate={intensity}
    >
      {children}
    </motion.div>
  )
}

// Smooth counter animation
interface CounterProps {
  value: number
  duration?: number
  className?: string
  prefix?: string
  suffix?: string
  decimals?: number
}

export function Counter({ 
  value, 
  duration = 2, 
  className = '', 
  prefix = '', 
  suffix = '', 
  decimals = 0 
}: CounterProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    const animateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      
      const currentCount = progress * value
      setCount(currentCount)
      
      if (progress < 1) {
        requestAnimationFrame(animateCount)
      }
    }
    
    requestAnimationFrame(animateCount)
  }, [value, duration])

  const formattedCount = decimals > 0 
    ? count.toFixed(decimals) 
    : Math.floor(count).toString()

  return (
    <span className={className}>
      {prefix}
      {formattedCount.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      {suffix}
    </span>
  )
}

// Accordion with smooth animations
interface AccordionItemProps {
  title: string
  children: React.ReactNode
  isOpen?: boolean
  onToggle?: () => void
  className?: string
}

export function AccordionItem({ 
  title, 
  children, 
  isOpen = false, 
  onToggle, 
  className = '' 
}: AccordionItemProps) {
  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Smooth page transition
interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  )
}

// Parallax scroll effect
interface ParallaxProps {
  children: React.ReactNode
  speed?: number
  className?: string
}

export function Parallax({ 
  children, 
  speed = 0.5, 
  className = '' 
}: ParallaxProps) {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.div
      className={className}
      style={{ y: scrollY * speed }}
    >
      {children}
    </motion.div>
  )
}

// Smooth hover card
interface HoverCardProps {
  children: React.ReactNode
  className?: string
  liftAmount?: number
}

export function HoverCard({ 
  children, 
  className = '', 
  liftAmount = 10 
}: HoverCardProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ 
        y: -liftAmount,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {children}
    </motion.div>
  )
}

// Smooth button with ripple effect
interface SmoothButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  disabled?: boolean
}

export function SmoothButton({ 
  children, 
  onClick, 
  className = '', 
  variant = 'default',
  disabled = false
}: SmoothButtonProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return

    const button = e.currentTarget
    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newRipple = { x, y, id: Date.now() }
    setRipples(prev => [...prev, newRipple])

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id))
    }, 600)

    onClick?.()
  }

  const baseClasses = "relative overflow-hidden transition-all duration-300 font-medium rounded-lg"
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-white hover:bg-gray-50",
    ghost: "hover:bg-gray-100"
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {children}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            className="absolute bg-white/30 rounded-full pointer-events-none"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        ))}
      </AnimatePresence>
    </button>
  )
}
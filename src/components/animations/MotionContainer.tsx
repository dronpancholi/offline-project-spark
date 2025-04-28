
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MotionContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  type?: 'fade' | 'slide' | 'scale' | 'slideFade';
}

export function MotionContainer({
  children,
  className,
  delay = 0,
  duration = 0.5,
  type = 'fade',
}: MotionContainerProps) {
  // Define animations based on type
  const animations = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: { x: 20 },
      animate: { x: 0 },
      exit: { x: -20 },
    },
    scale: {
      initial: { scale: 0.9, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.9, opacity: 0 },
    },
    slideFade: {
      initial: { x: 20, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: -20, opacity: 0 },
    },
  };

  const selectedAnimation = animations[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={selectedAnimation.initial}
        animate={selectedAnimation.animate}
        exit={selectedAnimation.exit}
        transition={{
          duration,
          delay,
          ease: 'easeInOut',
        }}
        className={cn(className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

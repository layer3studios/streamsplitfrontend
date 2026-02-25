'use client';
import { motion, useReducedMotion } from 'framer-motion';

// Page-level wrapper: fade + subtle translateY on mount
export function MotionPage({ children, className = '' }) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Section-level: scroll into view reveal
export function AnimateIn({ children, className = '', delay = 0 }) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Stagger container — wrap children to stagger their animations
export function StaggerContainer({ children, className = '', staggerDelay = 0.06 }) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={{
                hidden: {},
                show: {
                    transition: {
                        staggerChildren: prefersReducedMotion ? 0 : staggerDelay,
                    },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Stagger item — use inside StaggerContainer
export function StaggerItem({ children, className = '' }) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <motion.div
            variants={{
                hidden: prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

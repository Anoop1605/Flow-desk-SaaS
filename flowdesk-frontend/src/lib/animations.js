/**
 * Shared Framer Motion animation variants for the premium UI
 */

export const fadeUp = {
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: { duration: 0.15 }
    }
};

export const scaleIn = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        transition: { duration: 0.15 }
    }
};

export const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { type: "spring", stiffness: 400, damping: 30 }
    },
    exit: {
        opacity: 0,
        x: 50,
        transition: { duration: 0.2 }
    }
};

export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

export const pageVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25,0.46,0.45,0.94] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } }
};

export const cardVariant = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type:'spring', stiffness:300, damping:24 } }
};

export const modalVariants = {
  hidden:  { scale: 0.96, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type:'spring', stiffness:400, damping:28 } },
  exit:    { scale: 0.96, opacity: 0, transition: { duration: 0.15 } }
};

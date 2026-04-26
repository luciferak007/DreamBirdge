import { motion } from 'framer-motion'
export default function PageWrap({ children, className = '' }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`mx-auto max-w-6xl px-4 py-10 ${className}`}>
      {children}
    </motion.div>
  )
}

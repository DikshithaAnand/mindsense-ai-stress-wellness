import { motion } from 'framer-motion'

export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-64">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 border-4 border-teal/20 border-t-teal rounded-full"
      />
    </div>
  )
}

export function BreathingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="w-32 h-32 rounded-full border-4 border-teal/30 bg-teal/5"
      />
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="text-teal text-lg font-semibold"
      >
        Breathe... Relax... Reset
      </motion.p>
    </div>
  )
}

export function WavesAnimation() {
  return (
    <div className="flex justify-center items-end space-x-2 h-48">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ height: ['2rem', '4rem', '2rem'] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          className="w-4 bg-gradient-to-t from-teal to-lavender rounded-full"
        />
      ))}
    </div>
  )
}

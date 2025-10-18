import { motion } from "framer-motion";
import { GraduationCap, Sparkles } from "lucide-react";

interface AcademiaFlowAnimationProps {
  onComplete?: () => void;
}

export default function AcademiaFlowAnimation({ onComplete }: AcademiaFlowAnimationProps) {
  return (
    <div className="fixed inset-0 bg-dark-primary z-50 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, ease: "linear", repeat: Infinity }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Sparkles className="h-32 w-32 text-primary-500 opacity-30" />
          </motion.div>
          
          <div className="relative flex items-center justify-center mb-6">
            <div className="w-40 h-40 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center">
              <GraduationCap className="h-24 w-24 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-primary-500 to-purple-500 bg-clip-text text-transparent">
              AcademiaFlow
            </span>
          </h1>
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.8, duration: 1.5, ease: "easeInOut" }}
            className="h-1 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full mx-auto max-w-xs"
            onAnimationComplete={onComplete}
          />
          <p className="text-gray-400 mt-4">Preparing your academic dashboard...</p>
        </motion.div>
      </div>
    </div>
  );
}

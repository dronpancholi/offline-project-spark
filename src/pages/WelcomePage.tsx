
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function WelcomePage() {
  const { markAsOnboarded } = useApp();
  const navigate = useNavigate();
  const [animationComplete, setAnimationComplete] = useState(false);
  
  const handleGetStarted = () => {
    markAsOnboarded();
    navigate('/profile/setup');
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        onAnimationComplete={() => setAnimationComplete(true)}
        className="text-center max-w-md"
      >
        <div className="w-24 h-24 bg-primary rounded-xl flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl text-primary-foreground font-bold">FP</span>
        </div>
        
        <h1 className="text-4xl font-bold mb-3">
          Welcome to First Projects
        </h1>
        
        <p className="text-muted-foreground mb-8">
          Your personal task manager, completely offline and designed to boost your productivity.
        </p>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={animationComplete ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <Button onClick={handleGetStarted} size="lg" className="text-lg px-8">
            Get Started
          </Button>
        </motion.div>
        
        <p className="text-sm text-muted-foreground mt-8">
          No account needed. Your data stays on your device.
        </p>
      </motion.div>
    </div>
  );
}

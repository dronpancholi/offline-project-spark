
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { ProfileForm } from '@/components/profile/ProfileForm';

export default function ProfileSetupPage() {
  const { profile, isOnboarded } = useApp();
  const navigate = useNavigate();
  
  // Redirect to dashboard if user already has a profile
  useEffect(() => {
    if (isOnboarded && profile) {
      navigate('/dashboard');
    }
  }, [isOnboarded, profile, navigate]);
  
  const handleProfileComplete = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary p-6">
      <div className="w-full max-w-md">
        <ProfileForm onComplete={handleProfileComplete} isOnboarding={true} />
      </div>
    </div>
  );
}

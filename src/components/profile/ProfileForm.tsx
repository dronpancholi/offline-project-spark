
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileData } from '@/lib/storage';

interface ProfileFormProps {
  onComplete?: () => void;
  isOnboarding?: boolean;
}

export function ProfileForm({ onComplete, isOnboarding = false }: ProfileFormProps) {
  const { profile, saveUserProfile } = useApp();
  
  const [formData, setFormData] = useState<ProfileData>(profile || {
    fullName: '',
    username: '',
    bio: '',
    profilePicture: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProfileData, string>>>({});

  // For image upload preview
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    profile?.profilePicture
  );

  const validateForm = () => {
    const newErrors: Partial<Record<keyof ProfileData, string>> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData(prev => ({
          ...prev,
          profilePicture: base64String
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      saveUserProfile(formData);
      if (onComplete) onComplete();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto animate-fade-in">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {isOnboarding ? 'Create Your Profile' : 'Edit Profile'}
          </CardTitle>
          <CardDescription>
            {isOnboarding 
              ? 'Set up your profile to get started with First Projects'
              : 'Update your profile information'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center space-y-4">
            <div 
              className={`w-24 h-24 rounded-full border-2 border-primary flex items-center justify-center overflow-hidden ${
                imagePreview ? 'bg-white' : 'bg-secondary'
              }`}
            >
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl text-muted-foreground">
                  {formData.fullName ? formData.fullName[0].toUpperCase() : 'P'}
                </span>
              )}
            </div>
            
            <div className="flex flex-col items-center">
              <Label 
                htmlFor="profile-picture" 
                className="cursor-pointer text-sm text-primary hover:underline"
              >
                {imagePreview ? 'Change Image' : 'Upload Image'}
              </Label>
              <Input
                id="profile-picture"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              {imagePreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    setImagePreview(undefined);
                    setFormData(prev => ({
                      ...prev,
                      profilePicture: undefined
                    }));
                  }}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full-name">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="full-name"
              value={formData.fullName}
              onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              placeholder="Your Name"
              className={errors.fullName ? 'border-destructive' : ''}
            />
            {errors.fullName && (
              <p className="text-xs text-destructive">{errors.fullName}</p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username || ''}
              onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="username"
            />
            <p className="text-xs text-muted-foreground">Optional username for your profile</p>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio || ''}
              onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell us a little about yourself"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">Optional short description about yourself</p>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end">
          <Button type="submit" size="lg">
            {isOnboarding ? 'Continue' : 'Save Changes'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

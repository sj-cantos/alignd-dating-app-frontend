'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Heart, MapPin, Camera, Upload, X } from 'lucide-react';
import { Gender, profileApi } from '@/lib/api';

export default function ProfileSetup() {
  const { user, setupProfile, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Profile form state
  const [formData, setFormData] = useState({
    age: 25 as number | '',
    gender: Gender.MALE,
    bio: '',
    interests: [] as string[],
    latitude: 40.7128, // Default to NYC coordinates
    longitude: -74.0060,
    minAge: 18,
    maxAge: 50,
    interestedInGender: [Gender.FEMALE] as Gender[],
    profilePictureUrl: '',
  });

  const [currentInterest, setCurrentInterest] = useState('');
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  
  // Photo upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Redirect if user is not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, loading, router]);

  // Check if profile is already complete
  useEffect(() => {
    if (user?.isProfileComplete) {
      router.push('/discover');
    }
  }, [user, router]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          setLocationPermission('granted');
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationPermission('denied');
          // Use default location (you can set your city's coordinates)
          setFormData(prev => ({
            ...prev,
            latitude: 0, // New York default
            longitude: 0,
          }));
        }
      );
    }
  }, []);

  const handleInterestAdd = () => {
    if (currentInterest.trim() && !formData.interests.includes(currentInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, currentInterest.trim()]
      }));
      setCurrentInterest('');
    }
  };

  const handleInterestRemove = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const handleGenderPreferenceChange = (gender: string) => {
    if (gender === 'everyone') {
      setFormData(prev => ({
        ...prev,
        interestedInGender: [Gender.MALE, Gender.FEMALE, Gender.NON_BINARY]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        interestedInGender: [gender as Gender]
      }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const result = await profileApi.uploadProfilePhoto(selectedFile);
      setFormData(prev => ({ ...prev, profilePictureUrl: result.url }));
      toast.success('Photo uploaded successfully!');
    } catch (error) {
      console.error('Photo upload error:', error);
      toast.error('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setFormData(prev => ({ ...prev, profilePictureUrl: '' }));
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('User not authenticated. Please log in again.');
      router.push('/auth');
      return;
    }

    if (formData.interests.length === 0) {
      toast.error('Please add at least one interest');
      return;
    }

    if (!formData.bio.trim()) {
      toast.error('Please write a bio');
      return;
    }

    if (!formData.profilePictureUrl.trim()) {
      toast.error('Please upload a profile photo');
      return;
    }

    // Validate age
    const ageValue = typeof formData.age === 'string' ? parseInt(formData.age) : formData.age;
    if (!ageValue || isNaN(ageValue) || ageValue < 18 || ageValue > 100) {
      toast.error('Please enter a valid age between 18 and 100');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting profile data:', formData);
      console.log('Current user:', user);
      console.log('Token:', document.cookie);
      
      // Ensure age is a number for submission
      const submissionData = {
        ...formData,
        age: ageValue
      };
      
      await setupProfile(submissionData);
      toast.success('Profile setup completed!');
    } catch (error: unknown) {
      console.error('Profile setup error:', error);

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string; error?: string } }; message?: string };
        const errorMessage = axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          axiosError.message ||
          'Failed to setup profile';
        toast.error(errorMessage);
        console.error('Response data:', axiosError.response?.data);
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Failed to setup profile';
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
      router.push('/discover')
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-12 h-12 text-primary fill-primary mx-auto mb-4 animate-pulse" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
  <div className="w-full max-w-2xl">
    {/* Header */}
    <div className="mb-6 md:mb-8 text-center animate-fade-in-up">
      <h1 className="text-xl md:text-2xl font-black text-foreground bg-pink-bright px-4 py-2 border-brutal border-border shadow-brutal inline-block transform -rotate-1">
        💖 SETUP PROFILE
      </h1>
      <p className="text-sm md:text-base text-muted-foreground font-medium mt-3">
        Complete your profile to start matching
      </p>
    </div>

    <Card className="bg-card border-brutal border-border shadow-brutal-lg">
      <CardHeader className="px-6 pt-6">
        <CardTitle className="text-2xl font-black text-foreground">Step {step} of 4</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mt-1 font-medium">
          Let's set up your dating profile to find your perfect match
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Basic Information</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.age === '' ? '' : formData.age.toString()}
                    className="w-full"
                    placeholder="Enter your age"
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow empty field
                      if (value === '') {
                        setFormData(prev => ({ ...prev, age: '' as any }));
                        return;
                      }
                      
                      // Only allow numeric characters
                      const numericValue = value.replace(/\D/g, '');
                      if (numericValue !== value) {
                        return; // Reject non-numeric input
                      }
                      
                      // Parse and set the numeric value
                      const numValue = parseInt(numericValue);
                      if (!isNaN(numValue)) {
                        setFormData(prev => ({ ...prev, age: numValue }));
                      }
                    }}
                    onBlur={(e) => {
                      // Validate and correct range only on blur
                      const value = e.target.value;
                      if (value === '' || isNaN(parseInt(value))) {
                        setFormData(prev => ({ ...prev, age: 18 }));
                      } else {
                        const numValue = parseInt(value);
                        if (numValue < 18) {
                          setFormData(prev => ({ ...prev, age: 18 }));
                          toast.info('Minimum age is 18');
                        } else if (numValue > 100) {
                          setFormData(prev => ({ ...prev, age: 100 }));
                          toast.info('Maximum age is 100');
                        }
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <RadioGroup
                    value={formData.gender}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value as Gender }))}
                    className="flex flex-col sm:flex-row gap-2"
                  >
                    {[
                      { id: 'male', label: 'Male', value: Gender.MALE },
                      { id: 'female', label: 'Female', value: Gender.FEMALE },
                      { id: 'non-binary', label: 'Non-binary', value: Gender.NON_BINARY },
                    ].map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={option.id} />
                        <Label htmlFor={option.id} className="font-normal cursor-pointer">{option.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Profile Photo</Label>
                <div className="space-y-4">
                  {/* Photo Preview */}
                  {(previewUrl || formData.profilePictureUrl) && (
                    <div className="relative w-32 h-32 mx-auto">
                      <img
                        src={previewUrl || formData.profilePictureUrl}
                        alt="Profile preview"
                        className="w-full h-full object-cover rounded-lg border-2 border-border"
                      />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 border-2 border-border"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  
                  {/* File Input */}
                  <div className="flex flex-col items-center gap-2">
                    <input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="photo"
                      className="flex items-center gap-2 px-4 py-2 bg-muted border-brutal border-border shadow-brutal cursor-pointer hover:shadow-brutal-lg transition-all duration-200"
                    >
                      <Upload size={16} />
                      {selectedFile ? 'Change Photo' : 'Choose Photo'}
                    </label>
                    
                    {/* Upload Button */}
                    {selectedFile && !formData.profilePictureUrl && (
                      <Button
                        type="button"
                        onClick={handlePhotoUpload}
                        disabled={isUploading}
                        className="w-full max-w-xs"
                      >
                        {isUploading ? 'Uploading...' : 'Upload Photo'}
                      </Button>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground text-center">
                    Upload a clear photo of yourself. Supported formats: JPG, PNG, GIF
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="button" className="w-full sm:w-auto" onClick={() => setStep(2)}>Next</Button>
              </div>
            </div>
          )}

          {/* Step 2: About You */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">About You</h3>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Interests</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Add an interest"
                    value={currentInterest}
                    className="flex-1"
                    onChange={(e) => setCurrentInterest(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleInterestAdd())}
                  />
                  <Button type="button" onClick={handleInterestAdd}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm cursor-pointer"
                      onClick={() => handleInterestRemove(interest)}
                    >
                      {interest} ×
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button type="button" className="flex-1" onClick={() => setStep(3)}>Next</Button>
              </div>
            </div>
          )}

          {/* Step 3: Dating Preferences */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Dating Preferences</h3>

              <div className="space-y-4">
                <Label>I'm interested in</Label>
                <RadioGroup
                  value={
                    formData.interestedInGender.length === 3 ? 'everyone' :
                    formData.interestedInGender.length === 1 ? formData.interestedInGender[0] : 'custom'
                  }
                  onValueChange={handleGenderPreferenceChange}
                  className="flex flex-col sm:flex-row gap-2"
                >
                  {[
                    { id: 'pref-women', label: 'Women', value: Gender.FEMALE },
                    { id: 'pref-men', label: 'Men', value: Gender.MALE },
                    { id: 'pref-everyone', label: 'Everyone', value: 'everyone' }
                  ].map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.id} />
                      <Label htmlFor={option.id} className="font-normal cursor-pointer">{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Age range</Label>
                  <span className="text-sm font-medium">{formData.minAge} - {formData.maxAge} years</span>
                </div>
                <Slider
                  min={18}
                  max={100}
                  step={1}
                  value={[formData.minAge, formData.maxAge]}
                  onValueChange={(values) =>
                    setFormData(prev => ({ ...prev, minAge: values[0], maxAge: values[1] }))
                  }
                  className="w-full"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(2)}>Back</Button>
                <Button type="button" className="flex-1" onClick={() => setStep(4)}>Next</Button>
              </div>
            </div>
          )}

          {/* Step 4: Location & Summary */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Location</h3>

              <div className="space-y-4 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <span>
                    {locationPermission === 'granted'
                      ? 'Location detected automatically'
                      : locationPermission === 'denied'
                        ? 'Location permission denied'
                        : 'Detecting location...'}
                  </span>
                </div>
                <p className="text-muted-foreground">
                  Your location helps us show people nearby. We only use your general area, not your exact location.
                </p>
              </div>

              {/* Profile Summary Card */}
              <div className="bg-card border-brutal border-border shadow-brutal-lg p-6 space-y-6 animate-fade-in-up">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-xl text-foreground">Profile Preview</h4>
                  <Heart className="w-6 h-6 text-primary fill-primary" />
                </div>

                {/* Profile Photo & Name */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg border-brutal border-border shadow-brutal-sm bg-gradient-to-br from-pink-bright/20 to-primary/20 overflow-hidden">
                    {(previewUrl || formData.profilePictureUrl) ? (
                      <img 
                        src={previewUrl || formData.profilePictureUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-foreground">{user?.name || 'Your Name'}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold bg-secondary px-2 py-1 border-2 border-border transform -rotate-2">
                        {formData.age}
                      </span>
                      <span className="text-sm font-bold text-muted-foreground uppercase">
                        {formData.gender}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {formData.bio && (
                  <div className="bg-muted/50 p-4 border-l-brutal border-primary">
                    <p className="text-foreground/80 font-medium italic">"{formData.bio}"</p>
                  </div>
                )}

                {/* Interests */}
                {formData.interests.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-black text-foreground text-sm uppercase tracking-wide">Interests</h5>
                    <div className="flex flex-wrap gap-2">
                      {formData.interests.slice(0, 6).map((interest, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-accent/20 border-2 border-border text-foreground font-bold text-xs uppercase rounded-sm transform transition-transform"
                          style={{ transform: `rotate(${(index % 2 === 0 ? 1 : -1) * 2}deg)` }}
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preferences */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-bright/10 border-2 border-border p-3 shadow-brutal-sm">
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Looking for</p>
                    <p className="font-black text-foreground">
                      {formData.interestedInGender.length === 3 ? 'Everyone' : formData.interestedInGender.join(', ')}
                    </p>
                  </div>
                  <div className="bg-pink-bright/10 border-2 border-border p-3 shadow-brutal-sm">
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Age Range</p>
                    <p className="font-black text-foreground">{formData.minAge} - {formData.maxAge}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(3)}>Back</Button>
                <Button type="submit" size="lg" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? 'Setting up...' : 'Complete Setup'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  </div>
</div>

  );
}

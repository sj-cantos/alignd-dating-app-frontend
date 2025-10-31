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
import { Heart, MapPin, Camera } from 'lucide-react';
import { Gender } from '@/lib/api';

export default function ProfileSetup() {
  const { user, setupProfile, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Profile form state
  const [formData, setFormData] = useState({
    age: 25,
    gender: Gender.MALE,
    bio: '',
    interests: [] as string[],
    latitude: 0,
    longitude: 0,
    minAge: 18,
    maxAge: 50,
    interestedInGender: [Gender.FEMALE] as Gender[],
    profilePictureUrl: '',
  });

  const [currentInterest, setCurrentInterest] = useState('');
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'pending' | 'granted' | 'denied'>('pending');

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
            latitude: 40.7128, // New York default
            longitude: -74.0060,
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
      toast.error('Please add a photo URL');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting profile data:', formData);
      console.log('Current user:', user);
      console.log('Token:', document.cookie);
      await setupProfile(formData);
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
        <div className="flex items-center justify-center mb-8">
          <Heart className="w-12 h-12 text-primary fill-primary" />
          <h1 className="text-4xl font-bold ml-2">Complete Your Profile</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Step {step} of 4</CardTitle>
            <CardDescription>
              Let&apos;s set up your dating profile to find your perfect match
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Basic Information</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        min="18"
                        max="100"
                        value={formData.age}
                        onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 18 }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <RadioGroup
                        value={formData.gender}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value as Gender }))}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={Gender.MALE} id="male" />
                          <Label htmlFor="male" className="font-normal cursor-pointer">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={Gender.FEMALE} id="female" />
                          <Label htmlFor="female" className="font-normal cursor-pointer">Female</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={Gender.NON_BINARY} id="non-binary" />
                          <Label htmlFor="non-binary" className="font-normal cursor-pointer">Non-binary</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="photo">Profile Photo URL</Label>
                    <div className="flex space-x-2">
                      <Camera className="w-5 h-5 text-muted-foreground mt-2" />
                      <Input
                        id="photo"
                        type="url"
                        placeholder="https://example.com/your-photo.jpg"
                        value={formData.profilePictureUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, profilePictureUrl: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="button" onClick={() => setStep(2)}>
                      Next
                    </Button>
                  </div>
                </div>
              )}

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
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add an interest"
                        value={currentInterest}
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

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button type="button" onClick={() => setStep(3)}>
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Dating Preferences</h3>

                  <div className="space-y-4">
                    <Label>I&apos;m interested in</Label>
                    <RadioGroup
                      value={
                        formData.interestedInGender.length === 3 ? 'everyone' :
                          formData.interestedInGender.length === 1 ? formData.interestedInGender[0] :
                            'custom'
                      }
                      onValueChange={handleGenderPreferenceChange}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={Gender.FEMALE} id="pref-women" />
                        <Label htmlFor="pref-women" className="font-normal cursor-pointer">Women</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={Gender.MALE} id="pref-men" />
                        <Label htmlFor="pref-men" className="font-normal cursor-pointer">Men</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="everyone" id="pref-everyone" />
                        <Label htmlFor="pref-everyone" className="font-normal cursor-pointer">Everyone</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Age range</Label>
                      <span className="text-sm font-medium">
                        {formData.minAge} - {formData.maxAge} years
                      </span>
                    </div>
                    <Slider
                      min={18}
                      max={100}
                      step={1}
                      value={[formData.minAge, formData.maxAge]}
                      onValueChange={(values) =>
                        setFormData(prev => ({
                          ...prev,
                          minAge: values[0],
                          maxAge: values[1]
                        }))
                      }
                      className="w-full"
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(2)}>
                      Back
                    </Button>
                    <Button type="button" onClick={() => setStep(4)}>
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Location</h3>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">
                        {locationPermission === 'granted'
                          ? 'Location detected automatically'
                          : locationPermission === 'denied'
                            ? 'Using default location (New York)'
                            : 'Detecting location...'
                        }
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Your location helps us show you people nearby. We only use your general area, not your exact location.
                    </p>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Profile Summary</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Age:</strong> {formData.age}</p>
                      <p><strong>Gender:</strong> {formData.gender}</p>
                      <p><strong>Interests:</strong> {formData.interests.join(', ')}</p>
                      <p><strong>Looking for:</strong> {
                        formData.interestedInGender.length === 3 ? 'Everyone' :
                          formData.interestedInGender.join(', ')
                      }</p>
                      <p><strong>Age preference:</strong> {formData.minAge} - {formData.maxAge}</p>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(3)}>
                      Back
                    </Button>
                    <Button type="submit" size="lg" disabled={isSubmitting}>
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

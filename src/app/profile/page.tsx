'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ProfileCard } from '@/components/ProfileCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/hooks/useAuth';
import { Gender, profileApi } from '@/lib/api';
import { config } from '@/lib/config';
import { toast } from 'sonner';
import { ArrowLeft, Save, User, Camera, MapPin, Heart, Edit3 } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    age: 25 as number | '',
    gender: Gender.MALE,
    bio: '',
    interests: [] as string[],
    profilePictureUrl: '',
    minAge: 18,
    maxAge: 50,
    interestedInGender: [Gender.FEMALE] as Gender[],
  });

  const [currentInterest, setCurrentInterest] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        age: user.age || 25,
        gender: user.gender || Gender.MALE,
        bio: user.bio || '',
        interests: user.interests || [],
        profilePictureUrl: user.profilePictureUrl || '',
        minAge: user.preferences?.ageRange?.min || 18,
        maxAge: user.preferences?.ageRange?.max || 50,
        interestedInGender: Array.isArray(user.preferences?.interestedInGender)
          ? user.preferences.interestedInGender
          : user.preferences?.interestedInGender
            ? [user.preferences.interestedInGender]
            : [Gender.FEMALE],
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!formData.bio.trim()) {
      toast.error('Bio is required');
      return;
    }

    // Validate age
    const ageValue = typeof formData.age === 'string' ? parseInt(formData.age) : formData.age;
    if (!ageValue || isNaN(ageValue) || ageValue < 18 || ageValue > 100) {
      toast.error('Please enter a valid age between 18 and 100');
      return;
    }

    try {
      setSaving(true);
      await updateProfile({
        ...formData,
        age: ageValue,
        latitude: user?.location?.latitude,
        longitude: user?.location?.longitude,
      });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const addInterest = () => {
    if (currentInterest.trim() && !formData.interests.includes(currentInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, currentInterest.trim()]
      }));
      setCurrentInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const handleGenderInterestChange = (gender: Gender) => {
    setFormData(prev => ({
      ...prev,
      interestedInGender: prev.interestedInGender.includes(gender)
        ? prev.interestedInGender.filter(g => g !== gender)
        : [...prev.interestedInGender, gender]
    }));
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setUploadError(null);
  };

  const uploadProfileImage = async () => {
    if (!selectedFile) return;
    try {
      setUploadingImage(true);
      setUploadError(null);

      // Prefer backend upload (no public Cloudinary creds on client)
      const { url } = await profileApi.uploadProfilePhoto(selectedFile);

      setFormData(prev => ({ ...prev, profilePictureUrl: url }));
      setSelectedFile(null);
    } catch (err: any) {
      // Optional fallback: try unsigned client upload if env vars are present
      const cloudName = config.CLOUDINARY_CLOUD_NAME;
      const uploadPreset = config.CLOUDINARY_UPLOAD_PRESET;
      try {
        if (cloudName && uploadPreset) {
          const form = new FormData();
          form.append('file', selectedFile as File);
          form.append('upload_preset', uploadPreset);
          const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: form,
          });
          if (!res.ok) throw new Error(await res.text());
          const data = await res.json();
          const url = data.secure_url as string;
          if (!url) throw new Error('No secure_url returned from Cloudinary');
          setFormData(prev => ({ ...prev, profilePictureUrl: url }));
          setSelectedFile(null);
        } else {
          throw err;
        }
      } catch (fallbackErr: any) {
        setUploadError(fallbackErr?.message || err?.message || 'Failed to upload image');
      }
    } finally {
      setUploadingImage(false);
    }
  };

  // Convert form data to MatchUser format for ProfileCard preview
  const getPreviewProfile = () => ({
    id: user?.id || 'preview',
    name: formData.name || 'Your Name',
    age: typeof formData.age === 'string' ? parseInt(formData.age) || 25 : formData.age,
    gender: formData.gender,
    bio: formData.bio || 'Your bio will appear here...',
    interests: formData.interests,
    profilePictureUrl: formData.profilePictureUrl,
    location: user?.location || { latitude: 40.7128, longitude: -74.0060 },
    distance: undefined, // Not shown in preview
  });

  return (
    <ProtectedRoute requireCompleteProfile={true}>
  <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background p-4 pb-24 md:pb-8">
  <div className="max-w-5xl mx-auto space-y-10">
    
    {/* HEADER */}
    <div className="mb-6 md:mb-8 animate-fade-in-up">
      <h1 className="text-xl md:text-2xl font-black text-foreground bg-blue-bright px-4 py-2 border-brutal border-border shadow-brutal inline-block transform rotate-1">
        👤 PROFILE
      </h1>
      <p className="text-sm md:text-base text-muted-foreground font-medium mt-3 ml-1">
        Manage your profile settings
      </p>
    </div>

    {/* MAIN GRID */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      
      {/* PROFILE PREVIEW */}
      <div className="animate-fade-in-up space-y-4">
        <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
          <User size={22} /> Profile Preview
        </h2>
        <p className="text-muted-foreground font-medium">
          This is how others will see your profile.
        </p>
        <div className="max-w-sm mx-auto lg:mx-0">
          <ProfileCard profile={getPreviewProfile()} onSwipe={() => {}} preview />
        </div>
      </div>

      {/* EDIT FORM SECTION */}
      <div className="space-y-6 animate-fade-in-up">
        {/* EDIT BUTTONS */}
        <div className="flex justify-end">
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-primary to-pink-500 hover:opacity-90 text-primary-foreground border-brutal border-border shadow-brutal-lg font-black px-5 py-2"
            >
              <Edit3 size={20} className="mr-2" /> EDIT PROFILE
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                className="bg-card border-brutal border-border shadow-brutal hover:shadow-brutal-lg font-bold px-5 py-2"
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-secondary text-success-foreground border-brutal border-border shadow-brutal-lg font-black px-5 py-2"
              >
                <Save size={18} className="mr-2" />
                {saving ? 'SAVING...' : 'SAVE'}
              </Button>
            </div>
          )}
        </div>

        {/* PROFILE DETAILS CARD */}
        <Card className="bg-card border-brutal border-border shadow-brutal-lg overflow-hidden">
        <CardHeader className=" border-border">
          <CardTitle className="text-primary-foreground font-black text-xl flex items-center gap-2">
            <Edit3 size={22} /> {isEditing ? 'Edit Profile' : 'Profile Details'}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-8 max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          
          {/* BASIC INFO */}
          <section className="space-y-5">
            <h3 className="font-black text-foreground text-lg flex items-center gap-2 border-b-2 border-border pb-2">
              📝 BASIC INFO
            </h3>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="name" className="font-bold text-foreground">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  disabled={!isEditing}
                  className="border-brutal border-border font-medium bg-background shadow-brutal-sm focus:shadow-brutal"
                />
              </div>

              <div>
                <Label htmlFor="age" className="font-bold text-foreground">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age === '' ? '' : formData.age}
                  placeholder="Enter your age"
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty field and any number while typing
                    if (value === '') {
                      setFormData(prev => ({ ...prev, age: '' as any }));
                    } else {
                      // Allow any number input while typing
                      const numValue = parseInt(value);
                      if (!isNaN(numValue)) {
                        setFormData(prev => ({ ...prev, age: numValue }));
                      }
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
                  disabled={!isEditing}
                  className="border-brutal border-border font-medium bg-background shadow-brutal-sm focus:shadow-brutal"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <Label className="font-bold text-foreground mb-2 block">Gender</Label>
              <div className="flex flex-wrap gap-3">
                {Object.values(Gender).map((g) => (
                  <button
                    key={g}
                    type="button"
                    disabled={!isEditing}
                    onClick={() => setFormData((p) => ({ ...p, gender: g as Gender }))}
                    className={`px-1 py-1 rounded-b-sm  text-sm border-2 border-border font-medium transition-all duration-150 
                      ${formData.gender === g
                        ? 'bg-amber-200 text-primary-foreground shadow-brutal'
                        : 'bg-background text-foreground hover:bg-muted'
                      } ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio" className="font-bold text-foreground">Bio</Label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))}
                disabled={!isEditing}
                className="w-full px-3 py-2 border-brutal border-border bg-background text-foreground focus:outline-none focus:shadow-brutal resize-none font-medium rounded-md"
                rows={3}
                placeholder="Tell everyone about yourself..."
              />
            </div>

            {/* Profile Picture */}
            <div>
              <Label className="font-bold text-foreground">Profile Picture</Label>
              <div className="mt-4 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div 
                  className="w-28 h-28 rounded-2xl border-brutal border-border shadow-brutal bg-muted overflow-hidden cursor-pointer hover:shadow-brutal-lg transition-all duration-200 group relative"
                  onClick={() => {
                    if (isEditing && !uploadingImage) {
                      document.getElementById('profile-photo-input')?.click();
                    }
                  }}
                >
                  {selectedFile ? (
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : formData.profilePictureUrl ? (
                    <img
                      src={formData.profilePictureUrl}
                      alt="current"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm font-medium">
                      <div className="text-center">
                        <Camera size={24} className="mx-auto mb-1" />
                        <span className="text-xs">Click to upload</span>
                      </div>
                    </div>
                  )}
                  {isEditing && !uploadingImage && (
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-200 flex items-center justify-center">
                      <Camera className="opacity-0 group-hover:opacity-100 text-background w-8 h-8 transition-opacity duration-200" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 w-full">
                  <Input
                    id="profile-photo-input"
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                    disabled={!isEditing || uploadingImage}
                    className="border-brutal border-border hover:opacity-90 font-medium bg-background shadow-brutal-sm focus:shadow-brutal file:border-0 file:bg-gradient-to-r  file:text-primary-foreground file:font-bold"
                  />
                  {selectedFile && (
                    <Button
                      type="button"
                      onClick={uploadProfileImage}
                      disabled={uploadingImage}
                      className="bg-primary hover:opacity-90 text-success-foreground border-brutal border-border font-bold shadow-brutal-sm"
                    >
                      {uploadingImage ? 'Uploading...' : 'Upload Photo'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* INTERESTS */}
          <section className="space-y-4">
            <h3 className="font-black text-foreground text-lg border-b-2 border-border pb-2">
              🎯 INTERESTS
            </h3>

            {isEditing && (
              <div className="flex gap-2">
                <Input
                  value={currentInterest}
                  onChange={(e) => setCurrentInterest(e.target.value)}
                  placeholder="Add an interest..."
                  className="border-brutal border-border font-medium bg-background shadow-brutal-sm focus:shadow-brutal"
                  onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                />
                <Button
                  onClick={addInterest}
                  className=" text-success-foreground text-sm border-brutal border-border font-medium shadow-brutal-sm"
                >
                  Add
                </Button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {formData.interests.map((interest, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-accent border-2 border-border text-accent-foreground font-bold text-sm rounded-full flex items-center gap-2 shadow-sm hover:shadow-brutal-sm transition-all"
                >
                  {interest}
                  {isEditing && (
                    <button
                      onClick={() => removeInterest(interest)}
                      className="text-destructive hover:text-destructive/80 font-bold"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
          </section>

          {/* PREFERENCES */}
          <section className="space-y-5">
            <h3 className="font-black text-foreground text-lg border-b-2 border-border pb-2">
              💖 PREFERENCES
            </h3>

            <div>
              <Label className="font-bold text-foreground">
                Age Range: {formData.minAge} - {formData.maxAge}
              </Label>
              <div className="mt-2 space-y-3">
                <Slider
                  value={[formData.minAge]}
                  onValueChange={(v) => setFormData((p) => ({ ...p, minAge: v[0] }))}
                  min={18}
                  max={formData.maxAge}
                  step={1}
                  disabled={!isEditing}
                />
                <Slider
                  value={[formData.maxAge]}
                  onValueChange={(v) => setFormData((p) => ({ ...p, maxAge: v[0] }))}
                  min={formData.minAge}
                  max={100}
                  step={1}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <Label className="font-bold text-foreground">Interested in</Label>
              <div className="mt-3 flex flex-wrap gap-3">
                {Object.values(Gender).map((g) => (
                  <button
                    key={g}
                    type="button"
                    disabled={!isEditing}
                    onClick={() => handleGenderInterestChange(g)}
                    className={`px-1 py-1 bg-accent rounded-b-sm border-1 border-border font-medium transition-all duration-150 
                      ${formData.interestedInGender.includes(g)
                        ? 'bg-secondary text-success-foreground shadow-brutal'
                        : 'bg-background text-foreground hover:bg-muted'
                      } ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </CardContent>
      </Card>
      </div>
    </div>
  </div>
</div>

    </ProtectedRoute>
  );
}
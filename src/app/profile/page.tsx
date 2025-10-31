'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/hooks/useAuth';
import { Gender, profileApi } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Save, User, Camera, MapPin, Heart, Edit3 } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    age: 25,
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

    try {
      setSaving(true);
      await updateProfile({
        ...formData,
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
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
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

  return (
    <ProtectedRoute requireCompleteProfile={true}>
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Button
                onClick={() => router.push('/discover')}
                variant="outline"
                className="bg-card border-brutal border-border shadow-brutal hover:shadow-brutal-lg transition-all duration-200 font-bold transform -rotate-1"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Discover
              </Button>
              
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground border-brutal border-border shadow-brutal hover:shadow-brutal-lg transition-all duration-200 font-bold transform rotate-1"
                >
                  <Edit3 size={20} className="mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
            
            <div className="text-center">
              <h1 className="text-4xl font-black text-foreground mb-2 transform -rotate-1">
                👤 YOUR PROFILE 👤
              </h1>
              <p className="text-xl font-bold text-secondary-foreground bg-secondary inline-block px-4 py-2 border-2 border-border transform rotate-1">
                {isEditing ? 'Edit your amazing profile!' : 'Looking great!'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profile Preview Card */}
            <Card className="bg-card border-brutal border-border shadow-brutal-lg overflow-hidden animate-fade-in-up">
              <CardHeader className="bg-gradient-to-r from-pink-bright to-primary border-b-brutal border-border">
                <CardTitle className="text-primary-foreground font-black text-xl flex items-center gap-2">
                  <User size={24} />
                  Profile Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Profile Picture */}
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      {formData.profilePictureUrl ? (
                        <img
                          src={formData.profilePictureUrl}
                          alt="Profile"
                          className="w-full h-full object-cover border-brutal border-border shadow-brutal"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pink-bright/20 to-primary/20 border-brutal border-border shadow-brutal flex items-center justify-center">
                          <Camera size={40} className="text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="text-center">
                    <h2 className="text-2xl font-black text-foreground">{formData.name}</h2>
                    <p className="text-lg font-bold text-muted-foreground">{formData.age} years old</p>
                    <p className="text-sm font-medium text-muted-foreground capitalize">{formData.gender}</p>
                  </div>

                  {/* Bio */}
                  {formData.bio && (
                    <div className="border-l-brutal border-primary pl-4">
                      <p className="text-foreground font-medium italic">"{formData.bio}"</p>
                    </div>
                  )}

                  {/* Interests */}
                  {formData.interests.length > 0 && (
                    <div>
                      <h3 className="font-black text-foreground text-sm uppercase tracking-wide mb-2">Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {formData.interests.map((interest, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-accent border-2 border-border text-accent-foreground font-bold text-xs uppercase transform rotate-1"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Edit Form */}
            <Card className="bg-card border-brutal border-border shadow-brutal-lg animate-fade-in-up">
              <CardHeader className="bg-gradient-to-r from-success to-accent border-b-brutal border-border">
                <CardTitle className="text-primary-foreground font-black text-xl flex items-center gap-2">
                  <Edit3 size={24} />
                  {isEditing ? 'Edit Profile' : 'Profile Details'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-black text-foreground text-lg border-b-2 border-border pb-2">
                    📝 BASIC INFO
                  </h3>
                  
                  <div>
                    <Label htmlFor="name" className="font-bold text-foreground">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                      className="border-brutal border-border font-medium bg-background shadow-brutal-sm focus:shadow-brutal transition-all duration-200"
                    />
                  </div>

                  <div>
                    <Label htmlFor="age" className="font-bold text-foreground">Age: {formData.age}</Label>
                    <Slider
                      value={[formData.age]}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, age: value[0] }))}
                      min={18}
                      max={100}
                      step={1}
                      disabled={!isEditing}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="font-bold text-foreground">Gender</Label>
                    <RadioGroup
                      value={formData.gender}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value as Gender }))}
                      disabled={!isEditing}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={Gender.MALE} id="male" />
                        <Label htmlFor="male">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={Gender.FEMALE} id="female" />
                        <Label htmlFor="female">Female</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={Gender.NON_BINARY} id="non-binary" />
                        <Label htmlFor="non-binary">Non-binary</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="bio" className="font-bold text-foreground">Bio</Label>
                    <textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border-brutal border-border bg-background text-foreground focus:outline-none focus:shadow-brutal resize-none font-medium transition-all duration-200"
                      rows={3}
                      placeholder="Tell everyone about yourself..."
                    />
                  </div>

                  <div>
                    <Label className="font-bold text-foreground">Profile Picture</Label>
                    <div className="mt-2 space-y-3">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={onFileChange}
                        disabled={!isEditing || uploadingImage}
                        className="border-brutal border-border font-medium bg-background shadow-brutal-sm focus:shadow-brutal transition-all duration-200 file:border-0 file:bg-secondary file:text-secondary-foreground"
                      />

                      {selectedFile && (
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 border-brutal border-border shadow-brutal overflow-hidden">
                            <img
                              alt="preview"
                              src={URL.createObjectURL(selectedFile)}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={uploadProfileImage}
                            disabled={uploadingImage}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground border-brutal border-border shadow-brutal-sm hover:shadow-brutal font-bold"
                          >
                            {uploadingImage ? 'Uploading...' : 'Upload Photo'}
                          </Button>
                        </div>
                      )}

                      {uploadError && (
                        <p className="text-destructive text-sm font-bold">{uploadError}</p>
                      )}

                      {formData.profilePictureUrl && (
                        <p className="text-sm text-muted-foreground break-all">
                          Current: {formData.profilePictureUrl}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Interests */}
                <div className="space-y-4">
                  <h3 className="font-black text-foreground text-lg border-b-2 border-border pb-2">
                    🎯 INTERESTS
                  </h3>
                  
                  {isEditing && (
                    <div className="flex gap-2">
                      <Input
                        value={currentInterest}
                        onChange={(e) => setCurrentInterest(e.target.value)}
                        placeholder="Add an interest..."
                        className="border-brutal border-border font-medium bg-background shadow-brutal-sm focus:shadow-brutal transition-all duration-200"
                        onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                      />
                      <Button
                        onClick={addInterest}
                        className="bg-success hover:bg-success/90 text-success-foreground border-brutal border-border font-bold shadow-brutal-sm hover:shadow-brutal transition-all duration-200"
                      >
                        Add
                      </Button>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {formData.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-accent border-2 border-border text-accent-foreground font-bold text-sm flex items-center gap-2 transform rotate-1"
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
                </div>

                {/* Preferences */}
                <div className="space-y-4">
                  <h3 className="font-black text-foreground text-lg border-b-2 border-border pb-2">
                    💖 PREFERENCES
                  </h3>
                  
                  <div>
                    <Label className="font-bold text-foreground">Age Range: {formData.minAge} - {formData.maxAge}</Label>
                    <div className="mt-2 space-y-2">
                      <div>
                        <Label className="text-sm text-muted-foreground">Min Age: {formData.minAge}</Label>
                        <Slider
                          value={[formData.minAge]}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, minAge: value[0] }))}
                          min={18}
                          max={formData.maxAge}
                          step={1}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Max Age: {formData.maxAge}</Label>
                        <Slider
                          value={[formData.maxAge]}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, maxAge: value[0] }))}
                          min={formData.minAge}
                          max={100}
                          step={1}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="font-bold text-foreground">Interested in</Label>
                    <div className="mt-2 space-y-2">
                      {Object.values(Gender).map((gender) => (
                        <div key={gender} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`interested-${gender}`}
                            checked={formData.interestedInGender.includes(gender)}
                            onChange={() => isEditing && handleGenderInterestChange(gender)}
                            disabled={!isEditing}
                            className="w-4 h-4"
                          />
                          <Label htmlFor={`interested-${gender}`} className="capitalize text-foreground">
                            {gender}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      className="flex-1 border-brutal border-border font-bold bg-card"
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 bg-success hover:bg-success/90 text-success-foreground border-brutal border-border shadow-brutal hover:shadow-brutal-lg transition-all duration-200 font-black"
                    >
                      <Save size={20} className="mr-2" />
                      {saving ? 'SAVING...' : 'SAVE PROFILE'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
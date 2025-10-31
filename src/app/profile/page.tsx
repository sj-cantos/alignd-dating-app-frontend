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

    // Validate age
    if (!formData.age || formData.age < 18 || formData.age > 100) {
      toast.error('Please enter a valid age between 18 and 100');
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
    age: formData.age,
    gender: formData.gender,
    bio: formData.bio || 'Your bio will appear here...',
    interests: formData.interests,
    profilePictureUrl: formData.profilePictureUrl,
    location: user?.location || { latitude: 40.7128, longitude: -74.0060 },
    distance: undefined, // Not shown in preview
  });

  return (
    <ProtectedRoute requireCompleteProfile={true}>
      <div className="min-h-screen bg-background p-4 pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-2">
              <User size={26} /> Profile Settings
            </h1>

            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground border-brutal border-border shadow-brutal hover:shadow-brutal-lg font-black px-5 py-2"
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
                  className="bg-success hover:bg-success/90 text-success-foreground border-brutal border-border shadow-brutal hover:shadow-brutal-lg font-black px-5 py-2"
                >
                  <Save size={20} className="mr-2" />
                  {saving ? 'SAVING...' : 'SAVE'}
                </Button>
              </div>
            )}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Profile Preview */}
            <div className="animate-fade-in-up space-y-4">
              <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
                <User size={22} /> Profile Preview
              </h2>
              <p className="text-muted-foreground font-medium">
                This is how others will see your profile
              </p>
              <ProfileCard profile={getPreviewProfile()} onSwipe={() => { }} preview />
            </div>

            {/* Edit Form */}
            <Card className="bg-card border-brutal border-border shadow-brutal-lg animate-fade-in-up overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary to-accent border-b-brutal border-border">
                <CardTitle className="text-primary-foreground font-black text-xl flex items-center gap-2">
                  <Edit3 size={22} /> {isEditing ? 'Edit Profile' : 'Profile Details'}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
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
                        min="18"
                        max="100"
                        value={formData.age}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            setFormData((p) => ({ ...p, age: '' as any }));
                          } else {
                            const n = parseInt(value);
                            if (!isNaN(n) && n >= 18 && n <= 100) {
                              setFormData((p) => ({ ...p, age: n }));
                            }
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '') {
                            setFormData((p) => ({ ...p, age: user?.age || 18 }));
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
                          className={`px-4 py-2 rounded-xl border-2 border-border font-bold transition-all duration-150 ${formData.gender === g
                              ? 'bg-primary text-primary-foreground shadow-brutal'
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
                      className="w-full px-3 py-2 border-brutal border-border bg-background text-foreground focus:outline-none focus:shadow-brutal resize-none font-medium"
                      rows={3}
                      placeholder="Tell everyone about yourself..."
                    />
                  </div>

                  {/* Profile Picture */}
                  <div>
                    <Label className="font-bold text-foreground">Profile Picture</Label>
                    <div className="mt-3 space-y-3">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={onFileChange}
                        disabled={!isEditing || uploadingImage}
                        className="border-brutal border-border font-medium bg-background shadow-brutal-sm focus:shadow-brutal file:border-0 file:bg-primary file:text-primary-foreground"
                      />

                      {selectedFile && (
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg border-brutal border-border shadow-brutal overflow-hidden">
                            <img src={URL.createObjectURL(selectedFile)} alt="preview" className="w-full h-full object-cover" />
                          </div>
                          <Button
                            type="button"
                            onClick={uploadProfileImage}
                            disabled={uploadingImage}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground border-brutal border-border font-bold shadow-brutal-sm"
                          >
                            {uploadingImage ? 'Uploading...' : 'Upload Photo'}
                          </Button>
                        </div>
                      )}
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
                        className="bg-success hover:bg-success/90 text-success-foreground border-brutal border-border font-bold shadow-brutal-sm"
                      >
                        Add
                      </Button>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {formData.interests.map((interest, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-accent border-2 border-border text-accent-foreground font-bold text-sm rounded-lg flex items-center gap-2"
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
                          className={`px-4 py-2 rounded-xl border-2 border-border font-bold transition-all duration-150 ${formData.interestedInGender.includes(g)
                              ? 'bg-success text-success-foreground shadow-brutal'
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

    </ProtectedRoute>
  );
}
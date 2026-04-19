import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Loader2, User, Building, MapPin, Lock, Save, FileText } from 'lucide-react';
import { toast } from 'sonner';
import axiosInstance from '../../services/axiosConfig';
import { TokenStorage } from '../../services/tokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Profile {
  user: {
    id: string;
    email: string;
    role: string;
    status: string;
    last_login: string;
    created_at: string;
  };
  profile: {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    company?: string;
    address?: string;
    description?: string;
    created_at: string;
    updated_at: string;
  };
}

export function StakeholderSettings() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    company: '',
    address: '',
    about: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const token = TokenStorage.getAccessToken();
      const response = await axiosInstance.get(`${API_BASE_URL}/v1/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setProfile(response.data.data);
        setFormData({
          first_name: response.data.data.profile.first_name || '',
          last_name: response.data.data.profile.last_name || '',
          company: response.data.data.profile.company || '',
          address: response.data.data.profile.address || '',
          about: response.data.data.profile.about || '',
        });
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.first_name || !formData.last_name) {
      toast.error('First name and last name are required');
      return;
    }

    try {
      setIsSaving(true);
      const token = TokenStorage.getAccessToken();
      const response = await axiosInstance.post(
        `${API_BASE_URL}/v1/profile`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Profile updated successfully');
        loadProfile();
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">Profile Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your business profile</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Display */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Profile Header with Image on Left */}
                <div className="flex items-start gap-4">
                  {/* Alphabetical Profile Image */}
                  <div style={{ width: '80px', height: '80px' }} className="rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg flex-shrink-0">
                    <span className="text-3xl font-bold text-white">
                      {(formData.first_name?.[0] || profile.user.email[0]).toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Name & Email */}
                  <div className="flex-1 min-w-0 pt-1">
                    <h3 className="text-lg font-bold truncate">
                      {formData.first_name && formData.last_name
                        ? `${formData.first_name} ${formData.last_name}`
                        : 'Set Your Name'}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate mt-1">{profile.user.email}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {profile.user.role}
                      </Badge>
                      <Badge className="text-xs bg-green-100 text-green-800">
                        {profile.user.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="pt-4 border-t space-y-3">
                  {formData.company && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Company</span>
                      <span className="text-sm font-semibold truncate max-w-[150px]" title={formData.company}>
                        {formData.company}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Member Since</span>
                    <span className="text-sm font-semibold">
                      {new Date(profile.user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Last Login</span>
                    <span className="text-sm font-semibold">
                      {profile.user.last_login 
                        ? new Date(profile.user.last_login).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : 'Never'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Profile Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Basic Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs" htmlFor="first_name">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="mt-1 h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs" htmlFor="last_name">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="mt-1 h-9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building className="w-4 h-4" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs" htmlFor="company">
                  Company Name
                </Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Acme Corporation"
                  className="mt-1 h-9"
                />
              </div>
              <div>
                <Label className="text-xs" htmlFor="address">
                  Business Address
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Business Street, City, State, ZIP"
                  rows={2}
                  className="mt-1 resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4" />
                About
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label className="text-xs" htmlFor="about">
                  About
                </Label>
                <Textarea
                  id="about"
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  placeholder="Tell us about your company, industry, and security needs..."
                  rows={4}
                  className="mt-1 resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This helps pentesters understand your business context
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={loadProfile} disabled={isSaving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="!bg-black !text-white hover:!bg-gray-900"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

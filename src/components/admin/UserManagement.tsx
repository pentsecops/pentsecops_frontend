import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { UserPlus, Trash2, RefreshCw, Loader2, Users, Shield, Building, Search, Eye, Ban, CheckCircle, Snowflake, Mail, MapPin, Briefcase, Calendar, FileText, Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import axiosInstance from '../../services/axiosConfig';
import { TokenStorage } from '../../services/tokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface UserProfile {
  user: {
    id: string;
    email: string;
    role: 'pentester' | 'stakeholder';
    status: 'active' | 'freeze' | 'suspended';
    last_login: string;
    created_at: string;
    updated_at: string;
  };
  profile: {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    company?: string;
    address?: string;
    specialization?: string;
    experience_years?: number;
    resume?: string;
    created_at: string;
    updated_at: string;
  };
  profile_id: string;
}

interface PentesterForm {
  email: string;
  role: 'pentester';
  first_name: string;
  last_name: string;
  specialization: string;
  experience_years: number;
  resume: string;
}

interface StakeholderForm {
  email: string;
  role: 'stakeholder';
  first_name: string;
  last_name: string;
  company: string;
  address: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
  const [selectedRole, setSelectedRole] = useState<'pentester' | 'stakeholder'>('pentester');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'pentester' | 'stakeholder'>('all');
  
  const [pentesterForm, setPentesterForm] = useState<PentesterForm>({
    email: '',
    role: 'pentester',
    first_name: '',
    last_name: '',
    specialization: '',
    experience_years: 0,
    resume: ''
  });

  const [stakeholderForm, setStakeholderForm] = useState<StakeholderForm>({
    email: '',
    role: 'stakeholder',
    first_name: '',
    last_name: '',
    company: '',
    address: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const token = TokenStorage.getAccessToken();
      const response = await axiosInstance.get(`${API_BASE_URL}/v1/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const usersData = response.data.data?.users;
        // Handle null or undefined users
        if (!usersData || !Array.isArray(usersData)) {
          setUsers([]);
        } else {
          setUsers(usersData);
        }
      }
    } catch (error) {
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchQuery) {
      filtered = filtered.filter(userProfile => {
        const fullName = `${userProfile.profile.first_name} ${userProfile.profile.last_name}`.toLowerCase();
        const email = userProfile.user.email.toLowerCase();
        const query = searchQuery.toLowerCase();
        return fullName.includes(query) || email.includes(query);
      });
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(userProfile => userProfile.user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleViewUser = async (userId: string) => {
    try {
      const token = TokenStorage.getAccessToken();
      const response = await axiosInstance.get(`${API_BASE_URL}/v1/admin/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSelectedUser(response.data.data);
        setIsViewDialogOpen(true);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load user details');
    }
  };

  const handleCreateUser = async () => {
    try {
      const token = TokenStorage.getAccessToken();
      const payload = selectedRole === 'pentester' ? pentesterForm : stakeholderForm;
      
      const response = await axiosInstance.post(
        `${API_BASE_URL}/v1/admin/register/user`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('User created successfully');
        loadUsers();
        setIsAddDialogOpen(false);
        resetForms();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create user');
    }
  };

  const handleUpdateStatus = async (userId: string, newStatus: 'active' | 'freeze' | 'suspended') => {
    try {
      const token = TokenStorage.getAccessToken();
      const response = await axiosInstance.post(
        `${API_BASE_URL}/v1/admin/user/${userId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(`User status updated to ${newStatus}`);
        loadUsers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update status');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      const token = TokenStorage.getAccessToken();
      const response = await axiosInstance.delete(
        `${API_BASE_URL}/v1/admin/user/${userToDelete.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('User deleted successfully');
        loadUsers();
        setIsDeleteDialogOpen(false);
        setUserToDelete(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete user');
    }
  };

  const resetForms = () => {
    setPentesterForm({
      email: '',
      role: 'pentester',
      first_name: '',
      last_name: '',
      specialization: '',
      experience_years: 0,
      resume: ''
    });
    setStakeholderForm({
      email: '',
      role: 'stakeholder',
      first_name: '',
      last_name: '',
      company: '',
      address: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'freeze': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalUsers = users.length;
  const totalPentesters = users.filter(u => u.user.role === 'pentester').length;
  const totalStakeholders = users.filter(u => u.user.role === 'stakeholder').length;

  if (isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage pentesters and stakeholders</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={loadUsers} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new pentester or stakeholder to the system
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={selectedRole} onValueChange={(value: 'pentester' | 'stakeholder') => setSelectedRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pentester">Pentester</SelectItem>
                      <SelectItem value="stakeholder">Stakeholder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedRole === 'pentester' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input
                          value={pentesterForm.first_name}
                          onChange={(e) => setPentesterForm({ ...pentesterForm, first_name: e.target.value })}
                          placeholder="John"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input
                          value={pentesterForm.last_name}
                          onChange={(e) => setPentesterForm({ ...pentesterForm, last_name: e.target.value })}
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={pentesterForm.email}
                        onChange={(e) => setPentesterForm({ ...pentesterForm, email: e.target.value })}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Specialization</Label>
                      <Input
                        value={pentesterForm.specialization}
                        onChange={(e) => setPentesterForm({ ...pentesterForm, specialization: e.target.value })}
                        placeholder="Web Application Security"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Experience (Years)</Label>
                      <Input
                        type="number"
                        value={pentesterForm.experience_years}
                        onChange={(e) => setPentesterForm({ ...pentesterForm, experience_years: parseInt(e.target.value) || 0 })}
                        placeholder="5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Resume URL (Optional)</Label>
                      <Input
                        value={pentesterForm.resume}
                        onChange={(e) => setPentesterForm({ ...pentesterForm, resume: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input
                          value={stakeholderForm.first_name}
                          onChange={(e) => setStakeholderForm({ ...stakeholderForm, first_name: e.target.value })}
                          placeholder="Jane"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input
                          value={stakeholderForm.last_name}
                          onChange={(e) => setStakeholderForm({ ...stakeholderForm, last_name: e.target.value })}
                          placeholder="Smith"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={stakeholderForm.email}
                        onChange={(e) => setStakeholderForm({ ...stakeholderForm, email: e.target.value })}
                        placeholder="jane@company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input
                        value={stakeholderForm.company}
                        onChange={(e) => setStakeholderForm({ ...stakeholderForm, company: e.target.value })}
                        placeholder="Acme Corp"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Address</Label>
                      <Textarea
                        value={stakeholderForm.address}
                        onChange={(e) => setStakeholderForm({ ...stakeholderForm, address: e.target.value })}
                        placeholder="123 Business Street, City, State"
                        rows={3}
                      />
                    </div>
                  </>
                )}

                <Button onClick={handleCreateUser} className="w-full">
                  Create User
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">All registered users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pentesters</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPentesters}</div>
            <p className="text-xs text-muted-foreground">Security professionals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stakeholders</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStakeholders}</div>
            <p className="text-xs text-muted-foreground">Business clients</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={(value: any) => setRoleFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="pentester">Pentester</SelectItem>
                <SelectItem value="stakeholder">Stakeholder</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[300px]">User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Professional Info</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-center w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Users className="w-12 h-12 mb-2 opacity-20" />
                        <p>No users found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((userProfile) => {
                    // Add null safety checks
                    if (!userProfile?.profile || !userProfile?.user) {
                      return null;
                    }
                    
                    const initials = `${userProfile.profile.first_name?.charAt(0) || ''}${userProfile.profile.last_name?.charAt(0) || ''}`.toUpperCase();
                    const fullName = `${userProfile.profile.first_name || ''} ${userProfile.profile.last_name || ''}`;
                    
                    // Generate color based on first letter
                    const colors = [
                      'bg-blue-500',
                      'bg-green-500',
                      'bg-purple-500',
                      'bg-pink-500',
                      'bg-orange-500',
                      'bg-cyan-500',
                      'bg-indigo-500',
                      'bg-red-500',
                      'bg-yellow-500',
                      'bg-teal-500'
                    ];
                    const colorIndex = userProfile.profile.first_name.charCodeAt(0) % colors.length;
                    const avatarColor = colors[colorIndex];

                    return (
                      <TableRow key={userProfile.user.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div 
                              className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}
                              style={{ minWidth: '40px', minHeight: '40px', borderRadius: '50%' }}
                            >
                              {initials}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">{fullName}</p>
                              <p className="text-xs text-muted-foreground truncate">{userProfile.user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={userProfile.user.role === 'pentester' ? 'default' : 'secondary'}
                            className="font-medium"
                          >
                            {userProfile.user.role === 'pentester' ? (
                              <><Shield className="w-3 h-3 mr-1" /> Pentester</>
                            ) : (
                              <><Building className="w-3 h-3 mr-1" /> Stakeholder</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(userProfile.user.status)}>
                            {userProfile.user.status === 'active' && '✓ '}
                            {userProfile.user.status === 'freeze' && '❄️ '}
                            {userProfile.user.status === 'suspended' && '⛔ '}
                            {userProfile.user.status.charAt(0).toUpperCase() + userProfile.user.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {userProfile.user.role === 'pentester' ? (
                            <div className="text-sm">
                              <p className="font-medium text-gray-900">{userProfile.profile.specialization}</p>
                              <p className="text-xs text-muted-foreground">
                                {userProfile.profile.experience_years} {userProfile.profile.experience_years === 1 ? 'year' : 'years'} experience
                              </p>
                            </div>
                          ) : (
                            <div className="text-sm">
                              <p className="font-medium text-gray-900">{userProfile.profile.company}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {userProfile.profile.address}
                              </p>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {userProfile.user.last_login ? (
                            <div>
                              <p>{new Date(userProfile.user.last_login).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}</p>
                              <p className="text-xs">{new Date(userProfile.user.last_login).toLocaleTimeString()}</p>
                            </div>
                          ) : (
                            <span className="text-xs">Never logged in</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewUser(userProfile.user.id)}
                              title="View Details"
                              className="h-8 w-8 p-0 hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleUpdateStatus(userProfile.user.id, 'active')}
                              title="Set Active"
                              className="h-8 w-8 p-0 hover:bg-green-50"
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleUpdateStatus(userProfile.user.id, 'freeze')}
                              title="Freeze Account"
                              className="h-8 w-8 p-0 hover:bg-yellow-50"
                            >
                              <Snowflake className="w-4 h-4 text-yellow-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleUpdateStatus(userProfile.user.id, 'suspended')}
                              title="Suspend Account"
                              className="h-8 w-8 p-0 hover:bg-orange-50"
                            >
                              <Ban className="w-4 h-4 text-orange-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setUserToDelete({ id: userProfile.user.id, name: fullName });
                                setIsDeleteDialogOpen(true);
                              }}
                              title="Delete User"
                              className="h-8 w-8 p-0 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="font-semibold">{userToDelete?.name}</span> and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser} 
              className="!bg-red-600 hover:!bg-red-700 !text-white"
            >
              <Trash2 className="w-4 h-4 mr-2 !text-white" />
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
          {selectedUser && (() => {
            const initials = `${selectedUser.profile.first_name.charAt(0)}${selectedUser.profile.last_name.charAt(0)}`.toUpperCase();
            const fullName = `${selectedUser.profile.first_name} ${selectedUser.profile.last_name}`;
            const colors = [
              'from-blue-500 to-blue-600',
              'from-green-500 to-green-600',
              'from-purple-500 to-purple-600',
              'from-pink-500 to-pink-600',
              'from-orange-500 to-orange-600',
              'from-cyan-500 to-cyan-600',
              'from-indigo-500 to-indigo-600',
              'from-red-500 to-red-600',
              'from-yellow-500 to-yellow-600',
              'from-teal-500 to-teal-600'
            ];
            const colorIndex = selectedUser.profile.first_name.charCodeAt(0) % colors.length;
            const avatarColor = colors[colorIndex];
            
            return (
              <>
                {/* Header with Avatar and Background */}
                <div className="relative -m-6 mb-0 p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-b">
                  <div className="flex items-start gap-6">
                    <div 
                      className={`w-28 h-28 rounded-2xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white font-bold text-4xl flex-shrink-0 shadow-lg ring-4 ring-white`}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 pt-2">
                      <h2 className="text-3xl font-bold mb-2 text-gray-900">{fullName}</h2>
                      <div className="flex items-center gap-2 text-gray-600 mb-4">
                        <Mail className="w-4 h-4" />
                        <span className="text-base">{selectedUser.user.email}</span>
                      </div>
                      <div className="flex gap-3">
                        <Badge 
                          variant={selectedUser.user.role === 'pentester' ? 'default' : 'secondary'}
                          className="text-sm px-3 py-1"
                        >
                          {selectedUser.user.role === 'pentester' ? (
                            <><Shield className="w-4 h-4 mr-1" /> Pentester</>
                          ) : (
                            <><Building className="w-4 h-4 mr-1" /> Stakeholder</>
                          )}
                        </Badge>
                        <Badge className={`${getStatusColor(selectedUser.user.status)} px-3 py-1`}>
                          {selectedUser.user.status === 'active' && '✓ '}
                          {selectedUser.user.status === 'freeze' && '❄️ '}
                          {selectedUser.user.status === 'suspended' && '⛔ '}
                          {selectedUser.user.status.charAt(0).toUpperCase() + selectedUser.user.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-8 pt-6">
                  {/* Professional Information */}
                  <div>
                    <div className="flex items-center gap-2 mb-5">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Professional Information</h3>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="grid grid-cols-2 gap-6">
                        {selectedUser.user.role === 'pentester' ? (
                          <>
                            <div className="col-span-2">
                              <Label className="text-gray-500 text-sm font-medium mb-2 block">Specialization</Label>
                              <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-600" />
                                <p className="font-semibold text-lg text-gray-900">{selectedUser.profile.specialization}</p>
                              </div>
                            </div>
                            <div>
                              <Label className="text-gray-500 text-sm font-medium mb-2 block">Experience Level</Label>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-green-600" />
                                <p className="font-semibold text-lg text-gray-900">{selectedUser.profile.experience_years} years</p>
                              </div>
                            </div>
                            {selectedUser.profile.resume && (
                              <div className="col-span-2 pt-4 border-t border-gray-200">
                                <Label className="text-gray-500 text-sm font-medium mb-3 block flex items-center gap-2">
                                  <FileText className="w-4 h-4" />
                                  Resume Document
                                </Label>
                                <div className="flex gap-3">
                                  <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => window.open(selectedUser.profile.resume, '_blank')}
                                    className="flex-1 bg-white hover:bg-blue-50 border-2 hover:border-blue-300"
                                  >
                                    <ExternalLink className="w-5 h-5 mr-2" />
                                    View Resume
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = selectedUser.profile.resume!;
                                      link.download = `${fullName}_Resume`;
                                      link.click();
                                    }}
                                    className="bg-white hover:bg-green-50 border-2 hover:border-green-300"
                                  >
                                    <Download className="w-5 h-5" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="col-span-2">
                              <Label className="text-gray-500 text-sm font-medium mb-2 block">Company</Label>
                              <div className="flex items-center gap-2">
                                <Building className="w-5 h-5 text-blue-600" />
                                <p className="font-semibold text-lg text-gray-900">{selectedUser.profile.company}</p>
                              </div>
                            </div>
                            <div className="col-span-2">
                              <Label className="text-gray-500 text-sm font-medium mb-2 block flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                Business Address
                              </Label>
                              <p className="font-medium text-base text-gray-700 leading-relaxed">{selectedUser.profile.address}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div>
                    <div className="flex items-center gap-2 mb-5">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Account Information</h3>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <Label className="text-gray-500 text-sm font-medium mb-2 block">Last Login</Label>
                          <p className="font-semibold text-base text-gray-900">
                            {selectedUser.user.last_login ? (
                              <>
                                {new Date(selectedUser.user.last_login).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}
                                <span className="block text-sm text-gray-500 mt-1">
                                  {new Date(selectedUser.user.last_login).toLocaleTimeString()}
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-400">Never logged in</span>
                            )}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <Label className="text-gray-500 text-sm font-medium mb-2 block">Account Created</Label>
                          <p className="font-semibold text-base text-gray-900">
                            {new Date(selectedUser.user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}
                            <span className="block text-sm text-gray-500 mt-1">
                              {new Date(selectedUser.user.created_at).toLocaleTimeString()}
                            </span>
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <Label className="text-gray-500 text-sm font-medium mb-2 block">User ID</Label>
                          <p className="font-mono text-xs text-gray-600 break-all">{selectedUser.user.id}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <Label className="text-gray-500 text-sm font-medium mb-2 block">Profile ID</Label>
                          <p className="font-mono text-xs text-gray-600 break-all">{selectedUser.profile_id}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

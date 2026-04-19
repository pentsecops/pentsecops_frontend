import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import { UserPlus, Trash2, Users, Shield, Building, Search, Loader2 } from 'lucide-react';
import axiosInstance from '../../services/axiosConfig';
import { TokenStorage } from '../../services/tokenStorage';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: string;
  added_at: string;
}

interface UserProfile {
  user: {
    id: string;
    email: string;
    role: 'pentester' | 'stakeholder';
    status: string;
  };
  profile: {
    first_name: string;
    last_name: string;
    email: string;
    company?: string;
    specialization?: string;
    experience_years?: number;
  };
}

interface MemberWithProfile extends ProjectMember {
  profile?: UserProfile;
}

interface ProjectMembersProps {
  projectId: string;
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}

export const ProjectMembers: React.FC<ProjectMembersProps> = ({
  projectId,
  projectName,
  isOpen,
  onClose,
  embedded = false,
}) => {
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<MemberWithProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<'pentester' | 'stakeholder'>('pentester');

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
      fetchAllUsers();
    }
  }, [isOpen, projectId]);

  useEffect(() => {
    filterAvailableUsers();
  }, [allUsers, members, searchQuery]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const token = TokenStorage.getAccessToken();
      const response = await axiosInstance.get(
        `${API_BASE_URL}/v1/projects/${projectId}/members`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const membersData = response.data.data || [];
        // Fetch user profiles for each member
        const membersWithProfiles = await Promise.all(
          membersData.map(async (member: ProjectMember) => {
            try {
              const userResponse = await axiosInstance.get(
                `${API_BASE_URL}/v1/admin/user/${member.user_id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              return {
                ...member,
                profile: userResponse.data.success ? userResponse.data.data : null,
              };
            } catch (error) {
              return { ...member, profile: null };
            }
          })
        );
        setMembers(membersWithProfiles);
      }
    } catch (error: any) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load project members');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const token = TokenStorage.getAccessToken();
      const response = await axiosInstance.get(`${API_BASE_URL}/v1/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setAllUsers(response.data.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const filterAvailableUsers = () => {
    // Filter out users who are already members
    const memberUserIds = members.map((m) => m.user_id);
    let available = allUsers.filter((user) => !memberUserIds.includes(user.user.id));

    // Apply search filter
    if (searchQuery) {
      available = available.filter((user) => {
        const fullName = `${user.profile.first_name} ${user.profile.last_name}`.toLowerCase();
        const email = user.user.email.toLowerCase();
        const query = searchQuery.toLowerCase();
        return fullName.includes(query) || email.includes(query);
      });
    }

    setFilteredUsers(available);
  };

  const handleAddMember = async () => {
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }

    try {
      const token = TokenStorage.getAccessToken();
      const response = await axiosInstance.post(
        `${API_BASE_URL}/v1/projects/${projectId}/members`,
        {
          user_id: selectedUserId,
          role: selectedRole,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Member added successfully');
        setIsAddMemberOpen(false);
        setSelectedUserId('');
        setSearchQuery('');
        fetchMembers();
      }
    } catch (error: any) {
      console.error('Error adding member:', error);
      toast.error(error.response?.data?.error || 'Failed to add member');
    }
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;

    try {
      const token = TokenStorage.getAccessToken();
      await axiosInstance.delete(
        `${API_BASE_URL}/v1/projects/${projectId}/members/${memberToDelete.user_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Member removed successfully');
      setIsDeleteDialogOpen(false);
      setMemberToDelete(null);
      fetchMembers();
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast.error(error.response?.data?.error || 'Failed to remove member');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getAvatarColor = (name: string) => {
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
      'bg-teal-500',
    ];
    const colorIndex = name.charCodeAt(0) % colors.length;
    return colors[colorIndex];
  };

  const membersList = (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-medium">
            {members.length} {members.length === 1 ? 'Member' : 'Members'}
          </span>
        </div>
        <Button onClick={() => setIsAddMemberOpen(true)} size="sm">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
          <Users className="w-12 h-12 mb-2 opacity-20" />
          <p>No members added yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member) => {
            if (!member.profile) return null;

            const fullName = `${member.profile.profile.first_name} ${member.profile.profile.last_name}`;
            const initials = `${member.profile.profile.first_name.charAt(0)}${member.profile.profile.last_name.charAt(0)}`.toUpperCase();
            const avatarColor = getAvatarColor(member.profile.profile.first_name);

            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold flex-shrink-0`}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-base">{fullName}</p>
                      <Badge
                        variant={member.profile.user.role === 'pentester' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {member.profile.user.role === 'pentester' ? (
                          <>
                            <Shield className="w-3 h-3 mr-1" /> Pentester
                          </>
                        ) : (
                          <>
                            <Building className="w-3 h-3 mr-1" /> Stakeholder
                          </>
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {member.profile.user.email}
                    </p>
                    {member.profile.user.role === 'pentester' ? (
                      <p className="text-xs text-muted-foreground mt-1">
                        {member.profile.profile.specialization} •{' '}
                        {member.profile.profile.experience_years} years exp
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">
                        {member.profile.profile.company}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Added: {formatDate(member.added_at)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setMemberToDelete(member);
                    setIsDeleteDialogOpen(true);
                  }}
                  className="hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  if (embedded) {
    return (
      <div className="px-6">
        {membersList}

        {/* Add Member Dialog */}
        <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Member to Project</DialogTitle>
              <DialogDescription>Select a user to add to this project</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-2">
                <Label>Select User</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredUsers.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No available users found
                      </div>
                    ) : (
                      filteredUsers.map((user) => {
                        const fullName = `${user.profile.first_name} ${user.profile.last_name}`;
                        return (
                          <SelectItem key={user.user.id} value={user.user.id}>
                            <div className="flex items-center gap-2">
                              <span>{fullName}</span>
                              <span className="text-xs text-muted-foreground">
                                ({user.user.email})
                              </span>
                              <Badge
                                variant={user.user.role === 'pentester' ? 'default' : 'secondary'}
                                className="text-xs ml-2"
                              >
                                {user.user.role}
                              </Badge>
                            </div>
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Role in Project</Label>
                <Select
                  value={selectedRole}
                  onValueChange={(value: 'pentester' | 'stakeholder') => setSelectedRole(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pentester">Pentester</SelectItem>
                    <SelectItem value="stakeholder">Stakeholder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMember}>Add Member</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Member?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove{' '}
                <span className="font-semibold">
                  {memberToDelete?.profile &&
                    `${memberToDelete.profile.profile.first_name} ${memberToDelete.profile.profile.last_name}`}
                </span>{' '}
                from this project? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteMember}
                className="!bg-red-600 hover:!bg-red-700 !text-white"
              >
                <Trash2 className="w-4 h-4 mr-2 !text-white" />
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Project Members</DialogTitle>
            <DialogDescription>
              Manage members for <span className="font-semibold">{projectName}</span>
            </DialogDescription>
          </DialogHeader>

          {membersList}

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Member to Project</DialogTitle>
            <DialogDescription>Select a user to add to this project</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2">
              <Label>Select User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user" />
                </SelectTrigger>
                <SelectContent>
                  {filteredUsers.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No available users found
                    </div>
                  ) : (
                    filteredUsers.map((user) => {
                      const fullName = `${user.profile.first_name} ${user.profile.last_name}`;
                      return (
                        <SelectItem key={user.user.id} value={user.user.id}>
                          <div className="flex items-center gap-2">
                            <span>{fullName}</span>
                            <span className="text-xs text-muted-foreground">
                              ({user.user.email})
                            </span>
                            <Badge
                              variant={user.user.role === 'pentester' ? 'default' : 'secondary'}
                              className="text-xs ml-2"
                            >
                              {user.user.role}
                            </Badge>
                          </div>
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Role in Project</Label>
              <Select
                value={selectedRole}
                onValueChange={(value: 'pentester' | 'stakeholder') => setSelectedRole(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pentester">Pentester</SelectItem>
                  <SelectItem value="stakeholder">Stakeholder</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember}>Add Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{' '}
              <span className="font-semibold">
                {memberToDelete?.profile &&
                  `${memberToDelete.profile.profile.first_name} ${memberToDelete.profile.profile.last_name}`}
              </span>{' '}
              from this project? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMember}
              className="!bg-red-600 hover:!bg-red-700 !text-white"
            >
              <Trash2 className="w-4 h-4 mr-2 !text-white" />
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

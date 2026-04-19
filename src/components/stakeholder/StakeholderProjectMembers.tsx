import React, { useState, useEffect } from 'react';
import { Badge } from '../ui/badge';
import { Users, Shield, Building, Loader2 } from 'lucide-react';
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
  email?: string;
  first_name?: string;
  last_name?: string;
  user_role?: string;
}

interface StakeholderProjectMembersProps {
  projectId: string;
  projectName: string;
}

export const StakeholderProjectMembers: React.FC<StakeholderProjectMembersProps> = ({
  projectId,
  projectName,
}) => {
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const token = TokenStorage.getAccessToken();
      
      // Fetch project members
      const membersResponse = await axiosInstance.get(
        `${API_BASE_URL}/v1/projects/${projectId}/members`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (membersResponse.data.success) {
        const membersData = membersResponse.data.data || [];
        console.log('Members API response:', membersData);
        
        // Fetch all users from messages API
        const usersResponse = await axiosInstance.get(
          `${API_BASE_URL}/v1/messages/users`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (usersResponse.data.success) {
          const allUsers = usersResponse.data.data || [];
          console.log('Messages users API response:', allUsers);
          
          // Create a map of user_id to user data
          const userMap = new Map();
          allUsers.forEach((user: any) => {
            userMap.set(user.id, user);
          });
          
          // Map members with their user data
          const membersWithProfiles = membersData.map((member: ProjectMember) => {
            const userData = userMap.get(member.user_id);
            if (userData) {
              return {
                ...member,
                email: userData.email,
                first_name: userData.first_name,
                last_name: userData.last_name,
                user_role: userData.role,
              };
            }
            return member;
          });
          
          console.log('Members with profiles:', membersWithProfiles);
          setMembers(membersWithProfiles);
        } else {
          setMembers(membersData);
        }
      }
    } catch (error: any) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load project members');
    } finally {
      setLoading(false);
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

  return (
    <div className="px-6 space-y-4">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-muted-foreground" />
        <span className="text-sm font-medium">
          {members.length} {members.length === 1 ? 'Member' : 'Members'}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        </div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
          <Users className="w-12 h-12 mb-2 opacity-20" />
          <p>No members added yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member) => {
            if (!member.first_name || !member.last_name) {
              console.log('Missing user data for member:', member);
              return null;
            }

            const fullName = `${member.first_name} ${member.last_name}`;
            const initials = `${member.first_name.charAt(0)}${member.last_name.charAt(0)}`.toUpperCase();
            const avatarColor = getAvatarColor(member.first_name);

            return (
              <div
                key={member.id}
                className="flex items-center gap-4 p-4 border rounded-lg bg-muted/20"
              >
                <div
                  className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold flex-shrink-0`}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-base">{fullName}</p>
                    <Badge
                      variant={member.user_role === 'pentester' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {member.user_role === 'pentester' ? (
                        <>
                          <Shield className="w-3 h-3 mr-1" /> Pentester
                        </>
                      ) : (
                        <>
                          <Building className="w-3 h-3 mr-1" /> {member.user_role === 'stakeholder' ? 'Stakeholder' : member.user_role}
                        </>
                      )}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {member.email}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Role in Project: {member.role}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Added: {formatDate(member.added_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

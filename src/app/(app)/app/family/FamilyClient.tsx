'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardTitle } from '@/components/ui/Card';

interface FamilyGroup {
  id: string;
  name: string;
  created_by: string;
}

interface Member {
  id: string;
  user_id: string;
  full_name: string;
  completion: number;
}

interface Invite {
  id: string;
  email: string;
  expires_at: string;
}

interface FamilyClientProps {
  familyGroup: FamilyGroup | null;
  members: Member[];
  invites: Invite[];
  userId: string;
}

export function FamilyClient({
  familyGroup,
  members,
  invites,
  userId,
}: FamilyClientProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyName.trim()) return;
    setLoading(true);
    try {
      const { data: group, error: groupError } = await supabase
        .from('family_groups')
        .insert({ name: familyName.trim(), created_by: userId })
        .select('id')
        .single();
      if (groupError) throw groupError;
      if (group) {
        await supabase.from('family_members').insert({
          family_id: group.id,
          user_id: userId,
          role: 'admin',
        });
      }
      setShowCreate(false);
      setFamilyName('');
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !familyGroup) return;
    setLoading(true);
    try {
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      const { error } = await supabase.from('family_invites').insert({
        family_id: familyGroup.id,
        email: inviteEmail.trim(),
        token,
        expires_at: expiresAt.toISOString(),
      });
      if (error) throw error;
      setShowInvite(false);
      setInviteEmail('');
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveFamily = async () => {
    if (!familyGroup || !confirm('Leave this family group?')) return;
    setLoading(true);
    try {
      await supabase
        .from('family_members')
        .delete()
        .eq('family_id', familyGroup.id)
        .eq('user_id', userId);
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!familyGroup) {
    return (
      <div className="space-y-4">
        <p className="text-gray-600">Create or join a family group to stay accountable together.</p>
        {!showCreate ? (
          <button
            onClick={() => setShowCreate(true)}
            className="w-full py-4 bg-primary text-white rounded-card font-medium hover:bg-primary-600"
          >
            Create Family Group
          </button>
        ) : (
          <Card>
            <CardTitle>Create Family Group</CardTitle>
            <form onSubmit={handleCreateFamily} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Family Name
                </label>
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  required
                  placeholder="e.g. Smith Family"
                  className="w-full px-4 py-3 rounded-card border border-gray-300"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-primary text-white rounded-card font-medium disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-card font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>{familyGroup.name}</CardTitle>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setShowInvite(true)}
            className="py-2 px-4 bg-primary text-white rounded-card text-sm font-medium hover:bg-primary-600"
          >
            Invite
          </button>
          <button
            onClick={handleLeaveFamily}
            disabled={loading}
            className="py-2 px-4 border border-red-300 text-red-700 rounded-card text-sm font-medium hover:bg-red-50 disabled:opacity-50"
          >
            Leave
          </button>
        </div>
      </Card>

      {showInvite && (
        <Card>
          <CardTitle>Invite Member</CardTitle>
          <form onSubmit={handleInvite} className="space-y-4 mt-4">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              placeholder="Email address"
              className="w-full px-4 py-3 rounded-card border border-gray-300"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-primary text-white rounded-card font-medium disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Invite'}
              </button>
              <button
                type="button"
                onClick={() => setShowInvite(false)}
                className="flex-1 py-3 border border-gray-300 rounded-card font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <CardTitle>Members</CardTitle>
        <ul className="space-y-3 mt-2">
          {members.map((m) => (
            <li
              key={m.id}
              className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
            >
              <span className="font-medium">{m.full_name}</span>
              <span className="text-sm text-primary font-medium">
                {m.completion}% today
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {invites.length > 0 && (
        <Card>
          <CardTitle>Pending Invites</CardTitle>
          <ul className="space-y-2 mt-2">
            {invites.map((inv) => (
              <li key={inv.id} className="text-sm text-gray-600">
                {inv.email}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

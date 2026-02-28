import { Home, GraduationCap, type LucideIcon } from 'lucide-react';

export type GroupType = 'family' | 'class';

export interface GroupTerms {
  adminLabel: string;
  memberLabel: string;
  icon: LucideIcon;
  groupLabel: string;
  gradient: string;
  headerGradient: string;
  badgeVariant: 'default' | 'secondary' | 'outline';
  inviteTitle: (name: string) => string;
  inviteMessage: (name: string, code: string) => string;
}

const FAMILY_TERMS: GroupTerms = {
  adminLabel: 'Admin',
  memberLabel: 'Member',
  icon: Home,
  groupLabel: 'Family',
  gradient: 'from-emerald-500 to-emerald-600',
  headerGradient: 'from-emerald-500/20 to-emerald-600/10',
  badgeVariant: 'default',
  inviteTitle: (name) => `Join ${name} Family on Success Muslim!`,
  inviteMessage: (name, code) =>
    `Join my family group "${name}" on Success Muslim!\n\nInvite code: ${code}\n\nOr join directly: https://www.successmuslim.app/family/join/${code}`,
};

const CLASS_TERMS: GroupTerms = {
  adminLabel: 'Teacher',
  memberLabel: 'Student',
  icon: GraduationCap,
  groupLabel: 'Class',
  gradient: 'from-blue-500 to-blue-600',
  headerGradient: 'from-blue-500/20 to-blue-600/10',
  badgeVariant: 'secondary',
  inviteTitle: (name) => `Join ${name} Class on Success Muslim!`,
  inviteMessage: (name, code) =>
    `Join my class "${name}" on Success Muslim!\n\nInvite code: ${code}\n\nOr join directly: https://www.successmuslim.app/family/join/${code}`,
};

export function getGroupTerms(groupType?: string): GroupTerms {
  return groupType === 'class' ? CLASS_TERMS : FAMILY_TERMS;
}

export function getRoleLabel(role: string, groupType?: string): string {
  const terms = getGroupTerms(groupType);
  return role === 'admin' ? terms.adminLabel : terms.memberLabel;
}

import { currentUser } from '@clerk/nextjs/server';
import { MemberDashboardClient } from '@/components/dashboard/MemberDashboardClient';

export default async function DashboardPage() {
  const user = await currentUser();

  const userEmail    = user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress ?? '';
  const emailHandle  = userEmail.split('@')[0];
  const userName = user
    ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.username || emailHandle || 'there'
    : 'there';
  const userImageUrl = user?.hasImage ? user.imageUrl : '';
  const memberSince  = user
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <MemberDashboardClient
      userName={userName}
      userEmail={userEmail}
      userImageUrl={userImageUrl}
      memberSince={memberSince}
    />
  );
}

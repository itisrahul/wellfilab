import { currentUser } from '@clerk/nextjs/server';
import { MemberDashboardClient } from '@/components/dashboard/MemberDashboardClient';

export default async function DashboardPage() {
  const user = await currentUser();

  const userName = user
    ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.username || 'Member'
    : 'Member';
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress ?? '';

  return <MemberDashboardClient userName={userName} userEmail={userEmail} />;
}

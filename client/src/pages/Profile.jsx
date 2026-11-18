import { getMyStats } from '@/services/blog.service';
import { useFetch } from '@/hooks/useFetch';
import PageHeader from '@/components/common/PageHeader';
import ChangePasswordForm from '@/components/profile/ChangePasswordForm';
import DeleteAccountSection from '@/components/profile/DeleteAccountSection';
import ProfileForm from '@/components/profile/ProfileForm';

const Profile = () => {
  // Only used to tell the user how many blogs account deletion will remove
  const { data: stats } = useFetch((signal) => getMyStats({ signal }), []);

  return (
    <>
      <PageHeader
        title="Profile & settings"
        description="Manage your public profile and account security."
      />
      <div className="space-y-6">
        <ProfileForm />
        <ChangePasswordForm />
        <DeleteAccountSection blogCount={stats?.total ?? 0} />
      </div>
    </>
  );
};

export default Profile;

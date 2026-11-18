import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';
import { updateProfile } from '@/services/user.service';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import ImageUpload from '@/components/ui/ImageUpload';
import { Input, Textarea } from '@/components/ui/FormField';
import { applyServerErrors, getErrorMessage } from '@/utils/getErrorMessage';
import SettingsCard from './SettingsCard';

const ProfileForm = () => {
  const { user, setUser } = useAuth();
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ defaultValues: { name: user.name, bio: user.bio ?? '', avatar: null } });

  const bioLength = useWatch({ control, name: 'bio' })?.length ?? 0;

  const onSubmit = async (values) => {
    try {
      const updated = await updateProfile(values);
      setUser(updated);
      reset({ name: updated.name, bio: updated.bio ?? '', avatar: null });
      toast.success('Profile updated');
    } catch (error) {
      if (!applyServerErrors(error, setError, ['name', 'bio'])) toast.error(getErrorMessage(error));
    }
  };

  return (
    <SettingsCard
      icon="user"
      title="Profile"
      description="Your name, photo and bio appear on every blog you publish."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <Controller
          name="avatar"
          control={control}
          render={({ field }) => (
            <ImageUpload
              // Remount after save so the preview resets to the uploaded URL
              key={user.avatar?.url}
              label="Avatar"
              shape="round"
              maxDimension={800}
              currentUrl={user.avatar?.url}
              onChange={field.onChange}
              disabled={isSubmitting}
            />
          )}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Input
            id="name"
            label="Name"
            required
            autoComplete="name"
            error={errors.name?.message}
            {...register('name', {
              required: 'Name is required',
              validate: (v) =>
                (v.trim().length >= 2 && v.trim().length <= 50) ||
                'Name must be between 2 and 50 characters',
            })}
          />
          <Input
            id="email"
            label="Email"
            value={user.email}
            disabled
            hint="Email can't be changed."
            readOnly
          />
        </div>

        <Textarea
          id="bio"
          label="Bio"
          rows={4}
          maxLength={500}
          placeholder="A sentence or two about you. Shown under your blogs."
          hint={`${bioLength}/500`}
          error={errors.bio?.message}
          {...register('bio', {
            maxLength: { value: 500, message: 'Bio cannot exceed 500 characters' },
          })}
        />

        <div className="flex justify-end">
          <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
            Save profile
          </Button>
        </div>
      </form>
    </SettingsCard>
  );
};

export default ProfileForm;

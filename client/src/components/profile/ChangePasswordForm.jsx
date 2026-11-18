import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';
import { changePassword } from '@/services/auth.service';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/FormField';
import { applyServerErrors, getErrorMessage } from '@/utils/getErrorMessage';
import { cn } from '@/utils/format';
import SettingsCard from './SettingsCard';

const FIELDS = ['currentPassword', 'newPassword', 'confirmPassword'];
const EMPTY = { currentPassword: '', newPassword: '', confirmPassword: '' };

// Same rules the server enforces, shown as a live checklist
const RULES = [
  { label: '8–64 characters', test: (v) => v.length >= 8 && v.length <= 64 },
  { label: 'A lowercase letter', test: (v) => /[a-z]/.test(v) },
  { label: 'An uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'A number', test: (v) => /\d/.test(v) },
];

const ChangePasswordForm = () => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: EMPTY });

  const newPassword = useWatch({ control, name: 'newPassword' }) ?? '';

  const onSubmit = async (values) => {
    try {
      await changePassword(values);
      reset(EMPTY);
      toast.success('Password changed. You have been signed out on other devices.');
    } catch (error) {
      if (!applyServerErrors(error, setError, FIELDS)) toast.error(getErrorMessage(error));
    }
  };

  return (
    <SettingsCard
      id="password"
      icon="key"
      title="Change password"
      description="Changing your password signs you out everywhere except this device."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <Input
          id="currentPassword"
          type="password"
          label="Current password"
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          {...register('currentPassword', { required: 'Current password is required' })}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Input
            id="newPassword"
            type="password"
            label="New password"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            {...register('newPassword', {
              required: 'New password is required',
              validate: {
                rules: (v) =>
                  RULES.every((rule) => rule.test(v)) || 'Password does not meet the requirements',
                different: (v) =>
                  v !== getValues('currentPassword') ||
                  'New password must be different from your current password',
              },
            })}
          />
          <Input
            id="confirmPassword"
            type="password"
            label="Confirm new password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              validate: (v) => v === getValues('newPassword') || 'Passwords do not match',
            })}
          />
        </div>

        <ul
          className="grid grid-cols-1 gap-1.5 text-sm sm:grid-cols-2"
          aria-label="Password requirements"
        >
          {RULES.map((rule) => {
            const met = rule.test(newPassword);
            return (
              <li
                key={rule.label}
                className={cn('flex items-center gap-2', met ? 'text-green-700' : 'text-gray-500')}
              >
                <span
                  className={cn(
                    'flex size-4 items-center justify-center rounded-full text-[10px] font-bold',
                    met ? 'bg-green-100' : 'bg-gray-100'
                  )}
                  aria-hidden="true"
                >
                  {met ? '✓' : ''}
                </span>
                {rule.label}
                <span className="sr-only">{met ? '(met)' : '(not met)'}</span>
              </li>
            );
          })}
        </ul>

        <div className="flex justify-end">
          <Button type="submit" loading={isSubmitting}>
            Update password
          </Button>
        </div>
      </form>
    </SettingsCard>
  );
};

export default ChangePasswordForm;

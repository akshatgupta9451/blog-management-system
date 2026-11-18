import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { deleteAccount } from '@/services/user.service';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Input } from '@/components/ui/FormField';
import { applyServerErrors, getErrorMessage } from '@/utils/getErrorMessage';
import SettingsCard from './SettingsCard';

const DeleteAccountSection = ({ blogCount }) => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { password: '', confirm: false } });

  const close = () => {
    setOpen(false);
    reset();
  };

  const onSubmit = async ({ password }) => {
    try {
      await deleteAccount(password);
      // Leave the protected area first so the route guard doesn't bounce us to /login
      navigate(ROUTES.HOME, { replace: true });
      setUser(null);
      toast.success('Your account has been deleted. Sorry to see you go.');
    } catch (error) {
      if (!applyServerErrors(error, setError, ['password'])) {
        setError('root', { message: getErrorMessage(error) });
      }
    }
  };

  return (
    <SettingsCard
      id="danger-zone"
      icon="shield"
      title="Delete account"
      description="Permanently remove your account and everything you've written."
      danger
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          This deletes your profile
          {blogCount > 0 && (
            <>
              , <strong>{blogCount}</strong> blog{blogCount === 1 ? '' : 's'}
            </>
          )}{' '}
          and your activity history. It can&apos;t be undone.
        </p>
        <Button variant="danger" onClick={() => setOpen(true)} className="shrink-0">
          Delete account
        </Button>
      </div>

      <Modal
        open={open}
        onClose={close}
        title="Delete your account?"
        dismissible={!isSubmitting}
        footer={
          <>
            <Button variant="secondary" onClick={close} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="danger"
              type="submit"
              form="delete-account-form"
              loading={isSubmitting}
            >
              Delete my account
            </Button>
          </>
        }
      >
        <form
          id="delete-account-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
          <p>
            All of your blogs, images and activity will be permanently deleted. Enter your password
            to confirm.
          </p>
          {errors.root && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {errors.root.message}
            </p>
          )}
          <Input
            id="delete-password"
            type="password"
            label="Password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password', { required: 'Password is required' })}
          />
          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              className="mt-0.5 size-4 rounded border-gray-300 accent-red-600"
              {...register('confirm', { required: 'Please confirm you understand' })}
            />
            I understand this is permanent and can&apos;t be undone.
          </label>
          {errors.confirm && (
            <p role="alert" className="-mt-2 text-sm text-red-600">
              {errors.confirm.message}
            </p>
          )}
        </form>
      </Modal>
    </SettingsCard>
  );
};

export default DeleteAccountSection;

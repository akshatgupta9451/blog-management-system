import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/FormField';
import AuthCard from '@/components/layout/AuthCard';
import { applyServerErrors, getErrorMessage } from '@/utils/getErrorMessage';

const FIELDS = ['name', 'email', 'password', 'confirmPassword'];

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { name: '', email: '', password: '', confirmPassword: '' } });

  const onSubmit = async (values) => {
    try {
      const user = await registerUser(values);
      toast.success(`Welcome, ${user.name}! Your account is ready.`);
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (error) {
      if (!applyServerErrors(error, setError, FIELDS)) {
        setError('root', { message: getErrorMessage(error) });
      }
    }
  };

  return (
    <AuthCard
      title="Create your account"
      footer={
        <>
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="text-primary-600 font-medium hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {errors.root && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {errors.root.message}
          </p>
        )}
        <Input
          id="name"
          label="Name"
          autoComplete="name"
          autoFocus
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
          type="email"
          label="Email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
          })}
        />
        <Input
          id="password"
          type="password"
          label="Password"
          autoComplete="new-password"
          hint="At least 8 characters, with an uppercase letter, a lowercase letter and a number."
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Password must be at least 8 characters' },
            maxLength: { value: 64, message: 'Password must be at most 64 characters' },
            validate: {
              lower: (v) => /[a-z]/.test(v) || 'Password must contain a lowercase letter',
              upper: (v) => /[A-Z]/.test(v) || 'Password must contain an uppercase letter',
              digit: (v) => /\d/.test(v) || 'Password must contain a number',
            },
          })}
        />
        <Input
          id="confirmPassword"
          type="password"
          label="Confirm password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            validate: (v) => v === getValues('password') || 'Passwords do not match',
          })}
        />
        <Button type="submit" loading={isSubmitting} className="w-full">
          Create account
        </Button>
      </form>
    </AuthCard>
  );
};

export default Register;

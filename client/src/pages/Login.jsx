import { Link, useLocation, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/FormField';
import AuthCard from '@/components/layout/AuthCard';
import { applyServerErrors, getErrorMessage } from '@/utils/getErrorMessage';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '' } });

  const onSubmit = async (values) => {
    try {
      const user = await login(values);
      toast.success(`Welcome back, ${user.name}!`);
      // Return to the page that sent them here, if any
      const from = location.state?.from;
      navigate(from ? `${from.pathname}${from.search ?? ''}` : ROUTES.DASHBOARD, { replace: true });
    } catch (error) {
      if (!applyServerErrors(error, setError, ['email', 'password'])) {
        setError('root', { message: getErrorMessage(error) });
      }
    }
  };

  return (
    <AuthCard
      title="Log in to your account"
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to={ROUTES.REGISTER} className="text-primary-600 font-medium hover:underline">
            Sign up
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
          id="email"
          type="email"
          label="Email"
          autoComplete="email"
          autoFocus
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
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password', { required: 'Password is required' })}
        />
        <Button type="submit" loading={isSubmitting} className="w-full">
          Log in
        </Button>
      </form>
    </AuthCard>
  );
};

export default Login;

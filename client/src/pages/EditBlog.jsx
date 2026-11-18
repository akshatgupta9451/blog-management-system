import { useNavigate, useParams } from 'react-router';
import { toast } from 'react-toastify';
import { getBlogBySlug, updateBlog } from '@/services/blog.service';
import { useFetch } from '@/hooks/useFetch';
import { useAuth } from '@/hooks/useAuth';
import { ROLES, ROUTES, blogPath } from '@/constants';
import PageHeader from '@/components/common/PageHeader';
import BlogForm from '@/components/blog/BlogForm';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Loader from '@/components/ui/Loader';
import { getErrorStatus } from '@/utils/getErrorMessage';

const EditBlog = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    data: blog,
    loading,
    error,
    reload,
  } = useFetch((signal) => getBlogBySlug(slug, { signal }), [slug]);

  if (loading) return <Loader label="Loading blog…" />;

  if (error) {
    return getErrorStatus(error) === 404 ? (
      <EmptyState
        title="Blog not found"
        action={<Button to={ROUTES.DASHBOARD}>Back to dashboard</Button>}
      />
    ) : (
      <ErrorState error={error} title="Couldn't load this blog" onRetry={reload} />
    );
  }

  // The server enforces this too; checking here avoids showing a form that can't be saved
  if (blog.author?._id !== user._id && user.role !== ROLES.ADMIN) {
    return (
      <EmptyState
        tone="error"
        title="You can't edit this blog"
        message="Only its author or an admin can make changes."
        action={<Button to={blogPath(blog.slug)}>View blog</Button>}
      />
    );
  }

  const handleSubmit = async (values) => {
    const updated = await updateBlog(blog._id, values);
    toast.success('Blog updated');
    navigate(blogPath(updated.slug));
  };

  return (
    <>
      <PageHeader title="Edit blog" description={blog.title} />
      <BlogForm
        key={blog._id}
        blog={blog}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
        onCancel={() => navigate(-1)}
      />
    </>
  );
};

export default EditBlog;

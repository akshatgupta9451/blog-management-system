import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { createBlog } from '@/services/blog.service';
import { BLOG_STATUS, blogPath } from '@/constants';
import PageHeader from '@/components/common/PageHeader';
import BlogForm from '@/components/blog/BlogForm';

const CreateBlog = () => {
  const navigate = useNavigate();

  // Errors are thrown back to BlogForm, which maps them onto the fields
  const handleSubmit = async (values) => {
    const blog = await createBlog(values);
    toast.success(blog.status === BLOG_STATUS.PUBLISHED ? 'Blog published!' : 'Draft saved');
    navigate(blogPath(blog.slug));
  };

  return (
    <>
      <PageHeader
        title="Write a new blog"
        description="Save it as a draft or publish it right away."
      />
      <BlogForm onSubmit={handleSubmit} submitLabel="Create blog" onCancel={() => navigate(-1)} />
    </>
  );
};

export default CreateBlog;

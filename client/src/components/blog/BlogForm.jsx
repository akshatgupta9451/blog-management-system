import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';
import { BLOG_STATUS } from '@/constants';
import Button from '@/components/ui/Button';
import ImageUpload from '@/components/ui/ImageUpload';
import { FormField, Input, Select, Textarea } from '@/components/ui/FormField';
import RichTextEditor from './RichTextEditor';
import { applyServerErrors, getErrorMessage } from '@/utils/getErrorMessage';
import { htmlToText } from '@/utils/format';

const FIELDS = ['title', 'description', 'content', 'category', 'tags', 'status'];

const STATUS_OPTIONS = [
  { value: BLOG_STATUS.DRAFT, label: 'Draft — only you can see it' },
  { value: BLOG_STATUS.PUBLISHED, label: 'Published — visible to everyone' },
  { value: BLOG_STATUS.ARCHIVED, label: 'Archived — hidden from the feed' },
];

const toFormValues = (blog) => ({
  title: blog?.title ?? '',
  description: blog?.description ?? '',
  content: blog?.content ?? '',
  category: blog?.category ?? '',
  tags: blog?.tags?.join(', ') ?? '',
  status: blog?.status ?? BLOG_STATUS.DRAFT,
  coverImage: null,
  // Only meaningful when editing a blog that has a cover
  removeCover: false,
});

/**
 * Shared by Create Blog and Edit Blog. `onSubmit(values)` should call the API;
 * if it throws, server validation errors are mapped back onto the matching fields.
 * Client rules mirror the server's so most mistakes are caught before a round trip.
 */
const BlogForm = ({ blog, onSubmit, submitLabel, onCancel }) => {
  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: toFormValues(blog) });

  const descriptionLength = useWatch({ control, name: 'description' })?.length ?? 0;

  const submit = async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      const handled = applyServerErrors(error, setError, FIELDS);
      toast.error(handled ? 'Please fix the highlighted fields.' : getErrorMessage(error));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(submit)}
      noValidate
      className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]"
    >
      <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
        <Input
          id="title"
          label="Title"
          required
          placeholder="A clear, descriptive title"
          error={errors.title?.message}
          {...register('title', {
            required: 'Title is required',
            validate: (v) =>
              (v.trim().length >= 5 && v.trim().length <= 150) ||
              'Title must be between 5 and 150 characters',
          })}
        />

        <Textarea
          id="description"
          label="Description"
          required
          rows={3}
          maxLength={300}
          placeholder="A short summary shown on blog cards and in search results"
          error={errors.description?.message}
          hint={`${descriptionLength}/300`}
          {...register('description', {
            required: 'Description is required',
            validate: (v) =>
              (v.trim().length >= 10 && v.trim().length <= 300) ||
              'Description must be between 10 and 300 characters',
          })}
        />

        <FormField id="content" label="Content" required error={errors.content?.message}>
          <Controller
            name="content"
            control={control}
            rules={{
              validate: (html) =>
                htmlToText(html).length >= 20 ||
                'Content must contain at least 20 characters of text',
            }}
            render={({ field }) => (
              <RichTextEditor
                id="content"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.content}
                placeholder="Write your story…"
              />
            )}
          />
        </FormField>
      </div>

      <div className="space-y-5">
        <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-5">
          <Select
            id="status"
            label="Status"
            options={STATUS_OPTIONS}
            error={errors.status?.message}
            {...register('status')}
          />

          <Input
            id="category"
            label="Category"
            required
            placeholder="e.g. technology"
            error={errors.category?.message}
            {...register('category', {
              required: 'Category is required',
              validate: (v) =>
                (v.trim().length >= 2 && v.trim().length <= 50) ||
                'Category must be between 2 and 50 characters',
            })}
          />

          <Input
            id="tags"
            label="Tags"
            placeholder="react, javascript, tutorial"
            hint="Comma separated, up to 10."
            error={errors.tags?.message}
            {...register('tags', {
              validate: (v) =>
                v.split(',').filter((t) => t.trim()).length <= 10 || 'Use at most 10 tags',
            })}
          />

          <Controller
            name="coverImage"
            control={control}
            render={({ field }) => (
              <ImageUpload
                label="Cover image"
                currentUrl={blog?.coverImage?.url}
                onChange={(file) => {
                  field.onChange(file);
                  setValue('removeCover', false);
                }}
                // Picking a new file replaces the cover; Remove clears it on save
                onRemove={() => {
                  field.onChange(null);
                  setValue('removeCover', Boolean(blog?.coverImage?.url), { shouldDirty: true });
                }}
                disabled={isSubmitting}
              />
            )}
          />
        </div>

        <div className="flex gap-3">
          {onCancel && (
            <Button
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button type="submit" loading={isSubmitting} className="flex-1">
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default BlogForm;

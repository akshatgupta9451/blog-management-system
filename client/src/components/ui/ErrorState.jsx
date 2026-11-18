import EmptyState from './EmptyState';
import Button from './Button';
import { getErrorMessage } from '@/utils/getErrorMessage';

/** Shows an API error with an optional retry button. */
const ErrorState = ({ error, title = 'Something went wrong', onRetry }) => (
  <EmptyState
    tone="error"
    title={title}
    message={getErrorMessage(error)}
    action={
      onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )
    }
  />
);

export default ErrorState;

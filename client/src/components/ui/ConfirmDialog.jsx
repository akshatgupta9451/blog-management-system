import Modal from './Modal';
import Button from './Button';

/** Yes/no confirmation built on Modal. Can't be dismissed while `loading`. */
const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'danger',
  loading = false,
}) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    size="sm"
    dismissible={!loading}
    footer={
      <>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </>
    }
  >
    {message}
  </Modal>
);

export default ConfirmDialog;

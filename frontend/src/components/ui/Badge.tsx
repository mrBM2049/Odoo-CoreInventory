import type { OperationStatus } from '../../types/operations';

interface BadgeProps {
  status: OperationStatus;
}

export function Badge({ status }: BadgeProps) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}

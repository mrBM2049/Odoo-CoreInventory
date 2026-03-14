import type { OperationStatus } from '../../data/mockData';

interface BadgeProps {
  status: OperationStatus;
}

export function Badge({ status }: BadgeProps) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}

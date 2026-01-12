import styles from "./StatusBadge.module.css";

type BadgeVariant = "base" | "variant" | "success" | "warning" | "error";

interface StatusBadgeProps {
  readonly variant: BadgeVariant;
  readonly children: React.ReactNode;
}

export const StatusBadge = ({ variant, children }: StatusBadgeProps) => (
  <span className={`${styles.badge} ${styles[variant]}`}>{children}</span>
);

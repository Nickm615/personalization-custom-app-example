import { useCurrentItem } from "../../hooks/useCurrentItem";
import { StatusBadge } from "../StatusBadge/StatusBadge";
import styles from "./PersonalizationPanel.module.css";

interface PersonalizationPanelProps {
  readonly environmentId: string;
  readonly itemId: string;
  readonly languageId: string;
}

const LoadingState = () => (
  <div className={styles.loadingContainer}>
    <div className={styles.spinner} />
    <span className={styles.loadingText}>Loading item data...</span>
  </div>
);

interface ErrorStateProps {
  readonly message: string;
}

const ErrorState = ({ message }: ErrorStateProps) => (
  <div className={styles.errorContainer}>
    <svg
      className={styles.errorIcon}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
    <div className={styles.errorContent}>
      <p className={styles.errorTitle}>Error loading item</p>
      <p className={styles.errorMessage}>{message}</p>
    </div>
  </div>
);

const NoSnippetState = () => (
  <div className={styles.infoContainer}>
    <p className={styles.infoText}>
      This content type does not have the personalization snippet attached.
      The snippet should include variant_type, personalization_audience, and
      content_variants elements.
    </p>
  </div>
);

const VariantNotice = () => (
  <div className={styles.variantNotice}>
    <p className={styles.variantNoticeText}>
      This item is a personalization variant. To manage variants, please open
      the base content item.
    </p>
  </div>
);

export const PersonalizationPanel = ({
  environmentId,
  itemId,
  languageId,
}: PersonalizationPanelProps) => {
  const { data, loadingState, error } = useCurrentItem(
    environmentId,
    itemId,
    languageId
  );

  if (loadingState === "loading" || loadingState === "idle") {
    return (
      <div className={styles.container}>
        <LoadingState />
      </div>
    );
  }

  if (loadingState === "error" || error) {
    return (
      <div className={styles.container}>
        <ErrorState message={error ?? "Unknown error"} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.container}>
        <ErrorState message="No data available" />
      </div>
    );
  }

  if (!data.hasSnippet) {
    return (
      <div className={styles.container}>
        <NoSnippetState />
      </div>
    );
  }

  if (data.isVariant) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Personalization</h1>
        </div>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Current Item</span>
            <StatusBadge variant="variant">Variant</StatusBadge>
          </div>
          <p className={styles.itemName}>{data.item.name}</p>
          <p className={styles.itemType}>Type: {data.contentType.name}</p>
        </div>
        <div style={{ marginTop: "var(--spacing-xl)" }}>
          <VariantNotice />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Personalization</h1>
      </div>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Current Item</span>
          <StatusBadge variant="base">Base Content</StatusBadge>
        </div>
        <p className={styles.itemName}>{data.item.name}</p>
        <p className={styles.itemType}>Type: {data.contentType.name}</p>
      </div>
    </div>
  );
};

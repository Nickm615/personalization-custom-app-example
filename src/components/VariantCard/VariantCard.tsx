import { LanguageModels } from "@kontent-ai/management-sdk";
import type { VariantInfo } from "../../types/variant.types";
import { StatusBadge } from "../StatusBadge/StatusBadge";
import styles from "./VariantCard.module.css";

interface VariantCardProps {
  readonly variant: VariantInfo;
  readonly audienceName: string | null;
  readonly environmentId: string;
  readonly language: LanguageModels.LanguageModel | null;
}

const buildKontentLink = (
  environmentId: string,
  languageId: string,
  itemId: string
): string =>
  `https://app.kontent.ai/${environmentId}/content-inventory/${languageId}/content/${itemId}`;

export const VariantCard = ({
  variant,
  audienceName,
  environmentId,
  language,
}: VariantCardProps) => {
  const kontentLink =
    language
      ? buildKontentLink(environmentId, language.id, variant.id)
      : null;

  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <p className={styles.name}>{variant.name}</p>
        <div className={styles.badges}>
          {variant.isBaseContent ? (
            <StatusBadge variant="base">Base Content</StatusBadge>
          ) : audienceName ? (
            <StatusBadge variant="variant">{audienceName}</StatusBadge>
          ) : (
            <span className={styles.noAudience}>No audience</span>
          )}
        </div>
      </div>
      {kontentLink && (
        <a
          href={kontentLink}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          Open
        </a>
      )}
    </div>
  );
};

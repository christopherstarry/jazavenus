import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "#/lib/auth";
import { ReferenceDataPage, type RefColumn, type RefField } from "#/features/master-data/ReferenceDataPage";
import "#/features/master-data/masterDataI18n";

/** Order Code master — legacy Order Code reason lookup. See docs/modules/master-data/prds/order-and-return-codes.md. */
export function OrderCodePage() {
  const { t } = useTranslation(["masterData", "common"]);
  const { user } = useAuth();
  const canDelete = user?.isDeveloper || user?.roles.includes("SuperAdmin");

  const columns: RefColumn[] = useMemo(
    () => [
      { key: "code", label: t("common:code"), className: "font-mono w-[120px]" },
      { key: "name", label: t("common:name") },
      { key: "description", label: t("common:description") },
    ],
    [t],
  );

  const fields: RefField[] = useMemo(
    () => [
      { key: "code", label: t("common:code"), required: true, placeholder: t("masterData:orderCodes.codePlaceholder") },
      { key: "name", label: t("common:name"), required: true, placeholder: t("masterData:orderCodes.namePlaceholder") },
      { key: "description", label: t("common:description"), placeholder: t("masterData:orderCodes.descriptionPlaceholder") },
    ],
    [t],
  );

  return (
    <ReferenceDataPage
      title={t("masterData:orderCodes.title")}
      apiPath="settings/order-codes"
      columns={columns}
      fields={fields}
      canDelete={canDelete}
    />
  );
}

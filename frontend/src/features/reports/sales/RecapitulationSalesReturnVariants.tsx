import { useId, useState } from "react";
import { RecapitulationSalesReturnShell } from "#/features/reports/shared/RecapitulationSalesReturnShell";
import { CodeBrowseRow, legacyFormInputClass } from "#/features/reports/shared/legacySalesReportChrome";

export function RecapitulationSalesReturnByBrandPage() {
  const uid = useId();
  const [code, setCode] = useState("");
  const [desc, setDesc] = useState("");
  const [all, setAll] = useState(false);

  return (
    <RecapitulationSalesReturnShell
      filterSlot={
        <CodeBrowseRow
          label="Brand Code"
          inputId={`rsr-brand-${uid}`}
          value={code}
          onChange={setCode}
          description={desc}
          onDescriptionChange={setDesc}
          allChecked={all}
          onAllChange={setAll}
          showAll
        />
      }
    />
  );
}

export function RecapitulationSalesReturnByCustomerPage() {
  const uid = useId();
  const [code, setCode] = useState("");
  const [desc, setDesc] = useState("");
  const [all, setAll] = useState(false);

  return (
    <RecapitulationSalesReturnShell
      filterSlot={
        <CodeBrowseRow
          label="Customer Code"
          inputId={`rsr-cust-${uid}`}
          value={code}
          onChange={setCode}
          description={desc}
          onDescriptionChange={setDesc}
          allChecked={all}
          onAllChange={setAll}
          showAll
        />
      }
    />
  );
}

export function RecapitulationSalesReturnBySalesmanPage() {
  const uid = useId();
  const [code, setCode] = useState("");
  const [desc, setDesc] = useState("");
  const [all, setAll] = useState(false);

  return (
    <RecapitulationSalesReturnShell
      filterSlot={
        <CodeBrowseRow
          label="Salesman Code"
          inputId={`rsr-sales-${uid}`}
          value={code}
          onChange={setCode}
          description={desc}
          onDescriptionChange={setDesc}
          allChecked={all}
          onAllChange={setAll}
          showAll
        />
      }
    />
  );
}

export function RecapitulationSalesReturnByCustomerWithStatusPage() {
  const uid = useId();
  const [cust, setCust] = useState("");
  const [custDesc, setCustDesc] = useState("");
  const [custAll, setCustAll] = useState(false);

  const [docNo, setDocNo] = useState("");
  const [docDesc, setDocDesc] = useState("");
  const [docAll, setDocAll] = useState(false);

  const [status, setStatus] = useState("");
  const [statusAll, setStatusAll] = useState(false);

  return (
    <RecapitulationSalesReturnShell
      filterSlot={
        <div className="space-y-4">
          <CodeBrowseRow
            label="Customer Code"
            inputId={`rsr-cws-cust-${uid}`}
            value={cust}
            onChange={setCust}
            description={custDesc}
            onDescriptionChange={setCustDesc}
            allChecked={custAll}
            onAllChange={setCustAll}
            showAll
          />
          <CodeBrowseRow
            label="Document No."
            inputId={`rsr-cws-doc-${uid}`}
            value={docNo}
            onChange={setDocNo}
            description={docDesc}
            onDescriptionChange={setDocDesc}
            allChecked={docAll}
            onAllChange={setDocAll}
            showAll
          />
          <CodeBrowseRow
            label="Status"
            inputId={`rsr-cws-status-${uid}`}
            value={status}
            onChange={setStatus}
            description=""
            onDescriptionChange={() => {}}
            allChecked={statusAll}
            onAllChange={setStatusAll}
            showAll
            showDescription={false}
            codeInputClassName={legacyFormInputClass + " max-w-[12rem] font-mono tabular-nums"}
          />
        </div>
      }
    />
  );
}

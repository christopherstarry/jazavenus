import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeAll, describe, expect, it, vi } from "vitest";
import i18n from "#/i18n";
import { LookupDialog } from "./LookupDialog";

vi.mock("#/lib/api", () => ({
  api: {
    get: vi.fn(() => ({
      json: async () => ({ type: "customers", items: [], totalCount: 0 }),
    })),
  },
}));

beforeAll(() => {
  void i18n.changeLanguage("id");
});

function renderDialog() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <LookupDialog type="customers" open onOpenChange={() => {}} onSelect={() => {}} />
    </QueryClientProvider>,
  );
}

describe("LookupDialog i18n", () => {
  it("renders translated lookup labels, not raw lookup.* keys", async () => {
    renderDialog();
    expect(await screen.findByText("Cari Pelanggan")).toBeInTheDocument();
    expect(screen.getByText("Kolom")).toBeInTheDocument();
    expect(screen.getByText("Kode")).toBeInTheDocument();
    expect(screen.getByText("Nama")).toBeInTheDocument();
    expect(screen.queryByText(/lookup\./i)).not.toBeInTheDocument();
  });
});

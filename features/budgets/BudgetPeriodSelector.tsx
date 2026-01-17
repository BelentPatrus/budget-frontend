"use client";

import type { BudgetPeriod } from "./types";

export function BudgetPeriodSelector(props: {
  periods: BudgetPeriod[];
  selectedPeriodId: number | null;
  onChange: (id: number) => void;
}) {
  const { periods, selectedPeriodId, onChange } = props;

  const selectedPeriod = periods.find(
    (p) => p.id === selectedPeriodId
  );

  return (
    <div className="mb-4 flex flex-wrap gap-4 items-end">
      {/* Period dropdown */}
      <div>
        <label className="block text-xs text-gray-600 mb-1">
          Budget Period
        </label>
        <select
          className="rounded-xl border px-3 py-2 text-sm w-40"
          value={selectedPeriodId ?? ""}
          onChange={(e) => onChange(Number(e.target.value))}
        >
          {periods.map((p) => (
            <option key={p.id} value={p.id}>
              Period {p.id}
            </option>
          ))}
        </select>
      </div>

      {/* Start date */}
      <div>
        <label className="block text-xs text-gray-600 mb-1">
          Start date
        </label>
        <input
          type="date"
          className="rounded-xl border px-3 py-2 text-sm bg-gray-50"
          value={selectedPeriod?.startDate ?? ""}
          readOnly
        />
      </div>

      {/* End date */}
      <div>
        <label className="block text-xs text-gray-600 mb-1">
          End date
        </label>
        <input
          type="date"
          className="rounded-xl border px-3 py-2 text-sm bg-gray-50"
          value={selectedPeriod?.endDate ?? ""}
          readOnly
        />
      </div>
    </div>
  );
}

"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import type { VehicleFitment } from "@/lib/types";

function unique(values: Array<string | number | null>) {
  return Array.from(
    new Set(values.filter((value): value is string | number => value !== null))
  ).sort();
}

export function FitmentTable({ fitment }: { fitment: VehicleFitment[] }) {
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");

  const years = useMemo(() => unique(fitment.map((item) => item.year)), [fitment]);
  const makes = useMemo(() => unique(fitment.map((item) => item.make)), [fitment]);
  const models = useMemo(() => unique(fitment.map((item) => item.model)), [fitment]);

  const visibleFitment = fitment.filter((item) => {
    return (
      (year ? String(item.year) === year : true) &&
      (make ? item.make === make : true) &&
      (model ? item.model === model : true)
    );
  });

  return (
    <section className="surface overflow-hidden">
      <div className="border-b border-slate-200 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-shopred">
              <SlidersHorizontal aria-hidden className="h-4 w-4" />
              Does this fit my vehicle?
            </div>
            <h2 className="mt-2 text-2xl font-black text-ink">
              Verified fitment
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Match year, make, model, engine, trim, and notes before purchasing.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
            <label className="grid gap-1">
              <span className="label">Year</span>
              <select className="field" value={year} onChange={(event) => setYear(event.target.value)}>
                <option value="">Any year</option>
                {years.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="label">Make</span>
              <select className="field" value={make} onChange={(event) => setMake(event.target.value)}>
                <option value="">Any make</option>
                {makes.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="label">Model</span>
              <select className="field" value={model} onChange={(event) => setModel(event.target.value)}>
                <option value="">Any model</option>
                {models.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3 font-bold">Year</th>
              <th className="px-5 py-3 font-bold">Make</th>
              <th className="px-5 py-3 font-bold">Model</th>
              <th className="px-5 py-3 font-bold">Engine</th>
              <th className="px-5 py-3 font-bold">Trim</th>
              <th className="px-5 py-3 font-bold">Notes / exceptions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {visibleFitment.map((item) => (
              <tr key={item.id}>
                <td className="whitespace-nowrap px-5 py-4 font-semibold text-ink">
                  {item.year}
                </td>
                <td className="whitespace-nowrap px-5 py-4">{item.make}</td>
                <td className="whitespace-nowrap px-5 py-4">{item.model}</td>
                <td className="whitespace-nowrap px-5 py-4">{item.engine}</td>
                <td className="whitespace-nowrap px-5 py-4">
                  {item.trim ?? "All listed trims"}
                </td>
                <td className="min-w-[260px] px-5 py-4 text-slate-600">
                  {item.notes ?? "No exceptions listed."}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!visibleFitment.length ? (
        <div className="flex items-center gap-3 border-t border-slate-200 p-5 text-sm text-slate-600">
          <Search aria-hidden className="h-4 w-4" />
          No fitment rows match those filters.
        </div>
      ) : null}
    </section>
  );
}

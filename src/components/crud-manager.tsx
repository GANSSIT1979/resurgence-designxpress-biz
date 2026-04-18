"use client";

import { useEffect, useMemo, useState } from "react";
import { FormActions } from "./form-actions";
import { FormFieldShell } from "./form-field-shell";
import { FormSection } from "./form-section";
import { ImageUploadField } from "./image-upload-field";
import { SavedViewsBar } from "./saved-views-bar";
import { WorkflowBulkActions } from "./workflow-bulk-actions";
import { WorkflowFilters } from "./workflow-filters";
import { WorkflowRowActions } from "./workflow-row-actions";
import { WorkflowSummaryStrip } from "./workflow-summary-strip";
import { useServerSavedViews } from "@/hooks/use-server-saved-views";

type ColumnDef = {
  key?: string;
  accessorKey?: string;
  label?: string;
  header?: string;
  render?: (item: Record<string, unknown>) => React.ReactNode;
};

type FieldDef = {
  key?: string;
  name?: string;
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }> | string[];
  rows?: number;
  hint?: string;
};

type CrudManagerProps = {
  title?: string;
  subtitle?: string;
  endpoint?: string;
  apiEndpoint?: string;
  bulkEndpoint?: string;
  savedViewScope?: string;
  resourceName?: string;
  entityName?: string;
  columns?: ColumnDef[];
  tableColumns?: ColumnDef[];
  fields?: FieldDef[];
  formFields?: FieldDef[];
  initialValues?: Record<string, unknown>;
  defaultValues?: Record<string, unknown>;
  initialItems?: Record<string, unknown>[];
  emptyMessage?: string;
  statusField?: string;
  duplicateSanitizeKeys?: string[];
};

function fieldName(field: FieldDef) {
  return field.key || field.name || "";
}

function columnKey(column: ColumnDef) {
  return column.key || column.accessorKey || column.label || column.header || "column";
}

function columnLabel(column: ColumnDef) {
  return column.label || column.header || column.key || column.accessorKey || "Column";
}

function getTextValue(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

function normalizeItems(payload: any): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];
  if (Array.isArray(payload?.items)) return payload.items as Record<string, unknown>[];
  if (Array.isArray(payload?.data)) return payload.data as Record<string, unknown>[];
  if (Array.isArray(payload?.rows)) return payload.rows as Record<string, unknown>[];
  return [];
}

function readJsonSafe(text: string) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function inferBulkEndpoint(endpoint: string) {
  switch (endpoint) {
    case "/api/sponsor-applications":
      return "/api/bulk/sponsor-applications";
    case "/api/admin/inquiries":
      return "/api/bulk/admin-inquiries";
    case "/api/admin/gallery":
      return "/api/bulk/admin-gallery";
    case "/api/cashier/invoices":
      return "/api/bulk/cashier-invoices";
    case "/api/cashier/receipts":
      return "/api/bulk/cashier-receipts";
    default:
      return "";
  }
}

export function CrudManager(props: CrudManagerProps) {
  const title = props.title || props.resourceName || props.entityName || "Manager";
const subtitle =
  props.subtitle ||
  "Manage records, update content, and keep the dashboard data organized.";
const endpoint = props.endpoint || props.apiEndpoint || "";
const bulkEndpoint = props.bulkEndpoint || inferBulkEndpoint(endpoint);
const savedViewScope = props.savedViewScope || endpoint || title;
const columns = props.columns || props.tableColumns || [];
const fields = props.fields || props.formFields || [];
const baseValues = props.initialValues || props.defaultValues || {};
const emptyMessage = props.emptyMessage || "No records available yet.";
const statusField = props.statusField || "status";
const duplicateSanitizeKeys = props.duplicateSanitizeKeys || [
  "id",
  "createdAt",
  "updatedAt",
];

const hasEndpoint = Boolean(endpoint);
const hasInitialItems = props.initialItems !== undefined;

const [items, setItems] = useState<Record<string, unknown>[]>(props.initialItems || []);
const [form, setForm] = useState<Record<string, unknown>>(baseValues);
const [selectedId, setSelectedId] = useState<string>("");
const [selectedIds, setSelectedIds] = useState<string[]>([]);
const [search, setSearch] = useState("");
const [status, setStatus] = useState("");
const [loading, setLoading] = useState(hasEndpoint && !hasInitialItems);
const [saving, setSaving] = useState(false);
const [error, setError] = useState("");
const [done, setDone] = useState("");

const serverViews = useServerSavedViews(savedViewScope, { search, status });

  const normalizedColumns = useMemo(() => {
    if (columns.length) return columns;
    if (items.length) {
      return Object.keys(items[0]).slice(0, 6).map((key) => ({ key, label: key }));
    }
    return [];
  }, [columns, items]);

  const statusOptions = useMemo(() => {
    const fromFields = fields.find((field) => fieldName(field) === statusField)?.options;
    const values = new Set<string>();

    if (Array.isArray(fromFields)) {
      fromFields.forEach((option) => {
        if (typeof option === "string") values.add(option);
        else values.add(option.value);
      });
    }

    items.forEach((item) => {
      const value = item[statusField];
      if (typeof value === "string" && value.trim()) values.add(value);
    });

    return Array.from(values).sort();
  }, [fields, items, statusField]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const searchable = Object.values(item).map(getTextValue).join(" ").toLowerCase();
      const matchesSearch = !search || searchable.includes(search.toLowerCase());
      const matchesStatus =
        !status || String(item[statusField] ?? "").toLowerCase() === status.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [items, search, status, statusField]);

  function resetForm() {
    setSelectedId("");
    setForm(baseValues);
  }

  async function loadItems() {
    if (!hasEndpoint) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(endpoint, { cache: "no-store" });
      const text = await res.text();
      const json = readJsonSafe(text);

      if (!res.ok) {
        setError(json?.error || "Unable to load records.");
        setItems([]);
        return;
      }

      setItems(normalizeItems(json));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load records.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  if (hasInitialItems) {
    setItems(props.initialItems || []);
    setLoading(false);
    return;
  }

  loadItems();
}, [endpoint, hasInitialItems, props.initialItems]);

  useEffect(() => {
    setSelectedIds((current) =>
      current.filter((id) => filteredItems.some((item) => String(item.id ?? "") === id))
    );
  }, [filteredItems]);

  function selectItem(item: Record<string, unknown>) {
    setSelectedId(String(item.id ?? ""));
    setForm(item);
    setDone("");
    setError("");
  }

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!hasEndpoint) return;

    setSaving(true);
    setError("");
    setDone("");

    try {
      const isEditing = Boolean(selectedId);
      const target = isEditing ? `${endpoint}/${selectedId}` : endpoint;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(target, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const text = await res.text();
      const json = readJsonSafe(text);

      if (!res.ok) {
        setError(json?.error || "Unable to save record.");
        return;
      }

      setDone(isEditing ? "Record updated successfully." : "Record created successfully.");
      resetForm();
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save record.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(id: string) {
    if (!hasEndpoint || !id) return;
    const confirmed = window.confirm("Delete this record?");
    if (!confirmed) return;

    setError("");
    setDone("");

    try {
      const res = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
      const text = await res.text();
      const json = readJsonSafe(text);

      if (!res.ok) {
        setError(json?.error || "Unable to delete record.");
        return;
      }

      setDone("Record deleted successfully.");
      if (selectedId === id) resetForm();
      setSelectedIds((current) => current.filter((item) => item !== id));
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete record.");
    }
  }

  async function duplicateItem(item: Record<string, unknown>) {
    const clone: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(item)) {
      if (!duplicateSanitizeKeys.includes(key)) {
        clone[key] = value;
      }
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clone),
      });

      const text = await res.text();
      const json = readJsonSafe(text);

      if (!res.ok) {
        setError(json?.error || "Unable to duplicate record.");
        return;
      }

      setDone("Record duplicated successfully.");
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to duplicate record.");
    }
  }

  async function changeStatus(id: string, nextStatus: string) {
    try {
      const res = await fetch(`${endpoint}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [statusField]: nextStatus }),
      });

      const text = await res.text();
      const json = readJsonSafe(text);

      if (!res.ok) {
        setError(json?.error || "Unable to update status.");
        return;
      }

      setDone(`Status updated to ${nextStatus}.`);
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update status.");
    }
  }

  async function bulkDelete() {
    if (!selectedIds.length) return;
    const confirmed = window.confirm(`Delete ${selectedIds.length} selected record(s)?`);
    if (!confirmed) return;

    setError("");
    setDone("");

    try {
      if (bulkEndpoint) {
        const res = await fetch(bulkEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "delete",
            ids: selectedIds,
          }),
        });

        const text = await res.text();
        const json = readJsonSafe(text);

        if (!res.ok) {
          setError(json?.error || "Unable to complete bulk delete.");
          return;
        }
      } else {
        for (const id of selectedIds) {
          await fetch(`${endpoint}/${id}`, { method: "DELETE" });
        }
      }

      setDone(`${selectedIds.length} record(s) deleted successfully.`);
      setSelectedIds([]);
      resetForm();
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to complete bulk delete.");
    }
  }

  async function bulkStatusChange(nextStatus: string) {
    if (!selectedIds.length || !bulkEndpoint) return;

    setError("");
    setDone("");

    try {
      const res = await fetch(bulkEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "status",
          value: nextStatus,
          ids: selectedIds,
        }),
      });

      const text = await res.text();
      const json = readJsonSafe(text);

      if (!res.ok) {
        setError(json?.error || "Unable to update selected rows.");
        return;
      }

      setDone(`Updated ${selectedIds.length} record(s) to ${nextStatus}.`);
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update selected rows.");
    }
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  function renderField(field: FieldDef) {
    const name = fieldName(field);
    const label = field.label || name || "Field";
    const type = field.type || "text";
    const value = form[name];
    const stringValue = getTextValue(value);

    if (type === "image") {
      return (
        <ImageUploadField
          key={name}
          label={label}
          value={stringValue}
          hint={field.hint}
          required={field.required}
          name={name}
          onChange={(nextValue) => setForm((current) => ({ ...current, [name]: nextValue }))}
        />
      );
    }

    if (type === "textarea") {
      return (
        <FormFieldShell key={name} label={label} htmlFor={name} hint={field.hint} required={field.required}>
          <textarea
            id={name}
            rows={field.rows || 5}
            placeholder={field.placeholder || ""}
            value={stringValue}
            onChange={(e) => setForm((current) => ({ ...current, [name]: e.target.value }))}
            required={field.required}
          />
        </FormFieldShell>
      );
    }

    if (type === "select") {
      const options = Array.isArray(field.options) ? field.options : [];
      return (
        <FormFieldShell key={name} label={label} htmlFor={name} hint={field.hint} required={field.required}>
          <select
            id={name}
            value={stringValue}
            onChange={(e) => setForm((current) => ({ ...current, [name]: e.target.value }))}
            required={field.required}
          >
            <option value="">Select {label}</option>
            {options.map((option) => {
              const normalized =
                typeof option === "string" ? { label: option, value: option } : option;
              return (
                <option key={normalized.value} value={normalized.value}>
                  {normalized.label}
                </option>
              );
            })}
          </select>
        </FormFieldShell>
      );
    }

    return (
      <FormFieldShell key={name} label={label} htmlFor={name} hint={field.hint} required={field.required}>
        <input
          id={name}
          type={type === "number" ? "number" : type}
          placeholder={field.placeholder || ""}
          value={stringValue}
          onChange={(e) =>
            setForm((current) => ({
              ...current,
              [name]: type === "number" ? Number(e.target.value || 0) : e.target.value,
            }))
          }
          required={field.required}
        />
      </FormFieldShell>
    );
  }

  return (
    <div className="dashboard-content-stack">
      <WorkflowSummaryStrip
        items={[
          { label: "Total Records", value: items.length },
          { label: "Filtered", value: filteredItems.length, tone: "warning" },
          { label: "Selected", value: selectedIds.length, tone: "success" },
        ]}
      />

      <WorkflowFilters
        searchValue={search}
        onSearchChange={setSearch}
        statusValue={status}
        onStatusChange={setStatus}
        statusOptions={statusOptions}
      />

      <SavedViewsBar
        views={serverViews.views}
        loading={serverViews.loading}
        onApply={(state) => {
          setSearch(state.search || "");
          setStatus(state.status || "");
        }}
        onSave={serverViews.createView}
        onDelete={serverViews.deleteView}
        onReplace={serverViews.replaceView}
      />

      <WorkflowBulkActions
        selectedCount={selectedIds.length}
        totalCount={filteredItems.length}
        statusOptions={statusOptions}
        onSelectAll={() => setSelectedIds(filteredItems.map((item) => String(item.id ?? "")))}
        onClearSelection={() => setSelectedIds([])}
        onBulkDelete={bulkDelete}
        onBulkStatusChange={bulkEndpoint ? bulkStatusChange : undefined}
      />

      <section className="crud-layout">
        <FormSection
          eyebrow="Form Workspace"
          title={selectedId ? "Edit Record" : "Create Record"}
          subtitle="Use the structured form fields below to keep content complete and consistent."
        >
          {error ? <div className="field-error">{error}</div> : null}
          {done ? <div className="success-text">{done}</div> : null}

          {fields.length ? (
            <form className="crud-form" onSubmit={save}>
              <div className="form-grid">{fields.map(renderField)}</div>

              <FormActions align="between">
                <button type="button" className="button button-secondary button-small" onClick={resetForm}>
                  Reset
                </button>

                <button className="button" type="submit" disabled={saving || !hasEndpoint}>
                  {saving ? "Saving..." : selectedId ? "Update Record" : "Create Record"}
                </button>
              </FormActions>
            </form>
          ) : (
            <div className="empty-state">No form fields are configured for this module yet.</div>
          )}
        </FormSection>

        <FormSection
          eyebrow="Records Table"
          title="Existing Records"
          subtitle="Review, search, filter, select, and operate on records while keeping the module history visible."
        >
          <div className="dashboard-toolbar">
            <div className="dashboard-chip">API: {hasEndpoint ? endpoint : "Not configured"}</div>
            <button
              type="button"
              className="button button-secondary button-small"
              onClick={loadItems}
              disabled={loading || !hasEndpoint}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {!hasEndpoint ? (
            <div className="empty-state">No API endpoint is configured for this manager.</div>
          ) : loading ? (
            <div className="empty-state">Loading records...</div>
          ) : !filteredItems.length ? (
            <div className="empty-state">{emptyMessage}</div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: 48 }}>
                      <input
                        type="checkbox"
                        checked={filteredItems.length > 0 && selectedIds.length === filteredItems.length}
                        onChange={(e) =>
                          e.target.checked
                            ? setSelectedIds(filteredItems.map((item) => String(item.id ?? "")))
                            : setSelectedIds([])
                        }
                      />
                    </th>
                    {normalizedColumns.map((column) => (
                      <th key={columnKey(column)}>{columnLabel(column)}</th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item, index) => {
                    const rowId = String(item.id ?? index);

                    return (
                      <tr key={rowId}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(rowId)}
                            onChange={() => toggleSelected(rowId)}
                          />
                        </td>
                        {normalizedColumns.map((column) => {
                          if (typeof column.render === "function") {
                            return <td key={columnKey(column)}>{column.render(item)}</td>;
                          }

                          const value = item[column.key || column.accessorKey || ""];
                          return <td key={columnKey(column)}>{getTextValue(value) || "—"}</td>;
                        })}
                        <td>
                          <WorkflowRowActions
                            rowLabel={title}
                            rowData={item}
                            statusOptions={statusOptions}
                            onEdit={() => selectItem(item)}
                            onDelete={() => deleteItem(rowId)}
                            onDuplicate={() => duplicateItem(item)}
                            onStatusChange={statusOptions.length ? (next) => changeStatus(rowId, next) : undefined}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </FormSection>
      </section>
    </div>
  );
}

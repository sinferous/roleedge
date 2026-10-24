type Result<T> = { ok: true; data: T } | { ok: false; status: number; fields: Record<string, string> };

/** POST JSON to one of our API routes and normalise the error shape from docs/API.md. */
export async function postJson<T = unknown>(url: string, body: unknown): Promise<Result<T>> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok || res.status === 409) return { ok: true, data: json as T };
    const err = json?.error ?? {};
    const fields: Record<string, string> = { ...(err.fields ?? {}) };
    if (!Object.keys(fields).length || err.code !== "validation_failed") {
      fields.form = err.message ?? "Something went wrong. Please try again, or email info@roleedge.com.";
    }
    return { ok: false, status: res.status, fields };
  } catch {
    return { ok: false, status: 0, fields: { form: "You seem to be offline. Check your connection and try again." } };
  }
}

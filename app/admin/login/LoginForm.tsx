"use client";

import { useActionState } from "react";
import { login, type LoginState } from "../actions";
import { TextField } from "@/components/forms/fields";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="form-stack">
      <TextField label="Email" name="email" type="email" autoComplete="username" required defaultValue={state.email} />
      <TextField label="Password" name="password" type="password" autoComplete="current-password" required />
      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      <button type="submit" className="button button-dark" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

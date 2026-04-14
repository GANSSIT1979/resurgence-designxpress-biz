"use client";

export function LogoutForm() {
  return (
    <form
      action="/api/auth/logout"
      method="post"
      style={{ display: "inline-flex" }}
    >
      <button className="button button-small" type="submit">
        Logout
      </button>
    </form>
  );
}

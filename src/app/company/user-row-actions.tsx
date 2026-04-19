"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { UserRole } from "@/lib/auth/session";
import {
  deactivateUserAction,
  deleteInvitationAction,
  deleteUserAction,
  updateRoleAction,
} from "./actions";

export function RoleSelect({
  userId,
  role,
}: {
  userId: string;
  role: UserRole;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form action={updateRoleAction} ref={formRef}>
      <input name="userId" type="hidden" value={userId} />
      <select
        className="cursor-pointer rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm outline-none transition hover:border-zinc-950 hover:bg-zinc-50 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
        defaultValue={role}
        name="role"
        onChange={() => formRef.current?.requestSubmit()}
      >
        <option value="contributor">Contributor</option>
        <option value="admin">Admin</option>
      </select>
    </form>
  );
}

function DeactivateUserForm({
  userId,
  username,
}: {
  userId: string;
  username: string;
}) {
  return (
    <form action={deactivateUserAction}>
      <input name="userId" type="hidden" value={userId} />
      <button
        className="w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm font-medium text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2"
        onClick={(event) => {
          if (!window.confirm(`Deactivate @${username}?`)) {
            event.preventDefault();
          }
        }}
        type="submit"
      >
        Deactivate
      </button>
    </form>
  );
}

function DeleteUserForm({
  userId,
  username,
}: {
  userId: string;
  username: string;
}) {
  return (
    <form action={deleteUserAction}>
      <input name="userId" type="hidden" value={userId} />
      <button
        className="w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm font-medium text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2"
        onClick={(event) => {
          if (
            !window.confirm(
              `Permanently delete @${username}? This removes their login account and cannot be undone.`,
            )
          ) {
            event.preventDefault();
          }
        }}
        type="submit"
      >
        Delete
      </button>
    </form>
  );
}

function DeleteInvitationForm({
  invitationId,
  username,
}: {
  invitationId: string;
  username: string;
}) {
  return (
    <form action={deleteInvitationAction}>
      <input name="invitationId" type="hidden" value={invitationId} />
      <button
        className="w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm font-medium text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2"
        onClick={(event) => {
          if (!window.confirm(`Delete the registration link for @${username}?`)) {
            event.preventDefault();
          }
        }}
        type="submit"
      >
        Delete invite
      </button>
    </form>
  );
}

type UserActionsMenuProps =
  | {
      type: "active";
      userId: string;
      username: string;
      isCurrentUser: boolean;
    }
  | {
      type: "invited";
      invitationId: string;
      username: string;
      registrationUrl: string;
    };

export function UserActionsMenu(props: UserActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    right: number;
  } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  async function copyRegistrationUrl() {
    if (props.type !== "invited") {
      return;
    }

    await navigator.clipboard.writeText(props.registrationUrl);
    setCopied(true);
  }

  function toggleMenu() {
    const rect = buttonRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    setMenuPosition({
      top: rect.bottom + 6,
      right: window.innerWidth - rect.right,
    });
    setOpen((value) => !value);
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    function closeOnOutsideClick(event: MouseEvent) {
      const target = event.target as Node;

      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    function closeMenu() {
      setOpen(false);
    }

    window.addEventListener("mousedown", closeOnOutsideClick);
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeMenu);
    window.addEventListener("scroll", closeMenu, true);

    return () => {
      window.removeEventListener("mousedown", closeOnOutsideClick);
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
    };
  }, [open]);

  const menu =
    open && menuPosition
      ? createPortal(
          <div
            className="fixed z-50 w-52 rounded-md border border-zinc-200 bg-white p-1 text-left shadow-lg"
            ref={menuRef}
            style={{
              right: menuPosition.right,
              top: menuPosition.top,
            }}
          >
            {props.type === "invited" ? (
              <>
                <button
                  className="w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
                  onClick={copyRegistrationUrl}
                  type="button"
                >
                  {copied ? "Copied link" : "Copy invite link"}
                </button>
                <DeleteInvitationForm
                  invitationId={props.invitationId}
                  username={props.username}
                />
              </>
            ) : props.isCurrentUser ? (
              <p className="px-3 py-2 text-sm text-zinc-500">
                You cannot remove your own user.
              </p>
            ) : (
              <>
                <DeactivateUserForm
                  userId={props.userId}
                  username={props.username}
                />
                <DeleteUserForm
                  userId={props.userId}
                  username={props.username}
                />
              </>
            )}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        aria-expanded={open}
        aria-label={`Actions for @${props.username}`}
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center gap-0.5 rounded-md border border-zinc-300 bg-white text-zinc-700 transition hover:border-zinc-950 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
        onClick={toggleMenu}
        ref={buttonRef}
        type="button"
      >
        <span aria-hidden="true" className="h-1 w-1 rounded-full bg-current" />
        <span aria-hidden="true" className="h-1 w-1 rounded-full bg-current" />
        <span aria-hidden="true" className="h-1 w-1 rounded-full bg-current" />
      </button>
      {menu}
    </>
  );
}

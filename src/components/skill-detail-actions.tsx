"use client";

import { useMemo, useState } from "react";
import { ArtifactFileDialog } from "@/components/skill-file-dialog";

type SkillDetailActionsProps = {
  downloadFilename: string;
  previewFilename: string;
  markdown: string;
  fileLabel?: string;
  externalUrl?: string;
  externalLabel?: string;
};

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);

  if (!copied) {
    throw new Error("Unable to copy link.");
  }
}

export function SkillDetailActions({
  downloadFilename,
  previewFilename,
  markdown,
  fileLabel = "Read artifact file",
  externalUrl,
  externalLabel,
}: SkillDetailActionsProps) {
  const [message, setMessage] = useState("");
  const downloadHref = useMemo(
    () => `data:text/markdown;charset=utf-8,${encodeURIComponent(markdown)}`,
    [markdown],
  );

  async function shareSkill() {
    try {
      await copyText(window.location.href);
      setMessage("Artifact link copied.");
    } catch {
      setMessage("Could not copy the link.");
    }
  }

  return (
    <div className="mt-5 grid gap-3">
      <a
        className="cursor-pointer rounded-md bg-zinc-950 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 active:bg-zinc-800"
        download={downloadFilename}
        href={downloadHref}
        onClick={() => setMessage("Downloaded markdown file.")}
      >
        Download markdown
      </a>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <ArtifactFileDialog
          actionLabel={fileLabel}
          filename={previewFilename}
          markdown={markdown}
        />
        {externalUrl ? (
          <a
            className="cursor-pointer rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-zinc-800 transition hover:border-zinc-950 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 active:bg-zinc-200"
            href={externalUrl}
            rel="noreferrer"
            target="_blank"
          >
            Open {externalLabel || "external source"}
          </a>
        ) : null}
        <button
          className="cursor-pointer rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-zinc-800 transition hover:border-zinc-950 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 active:bg-zinc-200"
          onClick={shareSkill}
          type="button"
        >
          Share
        </button>
      </div>
      {message ? (
        <p aria-live="polite" className="text-sm text-zinc-600">
          {message}
        </p>
      ) : null}
    </div>
  );
}

export const ArtifactDetailActions = SkillDetailActions;

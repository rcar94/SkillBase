"use client";

import { useEffect, useState } from "react";

type SkillFileDialogProps = {
  filename: string;
  markdown: string;
};

export function SkillFileDialog({ filename, markdown }: SkillFileDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        className="cursor-pointer rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-zinc-800 transition hover:border-zinc-950 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 active:bg-zinc-200"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        Read skill file
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/55 px-4 py-6">
          <section
            aria-labelledby="skill-file-title"
            aria-modal="true"
            className="flex max-h-full w-full max-w-4xl flex-col rounded-lg border border-zinc-200 bg-white shadow-xl"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-5 py-4">
              <div>
                <h2
                  className="text-xl font-semibold text-zinc-950"
                  id="skill-file-title"
                >
                  Skill file
                </h2>
                <p className="mt-1 font-mono text-sm text-zinc-500">
                  {filename}
                </p>
              </div>
              <button
                className="cursor-pointer rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-950 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 active:bg-zinc-200"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                Close
              </button>
            </div>
            <div className="overflow-auto p-5">
              <pre className="whitespace-pre-wrap rounded-md border border-zinc-200 bg-zinc-950 p-4 font-mono text-sm leading-6 text-zinc-50">
                {markdown}
              </pre>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

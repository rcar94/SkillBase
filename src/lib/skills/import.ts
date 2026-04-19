import matter from "gray-matter";
import JSZip from "jszip";
import { slugify } from "./mappers";

export const MAX_SKILL_FILE_BYTES = 256 * 1024;

export type ParsedSkillImport = {
  slug: string;
  title: string;
  summary: string;
  audience: string;
  useWhen: string;
  produces: string;
  instructions: string;
  examples: string[];
  version: string;
  sourceMarkdown: string;
  warnings: string[];
};

const ACCEPTED_TEXT_EXTENSIONS = [".md", ".markdown", ".txt", ".skill"];

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeHeading(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function extractTitle(content: string) {
  const match = content.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() ?? "";
}

function contentAfterTitle(content: string) {
  const match = content.match(/^#\s+.+$/m);

  if (!match || match.index === undefined) {
    return content.trim();
  }

  return content.slice(match.index + match[0].length).trim();
}

function extractSections(content: string) {
  const sections = new Map<string, string>();
  const headingPattern = /^##\s+(.+)$/gm;
  const headings = Array.from(content.matchAll(headingPattern));

  headings.forEach((heading, index) => {
    const title = normalizeHeading(heading[1] ?? "");
    const start = (heading.index ?? 0) + heading[0].length;
    const next = headings[index + 1];
    const end = next?.index ?? content.length;
    const body = content.slice(start, end).trim();

    if (title) {
      sections.set(title, body);
    }
  });

  return sections;
}

function sectionValue(sections: Map<string, string>, names: string[]) {
  for (const name of names) {
    const value = sections.get(normalizeHeading(name));

    if (value) {
      return value.trim();
    }
  }

  return "";
}

function parseExamples(value: string) {
  if (!value.trim()) {
    return [];
  }

  return value
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-*]\s+/, "").trim())
    .filter(Boolean);
}

function firstParagraph(value: string) {
  return (
    value
      .split(/\n\s*\n/)
      .map((part) => part.trim())
      .find((part) => part && !part.startsWith("#")) ?? ""
  );
}

function extensionFor(filename: string) {
  const normalized = filename.toLowerCase();
  const index = normalized.lastIndexOf(".");

  return index === -1 ? "" : normalized.slice(index);
}

function isZipPackage(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer.slice(0, 4));
  return bytes[0] === 0x50 && bytes[1] === 0x4b;
}

function decodeText(buffer: ArrayBuffer) {
  return new TextDecoder("utf-8", { fatal: false }).decode(buffer);
}

function findPackagedSkillFile(zip: JSZip) {
  const files = Object.values(zip.files).filter((file) => !file.dir);
  const exact = files.find((file) => file.name.toLowerCase() === "skill.md");

  if (exact) {
    return exact;
  }

  const nested = files.filter((file) =>
    file.name.toLowerCase().endsWith("/skill.md"),
  );

  if (nested.length === 1) {
    return nested[0];
  }

  if (nested.length > 1) {
    throw new Error("The .skill package contains multiple SKILL.md files.");
  }

  throw new Error("We could not find a Markdown skill file inside this package.");
}

export async function extractSkillMarkdownFromFile(file: File) {
  const extension = extensionFor(file.name);

  if (!ACCEPTED_TEXT_EXTENSIONS.includes(extension)) {
    throw new Error("Upload a Claude .skill export or a Markdown skill file.");
  }

  const buffer = await file.arrayBuffer();

  if (extension === ".skill" && isZipPackage(buffer)) {
    const zip = await JSZip.loadAsync(buffer);
    const skillFile = findPackagedSkillFile(zip);
    return skillFile.async("text");
  }

  return decodeText(buffer);
}

export function parseSkillMarkdown(markdown: string): ParsedSkillImport {
  const trimmed = markdown.trim();

  if (!trimmed) {
    throw new Error("The skill file is empty.");
  }

  const parsed = matter(markdown);
  const sections = extractSections(parsed.content);
  const bodyAfterTitle = contentAfterTitle(parsed.content);
  const title = extractTitle(parsed.content) || stringValue(parsed.data.name);
  const summary =
    stringValue(parsed.data.description) ||
    sectionValue(sections, ["Purpose", "Summary"]) ||
    firstParagraph(bodyAfterTitle);
  const explicitInstructions = sectionValue(sections, ["Instructions"]);
  const instructions = explicitInstructions || bodyAfterTitle;
  const slug = slugify(stringValue(parsed.data.name) || title);
  const version = stringValue(parsed.data.version) || "0.1.0";
  const audience = stringValue(parsed.data.audience) || "Company teammates";
  const useWhen =
    sectionValue(sections, ["When to use", "When to use it", "Use when"]) ||
    stringValue(parsed.data.description) ||
    summary;
  const produces =
    sectionValue(sections, [
      "What you get",
      "What it produces",
      "What you produce",
      "Outputs",
      "Output",
    ]) || "A reusable workflow output based on the skill instructions.";
  const examples = parseExamples(sectionValue(sections, ["Examples"]));
  const warnings: string[] = [];

  if (!title) {
    throw new Error(
      "Add a skill name in frontmatter or a top-level Markdown title like '# PRD Writer'.",
    );
  }

  if (!slug) {
    throw new Error("Add a valid skill name before sharing.");
  }

  if (!summary) {
    throw new Error(
      "Add a short description in frontmatter or a Purpose section so teammates understand the skill.",
    );
  }

  if (!instructions) {
    throw new Error("Add useful Markdown content after the skill title.");
  }

  if (!explicitInstructions) {
    warnings.push(
      "No explicit Instructions section was found, so SkillBase used the Markdown body after the title as the instructions.",
    );
  }

  if (!stringValue(parsed.data.audience)) {
    warnings.push("No audience was found, so SkillBase used Company teammates.");
  }

  if (
    !sectionValue(sections, [
      "What you get",
      "What it produces",
      "What you produce",
    ])
  ) {
    warnings.push(
      "No output section was found, so SkillBase used a generic output summary.",
    );
  }

  if (examples.length === 0) {
    warnings.push("No examples section was found. You can add examples later.");
  }

  return {
    slug,
    title,
    summary,
    audience,
    useWhen,
    produces,
    instructions,
    examples,
    version,
    sourceMarkdown: markdown,
    warnings,
  };
}

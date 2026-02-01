export { assignStyle } from "@vistta/js";

/**
 * @typedef {"left" | "right" | "center"} HorizontalPosition
 * @typedef {"top" | "bottom" | "center"} VerticalPosition
 * @typedef {HorizontalPosition | VerticalPosition} Position
 * @typedef {Position | `${HorizontalPosition} ${VerticalPosition}`} CompositePosition
 * @typedef {string | { code: string, position: Exclude<HorizontalPosition, "center"> }} Icon
 * @typedef {string | { label: string, position?: Position }} Tooltip
 */
export const getIconCode = (icon) => (typeof icon === "object" ? icon.code : icon);
export const getTooltipLabel = (tooltip) => (typeof tooltip === "object" ? tooltip.label : tooltip);

export function htmlToMarkdown(html) {
  if (html == null) return "";
  const source = String(html);
  if (!source.trim()) return "";

  if (typeof document === "undefined") {
    return source
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/?p\b[^>]*>/gi, "\n\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  const container = document.createElement("div");
  container.innerHTML = source;
  const markdown = nodeToMarkdown(container, { inCode: false })
    .replace(/\u00A0/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return markdown;
}

export function markdownToHtml(markdown) {
  if (markdown == null) return "";
  const source = String(markdown).replace(/\r\n/g, "\n");
  if (!source.trim()) return "";

  const lines = source.split("\n");
  const htmlParts = [];

  let index = 0;
  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index++;
      continue;
    }

    const fenceMatch = line.trim().match(/^```+\s*([a-zA-Z0-9_-]+)?\s*$/);
    if (fenceMatch) {
      index++;
      const codeLines = [];
      while (index < lines.length && !lines[index].trim().match(/^```+\s*$/)) {
        codeLines.push(lines[index]);
        index++;
      }
      if (index < lines.length) index++;
      const code = codeLines.join("\n");
      htmlParts.push(`<pre><code>${escapeHtml(code)}</code></pre>`);
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      const quoteLines = [];
      while (index < lines.length && /^\s*>\s?/.test(lines[index])) {
        quoteLines.push(lines[index].replace(/^\s*>\s?/, ""));
        index++;
      }
      const inner = renderParagraph(quoteLines);
      htmlParts.push(`<blockquote>${inner}</blockquote>`);
      continue;
    }

    if (/^\s*[-+*]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\s*[-+*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*[-+*]\s+/, ""));
        index++;
      }
      htmlParts.push(`<ul>${items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ul>`);
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+\.\s+/, ""));
        index++;
      }
      htmlParts.push(`<ol>${items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ol>`);
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      htmlParts.push(`<h${level}>${renderInline(text)}</h${level}>`);
      index++;
      continue;
    }

    const paraLines = [];
    while (index < lines.length) {
      const current = lines[index];
      if (!current.trim()) break;
      if (current.trim().match(/^```+/)) break;
      if (/^\s*>\s?/.test(current)) break;
      if (/^\s*[-+*]\s+/.test(current)) break;
      if (/^\s*\d+\.\s+/.test(current)) break;
      if (/^(#{1,6})\s+/.test(current)) break;
      paraLines.push(current);
      index++;
    }
    htmlParts.push(renderParagraph(paraLines));
  }

  return htmlParts.join("");
}

function renderParagraph(lines) {
  const content = lines.map((l) => renderInline(l)).join("<br/>");
  // If it's effectively empty, keep a <br/> so contentEditable shows a line.
  if (!content || content === "<br/>") return "<p><br/></p>";
  return `<p>${content}</p>`;
}

function renderInline(text) {
  if (text == null) return "";
  const raw = String(text);

  // Allow underline round-tripping via literal <u> tags, but nothing else.
  const UO = "\u0001UO\u0001";
  const UC = "\u0001UC\u0001";
  const protectedRaw = raw.replace(/<u>/gi, UO).replace(/<\/u>/gi, UC);

  // Split on backticks for inline code.
  const parts = protectedRaw.split(/`/);
  let out = "";

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const isCode = i % 2 === 1;
    if (isCode) {
      out += `<code>${escapeHtml(part)}</code>`;
      continue;
    }
    out += renderInlineNoCode(part, { UO, UC });
  }

  return out;
}

function renderInlineNoCode(raw, tokens) {
  let cursor = 0;
  let result = "";
  const linkRe = /\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g;
  let match;

  while ((match = linkRe.exec(raw))) {
    const [full, text, url] = match;
    const start = match.index;
    result += renderEmphasis(escapeHtml(raw.slice(cursor, start)), tokens);
    const safeHref = sanitizeUrl(url);
    const label = renderEmphasis(escapeHtml(text), tokens);
    const hrefAttr = escapeHtmlAttr(safeHref);
    result += `<a href="${hrefAttr}">${label}</a>`;
    cursor = start + full.length;
  }

  result += renderEmphasis(escapeHtml(raw.slice(cursor)), tokens);
  return result;
}

function renderEmphasis(escapedText, { UO, UC }) {
  let text = escapedText;
  text = text.replaceAll(UO, "<u>").replaceAll(UC, "</u>");

  // Bold
  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Italic (simple, avoids **)
  text = text.replace(/(^|[^*])\*(?!\s)(.+?)(?<!\s)\*(?!\*)/g, "$1<em>$2</em>");
  return text;
}

function sanitizeUrl(url) {
  const value = String(url ?? "").trim();
  if (!value) return "";
  const lower = value.toLowerCase();
  if (lower.startsWith("javascript:") || lower.startsWith("vbscript:") || lower.startsWith("data:")) return "";
  return value;
}

function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeHtmlAttr(text) {
  // Same escaping rules; keep separate for clarity.
  return escapeHtml(text);
}

function escapeMarkdownText(text) {
  return String(text ?? "")
    .replace(/\u00A0/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/([*_[\]()`])/g, "\\$1");
}

function nodeToMarkdown(node, state) {
  const inCode = !!state?.inCode;

  if (!node) return "";
  if (node.nodeType === Node.TEXT_NODE) {
    const value = node.nodeValue ?? "";
    return inCode ? value : escapeMarkdownText(value);
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const el = node;
  const tag = (el.tagName || "").toUpperCase();

  const childrenMarkdown = (nextState) => {
    let out = "";
    for (const child of el.childNodes) out += nodeToMarkdown(child, nextState);
    return out;
  };

  // Treat style-only spans as formatting where possible.
  if (tag === "SPAN") {
    const style = el.style;
    const isBold = style?.fontWeight && (style.fontWeight === "bold" || Number(style.fontWeight) >= 600);
    const isItalic = style?.fontStyle === "italic";
    const isUnderline = style?.textDecoration?.includes("underline");
    let content = childrenMarkdown({ inCode });
    if (isBold) content = `**${content}**`;
    if (isItalic) content = `*${content}*`;
    if (isUnderline) content = `<u>${content}</u>`;
    return content;
  }

  switch (tag) {
    case "BR":
      return "\n";
    case "P":
    case "DIV": {
      const content = childrenMarkdown({ inCode });
      // Avoid returning pure whitespace-only paragraphs.
      const normalized = content.replace(/\s+/g, "").length ? content : "";
      return normalized + "\n\n";
    }
    case "H1":
    case "H2":
    case "H3":
    case "H4":
    case "H5":
    case "H6": {
      const level = Number(tag.slice(1));
      const content = childrenMarkdown({ inCode }).trim();
      return `${"#".repeat(level)} ${content}\n\n`;
    }
    case "STRONG":
    case "B":
      return `**${childrenMarkdown({ inCode })}**`;
    case "EM":
    case "I":
      return `*${childrenMarkdown({ inCode })}*`;
    case "U":
      // Markdown has no underline; preserve as inline HTML for round-trip.
      return `<u>${childrenMarkdown({ inCode })}</u>`;
    case "A": {
      const href = el.getAttribute("href") || "";
      const safeHref = sanitizeUrl(href);
      const label = childrenMarkdown({ inCode }) || safeHref;
      if (!safeHref) return label;
      return `[${label}](${safeHref})`;
    }
    case "PRE": {
      // Use textContent to avoid bringing nested tags.
      const code = (el.textContent ?? "").replace(/\n+$/g, "");
      return `\n\n\`\`\`\n${code}\n\`\`\`\n\n`;
    }
    case "CODE": {
      // If nested within <pre>, <pre> handler already uses textContent.
      const content = el.textContent ?? "";
      return inCode ? content : `\`${content.replace(/`/g, "\\`")}\``;
    }
    case "UL": {
      let out = "\n";
      for (const li of el.children) {
        if (li.tagName?.toUpperCase() !== "LI") continue;
        const item = nodeToMarkdown(li, { inCode }).trim();
        out += `- ${item}\n`;
      }
      return out + "\n";
    }
    case "OL": {
      let out = "\n";
      let n = 1;
      for (const li of el.children) {
        if (li.tagName?.toUpperCase() !== "LI") continue;
        const item = nodeToMarkdown(li, { inCode }).trim();
        out += `${n}. ${item}\n`;
        n++;
      }
      return out + "\n";
    }
    case "LI":
      return childrenMarkdown({ inCode });
    case "BLOCKQUOTE": {
      const content = childrenMarkdown({ inCode }).trimEnd();
      const lines = content.split("\n");
      return lines.map((l) => (l ? `> ${l}` : "> ")).join("\n") + "\n\n";
    }
    default:
      return childrenMarkdown({ inCode });
  }
}

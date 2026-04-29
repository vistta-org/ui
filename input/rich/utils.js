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
  let markdown = "";
  for (const child of container.childNodes) markdown += nodeToMarkdown(child, { inCode: false });
  markdown = markdown.replace(/\u00A0/g, " ").replace(/\n$/, "");
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
      htmlParts.push(`<p><br/></p>`);
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
      const isTaskList = items.some((item) => /^\[(x|X| )\]\s/.test(item));
      htmlParts.push(
        `<ul${isTaskList ? ' data-task-list="true"' : ""}>${items.map((item) => `<li>${renderListItem(item)}</li>`).join("")}</ul>`,
      );
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+\.\s+/, ""));
        index++;
      }
      htmlParts.push(`<ol>${items.map((item) => `<li>${renderListItem(item)}</li>`).join("")}</ol>`);
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const content = text ? renderInline(text) : "<br/>";
      htmlParts.push(`<h${level}>${content}</h${level}>`);
      index++;
      continue;
    }

    if (/^\s*([-*_]\s*){3,}$/.test(line)) {
      htmlParts.push("<hr/>");
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
      if (/^\s*([-*_]\s*){3,}$/.test(current)) break;
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

function renderListItem(text) {
  const match = String(text).match(/^\[(x|X| )\]\s+(.*)$/);
  if (!match) return renderInline(text);
  const checked = match[1].toLowerCase() === "x";
  const content = renderInline(match[2]);
  return `<input type="checkbox" ${checked ? "checked" : ""}/> ${content}`;
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
  return String(result ?? "").replace(/\\([\\`*_{}[\]()#+\-.!~>])/g, "$1");
}

function renderEmphasis(escapedText, { UO, UC }) {
  let text = escapedText;
  text = text.replaceAll(UO, "<u>").replaceAll(UC, "</u>");

  // Bold
  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Strikethrough
  text = text.replace(/~~(.+?)~~/g, "<del>$1</del>");
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
    .replace(/([*_[\]`])/g, "\\$1");
}

function wrapWithMarkdownDelimiters(content, delimiter) {
  const value = String(content ?? "");
  if (!value) return `${delimiter}${delimiter}`;

  const leading = value.match(/^\s+/)?.[0] || "";
  const trailing = value.match(/\s+$/)?.[0] || "";
  const middle = value.slice(leading.length, value.length - trailing.length);

  if (!middle) return value;
  return `${leading}${delimiter}${middle}${delimiter}${trailing}`;
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

  const childrenMarkdownFiltered = (nextState, predicate) => {
    let out = "";
    for (const child of el.childNodes) {
      if (predicate(child)) out += nodeToMarkdown(child, nextState);
    }
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
      const normalized = content.replace(/\s+/g, "").length ? content : "";
      return normalized ? `${normalized}\n` : "\n";
    }
    case "H1":
    case "H2":
    case "H3":
    case "H4":
    case "H5":
    case "H6": {
      const level = Number(tag.slice(1));
      const content = childrenMarkdown({ inCode }).trim();
      return `${"#".repeat(level)} ${content}\n`;
    }
    case "STRONG":
    case "B":
      return wrapWithMarkdownDelimiters(childrenMarkdown({ inCode }), "**");
    case "EM":
    case "I":
      return wrapWithMarkdownDelimiters(childrenMarkdown({ inCode }), "*");
    case "S":
    case "STRIKE":
    case "DEL":
      return wrapWithMarkdownDelimiters(childrenMarkdown({ inCode }), "~~");
    case "U":
      // Markdown has no underline; preserve as inline HTML for round-trip.
      return `<u>${childrenMarkdown({ inCode })}</u>`;
    case "HR":
      return "---\n";
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
      return `\`\`\`\n${code}\n\`\`\`\n`;
    }
    case "CODE": {
      // If nested within <pre>, <pre> handler already uses textContent.
      const content = el.textContent ?? "";
      return inCode ? content : `\`${content.replace(/`/g, "\\`")}\``;
    }
    case "UL": {
      let out = "";
      for (const li of el.children) {
        if (li.tagName?.toUpperCase() !== "LI") continue;
        const item = nodeToMarkdown(li, { inCode }).trim();
        out += `- ${item}\n`;
      }
      return out;
    }
    case "OL": {
      let out = "";
      let n = 1;
      for (const li of el.children) {
        if (li.tagName?.toUpperCase() !== "LI") continue;
        const item = nodeToMarkdown(li, { inCode }).trim();
        out += `${n}. ${item}\n`;
        n++;
      }
      return out;
    }
    case "LI": {
      let checked = null;
      for (const child of el.childNodes) {
        if (child.nodeType !== Node.ELEMENT_NODE) continue;
        const tag = child.tagName?.toUpperCase();
        if (tag !== "INPUT") continue;
        const type = (child.getAttribute("type") || "").toLowerCase();
        if (type !== "checkbox") continue;
        checked = "checked" in child ? !!child.checked : child.hasAttribute("checked");
        break;
      }

      const content = childrenMarkdownFiltered({ inCode }, (child) => {
        if (child.nodeType !== Node.ELEMENT_NODE) return true;
        const tag = child.tagName?.toUpperCase();
        if (tag !== "INPUT") return true;
        const type = (child.getAttribute("type") || "").toLowerCase();
        return type !== "checkbox";
      }).trim();

      if (checked == null) return content;
      return `[${checked ? "x" : " "}] ${content}`;
    }
    case "BLOCKQUOTE": {
      const content = childrenMarkdown({ inCode }).trimEnd();
      const lines = content.split("\n");
      return lines.map((l) => (l ? `> ${l}` : "> ")).join("\n") + "\n";
    }
    default:
      return childrenMarkdown({ inCode });
  }
}

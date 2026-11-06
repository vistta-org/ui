import Rich from "../input/rich/index.jsx";
import { htmlToMarkdown, markdownToHtml, sanitizeUrl } from "../input/rich/utils.js";

function paste(editor, html) {
  editor.style.minHeight = "40px";
  editor.innerHTML = "";
  expect(editor.isContentEditable, editor.outerHTML).toEqual(true);
  editor.focus();
  expect(document.activeElement === editor, editor.outerHTML).toEqual(true);
  const range = document.createRange();
  range.selectNodeContents(editor);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  expect(selection.rangeCount).toEqual(1);
  const clipboardData = new DataTransfer();
  clipboardData.setData("text/html", html);
  const event = new ClipboardEvent("paste", { clipboardData, bubbles: true, cancelable: true });
  editor.dispatchEvent(event);
  expect(event.defaultPrevented).toEqual(true);
}

suite("Rich text security", async () => {
  await test("URL filtering blocks dangerous schemes and browser whitespace bypasses", () => {
    for (const url of [
      "javascript:alert(1)",
      "JaVaScRiPt:alert(1)",
      " vbscript:payload",
      "data:text/html,payload",
      "java\tscript:payload",
      "vb\nscript:payload",
      "da\rta:payload",
      "\u0001javascript:payload",
    ]) {
      expect(sanitizeUrl(url)).toEqual("");
    }
    for (const url of ["https://example.com", "http://example.com", "mailto:a@example.com", "/relative", "#section"]) {
      expect(sanitizeUrl(url)).toEqual(url);
    }
  });

  await test("HTML paste removes unsafe hrefs including entity-encoded schemes", async () => {
    await document.mount(Rich, { id: "editor", format: true });
    const editor = document.querySelector("#editor");
    for (const href of [
      "javascript:alert(1)",
      " JaVaScRiPt:alert(1)",
      "vbscript:payload",
      "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
      "java&#9;script:payload",
      "vb&#10;script:payload",
      "da&#13;ta:payload",
      "&#1;javascript:payload",
      "&#106;avascript:payload",
    ]) {
      paste(editor, `<a href="${href}">link</a>`);
      expect(editor.textContent).toEqual("link");
      expect(editor.querySelector("[href]")).toEqual(null);
    }
  });

  await test("HTML paste preserves safe links and strips target and active attributes", async () => {
    await document.mount(Rich, { id: "editor", format: true });
    const editor = document.querySelector("#editor");
    for (const href of ["https://example.com", "mailto:a@example.com", "/relative", "#section"]) {
      paste(editor, `<a href="${href}" target="_blank" onclick="alert(1)" style="color:red">link</a>`);
      const link = editor.querySelector("a");
      expect(link.getAttribute("href")).toEqual(href);
      expect(link.attributes.length).toEqual(1);
    }
  });

  await test("HTML paste strips disallowed elements and retains only task checkboxes", async () => {
    await document.mount(Rich, { id: "editor", format: true });
    const editor = document.querySelector("#editor");
    paste(
      editor,
      '<p>text</p><script>void 0</script><iframe></iframe><svg></svg><style></style><img src="data:,x"><input type="text"><ul data-task-list="true"><li><input type="checkbox" checked onclick="alert(1)">task</li></ul>',
    );
    expect(editor.querySelector("script, iframe, svg, style, img, input:not([type=checkbox])")).toEqual(null);
    expect(editor.querySelector("[onclick]")).toEqual(null);
    expect(editor.querySelectorAll('input[type="checkbox"]').length).toEqual(1);
    expect(editor.querySelector("input").checked).toEqual(true);
    expect(editor.textContent).toInclude("task");
  });

  await test("Plain paste mode removes links and formatting", async () => {
    await document.mount(Rich, { id: "editor", format: false });
    const editor = document.querySelector("#editor");
    paste(editor, '<p><a href="https://example.com"><strong>text</strong></a></p>');
    expect(editor.textContent).toEqual("text");
    expect(editor.querySelector("a, strong")).toEqual(null);
  });

  await test("Markdown escapes raw HTML except bare underline tags and blocks unsafe links", () => {
    const container = document.createElement("div");
    container.innerHTML = markdownToHtml(
      '<u>underlined</u> <u onclick="alert(1)">raw</u> <script>alert(1)</script> <img src=x onerror=alert(1)>',
    );
    expect(container.querySelectorAll("u").length).toEqual(1);
    expect(container.querySelector("u").textContent).toEqual("underlined");
    expect(container.querySelector("script, img, [onclick], [onerror]")).toEqual(null);
    for (const url of ["javascript:payload", "vbscript:payload", "data:text/html,payload"]) {
      container.innerHTML = markdownToHtml(`[link](${url})`);
      expect(container.querySelector("a").getAttribute("href")).toEqual("");
    }
    expect(markdownToHtml("```\n<script>alert(1)</script>\n```")).toInclude("&lt;script&gt;");
    expect(htmlToMarkdown("<p><u>underlined</u></p>")).toInclude("<u>underlined</u>");
  });

  await test("HTML conversion and paste parse custom elements inertly", async () => {
    let constructed = 0;
    customElements.define(
      "rich-security-probe",
      class extends HTMLElement {
        constructor() {
          super();
          constructed++;
        }
      },
    );
    const html = "<rich-security-probe><p>safe</p></rich-security-probe>";
    expect(htmlToMarkdown(html).trim()).toEqual("safe");
    expect(constructed).toEqual(0);
    await document.mount(Rich, { id: "editor", format: true });
    const editor = document.querySelector("#editor");
    paste(editor, html);
    expect(editor.textContent).toEqual("safe");
    expect(editor.querySelector("rich-security-probe")).toEqual(null);
    expect(constructed).toEqual(0);
  });
});

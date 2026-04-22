// Known issues:
// - Modifing empty paragraphs result in no change being made
import { Component, Ref } from "@vistta/js";
import Menu from "../../menu";
import { htmlToMarkdown, markdownToHtml } from "./utils";

const BLOCK_TAGS = new Set(["P", "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE", "PRE", "UL", "OL"]);
const FORMAT_ALLOWED_TAGS = new Set([
  "P",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "BLOCKQUOTE",
  "PRE",
  "UL",
  "OL",
  "LI",
  "HR",
  "B",
  "STRONG",
  "I",
  "EM",
  "S",
  "DEL",
  "CODE",
  "A",
  "INPUT",
  "BR",
]);
const PLAIN_ALLOWED_TAGS = new Set(["P", "BR"]);

/**
 * @typedef {object} RichProps
 * @property {string} [id]
 * @property {Ref<HTMLInputElement | HTMLTextAreaElement> | ((element: HTMLInputElement | HTMLTextAreaElement) => void)} [ref]
 * @property {string} [name]
 * @property {string} [placeholder]
 * @property {boolean} [format]
 * @property {any} [value]
 * @property {boolean} [required]
 * @property {boolean} [disabled]
 * @property {boolean} [readonly]
 * @property {(event?: any) => any} [onChange]
 * @property {(event?: InputEvent) => any} [onInput]
 */

/**
 * @extends {Component<RichProps>}
 */
class Rich extends Component {
  #node;
  #debounce;
  #savedRange;

  #saveSelection() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !this.#node) return;

    const range = selection.getRangeAt(0);
    const insideStart = range.startContainer === this.#node || this.#node.contains(range.startContainer);
    const insideEnd = range.endContainer === this.#node || this.#node.contains(range.endContainer);
    if (!insideStart || !insideEnd) return;

    this.#savedRange = range.cloneRange();
  }

  #getCurrentRange() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && this.#node) {
      const range = selection.getRangeAt(0);
      const insideStart = range.startContainer === this.#node || this.#node.contains(range.startContainer);
      const insideEnd = range.endContainer === this.#node || this.#node.contains(range.endContainer);
      if (insideStart && insideEnd) return range;
    }

    if (!this.#savedRange || !selection || !this.#node) return null;
    const insideStart =
      this.#savedRange.startContainer === this.#node || this.#node.contains(this.#savedRange.startContainer);
    const insideEnd = this.#savedRange.endContainer === this.#node || this.#node.contains(this.#savedRange.endContainer);
    if (!insideStart || !insideEnd) return null;

    selection.removeAllRanges();
    selection.addRange(this.#savedRange);
    return this.#savedRange;
  }

  #handleClick(event) {
    const target = event?.target;
    if (
      !target ||
      target.nodeType !== Node.ELEMENT_NODE ||
      target.tagName !== "INPUT" ||
      target.getAttribute("type") !== "checkbox"
    ) {
      return;
    }

    if (target.checked) target.setAttribute("checked", "");
    else target.removeAttribute("checked");
  }

  #handleChange(event) {
    const target = event?.target;
    if (target?.tagName === "INPUT" && target.getAttribute("type") === "checkbox") {
      event.stopPropagation();
      return;
    }

    if (this.onChange) this.onChange(event);
  }

  #handleInput() {
    normalizeParagraphBase(this.#node);
    clearTimeout(this.#debounce);
    this.#debounce = setTimeout(() => this.#node.dispatchEvent(new Event("change", { bubbles: true })), 250);
    this.#saveSelection();
  }

  #canEdit() {
    return !!this.#node && !this.disabled && !this.readonly;
  }

  #handlePaste(event) {
    if (!this.#canEdit()) return;
    event.preventDefault();

    const html = event.clipboardData?.getData("text/html");
    const text = event.clipboardData?.getData("text/plain") || "";

    const container = document.createElement("div");
    if (html) container.innerHTML = html;
    else {
      for (const line of text.split("\n")) {
        const p = document.createElement("p");
        if (line.trim()) p.textContent = line;
        else p.appendChild(document.createElement("br"));
        container.appendChild(p);
      }
    }

    sanitizeNode(container, this.format);

    // execCommand is deprecated but has no replacement for undo-aware contentEditable insertion
    document.execCommand("insertHTML", false, container.innerHTML);

    this.#handleInput();
  }

  #handleKeyDown(event) {
    if (!this.#canEdit()) return;

    // Tab indent/outdent in lists
    if (event.key === "Tab") {
      event.preventDefault();
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);

      let li = null;
      let node =
        range.startContainer.nodeType === Node.ELEMENT_NODE
          ? /** @type {Element} */ (range.startContainer)
          : range.startContainer.parentElement;
      while (node && node !== this.#node) {
        if (node.tagName === "LI") {
          li = node;
          break;
        }
        node = node.parentElement;
      }

      if (!li) {
        // Not in a list: insert a tab character (only forward tab, not shift+tab)
        if (!event.shiftKey) document.execCommand("insertText", false, "\t");
        return;
      }
      const list = /** @type {Element} */ (li.parentElement);
      if (!list) return;

      if (!event.shiftKey) {
        // Indent: wrap this li in a nested list under the previous sibling li
        const prevLi = li.previousElementSibling;
        if (prevLi && prevLi.tagName === "LI") {
          let nested = prevLi.querySelector(`:scope > ${list.tagName.toLowerCase()}`);
          if (!nested) {
            nested = document.createElement(list.tagName.toLowerCase());
            if (list.hasAttribute("data-task-list")) nested.setAttribute("data-task-list", "true");
            prevLi.appendChild(nested);
          }
          nested.appendChild(li);
        }
      } else {
        // Outdent: move this li out of its parent list into the grandparent list
        const parentList = list;
        const grandparentLi = parentList.parentElement;
        if (grandparentLi?.tagName === "LI") {
          const grandparentList = grandparentLi.parentElement;
          if (grandparentList && (grandparentList.tagName === "UL" || grandparentList.tagName === "OL")) {
            // Move trailing siblings into a new nested list
            if (li.nextSibling) {
              const trailingList = document.createElement(parentList.tagName.toLowerCase());
              if (parentList.hasAttribute("data-task-list")) trailingList.setAttribute("data-task-list", "true");
              while (li.nextSibling) trailingList.appendChild(li.nextSibling);
              if (trailingList.children.length) li.appendChild(trailingList);
            }
            grandparentLi.after(li);
            if (!parentList.children.length) {
              parentList.remove();
              if (
                !grandparentLi.childNodes.length ||
                (grandparentLi.childNodes.length === 1 && !grandparentLi.textContent?.trim())
              ) {
                grandparentLi.remove();
              }
            }
          }
        }
      }

      // Restore caret
      const caretRange = document.createRange();
      const walker = document.createTreeWalker(li, NodeFilter.SHOW_TEXT);
      if (walker.nextNode()) caretRange.setStart(walker.currentNode, 0);
      else {
        const cb = li.querySelector("input[type='checkbox']");
        if (cb) caretRange.setStartAfter(cb);
        else caretRange.setStart(li, 0);
      }
      caretRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(caretRange);

      this.#handleInput();
      return;
    }

    if (event.key === "Enter" && !event.shiftKey) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      if (!range.collapsed) return;

      let li = null;
      let current =
        range.startContainer.nodeType === Node.ELEMENT_NODE
          ? /** @type {Element} */ (range.startContainer)
          : range.startContainer.parentElement;
      while (current && current !== this.#node) {
        if (current.tagName === "LI") {
          li = current;
          break;
        }
        current = current.parentElement;
      }

      if (!li) return;
      const list = /** @type {Element | null} */ (li.parentElement);
      if (!list || (list.tagName !== "UL" && list.tagName !== "OL")) return;

      event.preventDefault();

      // Detect task items by checking for a checkbox in the current li
      const checkboxInput = li.querySelector("input[type='checkbox']");
      if (checkboxInput) {
        const cbIdx = Array.from(li.childNodes).indexOf(checkboxInput);
        if (range.startContainer === li && range.startOffset <= cbIdx + 1) {
          range.setStart(li, cbIdx + 1);
          range.collapse(true);
        }
      }

      const afterRange = document.createRange();
      afterRange.setStart(range.startContainer, range.startOffset);
      afterRange.setEnd(li, li.childNodes.length);
      const afterContent = afterRange.extractContents();

      const newLi = document.createElement("li");
      if (checkboxInput) {
        const checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");
        newLi.appendChild(checkbox);
      }

      // Remove any checkboxes that came from the extracted content
      for (const input of afterContent.querySelectorAll("input[type='checkbox']")) input.remove();
      newLi.appendChild(afterContent);

      if (!newLi.textContent?.trim() && !newLi.querySelector("br")) {
        newLi.appendChild(document.createElement("br"));
      }

      if (!li.textContent?.trim() && !li.querySelector("br")) {
        li.appendChild(document.createElement("br"));
      }

      // Ensure original li still has its checkbox
      if (checkboxInput && !li.contains(checkboxInput)) {
        const restored = document.createElement("input");
        restored.setAttribute("type", "checkbox");
        li.insertBefore(restored, li.firstChild);
      }

      li.after(newLi);

      const caretRange = document.createRange();
      const walker = document.createTreeWalker(newLi, NodeFilter.SHOW_TEXT);
      if (walker.nextNode()) caretRange.setStart(walker.currentNode, 0);
      else caretRange.setStart(newLi, newLi.childNodes.length);
      caretRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(caretRange);

      this.#handleInput();
      return;
    }

    if (event.key !== "Backspace" && event.key !== "Delete") return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (!range.collapsed) {
      // Prevent deleting all content — after deletion, ensure at least one block remains
      const text = this.#node.textContent || "";
      if (range.toString().length >= text.length) {
        event.preventDefault();
        this.#node.innerHTML = "";
        normalizeParagraphBase(this.#node);
        const p = this.#node.querySelector("p");
        if (p) {
          const caretRange = document.createRange();
          caretRange.setStart(p, 0);
          caretRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(caretRange);
        }
        this.#node.dispatchEvent(new Event("change", { bubbles: true }));
      }
      return;
    }
    if (!this.#node.contains(range.startContainer) && range.startContainer !== this.#node) return;

    let line = null;
    let current =
      range.startContainer.nodeType === Node.ELEMENT_NODE
        ? /** @type {Element} */ (range.startContainer)
        : range.startContainer.parentElement;
    while (current && current !== this.#node) {
      if (current.tagName === "LI" || BLOCK_TAGS.has(current.tagName)) {
        line = current;
        break;
      }
      current = current.parentElement;
    }

    // Only intercept Backspace at position 0, never Delete (Delete should just delete the next char)
    if (event.key === "Delete") return;

    if (!line || line.tagName === "P") {
      // Backspace at start of a P: if previous sibling is a list, merge into the last li
      if (event.key === "Backspace" && line?.tagName === "P") {
        const offsetRange = document.createRange();
        offsetRange.setStart(line, 0);
        offsetRange.setEnd(range.startContainer, range.startOffset);
        if (offsetRange.toString().length === 0) {
          const prev = line.previousElementSibling;
          if (prev && (prev.tagName === "UL" || prev.tagName === "OL")) {
            const lastLi = prev.querySelector("li:last-child");
            if (lastLi) {
              event.preventDefault();
              // Find caret anchor: after checkbox or at end of existing content
              const checkbox = lastLi.querySelector("input[type='checkbox']");
              let caretNode = null;
              let caretOffset = 0;
              const walker = document.createTreeWalker(lastLi, NodeFilter.SHOW_TEXT);
              let lastText = null;
              while (walker.nextNode()) lastText = walker.currentNode;
              if (lastText) {
                caretNode = lastText;
                caretOffset = lastText.textContent?.length || 0;
              }

              // Remove trailing br from lastLi
              const lastChild = /** @type {Element | null} */ (lastLi.lastChild);
              if (lastChild?.nodeType === Node.ELEMENT_NODE && lastChild?.tagName === "BR") lastChild.remove();

              // Move P contents into the li
              while (line.firstChild) lastLi.appendChild(line.firstChild);
              line.remove();

              const caretRange = document.createRange();
              if (caretNode) caretRange.setStart(caretNode, caretOffset);
              else if (checkbox) caretRange.setStartAfter(checkbox);
              else caretRange.setStart(lastLi, 0);
              caretRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(caretRange);

              this.#handleInput();
            }
          }
        }
      }
      return;
    }

    const offsetRange = document.createRange();
    offsetRange.setStart(line, 0);
    offsetRange.setEnd(range.startContainer, range.startOffset);
    if (offsetRange.toString().length !== 0) return;

    event.preventDefault();

    if (line.tagName === "LI") {
      const list = /** @type {Element | null} */ (line.parentElement);
      if (!list || (list.tagName !== "UL" && list.tagName !== "OL")) return;

      const paragraph = document.createElement("p");
      moveNodeChildren(paragraph, line, true);

      const trailingList = document.createElement(list.tagName.toLowerCase());
      if (list.hasAttribute("data-task-list")) trailingList.setAttribute("data-task-list", "true");
      while (line.nextSibling) trailingList.appendChild(line.nextSibling);

      line.remove();
      list.after(paragraph);
      if (trailingList.children.length) paragraph.after(trailingList);
      if (!list.children.length) list.remove();

      const caretRange = document.createRange();
      const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);
      if (walker.nextNode()) caretRange.setStart(walker.currentNode, 0);
      else caretRange.setStart(paragraph, 0);
      caretRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(caretRange);

      this.#handleInput();
      return;
    }

    this.#toggleFormat("p", true);
  }

  #toggleFormat(type, isBlock = false) {
    if (!this.#canEdit()) return;
    const selection = window.getSelection();
    const range = this.#getCurrentRange();
    if (!selection || !range) return;

    this.#node.focus();
    selection.removeAllRanges();
    selection.addRange(range);
    if (isBlock) {
      const blocks = getSelectedLineBlocks(range, this.#node);
      let firstTarget = null;
      let caretOffset = null;
      if (range.collapsed && blocks.length) {
        try {
          const anchorBlock = blocks[0];
          if (anchorBlock && (anchorBlock === range.startContainer || anchorBlock.contains(range.startContainer))) {
            const offsetRange = document.createRange();
            offsetRange.setStart(anchorBlock, 0);
            offsetRange.setEnd(range.startContainer, range.startOffset);
            caretOffset = offsetRange.toString().length;
          }
        } catch {}
      }

      const active =
        blocks.length > 0 &&
        blocks.every((block) => {
          if (!block) return false;

          if (type === "tl") {
            if (block.tagName === "UL") return block.hasAttribute("data-task-list");
            return (
              block.tagName === "LI" &&
              block.parentElement?.tagName === "UL" &&
              block.parentElement.hasAttribute("data-task-list")
            );
          }

          if (type === "ul") {
            if (block.tagName === "UL") return !block.hasAttribute("data-task-list");
            return (
              block.tagName === "LI" &&
              block.parentElement?.tagName === "UL" &&
              !block.parentElement.hasAttribute("data-task-list")
            );
          }

          if (type === "ol") {
            if (block.tagName === "OL") return true;
            return block.tagName === "LI" && block.parentElement?.tagName === "OL";
          }

          return block.tagName === type.toUpperCase();
        });

      if (type === "pre") {
        if (!active) {
          const pre = document.createElement("pre");
          const lines = [];

          for (const block of blocks) {
            if (block.tagName === "UL" || block.tagName === "OL") {
              for (const item of Array.from(block.children)) {
                const cloned = item.cloneNode(true);
                for (const input of cloned.querySelectorAll("input[type='checkbox']")) input.remove();
                lines.push((cloned.textContent || "").replace(/\n+$/g, ""));
              }
              continue;
            }

            lines.push((block.textContent || "").replace(/\n+$/g, ""));
          }

          pre.textContent = lines.join("\n");
          if (blocks.length) {
            blocks[0].before(pre);
            for (const block of blocks) block.remove();
            firstTarget = pre;
          }
        } else if (blocks.length === 1 && blocks[0].tagName === "PRE") {
          const source = blocks[0];
          const text = source.textContent || "";
          const lines = text.split("\n");
          const replacement = [];

          for (const line of lines) {
            const p = document.createElement("p");
            if (line) p.textContent = line;
            else p.appendChild(document.createElement("br"));
            replacement.push(p);
          }

          if (!replacement.length) {
            const p = document.createElement("p");
            p.appendChild(document.createElement("br"));
            replacement.push(p);
          }

          source.before(...replacement);
          source.remove();
          firstTarget = replacement[0];
        }

        this.#handleInput();

        if (firstTarget) {
          let textNode = null;
          let nodeOffset = 0;
          let remaining = typeof caretOffset === "number" ? caretOffset : 0;
          let lastTextNode = null;
          const walker = document.createTreeWalker(firstTarget, NodeFilter.SHOW_TEXT);
          while (walker.nextNode()) {
            const contentLength = walker.currentNode.textContent?.length || 0;
            if (!contentLength) continue;
            lastTextNode = walker.currentNode;

            if (remaining <= contentLength) {
              textNode = walker.currentNode;
              nodeOffset = remaining;
              break;
            }

            remaining -= contentLength;
          }

          if (!textNode && lastTextNode) {
            textNode = lastTextNode;
            nodeOffset = lastTextNode.textContent?.length || 0;
          }

          const caretRange = document.createRange();
          if (textNode) caretRange.setStart(textNode, nodeOffset);
          else caretRange.setStart(firstTarget, 0);
          caretRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(caretRange);
        }

        return;
      }

      const targetType = active ? "p" : type;
      if (targetType === "ul" || targetType === "ol" || targetType === "tl") {
        if (blocks.length) {
          const list = document.createElement(targetType === "ol" ? "ol" : "ul");
          if (targetType === "tl") list.setAttribute("data-task-list", "true");

          blocks[0].before(list);

          for (const block of blocks) {
            if (block.tagName === "UL" || block.tagName === "OL") {
              for (const item of Array.from(block.children)) {
                const li = document.createElement("li");
                if (targetType === "tl") {
                  const checkbox = document.createElement("input");
                  checkbox.setAttribute("type", "checkbox");
                  li.appendChild(checkbox);
                }
                moveNodeChildren(li, item, true);
                list.appendChild(li);
                if (!firstTarget) firstTarget = li;
              }
              block.remove();
              continue;
            }

            if (block.tagName === "PRE") {
              const lines = (block.textContent || "").split("\n");
              for (const line of lines) {
                const li = document.createElement("li");
                if (targetType === "tl") {
                  const checkbox = document.createElement("input");
                  checkbox.setAttribute("type", "checkbox");
                  li.appendChild(checkbox);
                }

                if (line) li.appendChild(document.createTextNode(line));
                else li.appendChild(document.createElement("br"));

                list.appendChild(li);
                if (!firstTarget) firstTarget = li;
              }

              block.remove();
              continue;
            }

            const li = document.createElement("li");
            if (targetType === "tl") {
              const checkbox = document.createElement("input");
              checkbox.setAttribute("type", "checkbox");
              li.appendChild(checkbox);
            }
            moveNodeChildren(li, block, true);
            list.appendChild(li);
            if (!firstTarget) firstTarget = li;
            block.remove();
          }

          if (!list.children.length) {
            const li = document.createElement("li");
            if (targetType === "tl") {
              const checkbox = document.createElement("input");
              checkbox.setAttribute("type", "checkbox");
              li.appendChild(checkbox);
            }
            li.appendChild(document.createElement("br"));
            list.appendChild(li);
            if (!firstTarget) firstTarget = li;
          }

          if (!firstTarget) firstTarget = list;
        }
      } else {
        const tagName = targetType.toLowerCase();
        for (const block of blocks) {
          if (block.tagName === "UL" || block.tagName === "OL") {
            for (const item of Array.from(block.children)) {
              const target = document.createElement(tagName);
              moveNodeChildren(target, item, true);
              block.before(target);
              if (!firstTarget) firstTarget = target;
            }
            block.remove();
            continue;
          }

          if (block.tagName === "PRE") {
            const lines = (block.textContent || "").split("\n");
            for (const line of lines) {
              const target = document.createElement(tagName);
              if (line) target.textContent = line;
              else target.appendChild(document.createElement("br"));
              block.before(target);
              if (!firstTarget) firstTarget = target;
            }
            block.remove();
            continue;
          }

          const target = document.createElement(tagName);
          moveNodeChildren(target, block, true);
          if (!firstTarget) firstTarget = target;
          block.replaceWith(target);
        }
      }

      this.#handleInput();

      if (firstTarget) {
        // For task list items, place caret after the checkbox
        const isTaskListTarget =
          (targetType === "tl" || targetType === "ul" || targetType === "ol") && firstTarget.tagName === "LI";
        const taskCheckbox = isTaskListTarget && firstTarget.querySelector("input[type='checkbox']");

        let textNode = null;
        let nodeOffset = 0;
        let remaining = typeof caretOffset === "number" ? caretOffset : 0;
        let lastTextNode = null;
        const walker = document.createTreeWalker(firstTarget, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const contentLength = walker.currentNode.textContent?.length || 0;
          if (!contentLength) continue;
          lastTextNode = walker.currentNode;

          if (remaining <= contentLength) {
            textNode = walker.currentNode;
            nodeOffset = remaining;
            break;
          }

          remaining -= contentLength;
        }

        if (!textNode && lastTextNode) {
          textNode = lastTextNode;
          nodeOffset = lastTextNode.textContent?.length || 0;
        }

        const caretRange = document.createRange();
        if (textNode) caretRange.setStart(textNode, nodeOffset);
        else if (taskCheckbox) caretRange.setStartAfter(taskCheckbox);
        else caretRange.setStart(firstTarget, 0);
        caretRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(caretRange);
      }

      return;
    }

    if (type === "code") {
      let codeEl = null;
      let current =
        range.startContainer.nodeType === Node.ELEMENT_NODE
          ? /** @type {Element} */ (range.startContainer)
          : range.startContainer.parentElement;
      while (current && current !== this.#node) {
        if (current.tagName === "CODE") {
          codeEl = current;
          break;
        }
        current = current.parentElement;
      }

      if (codeEl) {
        const newRange = document.createRange();
        newRange.selectNodeContents(codeEl);
        selection.removeAllRanges();
        selection.addRange(newRange);
        while (codeEl.firstChild) codeEl.before(codeEl.firstChild);
        codeEl.remove();
      } else if (!range.collapsed) {
        const code = document.createElement("code");
        code.appendChild(range.extractContents());
        range.insertNode(code);
        const newRange = document.createRange();
        newRange.selectNodeContents(code);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }

      this.#saveSelection();
      this.#handleInput();
      return;
    }

    if (type === "b" || type === "i" || type === "u" || type === "s") {
      // execCommand is deprecated but has no replacement for undo-aware contentEditable mutations
      const command = type === "b" ? "bold" : type === "i" ? "italic" : type === "u" ? "underline" : "strikeThrough";
      document.execCommand(command, false, null);

      this.#saveSelection();
      this.#handleInput();
    }
  }

  #insert(type) {
    if (!this.#canEdit()) return;

    const selection = window.getSelection();
    if (!selection) return;

    let range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    const rangeInEditor =
      !!range &&
      (range.startContainer === this.#node || this.#node.contains(range.startContainer)) &&
      (range.endContainer === this.#node || this.#node.contains(range.endContainer));

    if (!rangeInEditor) {
      range = document.createRange();
      range.selectNodeContents(this.#node);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    switch (type) {
      case "link": {
        const href = window.prompt("Link URL", "https://");
        if (!href) return;

        const anchor = document.createElement("a");
        anchor.setAttribute("href", href);

        if (range.collapsed) {
          anchor.textContent = href;
          range.insertNode(anchor);

          const caretRange = document.createRange();
          caretRange.setStartAfter(anchor);
          caretRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(caretRange);
        } else {
          const content = range.extractContents();
          anchor.appendChild(content);
          range.insertNode(anchor);

          const caretRange = document.createRange();
          caretRange.setStartAfter(anchor);
          caretRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(caretRange);
        }
        break;
      }
      case "divider": {
        const line = getSelectedLineBlocks(range, this.#node)[0];
        const hr = document.createElement("hr");
        const paragraph = document.createElement("p");
        paragraph.appendChild(document.createElement("br"));

        if (line) {
          line.after(hr);
          hr.after(paragraph);
        } else {
          range.insertNode(hr);
          hr.after(paragraph);
        }

        const caretRange = document.createRange();
        caretRange.setStart(paragraph, 0);
        caretRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(caretRange);
        break;
      }
      default:
        return;
    }
    this.#handleInput();
  }

  #register(element) {
    this.#node = element;
    normalizeParagraphBase(element);
    Object.defineProperties(element, {
      value: {
        get: () => htmlToMarkdown(element.innerHTML),
        set: (value) => {
          element.innerHTML = markdownToHtml(value);
          normalizeParagraphBase(element);
        },
        configurable: false,
      },
    });
  }

  render() {
    return (
      <>
        <div
          ref={Ref.forward(this.ref, this.#register.bind(this))}
          id={this.id}
          placeholder={this.placeholder}
          name={this.name}
          aria-label={this.name}
          value={this.value}
          onChange={this.#handleChange.bind(this)}
          onClick={this.#handleClick.bind(this)}
          onMouseUp={this.#saveSelection.bind(this)}
          onKeyUp={this.#saveSelection.bind(this)}
          onFocus={this.#saveSelection.bind(this)}
          onKeyDown={this.#handleKeyDown.bind(this)}
          onPaste={this.#handlePaste.bind(this)}
          onInput={this.#handleInput.bind(this)}
          disabled={this.disabled}
          readonly={this.readonly}
          role="input"
          contentEditable={!(this.disabled || this.readonly)}
          style={{
            height: "auto",
            maxHeight: "100%",
            overflow: "auto",
            p: "2rem!",
            paddingTop: this.format && !this.disabled && !this.readonly && "12rem!",
            listStylePosition: "inside",
            "li > ul, li > ol": {
              paddingLeft: "6rem",
              marginTop: "1rem",
            },
            "li:has(> input[type=checkbox])": {
              position: "relative",
              listStyle: "none",
              paddingLeft: "7.5rem",
              "> input[type=checkbox]": {
                position: "absolute",
                top: ".5rem",
                left: "0",
              },
            },
            ":empty:before": {
              content: "attr(placeholder)",
              pointerEvents: "none",
              opacity: "0.5",
            },
          }}
        />
        {this.format && !this.disabled && !this.readonly && (
          <Menu
            type="horizontal"
            items={[
              {
                name: "Size",
                icon: "e245",
                items: [
                  {
                    name: "Heading 1",
                    icon: "f85d",
                    tooltip: "Heading 1",
                    onClick: () => this.#toggleFormat("h1", true),
                    action: true,
                  },
                  {
                    name: "Heading 2",
                    icon: "f85e",
                    tooltip: "Heading 2",
                    onClick: () => this.#toggleFormat("h2", true),
                    action: true,
                  },
                  {
                    name: "Heading 3",
                    icon: "f85f",
                    tooltip: "Heading 3",
                    onClick: () => this.#toggleFormat("h3", true),
                    action: true,
                  },
                  {
                    name: "Heading 4",
                    icon: "f860",
                    tooltip: "Heading 4",
                    onClick: () => this.#toggleFormat("h4", true),
                    action: true,
                  },
                  {
                    name: "Heading 5",
                    icon: "f861",
                    tooltip: "Heading 5",
                    onClick: () => this.#toggleFormat("h5", true),
                    action: true,
                  },
                  {
                    name: "Heading 6",
                    icon: "f862",
                    tooltip: "Heading 6",
                    onClick: () => this.#toggleFormat("h6", true),
                    action: true,
                  },
                  {
                    name: "Regular",
                    icon: "f417",
                    tooltip: "Regular",
                    onClick: () => this.#toggleFormat("p", true),
                    action: true,
                  },
                ],
                action: true,
              },
              {
                name: "Bold",
                icon: "e238",
                tooltip: "Bold",
                onClick: () => this.#toggleFormat("b"),
                action: true,
              },
              {
                name: "Italic",
                icon: "e23f",
                tooltip: "Italic",
                onClick: () => this.#toggleFormat("i"),
                action: true,
              },
              /*
              Underline is not supported by Markdown
              {
                name: "Underline",
                icon: "e249",
                tooltip: "Underline",
                onClick: () => this.#toggleFormat("u"),
                action: true,
              },*/
              {
                name: "Strikethrough",
                icon: "e257",
                tooltip: "Strikethrough",
                onClick: () => this.#toggleFormat("s"),
                action: true,
              },
              {
                divider: true,
              },
              {
                name: "Bullet List",
                icon: "e241",
                tooltip: "Bullet List",
                onClick: () => this.#toggleFormat("ul", true),
                action: true,
              },
              {
                name: "Numbered List",
                icon: "e242",
                tooltip: "Numbered List",
                onClick: () => this.#toggleFormat("ol", true),
                action: true,
              },
              {
                name: "Task List",
                icon: "e6b1",
                tooltip: "Task List",
                onClick: () => this.#toggleFormat("tl", true),
                action: true,
              },
              {
                divider: true,
              },
              {
                name: "Link",
                icon: "e250",
                tooltip: "Link",
                onClick: () => this.#insert("link"),
                action: true,
              },
              {
                name: "Quote",
                icon: "e244",
                tooltip: "Quote",
                onClick: () => this.#toggleFormat("blockquote", true),
                action: true,
              },
              {
                name: "Code Block",
                icon: "f84d",
                tooltip: "Code Block",
                onClick: () => this.#toggleFormat("pre", true),
                action: true,
              },
              {
                name: "Inline Code",
                icon: "e86f",
                tooltip: "Inline Code",
                onClick: () => this.#toggleFormat("code"),
                action: true,
              },
              {
                name: "Divider",
                icon: "f108",
                tooltip: "Divider",
                onClick: () => this.#insert("divider"),
                action: true,
              },
            ]}
            style={{
              position: "absolute",
              inset: "$space-top 1rem auto",
              col: 1,
              width: "calc(100% - 2rem)",
              background: "light-dark(shade($back-color, 5%), shade($back-color, 25%))",
              border: "none",
              "> button": {
                "> dialog": {
                  width: "12rem",
                  overflow: "visible",
                  background: "$back-color",
                },
              },
            }}
          />
        )}
      </>
    );
  }
}

export default Rich;

//

function normalizeParagraphBase(container) {
  if (!container) return;

  for (const child of Array.from(container.children)) {
    if (child.tagName === "DIV") {
      const paragraph = document.createElement("p");
      while (child.firstChild) paragraph.appendChild(child.firstChild);
      if (!paragraph.childNodes.length) paragraph.appendChild(document.createElement("br"));
      child.replaceWith(paragraph);
    }
  }

  let activeParagraph = null;
  for (const node of Array.from(container.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) {
      node.remove();
      continue;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      if (BLOCK_TAGS.has(node.tagName) || node.tagName === "HR") {
        activeParagraph = null;
        continue;
      }
    }

    if (!activeParagraph) {
      activeParagraph = document.createElement("p");
      node.before(activeParagraph);
    }
    activeParagraph.appendChild(node);
  }

  if (!container.childNodes.length) {
    const paragraph = document.createElement("p");
    paragraph.appendChild(document.createElement("br"));
    container.appendChild(paragraph);
    return;
  }

  for (const child of Array.from(container.children))
    if (child.tagName === "P" && !child.childNodes.length) child.appendChild(document.createElement("br"));
}

function getSelectedLineBlocks(range, container) {
  if (!range || !container) return [];
  if (!container.contains(range.startContainer) && range.startContainer !== container) return [];
  if (!container.contains(range.endContainer) && range.endContainer !== container) return [];

  const findNearestBlock = (node, offset = 0) => {
    if (!node) return null;

    const blockSelector = Array.from(BLOCK_TAGS)
      .map((tag) => tag.toLowerCase())
      .join(",");

    if (node === container) {
      const rootBlocks = Array.from(container.querySelectorAll(`:scope > ${blockSelector}`));
      if (!rootBlocks.length) return null;
      const index = Math.max(0, Math.min(rootBlocks.length - 1, offset));
      return rootBlocks[index] || rootBlocks[0];
    }

    if (node.nodeType === Node.ELEMENT_NODE && BLOCK_TAGS.has(node.tagName)) return node;

    let current = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    while (current && current !== container) {
      if (BLOCK_TAGS.has(current.tagName)) return current;
      current = current.parentElement;
    }

    return null;
  };

  const selector = Array.from(BLOCK_TAGS)
    .map((tag) => tag.toLowerCase())
    .join(",");
  const blocks = Array.from(container.querySelectorAll(selector));
  if (!blocks.length) return [];

  if (range.collapsed) {
    const startBlock = findNearestBlock(range.startContainer, range.startOffset);
    return startBlock ? [startBlock] : [];
  }

  const selected = blocks.filter((block) => range.intersectsNode(block));
  if (selected.length) return selected;

  const startBlock = findNearestBlock(range.startContainer, range.startOffset);
  const endBlock = findNearestBlock(range.endContainer, range.endOffset);
  if (!startBlock || !endBlock) return [];

  const start = blocks.indexOf(startBlock);
  const end = blocks.indexOf(endBlock);
  if (start === -1 || end === -1) return [];
  return blocks.slice(Math.min(start, end), Math.max(start, end) + 1);
}

function sanitizeNode(node, format) {
  const allowed = format ? FORMAT_ALLOWED_TAGS : PLAIN_ALLOWED_TAGS;

  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) continue;
    if (child.nodeType !== Node.ELEMENT_NODE) {
      child.remove();
      continue;
    }

    const el = /** @type {Element} */ (child);

    if (el.tagName === "INPUT" && el.getAttribute("type") !== "checkbox") {
      el.remove();
      continue;
    }

    if (!allowed.has(el.tagName)) {
      sanitizeNode(el, format);
      while (el.firstChild) el.before(el.firstChild);
      el.remove();
      continue;
    }

    const attrs = Array.from(el.attributes);
    for (const attr of attrs) {
      if (el.tagName === "A" && attr.name === "href") {
        if (/^javascript:/i.test(attr.value)) el.removeAttribute("href");
        continue;
      }
      if (el.tagName === "INPUT" && (attr.name === "type" || attr.name === "checked")) continue;
      if (el.tagName === "UL" && attr.name === "data-task-list") continue;
      el.removeAttribute(attr.name);
    }

    if (el.tagName !== "HR" && el.tagName !== "BR" && el.tagName !== "INPUT") {
      sanitizeNode(el, format);
    }
  }
}

function moveNodeChildren(target, source, stripTaskCheckbox) {
  while (source.firstChild) {
    const child = source.firstChild;
    if (
      stripTaskCheckbox &&
      child?.nodeType === Node.ELEMENT_NODE &&
      child.tagName === "INPUT" &&
      child.getAttribute("type") === "checkbox"
    ) {
      child.remove();
      continue;
    }
    target.appendChild(child);
  }

  if (!target.childNodes.length) target.appendChild(document.createElement("br"));
}

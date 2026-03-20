import { Component, Ref } from "@vistta/js";
import Menu from "../../menu";
import { htmlToMarkdown, markdownToHtml } from "../../utils";

const BLOCK_TAGS = new Set(["P", "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE", "PRE", "UL", "OL"]);

class Rich extends Component {
  formatting = true;
  #element;
  #debounce;
  #savedRange;

  #saveSelection() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !this.#element) return;

    const range = selection.getRangeAt(0);
    const insideStart = range.startContainer === this.#element || this.#element.contains(range.startContainer);
    const insideEnd = range.endContainer === this.#element || this.#element.contains(range.endContainer);
    if (!insideStart || !insideEnd) return;

    this.#savedRange = range.cloneRange();
  }

  #getCurrentRange() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && this.#element) {
      const range = selection.getRangeAt(0);
      const insideStart = range.startContainer === this.#element || this.#element.contains(range.startContainer);
      const insideEnd = range.endContainer === this.#element || this.#element.contains(range.endContainer);
      if (insideStart && insideEnd) return range;
    }

    if (!this.#savedRange || !selection || !this.#element) return null;
    const insideStart =
      this.#savedRange.startContainer === this.#element || this.#element.contains(this.#savedRange.startContainer);
    const insideEnd =
      this.#savedRange.endContainer === this.#element || this.#element.contains(this.#savedRange.endContainer);
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
    normalizeParagraphBase(this.#element);
    clearTimeout(this.#debounce);
    this.#debounce = setTimeout(() => this.#element.dispatchEvent(new Event("change", { bubbles: true })), 250);
    this.#saveSelection();
  }

  #canEdit() {
    return !!this.#element && !this.disabled && !this.readonly;
  }

  #handleKeyDown(event) {
    if (event.key !== "Backspace" && event.key !== "Delete") return;
    if (!this.#canEdit()) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (!range.collapsed) return;
    if (!this.#element.contains(range.startContainer) && range.startContainer !== this.#element) return;

    let line = null;
    let current =
      range.startContainer.nodeType === Node.ELEMENT_NODE
        ? /** @type {Element} */ (range.startContainer)
        : range.startContainer.parentElement;
    while (current && current !== this.#element) {
      if (current.tagName === "LI" || BLOCK_TAGS.has(current.tagName)) {
        line = current;
        break;
      }
      current = current.parentElement;
    }

    if (!line || line.tagName === "P") return;

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

    this.#element.focus();
    selection.removeAllRanges();
    selection.addRange(range);
    if (isBlock) {
      const blocks = getSelectedLineBlocks(range, this.#element);
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

    if (type === "b" || type === "i" || type === "u" || type === "s") {
      const command = type === "b" ? "bold" : type === "i" ? "italic" : type === "u" ? "underline" : "strikeThrough";

      if (typeof document.execCommand !== "function") return;
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
      (range.startContainer === this.#element || this.#element.contains(range.startContainer)) &&
      (range.endContainer === this.#element || this.#element.contains(range.endContainer));

    if (!rangeInEditor) {
      range = document.createRange();
      range.selectNodeContents(this.#element);
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
        const line = getSelectedLineBlocks(range, this.#element)[0];
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
    this.#element = element;
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
          aria-label={this.label}
          value={this.value}
          onChange={this.#handleChange.bind(this)}
          onClick={this.#handleClick.bind(this)}
          onMouseUp={this.#saveSelection.bind(this)}
          onKeyUp={this.#saveSelection.bind(this)}
          onFocus={this.#saveSelection.bind(this)}
          onKeyDown={this.#handleKeyDown.bind(this)}
          onInput={this.#handleInput.bind(this)}
          disabled={this.disabled}
          readonly={this.readonly}
          role="input"
          contentEditable={this.disabled || this.readonly ? "false" : "true"}
          style={{
            col: "full",
            p: "1rem!",
            marginTop: this.formatting && !this.disabled && !this.readonly && "8rem!",
            listStylePosition: "inside",
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
            "&:empty:before": {
              content: "attr(placeholder)",
              pointerEvents: "none",
              opacity: "0.5",
            },
          }}
        />
        {this.formatting && !this.disabled && !this.readonly && (
          <Menu
            type="horizontal"
            items={[
              {
                name: "Size",
                icon: "e245",
                width: "35rem",
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
              inset: "0 0 auto 0",
              col: "full",
              background: "$back-color",
              "> button": {
                background: "$back-color",
                "> dialog": {
                  width: "12rem",
                  overflow: "visible",
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
      if (BLOCK_TAGS.has(node.tagName)) {
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

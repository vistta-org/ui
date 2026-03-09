import { Component, Ref } from "@vistta/js";
import Menu from "../../menu";
import { htmlToMarkdown, markdownToHtml } from "../../utils";

const BLOCK_TAGS = new Set(["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE", "PRE", "UL", "OL"]);

class Rich extends Component {
  #element;
  #debounce;

  #handleInput() {
    normalizeParagraphBase(this.#element);
    clearTimeout(this.#debounce);
    this.#debounce = setTimeout(() => this.#element.dispatchEvent(new Event("change", { bubbles: true })), 250);
  }

  #canEdit() {
    return !!this.#element && !this.disabled && !this.readonly;
  }

  #toggleFormat(type, isBlock = false) {
    if (!this.#canEdit()) return;
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const commonAncestor = range.commonAncestorContainer;
    // console.dir(commonAncestor);
    // const isActive = this.#isFormatActive(type, isBlock, commonAncestor);
  }

  #insert(type) {
    if (!this.#canEdit()) return;
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
        {!(this.disabled || this.readonly) && (
          <Menu
            type="horizontal"
            items={[
              {
                name: "Size",
                icon: "e245",
                width: "35rem",
                items: [
                  {
                    label: "Heading 1",
                    onClick: () => this.#toggleFormat("h1", true),
                  },
                  {
                    label: "Heading 2",
                    onClick: () => this.#toggleFormat("h2", true),
                  },
                  {
                    label: "Heading 3",
                    onClick: () => this.#toggleFormat("h3", true),
                  },
                  {
                    label: "Heading 4",
                    onClick: () => this.#toggleFormat("h4", true),
                  },
                  {
                    label: "Heading 5",
                    onClick: () => this.#toggleFormat("h5", true),
                  },
                  {
                    label: "Heading 6",
                    onClick: () => this.#toggleFormat("h6", true),
                  },
                  {
                    label: "Paragraph",
                    onClick: () => this.#toggleFormat("p", true),
                  },
                ],
                action: true,
              },
              {
                name: "Bold",
                icon: "e238",
                onClick: () => this.#toggleFormat("b"),
                action: true,
              },
              {
                name: "Italic",
                icon: "e23f",
                onClick: () => this.#toggleFormat("i"),
                action: true,
              },
              {
                name: "Underline",
                icon: "e249",
                onClick: () => this.#toggleFormat("u"),
                action: true,
              },
              {
                name: "Strikethrough",
                icon: "e257",
                onClick: () => this.#toggleFormat("s"),
                action: true,
              },
              {
                divider: true,
              },
              {
                name: "Bullet List",
                icon: "e241",
                onClick: () => this.#toggleFormat("ul", true),
                action: true,
              },
              {
                name: "Numbered List",
                icon: "e242",
                onClick: () => this.#toggleFormat("ol", true),
                action: true,
              },
              {
                name: "Task List",
                icon: "e6b1",
                onClick: () => this.#toggleFormat("tl", true),
                action: true,
              },
              {
                divider: true,
              },
              {
                name: "Link",
                icon: "e250",
                onClick: () => this.#insert("link"),
                action: true,
              },
              {
                name: "Quote",
                icon: "e244",
                onClick: () => this.#toggleFormat("blockquote", true),
                action: true,
              },
              {
                name: "Code Block",
                icon: "f84d",
                onClick: () => this.#toggleFormat("pre", true),
                action: true,
              },
              {
                name: "Inline Code",
                icon: "e86f",
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
              radius: "0",
              "> button": {
                background: "$back-color",
                "> dialog": {
                  width: "12rem",
                },
              },
            }}
          />
        )}
        <div
          ref={Ref.forward(this.ref, this.#register.bind(this))}
          id={this.id}
          placeholder={this.placeholder}
          name={this.name}
          aria-label={this.label}
          value={this.value}
          onChange={this.onChange}
          onInput={this.#handleInput.bind(this)}
          disabled={this.disabled}
          readonly={this.readonly}
          role="input"
          contentEditable={this.disabled || this.readonly ? "false" : "true"}
          style={{
            col: "full",
            p: "1rem!",
            marginTop: "8rem",
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

import { Component, Ref } from "@vistta/js";
import Menu from "../../menu";

const TOOLBAR_ACTIONS = [
  {
    label: "Size",
    icon: "\ue245",
    action: true,
    onClick: () => format("Size"),
  },
  {
    label: "Color",
    icon: "\ue23c",
    action: true,
    onClick: () => format("Color"),
  },
  {
    label: "Bold",
    icon: "\ue238",
    action: true,
    onClick: () => format("Bold"),
  },
  {
    label: "Italic",
    icon: "\ue23f",
    action: true,
    onClick: () => format("Italic"),
  },
  {
    label: "Underline",
    icon: "\ue249",
    action: true,
    onClick: () => format("Underline"),
  },
  {
    label: "Strikethrough",
    icon: "\ue246",
    action: true,
    onClick: () => format("Strikethrough"),
  },
  {
    label: "Align Left",
    icon: "\ue246",
    action: true,
    onClick: () => format("AlignLeft"),
  },
  {
    label: "Bullet List",
    icon: "\ue241",
    action: true,
    onClick: () => format("BulletList"),
  },
  {
    label: "Number List",
    icon: "\ue242",
    action: true,
    onClick: () => format("NumberList"),
  },
  {
    label: "Check List",
    icon: "\ue6b1",
    action: true,
    onClick: () => format("CheckList"),
  },
];

/*

  {
    label: "Align Center",
    icon: "\ue234",
    action: true,
    onClick: () => format("AlignCenter"),
  },
  {
    label: "Align Right",
    icon: "\ue237",
    action: true,
    onClick: () => format("AlignRight"),
  },
  {
    label: "Align Justify",
    icon: "\ue235",
    action: true,
    onClick: () => format("AlignJustify"),
  },*/

class Rich extends Component {
  #timer;

  onChangeAdapter(event) {
    this.onInput?.(event);
    clearTimeout(this.#timer);
    this.#timer = setTimeout(
      () => event.target.dispatchEvent(new Event("change")),
      250
    );
  }

  setElementProperties(element) {
    Object.defineProperty(element, "value", {
      get: () => element.innerText,
      set: (value) => (element.innerText = value),
    });
    if (!this.ref) return;
    if (typeof this.ref === "function") this.ref(element);
    else if (this.ref instanceof Ref) this.ref.node = element;
  }

  render() {
    return (
      <>
        {this.toolbar && (
          <Menu
            variant="raw"
            className="toolbar"
            dropdown={{ action: true }}
            items={TOOLBAR_ACTIONS}
          />
        )}
        <div
          id={this.id}
          placeholder={this.placeholder}
          name={this.name}
          ref={(e) => this.setElementProperties(e)}
          aria-label={this.label}
          value={this.value}
          onInput={(e) => this.onChangeAdapter(e)}
          onChange={this.onChange}
          contentEditable={true}
        ></div>
      </>
    );
  }
}

export default Rich;

function format(format) {
  /*
const FORMAT_MAP = {
  Bold: { property: "fontWeight", value: "bold" },
  Italic: { property: "fontStyle", value: "italic" },
  Underline: { property: "textDecoration", value: "underline" },
  Strikethrough: { property: "textDecoration", value: "line-through" },
};
  
  const selection = window.getSelection();
  if (!selection?.rangeCount) return;

  const range = selection.getRangeAt(0);
  if (range.collapsed) return; // No text selected

  const { property, value } = FORMAT_MAP[format] || {};
  if (!property || !value) return;

  const isFormatted = isSelectionFormatted(range, property, value);

  try {
    if (isFormatted) {
      removeFormatting(range, property, value);
    } else {
      applyFormatting(range, property, value);
    }

    // Restore selection focus
    selection.removeAllRanges();
    selection.addRange(range);
  } catch (error) {
    console.error("Error formatting text:", error);
  }
}

function isSelectionFormatted(range, property, value) {
  const fragment = range.cloneContents();
  const textNodes = getAllTextNodes(fragment);

  if (textNodes.length === 0) return false;

  return textNodes.every((node) => {
    for (
      let parent = node.parentNode;
      parent && parent !== fragment;
      parent = parent.parentNode
    ) {
      if (parent.nodeName === "SPAN" && hasStyle(parent, property, value)) {
        return true;
      }
    }
    return false;
  });
}

function getAllTextNodes(node) {
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  const textNodes = [];

  let current;
  while ((current = walker.nextNode())) {
    if (current.textContent.trim()) {
      textNodes.push(current);
    }
  }

  return textNodes;
}

function hasStyle(element, property, value) {
  return property === "textDecoration"
    ? element.style[property].includes(value)
    : element.style[property] === value;
}

function removeFormatting(range, property, value) {
  const fragment = range.extractContents();

  Array.from(fragment.querySelectorAll("span")).forEach((span) => {
    if (hasStyle(span, property, value)) {
      if (property === "textDecoration") {
        span.style[property] = span.style[property]
          .split(" ")
          .filter((s) => s !== value)
          .join(" ");
      } else {
        span.style[property] = "";
      }

      if (!span.style.cssText) {
        unwrapElement(span);
      }
    }
  });

  range.insertNode(fragment);
}

function applyFormatting(range, property, value) {
  const fragment = range.extractContents();

  // Process existing spans to avoid nesting similar formats
  optimizeNestedSpans(fragment, property, value);

  // Wrap content in span with formatting
  const span = document.createElement("span");
  span.style[property] = value;
  span.appendChild(fragment);

  range.insertNode(span);
}

function optimizeNestedSpans(node, property, value) {
  Array.from(node.querySelectorAll("span"))
    .filter((span) => hasStyle(span, property, value))
    .forEach(unwrapElement);
}

function unwrapElement(element) {
  if (!element?.parentNode) return;

  const parent = element.parentNode;
  const fragment = document.createDocumentFragment();

  while (element.firstChild) {
    fragment.appendChild(element.firstChild);
  }

  parent.insertBefore(fragment, element);
  parent.removeChild(element);*/
}

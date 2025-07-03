import { Component, Ref } from "@vistta/js";
import Toolbar, { type FormatOptions } from "./toolbar";

type Marker = {
  start: Text;
  end: Text;
};

class Rich extends Component {
  id?: string;
  ref?: Ref<HTMLElement> | ((element: HTMLElement) => void) | null;
  name?: string;
  placeholder?: string;
  label?: string;
  value?: string;
  toolbar?: true | FormatOptions[];
  #timer;
  #element = new Ref<HTMLElement>();

  onChangeAdapter(event) {
    const element = this.#element.node;
    if (!element) return;
    Array.from(element.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = node.textContent;
        element.replaceChild(p, node);
      } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== "P") {
        const p = document.createElement("p");
        p.innerHTML = node.outerHTML;
        element.replaceChild(p, node);
      }
    });
    fixEmptyParagraphs(element);
    this.onInput?.(event);
    clearTimeout(this.#timer);
    this.#timer = setTimeout(
      () => event.target.dispatchEvent(new Event("change")),
      250
    );
  }

  setElementProperties(element) {
    this.#element.node = element;
    Object.defineProperties(element, {
      value: {
        get: () => element.innerHTML,
        set: (value) => (element.innerHTML = value),
        configurable: false,
      },
      toggle: {
        value: (command, arg) => this.format(command, arg),
        configurable: false,
        writable: false,
      },
    });
    fixEmptyParagraphs(element);
    if (!this.ref) return;
    if (typeof this.ref === "function") this.ref(element);
    else if (this.ref instanceof Ref) this.ref.node = element;
  }

  format(command, arg) {
    const selection = window.getSelection();
    let range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    if (!range || range.collapsed) return;
    const marker = markSelection(range);
    this.#element.node.focus();
    range = restoreSelectionFromMarker(selection, marker, false);

    let container: any = range.commonAncestorContainer;
    if (container.nodeType !== Node.ELEMENT_NODE)
      container = container.parentElement;
    if (!container) return;

    const lines = [];
    const nodes = container.querySelectorAll("p, li");
    const len = nodes.length;
    if (len === 0) {
      while (container.tagName !== "P" && container.parentElement) {
        if (container === this.#element.node) return;
        container = container.parentElement;
      }
      lines.push(container as HTMLElement);
    } else
      for (let i = 0; i < len; i++) {
        const paragraphRange = createRangeFromNode(nodes[i]);
        if (
          range.compareBoundaryPoints(Range.END_TO_START, paragraphRange) < 0 &&
          range.compareBoundaryPoints(Range.START_TO_END, paragraphRange) > 0
        )
          lines.push(nodes[i] as HTMLElement);
      }

    switch (command) {
      case "bold":
        toggleFormattingByLines(lines, marker, range, "b");
        break;
      case "italic":
        toggleFormattingByLines(lines, marker, range, "i");
        break;
      case "underline":
        toggleFormattingByLines(lines, marker, range, "u");
        break;
      case "strike":
        toggleFormattingByLines(lines, marker, range, "s");
        break;
      case "cite":
        toggleFormattingByLines(lines, marker, range, "cite");
        break;
      case "mark":
        toggleFormattingByLines(lines, marker, range, "mark");
        break;
      case "code":
        toggleFormattingByLines(lines, marker, range, "code");
        break;
      case "sup":
        toggleFormattingByLines(lines, marker, range, "sup");
        break;
      case "sub":
        toggleFormattingByLines(lines, marker, range, "sub");
        break;
      case "align":
        for (let i = lines.length - 1; i >= 0; i--)
          lines[i].style.textAlign = arg;
        break;
      case "size":
        console.log(arg);
        break;
      case "color":
        break;
      case "TaskList":
      case "BulletList":
      case "OrderedList":
        //toggleListByLines(lines, "ol");
        break;
      default:
        return;
    }

    restoreSelectionFromMarker(selection, marker);
    this.#element.node.dispatchEvent(new Event("input", { bubbles: true }));
  }

  render() {
    return (
      <>
        {this.toolbar && (
          <Toolbar
            options={this.toolbar}
            onSelect={(command, arg) => this.format(command, arg)}
          />
        )}
        <div
          ref={(e) => this.setElementProperties(e)}
          id={this.id}
          placeholder={this.placeholder}
          name={this.name}
          aria-label={this.label}
          value={this.value}
          onInput={(e) => this.onChangeAdapter(e)}
          onChange={this.onChange}
          contentEditable={"true"}
        />
      </>
    );
  }
}

export default Rich;

function fixEmptyParagraphs(element) {
  if (element?.innerHTML?.trim() === "") {
    const p = document.createElement("p");
    p.appendChild(document.createElement("br"));
    element.appendChild(p);
  }
}

function toggleFormattingByLines(
  lines: HTMLElement[],
  marker: Marker,
  range: Range,
  type: string
) {
  let fullMatched = "";
  for (let i = lines.length - 1; i >= 0; i--) {
    const elements = lines[i].querySelectorAll(type);
    for (let i2 = elements.length - 1; i2 >= 0; i2--) {
      const node = elements[i2];
      if (!range.intersectsNode(node)) continue;
      const currentRange = createRangeFromNode(node);
      fullMatched = currentRange.toString() + fullMatched;

      if (node.contains(marker.end)) {
        const after = document.createRange();
        after.setStartAfter(marker.end);
        after.setEnd(currentRange.endContainer, currentRange.endOffset);
        if (after.toString() !== "") wrapRange(after, type);
      }
      if (node.contains(marker.start)) {
        const before = document.createRange();
        before.setStart(currentRange.startContainer, currentRange.startOffset);
        before.setEndBefore(marker.start);
        if (before.toString() !== "") wrapRange(before, type);
      }

      while (node.firstChild)
        node.parentNode.insertBefore(node.firstChild, node);
      node.parentNode.removeChild(node);
    }
  }

  if (fullMatched.includes(range.toString())) return;
  for (let i = lines.length - 1; i >= 0; i--) {
    const node = lines[i];
    const subRange = createRangeFromNode(node);

    if (node.contains(marker.end)) subRange.setEndBefore(marker.end);
    if (node.contains(marker.start)) subRange.setStartAfter(marker.start);

    wrapRange(subRange, type);
  }
}

function wrapRange(range, type) {
  if (!range || !(range instanceof Range)) return;
  const wrapper = document.createElement(type);
  wrapper.appendChild(range.extractContents());
  range.insertNode(wrapper);
  const selection = window.getSelection();
  if (selection) {
    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNode(wrapper);
    selection.addRange(newRange);
  }
  return wrapper;
}

function createRangeFromNode(node) {
  const range = document.createRange();
  range.selectNodeContents(node);
  return range;
}

function markSelection(range) {
  const marker: Marker = {
    start: document.createTextNode(""),
    end: document.createTextNode(""),
  };
  const endRange = range.cloneRange();
  endRange.collapse(false);
  endRange.insertNode(marker.end);
  const startRange = range.cloneRange();
  startRange.collapse(true);
  startRange.insertNode(marker.start);
  return marker;
}

function restoreSelectionFromMarker(selection, { start, end }, cleanup = true) {
  selection.removeAllRanges();
  if (!start || !end) return;

  const range = document.createRange();
  range.setStartAfter(start);
  range.setEndBefore(end);
  selection.addRange(range);
  if (!cleanup) return range;
  start.remove();
  end.remove();
  return range;
}

// Clean pasted HTML from empty paragraphs

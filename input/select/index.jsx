import { Component, Ref } from "@vistta/js";
import Popover from "../../popover";

/**
 * @typedef {object} SelectProps
 * @property {string} [id]
 * @property {Ref<HTMLInputElement | HTMLTextAreaElement> | ((element: HTMLInputElement | HTMLTextAreaElement) => void)} [ref]
 * @property {string} [name]
 * @property {string} [placeholder]
 * @property {boolean} [multiple]
 * @property {boolean} [filterable]
 * @property {any} [value]
 * @property {Array<{ label: string; value: any } | string>} [options]
 * @property {boolean} [required]
 * @property {boolean} [disabled]
 * @property {boolean} [readonly]
 * @property {(event?: any) => any} [onChange]
 * @property {(event?: InputEvent) => any} [onInput]
 */

/**
 * @extends {Component<SelectProps>}
 */
class Select extends Component {
  open = false;
  search;
  anchor;
  value = null;
  #node;
  #input;

  get #options() {
    if (!this.options) return [<span style={{ padding: "1rem", color: "muted" }}>No options</span>];
    const result = [];
    for (let i = 0, len = this.options.length; i < len; i++) {
      const { label, value } = normalizeOption(this.options[i]);
      if (this.filterable && this.search && !label.toLowerCase().includes(this.search.toLowerCase())) continue;
      const selected = isSelected(this.value, value, this.multiple);
      result.push(
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            this.#select(value);
          }}
          style={{
            background: selected ? "$fore-color" : "none",
            color: selected ? "$back-color" : "default",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "2rem",
            padding: "1rem 2rem",
            borderRadius: "1rem",
          }}
        >
          {label}
        </button>,
      );
    }
    return result.length ? result : [<span style={{ padding: "1rem", color: "muted" }}>No results</span>];
  }

  get #displayValue() {
    const value = this.multiple ? this.value : [this.value];
    const result = [];
    for (let i = 0, len = value?.length || 0; i < len; i++) {
      const option = this.options?.find((option) => normalizeOption(option).value === value[i]);
      if (option) result.push(normalizeOption(option).label);
    }
    return result.join(", ");
  }

  #open() {
    if (this.disabled || this.readonly) return;
    if (this.#input) this.#input.focus();
    if (!this.open) this.open = true;
  }

  #close(target) {
    if (target && this.#node.contains(target)) return;
    this.open = false;
    this.search = "";
    if (this.#input) this.#input.value = "";
  }

  #select(value, dispatch = true) {
    if (this.disabled || this.readonly) return;
    if (this.multiple) {
      if (value === undefined || value === null) this.value = undefined;
      else if (!Array.isArray(this.value)) this.value = [value];
      else if (this.value.includes(value)) this.value = this.value.filter((v) => v !== value);
      else this.value = [...this.value, value];
    } else this.value = value;
    if (this.#input) this.#input.value = "";
    if (!this.multiple) this.#close();
    else if (this.#input) this.#input.focus();
    if (dispatch) this.#node.dispatchEvent(new Event("change", { bubbles: true }));
  }

  #onKeyDown(event) {
    switch (event.key) {
      case "Escape":
        this.#close();
        break;
      case "Enter": {
        const selection = [];
        for (let i = 0, len = this.options.length; i < len; i++) {
          const { label, value } = normalizeOption(this.options[i]);
          if (this.filterable && this.search && !label.toLowerCase().includes(this.search.toLowerCase())) continue;
          selection.push({ label, value });
        }
        if (selection.length === 1) this.#select(selection[0].value);
        break;
      }
      case "Backspace":
        if (
          this.multiple &&
          this.#input?.selectionStart === 0 &&
          !this.#input.selectionEnd &&
          Array.isArray(this.value) &&
          this.value.length
        ) {
          this.#select(this.value[this.value.length - 1]);
        }
        break;
    }
  }

  #register(element) {
    this.#node = element;
    Object.defineProperties(element, {
      value: {
        get: () => this.value,
        set: (value) => this.#select(value, false),
        configurable: false,
      },
    });
  }

  render() {
    return (
      <>
        <div
          ref={Ref.forward(this.ref, this.#register.bind(this))}
          role="select"
          name={this.name}
          aria-label={this.name}
          aria-expanded={this.open}
          aria-disabled={this.disabled}
          aria-selected={this.#displayValue?.length > 0}
          onClick={this.#open.bind(this)}
          onChange={this.onChange}
          onInput={this.onInput}
          style={{
            position: "relative",
            minHeight: "10rem",
            container: "default",
            flexWrap: "nowrap",
          }}
        >
          {this.#displayValue}
          {!this.readonly && !this.disabled && this.filterable && (
            <input
              ref={(el) => (this.#input = el)}
              type="text"
              onInput={(e) => (this.search = e.target.value)}
              placeholder={this.placeholder}
              onKeyDown={this.#onKeyDown.bind(this)}
              style={{ col: "default", padding: "0", margin: "-2rem 0", border: "none", background: "none" }}
            />
          )}
        </div>
        <Popover
          open={this.open}
          onOutsideClick={(e) => this.#close(e.target)}
          style={{
            inset: `${this.anchor("bottom", "2rem")} calc(${this.anchor("left")} - ${this.anchor("width")}) auto auto`,
            container: "default",
            gap: "1rem",
            padding: "1rem",
            "> *": { col: "full", text: "left" },
            height: "max-content",
            maxHeight: "60rem",
            overflow: "auto",
            width: "fit-content",
            minWidth: this.anchor.width,
          }}
          inert
        >
          {this.#options}
        </Popover>
      </>
    );
  }
}

export default Select;

function normalizeOption(option) {
  if (typeof option === "string") return { label: option, value: option };
  return option;
}

function isSelected(value, target, multiple) {
  if (multiple) {
    if (!Array.isArray(value)) return !target;
    for (let i = 0, len = value.length; i < len; i++) {
      if (value[i] === target) return true;
    }
    return false;
  }
  return value === target;
}

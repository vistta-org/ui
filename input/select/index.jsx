import { Component, Ref } from "@vistta/js";
import { equals } from "@vistta/utils";
import Button from "../../button";
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
  #node;
  #input;

  get #label() {
    const result = [];
    const value = this.multiple ? this.value || [] : [this.value];
    for (let i = 0, len = value.length; i < len; i++) {
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
        if (this.multiple && this.#input?.selectionStart === 0 && !this.#input.selectionEnd && this.value?.length)
          this.#select(this.value[this.value.length - 1]);
        break;
      default:
        if (!this.open) this.#open();
    }
  }

  #register(element) {
    this.#node = element;
    Object.defineProperties(element, {
      value: {
        get: () => this.value,
        set: (value) => {
          if (this.disabled || this.readonly || equals(this.value, value)) return;
          this.value = this.multiple && !Array.isArray(value) ? [value] : value;
        },
        configurable: false,
      },
    });
  }

  #select(value) {
    if (this.disabled || this.readonly) return;
    if (this.multiple) {
      if (value === undefined || value === null) this.value = [];
      else if (!Array.isArray(this.value)) this.value = [value];
      else if (this.value.includes(value)) this.value = this.value.filter((v) => v !== value);
      else this.value = [...this.value, value];
    } else this.value = value;
    if (this.#input) this.#input.value = "";
    if (!this.multiple) this.#close();
    else if (this.#input) this.#input.focus();
    this.#node.dispatchEvent(new Event("change", { bubbles: false }));
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
          aria-selected={this.#label?.length > 0}
          onClick={this.#open.bind(this)}
          onChange={this.onChange}
          onInput={this.onInput}
          style={{
            position: "relative",
            height: "auto!",
            minHeight: "10rem",
            maxWidth: "calc(100% - 8rem)!",
            paddingRight: "2rem!",
            container: "default",
            gap: "0",
            flexWrap: "wrap",
          }}
        >
          <div style="col:default; text-wrap: wrap">{this.#label}</div>
          {!this.readonly && !this.disabled && this.filterable && (
            <input
              ref={(el) => (this.#input = el)}
              type="text"
              onInput={(e) => (this.search = e.target.value)}
              placeholder={this.placeholder}
              onKeyDown={this.#onKeyDown.bind(this)}
              style={{
                col: "auto",
                padding: "0",
                margin: "-2rem 0",
                border: "none",
                background: "none",
              }}
            />
          )}
        </div>
        <Popover
          open={this.open}
          onOutsideClick={(e) => this.#close(e.target)}
          style={{
            ...this.anchor("bottom", { gap: "2rem" }),
            container: "default",
            gap: "1rem",
            padding: "1rem",
            "> *": { col: "full", text: "left" },
            height: "max-content",
            maxHeight: "60rem",
            overflow: "auto",
            width: "min-content",
          }}
          inert
        >
          {this.options?.reduce((result, option) => {
            const { label, value } = normalizeOption(option);
            if (this.filterable && this.search && !label.toLowerCase().includes(this.search.toLowerCase())) return result;
            const selected = (this.multiple ? this.value || [] : [this.value]).includes(value);
            return [
              ...result,
              <Button
                label={label}
                onClick={(e) => (e.stopPropagation(), this.#select(value))}
                style={{
                  variant: "raw",
                  background: selected ? "$fore-color" : "none",
                  color: selected ? "$back-color" : "default",
                }}
              />,
            ];
          }, []) || <span style={{ padding: "1rem", color: "muted" }}>No options</span>}
        </Popover>
      </>
    );
  }
}

export default Select;

function normalizeOption(option) {
  if (typeof option === "string") {
    if (!option) return { label: "None", value: option };
    return { label: option, value: option };
  }
  return option;
}

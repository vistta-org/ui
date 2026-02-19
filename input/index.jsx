import { Component, Ref } from "@vistta/js";
import { assignStyle, getTooltipLabel } from "../utils";
import Rich from "./rich";
import Select from "./select";

/**
 * @typedef {import("../utils").Tooltip} Tooltip
 * @typedef {object} InputProps
 * @property {string} [id]
 * @property {Ref<HTMLInputElement | HTMLTextAreaElement> | ((element: HTMLInputElement | HTMLTextAreaElement) => void)} [ref]
 * @property {JSX.Anchor} [anchor]
 * @property {HTMLInputElement["type"] | "textarea" | "rich" | "richtext" | "select"} [type]
 * @property {"default" | "basic"} [variant]
 * @property {string} [icon]
 * @property {string} [label]
 * @property {string} [name]
 * @property {string} [placeholder]
 * @property {boolean} [required]
 * @property {any} [value]
 * @property {Array<{ label: string; value: any }>} [options]
 * @property {Tooltip} [tooltip]
 * @property {any} [toolbar]
 * @property {Record<string, string>} [style]
 * @property {boolean} [disabled]
 * @property {boolean} [readonly]
 * @property {(event?: any) => any} [onChange]
 * @property {(event?: InputEvent) => any} [onInput]
 */

const TEXT_BASED = ["text", "password", "email", "url", "tel", "search", "textarea", "rich", "richtext"];

/**
 * @extends {Component<InputProps>}
 */
class Input extends Component {
  #node;

  #input() {
    if (this.type === "textarea")
      return (
        <textarea
          ref={Ref.forward(this.ref, (el) => (this.#node = el))}
          id={this.id}
          name={this.name}
          aria-label={this.label}
          placeholder={this.placeholder || " "}
          value={this.value}
          required={this.required}
          disabled={this.disabled}
          readonly={this.readonly}
          onChange={this.onChange}
          onInput={this.onInput}
        />
      );
    if (this.type === "rich" || this.type === "richtext")
      return (
        <Rich
          ref={Ref.forward(this.ref, (el) => (this.#node = el))}
          id={this.id}
          name={this.name}
          label={this.label}
          placeholder={this.placeholder}
          value={this.value}
          toolbar={this.toolbar}
          disabled={this.disabled}
          readonly={this.readonly}
          onChange={this.onChange}
          onInput={this.onInput}
        />
      );
    if (this.type === "select")
      return (
        <Select
          ref={Ref.forward(this.ref, (el) => (this.#node = el))}
          id={this.id}
          name={this.name}
          label={this.label}
          options={this.options}
          value={this.value}
          required={this.required}
          disabled={this.disabled}
          readonly={this.readonly}
          onChange={this.onChange}
          onInput={this.onInput}
        />
      );
    return (
      <input
        ref={Ref.forward(this.ref, (el) => (this.#node = el))}
        id={this.id}
        name={this.name}
        aria-label={this.label}
        type={this.type}
        placeholder={this.placeholder || " "}
        value={this.value}
        required={this.required}
        disabled={this.disabled}
        readonly={this.readonly}
        onChange={this.onChange}
        onInput={this.onInput}
      />
    );
  }

  #focus(event) {
    if (event.target === this.#node || !TEXT_BASED.includes(this.type)) return;
    this.#node?.focus();
  }

  render() {
    return (
      <fieldset
        anchor={this.anchor}
        tooltip={getTooltipLabel(this.tooltip)}
        onClick={(e) => this.#focus(e)}
        style={assignStyle(
          { position: "relative" },
          this.style,
          {
            marginTop:
              this.type !== "checkbox" &&
              this.type !== "radio" &&
              this.label &&
              (this.variant === "basic" ? "7rem" : "2rem"),
            cursor: TEXT_BASED.includes(this.type) && "text",
          },
          this.icon ?? (this.type === "search" && "icon:e8b6"),
        )}
      >
        {this.label ? (
          <label
            style={{
              ...getStyle(this.variant, this.type === "checkbox" || this.type === "radio", this.readonly),
              "> *": {
                borderLeft: "none!",
                margin: "0!",
                padding: "0!",
              },
            }}
            name={this.label}
            for={this.id}
          >
            {this.#input()}
          </label>
        ) : (
          this.#input()
        )}
      </fieldset>
    );
  }
}

export default Input;

function getStyle(variant, isCheckRadio, readonly) {
  const base = {
    content: "attr(name)",
    display: "block",
  };
  if (isCheckRadio)
    return {
      after: {
        ...base,
        paddingLeft: "2rem",
      },
    };

  base.position = "absolute";
  if (variant === "basic")
    return {
      before: {
        ...base,
        left: "2rem",
        top: "-7rem",
      },
    };

  return {
    before: {
      ...base,
      top: readonly ? "-3rem" : "1.5rem",
      left: "1rem",
      padding: "0 1rem",
      fontSize: readonly && "3.5rem",
      transition: "top $duration, font-size $duration",
      backdropFilter: !readonly && "$blur",
    },
    "has(*:not(:placeholder-shown), *:focus)": !readonly && {
      before: {
        top: "-3rem",
        fontSize: "3.5rem",
      },
    },
  };
}

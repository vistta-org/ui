import { Component, Ref } from "@vistta/js";
import { assignStyle, getTooltipLabel } from "../utils";
import Rich from "./rich";
import Select from "./select";

/**
 * @typedef {import("../utils").Tooltip} Tooltip
 * @typedef {object} InputProps
 * @property {string} [id]
 * @property {Ref<HTMLInputElement | HTMLTextAreaElement> | ((element: HTMLInputElement | HTMLTextAreaElement) => void)} [ref]
 * @property {"button" | "checkbox" | "color" | "date" | "datetime-local" | "email" | "file" | "hidden" | "image" | "month" | "number" | "password" | "radio" | "range" | "reset" | "search" | "submit" | "tel" | "text" | "time" | "url" | "week" | "textarea" | "rich" | "richtext" | "select"} [type]
 * @property {"default" | "basic"} [variant]
 * @property {string} [icon]
 * @property {string} [label]
 * @property {string} [name]
 * @property {string} [placeholder]
 * @property {boolean} [hidden]
 * @property {boolean} [required]
 * @property {boolean} [multiple]
 * @property {any} [value]
 * @property {Array<{ label: string; value: any } | string>} [options]
 * @property {Tooltip} [tooltip]
 * @property {any} [toolbar]
 * @property {JSX.Style} [style]
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
          multiple={this.multiple}
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

  #style() {
    if (!this.label) return {};
    if (this.type === "checkbox" || this.type === "radio") return { paddingLeft: "2rem" };
    if (this.variant === "basic")
      return {
        marginTop: "7rem",
        "> label": {
          position: "absolute",
          left: "1rem",
          top: "-7rem",
        },
      };
    return {
      marginTop: "2rem",
      "> label": {
        position: "absolute",
        top: this.readonly ? "-3rem" : "1.5rem",
        left: "1rem",
        padding: "0 1rem",
        fontSize: this.readonly && "3.5rem",
        transition: "top $duration, font-size $duration",
        backdropFilter: !this.readonly && "$blur",
        z: 1,
      },
      "has(input:not(:placeholder-shown), input:focus, div)": !this.readonly && {
        "> label": {
          top: "-3rem",
          fontSize: "3.5rem",
        },
      },
    };
  }

  render() {
    return (
      <fieldset
        tooltip={getTooltipLabel(this.tooltip)}
        onClick={(e) => this.#focus(e)}
        style={assignStyle(
          { position: "relative", cursor: TEXT_BASED.includes(this.type) && "text" },
          this.style,
          this.#style(),
          this.icon ?? (this.type === "search" && "icon:e8b6"),
        )}
        hidden={this.hidden}
      >
        {this.label && <label>{this.label}</label>}
        {this.#input()}
      </fieldset>
    );
  }
}

export default Input;

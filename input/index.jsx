import { Anchor, Component, Ref } from "@vistta/js";
import { Style, getTooltipLabel, style as globalStyle } from "../utils";
import Color from "./color";
import Rich from "./rich";
import Select from "./select";

/**
 * @typedef {import("../utils").Tooltip} Tooltip
 * @typedef {import("./color").ColorProps} ColorProps
 * @typedef {import("./select").SelectProps} SelectProps
 * @typedef {import("./rich").RichProps} RichProps
 *
 * @typedef {{
 *  variant?: "default" | "basic",
 *  icon?: string,
 *  label?: string,
 *  hidden?: boolean,
 *  tooltip?: Tooltip,
 *  style?: JSX.Style,
 * }} FieldsetProps
 *
 * @typedef {"button" | "date" | "datetime-local" | "email" | "file" | "hidden" | "image" | "month" | "number" | "password" | "range" | "reset" | "search" | "submit" | "tel" | "text" | "time" | "url" | "week"} BaseInputs
 *
 * @typedef {{
 *  id?: string,
 *  ref?: Ref<HTMLInputElement | HTMLTextAreaElement> | ((element: HTMLInputElement | HTMLTextAreaElement) => void),
 *  name?: string,
 *  placeholder?: string,
 *  required?: boolean,
 *  value?: any,
 *  disabled?: boolean,
 *  readonly?: boolean,
 *  onChange?: (event?: any) => any,
 *  onInput?: (event?: any) => any,
 * }} BaseInputProps
 *
 * @typedef {BaseInputProps & FieldsetProps & { type?: BaseInputs | "textarea" }} StandardInputProps
 * @typedef {BaseInputProps & FieldsetProps & { type?: "number", min?: string | number, max?: string | number }} NumberInputProps
 * @typedef {BaseInputProps & Omit<FieldsetProps, "variant"> & { type?: "checkbox" | "radio", variant?: "default" | "inverted" | "primary" | "primary inverted", indeterminate?: boolean }} CheckInputProps
 * @typedef {BaseInputProps & Omit<FieldsetProps, "variant"> & { type?: "switch" | "toggle", variant?: "default" | "inverted" | "primary" | "primary inverted" }} ToggleInputProps
 * @typedef {SelectProps & FieldsetProps & { type: "select" }} SelectInputProps
 * @typedef {RichProps & FieldsetProps & { type: "rich" | "richtext" }} RichInputProps
 * @typedef {Omit<ColorProps, "variant"> & Omit<FieldsetProps, "variant"> & { type: "color", variant?: ColorProps["variant"] }} ColorInputProps
 * @typedef {StandardInputProps | NumberInputProps | CheckInputProps | ToggleInputProps | SelectInputProps | RichInputProps | ColorInputProps} InputProps
 */

const TEXT_BASED = ["text", "password", "email", "url", "tel", "search", "textarea", "rich", "richtext"];

/**
 * @extends {Component<InputProps>}
 */
class Input extends Component {
  #node;
  anchor = new Anchor();

  static set style(value) {
    globalStyle.update("input", value);
  }

  static get style() {
    return globalStyle.value?.input || {};
  }

  globalStyle = globalStyle();

  onConnect() {
    // @ts-ignore - narrowed by type check above
    if ((this.type === "checkbox" || this.type === "radio") && this.indeterminate) this.#node.indeterminate = true;
  }

  onUpdate() {
    // @ts-ignore - narrowed by type check above
    if ((this.type === "checkbox" || this.type === "radio") && this.indeterminate !== this.#node.indeterminate) {
      // @ts-ignore - narrowed by type check above
      this.#node.indeterminate = this.indeterminate;
    }
  }

  #input() {
    if (this.type === "textarea")
      return (
        <textarea
          ref={Ref.forward(this.ref, (el) => (this.#node = el))}
          id={this.id}
          name={this.name}
          aria-label={this.label}
          // @ts-ignore - narrowed by type check above
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
          // @ts-ignore - narrowed by type check above
          placeholder={this.placeholder}
          value={this.value}
          // @ts-ignore - narrowed by type check above
          format={this.format}
          required={this.required}
          disabled={this.disabled}
          readonly={this.readonly}
          onChange={this.onChange}
          onInput={this.onInput}
        />
      );
    if (this.type === "color")
      return (
        <Color
          ref={Ref.forward(this.ref, (el) => (this.#node = el))}
          anchor={this.anchor}
          id={this.id}
          name={this.name}
          value={this.value}
          // @ts-ignore - narrowed by type check above
          variant={this.variant}
          // @ts-ignore - narrowed by type check above
          presets={this.presets}
          // @ts-ignore - narrowed by type check above
          recent={this.recent}
          required={this.required}
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
          // @ts-ignore - narrowed by type check above
          anchor={this.anchor}
          id={this.id}
          name={this.name}
          // @ts-ignore - narrowed by type check above
          placeholder={this.placeholder}
          // @ts-ignore - narrowed by type check above
          options={this.options}
          // @ts-ignore - narrowed by type check above
          multiple={this.multiple}
          // @ts-ignore - narrowed by type check above
          filterable={this.filterable}
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
        type={this.type === "switch" || this.type === "toggle" ? "checkbox" : this.type}
        role={this.type === "switch" || this.type === "toggle" ? this.type : undefined}
        // @ts-ignore - narrowed by type check above
        placeholder={this.placeholder || " "}
        value={
          this.type === "checkbox" || this.type === "radio" || this.type === "switch" || this.type === "toggle"
            ? undefined
            : this.value
        }
        checked={
          this.type === "checkbox" || this.type === "radio" || this.type === "switch" || this.type === "toggle"
            ? this.value
            : undefined
        }
        required={this.required}
        disabled={this.disabled}
        readonly={this.readonly}
        onChange={this.onChange}
        onInput={this.onInput}
      />
    );
  }

  #focus(event) {
    if (event.target === this.#node) return;
    if (TEXT_BASED.includes(this.type)) this.#node?.focus();
    if (
      this.type === "select" ||
      this.type === "color" ||
      this.type === "checkbox" ||
      this.type === "radio" ||
      this.type === "switch" ||
      this.type === "toggle"
    )
      this.#node?.click();
  }

  get #style() {
    const style = {
      position: "relative",
      background: this.readonly ? "none" : "light-dark(shade($back-color, 5%), shade($back-color, 25%))",
      container: "default",
      alignItems: this.type !== "rich" && this.type !== "richtext" && "center",
      gap: "0",
      border: this.readonly ? "none" : "default",
      radius: "rounded",
      cursor: TEXT_BASED.includes(this.type) && "text",
      $placeholderColor: "transparent",
      ":has(input:focus, textarea:focus, [role=input]:focus, [role=select][aria-expanded])": {
        $placeholderColor: "shade($neutral-color, 35%)",
      },
      ":has([role=select])": {
        cursor: "pointer",
      },
      "input:placeholder, textarea:placeholder, [role=input]:before": {
        color: "$placeholder-color",
        transition: "color $duration",
      },
    };

    if (this.icon !== "") {
      style[":before"] = {
        color: "$placeholder-color",
        width: "6rem",
        height: "6rem",
        margin: "0 0 0 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "color $duration",
      };
      if (this.type === "search") style.icon = this.icon || "e8b6";
      else if (this.type === "select") {
        style[":before"] = {
          ...style[":before"],
          color: "$fore-color",
          margin: "0 2rem 0 0",
          order: 99,
        };
        style.icon = this.icon || "e5c5";
      } else style.icon = this.icon;
    }

    const input = /** @type {JSX.Style} */ (
      style["> input, > textarea, > [role=input], > [role=select]"] = {
        col: "default",
        border: "none",
        background: "inherit",
        color: "inherit",
      }
    );

    if (this.type === "radio" || this.type === "checkbox" || this.type === "switch" || this.type === "toggle") {
      style.padding = "0";
      style.border = "none";
      style.background = "none";

      input.col = "auto";
      input[this.variant !== "inverted" && this.variant !== "primary inverted" ? "margin-left" : "margin-right"] = "1rem";
      if (this.variant === "inverted" || this.variant === "primary inverted") input.order = "-1";
      if (this.label) {
        style["> label"] = { width: "auto", background: "transparent", userSelect: "none" };
      }

      if (this.type === "radio" || this.type === "checkbox") {
        input.accentColor =
          this.variant === "primary" || this.variant === "primary inverted" ? "$primary-color" : "$fore-color";
        input.scale = "1.35";
      } else {
        input.appearance = "none";
        input.width = "10rem";
        input.height = "5.5rem";
        input.padding = "0.5rem";
        input.borderRadius = "3rem";
        input.background = "shade($neutral-color, 35%)";
        input.cursor = this.disabled ? "default" : "pointer";
        input.opacity = this.disabled ? "0.8" : "1";
        input.transition = "background $duration ease-in-out";
        input["&:checked"] = {
          background: this.variant === "primary" || this.variant === "primary inverted" ? "$primary-color" : "$fore-color",
        };
        input["&:before"] = {
          content: "''",
          display: "block",
          width: "4.5rem",
          height: "4.5rem",
          borderRadius: "50%",
          background: "$back-color",
          opacity: this.disabled ? "0.8" : "1",
          transform: "translateX(0)",
          transition: "transform $duration ease-in-out",
        };
        input["&:checked::before"] = {
          transform: "translateX(4.5rem)",
        };
      }
    } else if (this.label) {
      const animate = !(this.variant === "basic" || this.readonly || this.type === "color");
      input.padding = "2rem 4rem";
      input.marginTop = "4rem";
      input.height = "10rem";
      style["> label"] = {
        position: "absolute",
        top: !animate ? ".5rem" : "4rem",
        left: "1rem",
        width: "calc(100% - 2rem)",
        padding: "0 1rem",
        fontSize: !animate && "3rem",
        transition: "top $duration, font-size $duration",
        background: "transparent",
        backdropFilter: !this.readonly && "$blur",
        pointerEvents: "none",
        z: 1,
      };
      if (animate) {
        style[
          ":has(input:not(:placeholder-shown), input:focus, textarea:not(:placeholder-shown), textarea:focus, [role=input]:not(:empty), [role=input]:focus, [role=select][aria-selected], [role=select][aria-expanded]) > label"
        ] = {
          top: ".5rem",
          fontSize: "3rem",
        };
      }
    }
    return style;
  }

  render() {
    return (
      <fieldset
        ref={this.anchor}
        tooltip={getTooltipLabel(this.tooltip)}
        onClick={(e) => this.#focus(e)}
        style={Style.assign(
          this.#style,
          this.globalStyle.input || {},
          this.style,
          this.readonly && {
            pointerEvents: "none",
          },
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

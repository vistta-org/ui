import { Anchor, Component, Ref } from "@vistta/js";
import { Style, getTooltipLabel } from "../utils";
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
 * @typedef {BaseInputProps & Omit<FieldsetProps, "variant"> & { type?: "checkbox" | "radio" | "switch", variant?: "default" | "inverted" }} CheckInputProps
 * @typedef {SelectProps & FieldsetProps & { type: "select" }} SelectInputProps
 * @typedef {RichProps & FieldsetProps & { type: "rich" | "richtext" }} RichInputProps
 * @typedef {ColorProps & FieldsetProps & { type: "color" }} ColorInputProps
 * @typedef {StandardInputProps | CheckInputProps | SelectInputProps | RichInputProps | ColorInputProps} InputProps
 */

const TEXT_BASED = ["text", "password", "email", "url", "tel", "search", "textarea", "rich", "richtext"];

/**
 * @extends {Component<InputProps>}
 */
class Input extends Component {
  #node;
  anchor = new Anchor();

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
        type={this.type === "switch" ? "checkbox" : this.type}
        role={this.type === "switch" ? "switch" : undefined}
        placeholder={this.placeholder || " "}
        value={this.type === "checkbox" || this.type === "radio" || this.type === "switch" ? undefined : this.value}
        checked={this.type === "checkbox" || this.type === "radio" || this.type === "switch" ? this.value : undefined}
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
    if (this.type === "select" || this.type === "color" || this.type === "checkbox" || this.type === "radio" || this.type === "switch")
      this.#node?.click();
  }

  get #iconStyle() {
    if (this.icon !== "") {
      const style = {
        ":before": {
          color: "$placeholder-color",
          width: "6rem",
          height: "6rem",
          margin: "0 0 0 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "color $duration",
        },
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
      return style;
    }
    return {};
  }

  get #labelStyle() {
    if (!this.label) return {};
    if (this.type === "checkbox" || this.type === "radio" || this.type === "switch")
      return {
        "> label": { width: "auto", background: "transparent", userSelect: "none" },
      };
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
        top: this.readonly ? "-3rem" : "2rem",
        left: "1rem",
        width: "auto",
        padding: "0 1rem",
        fontSize: this.readonly && "3.5rem",
        transition: "top $duration, font-size $duration",
        background: "transparent",
        backdropFilter: !this.readonly && "$blur",
        pointerEvents: "none",
        z: 1,
      },
      ":has(input:not(:placeholder-shown), input:focus, [role=input]:not(:empty), [role=input]:focus, [role=select][aria-selected], [role=select][aria-expanded])":
        !this.readonly && {
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
        ref={this.anchor}
        tooltip={getTooltipLabel(this.tooltip)}
        onClick={(e) => this.#focus(e)}
        style={Style.assign(
          {
            position: "relative",
            background: this.readonly ? "none" : "light-dark(shade($back-color, 5%), shade($back-color, 25%))",
            container: "default",
            alignItems: this.type !== "rich" && this.type !== "richtext" && "center",
            gap: "0",
            border: this.readonly ? "none" : "default",
            radius: "rounded",
            cursor: TEXT_BASED.includes(this.type) && "text",
            ...(this.type === "radio" || this.type === "checkbox" || this.type === "switch"
              ? {
                  background: "none",
                  border: "none",
                  padding: "0",
                }
              : {}),
            $placeholderColor: "transparent",
            ...this.#iconStyle,
            ":has(input:focus, [role=input]:focus, [role=select][aria-expanded])": {
              $placeholderColor: "shade($neutral-color, 35%)",
            },
            ":has([role=select])": {
              cursor: "pointer",
            },
            "> input, > [role=input], > [role=select]": {
              col: "default",
              border: "none",
              background: "inherit",
              color: "inherit",
              ...(this.type === "radio" || this.type === "checkbox"
                ? {
                    col: "auto",
                    [this.variant !== "inverted" ? "margin-left" : "margin-right"]: "1rem",
                    order: this.variant === "inverted" && "-1",
                    scale: "1.5",
                  }
                : {}),
              ...(this.type === "switch"
                ? {
                    col: "auto",
                    [this.variant !== "inverted" ? "margin-left" : "margin-right"]: "1rem",
                    order: this.variant === "inverted" && "-1",
                    appearance: "none",
                    width: "10rem",
                    height: "5.5rem",
                    padding: "0.5rem",
                    borderRadius: "3rem",
                    background: "shade($neutral-color, 35%)",
                    cursor: "pointer",
                    transition: "background $duration ease-in-out",
                    "&:checked": {
                      background: "$primary-color",
                    },
                    "&::before": {
                      content: "''",
                      display: "block",
                      width: "4.5rem",
                      height: "4.5rem",
                      borderRadius: "50%",
                      background: "$back-color",
                      transform: "translateX(0)",
                      transition: "transform $duration ease-in-out",
                    },
                    "&:checked::before": {
                      transform: "translateX(4.5rem)",
                    },
                  }
                : {}),
            },
            "input:placeholder, [role=input]:before": {
              color: "$placeholder-color",
              transition: "color $duration",
            },
          },
          this.style,
          this.#labelStyle,
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

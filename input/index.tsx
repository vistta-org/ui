import { Component, Ref } from "@vistta/js";
import { getTooltipLabel, type Tooltip } from "../utils";
import Rich from "./rich";
import Select from "./select";
import style from "./style.scss";

class Input extends Component {
  type:
    | "text"
    | "number"
    | "email"
    | "password"
    | "tel"
    | "url"
    | "date"
    | "time"
    | "datetime-local"
    | "month"
    | "week"
    | "color"
    | "file"
    | "textarea"
    | "rich"
    | "richtext"
    | "select"
    | "checkbox"
    | "search" = "text";
  id?: string;
  ref?: Ref<HTMLInputElement | HTMLTextAreaElement> | ((element: HTMLInputElement | HTMLTextAreaElement) => void);
  anchor?: string;
  className?: string;
  icon?: string;
  label?: string;
  name?: string;
  placeholder?: string;
  value?: any;
  options?: Array<{ label: string; value: any }>;
  tooltip?: Tooltip;
  toolbar?: any;
  style?: Record<string, string>;
  disabled?: boolean;
  readonly?: boolean;
  onChange?: (event?: any) => any;
  onInput?: (event?: InputEvent) => any;

  getClassName() {
    const className = this.className?.split(" ") || [];
    if (this.type !== "checkbox") className.unshift("input");
    if (typeof this.tooltip === "object" && this.tooltip.position) className.push(`tooltip:${this.tooltip.position}`);
    return className.join(" ");
  }

  getIcon() {
    if (this.type === "search") return "\ue8b6";
    return this.icon;
  }

  getInputComponent() {
    if (this.type === "textarea")
      return (
        <textarea
          ref={this.ref}
          id={this.id}
          name={this.name}
          aria-label={this.label}
          placeholder={this.placeholder || " "}
          value={this.value}
          disabled={this.disabled}
          readonly={this.readonly}
          onChange={this.onChange}
          onInput={this.onInput}
        />
      );
    if (this.type === "rich" || this.type === "richtext")
      return (
        <Rich
          ref={this.ref}
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
          ref={this.ref}
          id={this.id}
          name={this.name}
          label={this.label}
          options={this.options}
          value={this.value}
          disabled={this.disabled}
          readonly={this.readonly}
          onChange={this.onChange}
          onInput={this.onInput}
        />
      );
    return (
      <input
        ref={this.ref}
        id={this.id}
        name={this.name}
        aria-label={this.label}
        type={this.type}
        placeholder={this.placeholder || " "}
        value={this.value}
        disabled={this.disabled}
        readonly={this.readonly}
        onChange={this.onChange}
        onInput={this.onInput}
      />
    );
  }

  render() {
    return (
      <div
        anchor={this.anchor}
        className={this.getClassName()}
        data-icon={this.getIcon()}
        data-tooltip={getTooltipLabel(this.tooltip)}
        style={this.style}
        {...style}
      >
        {this.label && <label for={this.id}>{this.label}</label>}
        {this.getInputComponent()}
      </div>
    );
  }
}

export default Input;

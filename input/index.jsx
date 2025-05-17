import { Component } from "@vistta/js";
import Select from "./select";
import Rich from "./rich";
import style from "./style.scss";
import { getTooltipLabel } from "../utils";

class Input extends Component {
  getClassName() {
    const className = this.className?.split(" ") || [];
    if (this.type !== "checkbox") className.unshift("input");
    if (typeof this.tooltip === "object" && this.tooltip.position)
      className.push(`tooltip:${this.tooltip.position}`);
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
          onChange={this.onChange}
          onInput={this.onInput}
        />
      );
    if (this.type === "rich")
      return (
        <Rich
          ref={this.ref}
          id={this.id}
          name={this.name}
          label={this.label}
          placeholder={this.placeholder}
          value={this.value}
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
        onChange={this.onChange}
        onInput={this.onInput}
      />
    );
  }

  render() {
    return (
      <div
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

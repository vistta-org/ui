import { Anchor, Component, Ref } from "@vistta/js";
import Popover from "../../popover";

class Select extends Component {
  open = false;
  anchor = new Anchor();

  get #options() {
    return (Array.isArray(this.options) ? this.options : [])
      .map((option) => {
        if (typeof option === "string") return { label: option, value: option, key: String(option) };
        if (option && typeof option === "object") {
          const value = option.value;
          return {
            label: option.label || String(value),
            value,
            key: String(value),
          };
        }
        return null;
      })
      .filter(Boolean);
  }

  get #selected() {
    return new Set(
      (Array.isArray(this.value) ? this.value : this.value != null ? [this.value] : []).map((item) => String(item)),
    );
  }

  #register(element) {
    Object.defineProperty(element, "value", {
      set(value) {
        if (this.multiple && !Array.isArray(value)) value = [value];
        if (!this.multiple && Array.isArray(value)) value = value[0];
        this.value = value;
      },
      get() {
        const nextKeys = new Set();
        for (let i = 0; i < element.selectedOptions.length; i++) nextKeys.add(element.selectedOptions[i].value);
        return Array.from(nextKeys);
      },
    });
  }

  render() {
    const options = this.#options;
    if (!this.multiple) {
      const children = [<option hidden />];
      for (let i = 0; i < options.length; i++) {
        const option = options[i];
        children.push(
          <option value={option.value} selected={String(option.value) === String(this.value)}>
            {option.label}
          </option>,
        );
      }

      return (
        <select
          ref={this.ref}
          id={this.id}
          name={this.name}
          aria-label={this.label}
          onChange={this.onChange}
          onInput={this.onInput}
          required={this.required}
          disabled={this.disabled}
          readonly={this.readonly}
          multiple={false}
        >
          {children}
        </select>
      );
    }

    return (
      <div ref={this.anchor} style={{ position: "relative", width: "100%" }}>
        <div
          role="select"
          aria-label={this.label}
          aria-haspopup="listbox"
          aria-expanded={this.open}
          disabled={this.disabled || this.readonly}
          onClick={() => {
            this.open = !this.open;
          }}
          style={{
            width: "100%",
            text: "left",
            overflow: "hidden",
            "text-overflow": "ellipsis",
            "white-space": "nowrap",
            cursor: this.disabled || this.readonly ? "default" : "pointer",
          }}
        >
          {selectedToLabel(options.filter((option) => this.#selected.has(option.key)).map((option) => option.label)) ||
            this.placeholder ||
            "Select options"}
        </div>

        <Popover
          open={this.open && !this.disabled && !this.readonly}
          onOutsideClick={() => (this.open = false)}
          style={{
            inset: `${this.anchor("bottom", "2rem")} auto auto ${this.anchor("x")}`,
            width: `${this.anchor("width")}`,
            padding: "0",
            border: "default",
            container: "default",
            maxHeight: "32rem",
            overflow: "auto",
          }}
        >
          <select
            ref={Ref.forward(this.ref, this.#register.bind(this))}
            multiple
            id={this.id}
            name={this.name}
            required={this.required}
            disabled={this.disabled}
            readonly={this.readonly}
            size={Math.min(Math.max(options.length, 4), 8)}
            aria-label={this.label}
            onInput={(event) => {
              const nextKeys = new Set();
              for (let i = 0; i < event.target.selectedOptions.length; i++) {
                nextKeys.add(event.target.selectedOptions[i].value);
              }
              this.value = options.filter((item) => nextKeys.has(item.key)).map((item) => item.value);
              this.onInput?.(event);
              this.onChange?.(event);
            }}
            onKeyDown={(event) => event.key === "Escape" && (this.open = false)}
            style={{
              width: "100%",
              padding: "0.5rem",
              margin: "0!",
            }}
          >
            {options.map((option) => (
              <option value={option.key} selected={this.#selected.has(option.key)}>
                {option.label}
              </option>
            ))}
          </select>
        </Popover>
      </div>
    );
  }
}

export default Select;

function selectedToLabel(values) {
  if (!values || values.length === 0) return null;
  return values.join(", ");
}

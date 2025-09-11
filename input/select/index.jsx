import { Component } from "@vistta/js";

class Select extends Component {
  render() {
    const children = [<option class="hidden" />];
    for (let i = 0; i < this.options.length; i++) {
      const option = this.options[i];
      switch (typeof option) {
        case "string":
          children.push(
            <option value={option} selected={option === this.value}>
              {option}
            </option>,
          );
          break;
        case "object":
          children.push(
            <option value={option.value} selected={option.value === this.value}>
              {option.label || option.value}
            </option>,
          );
          break;
        default:
          break;
      }
    }
    return (
      <select
        ref={this.ref}
        id={this.id}
        name={this.name}
        aria-label={this.label}
        onChange={this.onChange}
        onInput={this.onInput}
      >
        {children}
      </select>
    );
  }
}

export default Select;

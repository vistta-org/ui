import { Component } from "@vistta/js";

class Button extends Component {
  className = "";
  label;
  icon;
  onClick;
  type;
  variant;
  action;

  render() {
    const classes = this.className.split(" ");
    if (this.type) classes.push(this.type);
    if (this.variant) classes.push(this.variant);
    if (this.action) classes.push("action");

    return (
      <button
        className={classes.join(" ")}
        data-icon={this.icon}
        onClick={this.onClick}
        aria-label={this.label}
        name={this.label}
      >
        {!this.action && this.label}
      </button>
    );
  }
}

export default Button;

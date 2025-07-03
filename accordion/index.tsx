import { Component, Ref } from "@vistta/js";
import style from "./style.scss";

export type AccordionSection = {
  key: string;
  title: string | JSX.Element;
  content: string | JSX.Element;
  active?: boolean;
};

class Accordion extends Component {
  ref?: Ref<HTMLDivElement>;
  id?: string;
  sections: AccordionSection[];
  className?: string;
  style?: Record<string, string>;
  openIcon?: string = "\ue316";
  closeIcon?: string = "\ue313";
  iconPosition?: "left" | "right";
  allowMultipleOpen?: boolean = false;

  onConnect() {
    if (!this.allowMultipleOpen) {
      let preventActive = false;
      const sections = [...this.sections];
      for (let i = 0, len = sections.length; i < len; i++) {
        if (!sections[i].active) continue;
        if (preventActive) sections[i].active = false;
        else preventActive = true;
      }
      this.sections = sections;
    }
  }

  getClassName() {
    const className = this.className?.split(" ") || [];
    className.unshift("accordion");
    return className.join(" ");
  }

  toggleSection(key) {
    const sections = [...this.sections];
    for (let i = 0, len = sections.length; i < len; i++) {
      if (sections[i].key === key) {
        sections[i].active = !sections[i].active;
      } else if (!this.allowMultipleOpen) sections[i].active = false;
    }
    this.sections = sections;
  }

  render() {
    return (
      <div
        ref={this.ref}
        id={this.id}
        className={this.getClassName()}
        style={this.style}
        {...style}
      >
        {this.sections.map(
          ({ key, title, content, active }) =>
            key &&
            title &&
            content && (
              <div key={key} className="section">
                <div
                  className="header container p:2 border:bottom"
                  onClick={() => this.toggleSection(key)}
                >
                  {this.iconPosition === "left" && (
                    <span data-icon={active ? this.closeIcon : this.openIcon} />
                  )}
                  {title}
                  {(!this.iconPosition || this.iconPosition === "right") && (
                    <span
                      className="ml:auto"
                      data-icon={active ? this.closeIcon : this.openIcon}
                    />
                  )}
                </div>
                {active && (
                  <div className="content container p:2">{content}</div>
                )}
              </div>
            )
        )}
      </div>
    );
  }
}

export default Accordion;

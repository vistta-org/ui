import { Component, Ref } from "@vistta/js";
import { htmlToMarkdown, markdownToHtml } from "../../utils";

class Rich extends Component {
  #timer;
  #element;

  #onChangeAdapter(event) {
    if (!this.#element) return;
    this.onInput?.(event);
    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => this.#element.dispatchEvent(new Event("change")), 250);
  }

  #register(element) {
    this.#element = element;
    Object.defineProperties(element, {
      value: {
        get: () => htmlToMarkdown(element.innerHTML),
        set: (value) => (element.innerHTML = markdownToHtml(value)),
        configurable: false,
      },
    });
  }

  render() {
    return (
      <>
        <div
          ref={Ref.forward(this.ref, this.#register.bind(this))}
          id={this.id}
          placeholder={this.placeholder}
          name={this.name}
          aria-label={this.label}
          value={this.value}
          onInput={(e) => this.#onChangeAdapter(e)}
          onChange={this.onChange}
          disabled={this.disabled}
          readonly={this.readonly}
          role="input"
          contentEditable={!(this.disabled || this.readonly)}
          style={{
            listStylePosition: "inside",
          }}
        />
      </>
    );
  }
}

export default Rich;

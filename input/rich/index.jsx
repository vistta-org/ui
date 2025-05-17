import { Component, Ref } from "@vistta/js";

class Rich extends Component {
  #timer;

  onChangeAdapter(event) {
    this.onInput?.(event);
    clearTimeout(this.#timer);
    this.#timer = setTimeout(
      () => event.target.dispatchEvent(new Event("change")),
      250
    );
  }

  setElementProperties(element) {
    Object.defineProperty(element, "value", {
      get: () => element.innerText,
      set: (value) => element.innerText = value,
    });
    if (!this.ref) return;
    if (typeof this.ref === "function") this.ref(element);
    else if (this.ref instanceof Ref) this.ref.node = element;
  }

  render() {
    return (
      <div
        id={this.id}
        placeholder={this.placeholder}
        name={this.name}
        ref={e => this.setElementProperties(e)}
        aria-label={this.label}
        value={this.value}
        onInput={e => this.onChangeAdapter(e)}
        onChange={this.onChange}
        contentEditable
      ></div>
    );
  }
}

export default Rich;

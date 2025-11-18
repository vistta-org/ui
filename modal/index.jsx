import { Component, Ref } from "@vistta/js";

/**
 * @typedef {{
 *   id?: string,
 *   ref?: Ref<HTMLButtonElement> | ((element: HTMLButtonElement) => void),
 *   anchor?: any,
 *   open?: boolean,
 *   style?: JSX.Style;
 *   onClose?: () => void;
 * }} ButtonProps
 */

/**
 * @extends {Component<ButtonProps>}
 */
class Modal extends Component {
  id;
  ref;
  style;
  open;
  onClose;

  register(element) {
    if (this.open) requestAnimationFrame(() => element.showModal());
    element.show = () => ((this.open = false), element.showModal());
    const close = element.close?.bind?.(element);
    element.close = () => ((this.open = false), close());
    element.addEventListener("close", () => {
      if (this.onClose) this.onClose();
    });
  }

  render() {
    if (!this.open) return null;
    return (
      <dialog ref={Ref.forward(this.ref, this.register.bind(this))} id={this.id} style={this.style}>
        {this.children}
      </dialog>
    );
  }
}

export default Modal;

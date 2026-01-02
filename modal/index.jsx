import { Component, Ref } from "@vistta/js";
import Button from "../button/index.jsx";
import { assignStyle } from "../utils.js";

/**
 * @typedef {import("../button/index.jsx").ButtonProps} ButtonProps
 * @typedef {object} ModalProps
 * @property {string} [id]
 * @property {Ref<HTMLButtonElement> | ((element: HTMLButtonElement) => void)} [ref]
 * @property {any} [anchor]
 * @property {boolean} [open]
 * @property {boolean} [inert]
 * @property {string | undefined} [title]
 * @property {ButtonProps[]} [actions]
 * @property {JSX.Style} [style]
 * @property {() => void} [onClose]
 */

/**
 * @extends {Component<ModalProps>}
 */
class Modal extends Component {
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
      <dialog
        ref={Ref.forward(this.ref, this.register.bind(this))}
        id={this.id}
        anchor={this.anchor}
        inert={this.inert}
        style={assignStyle({ container: "center", animate: "fade" }, this.style)}
      >
        {this.title && <h3 style="col:full; p:2rem; border:bottom">{this.title}</h3>}
        {this.children}
        {this.actions && this.actions.length > 0 && (
          <div style="col:full; container:end; gap:inherit;">
            {this.actions.map((action) => (
              <Button {...action} />
            ))}
          </div>
        )}
      </dialog>
    );
  }
}

export default Modal;

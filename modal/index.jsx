import { Component, Ref } from "@vistta/js";
import Button from "../button/index.jsx";
import { Style } from "../utils.js";

const HANDLED_PROPS = ["ref", "open", "title", "actions", "style", "onClose"];

/**
 * @typedef {import("../button/index.jsx").ButtonProps} ButtonProps
 * @typedef {Omit<JSX.EventHandlers, "onClose"> & {
 *  id?: string,
 *  ref?: Ref<HTMLDialogElement> | ((element: HTMLDialogElement) => void),
 *  open?: boolean,
 *  inert?: boolean,
 *  title?: string | undefined,
 *  actions?: ButtonProps[],
 *  style?: JSX.Style,
 *  onClose?: () => void,
 * }} ModalProps
 */

/**
 * @extends {Component<ModalProps>}
 */
class Modal extends Component {
  #node;
  #close;

  #register(element) {
    this.#node = element;
    if (this.open) requestAnimationFrame(() => this.#node.isConnected && this.#node.showModal());
    element.show = () => (this.open = true);
    this.#close = element.close?.bind?.(element);
    element.close = () => (this.open = false);
    element.addEventListener("close", () => {
      if (this.onClose) this.onClose();
    });
  }

  onUpdate(prev) {
    if (prev.open === this.open) return;
    if (this.open) {
      Style.stopExit(this.#node);
      this.#node?.showModal();
    } else Style.waitForExit(this.#node).then(() => this.#close());
  }

  render() {
    return (
      <dialog
        ref={Ref.forward(this.ref, this.#register.bind(this))}
        style={Style.assign(
          {
            container: "center",
            width: "fit-content",
            "max-width": "min(600px, calc(100vw - 8rem))",
            p: "4rem",
            gap: "4rem",
            animate: "fade",
          },
          this.style,
        )}
        {...this.props(...HANDLED_PROPS)}
      >
        {this.title && <h5 style="col:full; mb:2rem; p:0 2rem 2rem; border:bottom">{this.title}</h5>}
        {this.children}
        {this.actions && this.actions.length > 0 && (
          <div style="col:full; container:end; gap:inherit;">
            {this.actions.reduce((acc, action) => {
              if (action) acc.push(<Button {...action} />);
              return acc;
            }, [])}
          </div>
        )}
      </dialog>
    );
  }
}

export default Modal;

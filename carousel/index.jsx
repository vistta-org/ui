import { Component, Ref } from "@vistta/js";
import Button from "../button";
import { Style } from "../utils";

/**
 * @typedef {object} CarouselProps
 * @property {string} [id]
 * @property {Ref<HTMLElement> | ((element: HTMLElement) => void)} [ref]
 * @property {JSX.Style} [style]
 * @property {JSX.Element[] | ((active: any, offset: number) => JSX.Element)} [items] - Array of elements (fixed mode) or a function returning the element at a given offset from active (virtual mode).
 * @property {any} [active] - The currently active item (index for fixed mode, any value for virtual mode).
 * @property {"all" | "gesture" | "none"} [controls] - Navigation controls mode. Defaults to "all".
 * @property {number} [renderOffset] - How many panels away from active to render. Defaults to 1.
 * @property {(event: Event & { item: any, index: number }) => void} [onChange] - Called when the active item changes via navigation.
 */

/**
 * @extends {Component<CarouselProps>}
 */
export default class Carousel extends Component {
  #body;
  #main;
  items = undefined;
  /** @type {"all" | "gesture" | "none"} */
  controls = "all";

  get #isVirtual() {
    return typeof this.items === "function";
  }

  get index() {
    if (this.#isVirtual) return 0;
    return this.active ?? 0;
  }

  #itemAt(offset) {
    if (this.#isVirtual) return this.items(this.active, offset) ?? null;
    const item = this.items[this.index + offset];
    return item != null ? item : null;
  }

  itemAt(offset) {
    return this.#itemAt(offset);
  }

  get hasPrev() {
    return this.#itemAt(-1) != null;
  }

  get hasNext() {
    return this.#itemAt(1) != null;
  }

  register(element) {
    this.#main = element;
    element.next = this.next.bind(this);
    element.previous = this.previous.bind(this);
    element.focus?.();
  }

  registerBody(body) {
    this.#body = body;
    const init = () => {
      const count = this.#isVirtual ? 3 : Array.isArray(this.items) ? this.items.length : 0;
      if (!body.clientWidth || !count) return false;
      body.scrollLeft = this.#isVirtual ? body.clientWidth : this.index * body.clientWidth;
      return true;
    };
    if (init()) return;
    const observer = new ResizeObserver(() => init() && observer.disconnect());
    observer.observe(body);
  }

  #navigate(direction) {
    const item = this.#itemAt(direction);
    if (item == null) return;
    const event = /** @type {any} */ (new CustomEvent("change", { cancelable: true }));
    event.item = item;
    event.index = this.index + direction;
    this.#main?.dispatchEvent(event);
    if (event.defaultPrevented) return;
    this.active = this.#isVirtual ? item : event.index;
  }

  onScrollEnd({ target: body }) {
    if (this.#isVirtual) {
      const page = Math.round(body.scrollLeft / body.clientWidth);
      if (page === 1) return;
      this.#navigate(page === 0 ? -1 : 1);
      body.scrollTo({ left: body.clientWidth, behavior: "instant" });
    } else {
      const page = Math.round(body.scrollLeft / body.clientWidth);
      if (page === this.index) return;
      const item = this.items[page];
      if (item == null) return;
      const event = /** @type {any} */ (new CustomEvent("change", { cancelable: true }));
      event.item = item;
      event.index = page;
      this.#main?.dispatchEvent(event);
      if (event.defaultPrevented) {
        body.scrollTo({ left: this.index * body.clientWidth, behavior: "instant" });
        return;
      }
      this.active = page;
    }
  }

  next() {
    if (!this.#body || !this.hasNext) return;
    if (this.#isVirtual) {
      this.#body.scrollTo({ left: this.#body.clientWidth * 2, behavior: "smooth" });
    } else {
      this.#body.scrollTo({ left: (this.index + 1) * this.#body.clientWidth, behavior: "smooth" });
    }
  }

  previous() {
    if (!this.#body || !this.hasPrev) return;
    if (this.#isVirtual) {
      this.#body.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      this.#body.scrollTo({ left: (this.index - 1) * this.#body.clientWidth, behavior: "smooth" });
    }
  }

  #onKeyDown(e) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      this.previous();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      this.next();
    }
  }

  render() {
    return (
      <div
        ref={Ref.forward(this.ref, this.register.bind(this))}
        id={this.id}
        tabIndex={0}
        onChange={this.onChange}
        onKeyDown={this.#onKeyDown.bind(this)}
        style={Style.assign(
          { position: "relative", height: "100%", width: "100%", outline: "none", overflow: "clip" },
          this.style,
        )}
      >
        <div
          ref={this.registerBody.bind(this)}
          style={{
            position: "relative",
            height: "100%",
            width: "100%",
            display: "flex",
            flexWrap: "nowrap",
            overflow: "auto clip",
            scrollSnapType: "x mandatory",
            scrollbar: "hidden",
          }}
          onScrollEnd={this.controls !== "none" && this.onScrollEnd.bind(this)}
        >
          {this.#isVirtual ? (
            <>
              <Panel carousel={this} offset={-1} />
              <Panel carousel={this} offset={0} />
              <Panel carousel={this} offset={1} />
            </>
          ) : (
            this.items.map((_, i) => <Panel carousel={this} offset={i - this.index} />)
          )}
        </div>
        {this.controls === "all" && (
          <div style="position:absolute; inset:auto 0 1rem 0; z-index:10; display:flex; justify-content:center; align-items:center; gap:2rem; pointer-events:none">
            <Button
              icon="e408"
              onClick={() => this.previous()}
              variant="raw"
              disabled={!this.hasPrev}
              style="pointer-events:auto"
            />
            <Button
              icon="e409"
              onClick={() => this.next()}
              variant="raw"
              disabled={!this.hasNext}
              style="pointer-events:auto"
            />
          </div>
        )}
      </div>
    );
  }
}

class Panel extends Component {
  #rendered = false;

  render() {
    const item = this.carousel.itemAt(this.offset);
    const near = Math.abs(this.offset) <= (this.carousel.renderOffset ?? 1);
    if (near) this.#rendered = true;
    return (
      <div style="flex:none; width:100%; height:100%; scroll-snap-align:center">
        {this.#rendered && item != null && item}
      </div>
    );
  }
}

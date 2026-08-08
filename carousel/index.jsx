import { Component, Ref } from "@vistta/js";
import Button from "../button";
import { Style } from "../utils";

const HANDLED_PROPS = ["ref", "style", "items", "active", "controls", "renderOffset", "direction"];

/**
 * @typedef {Omit<JSX.EventHandlers, "onChange"> & {
 *  id?: string,
 *  ref?: Ref<HTMLElement> | ((element: HTMLElement) => void),
 *  style?: JSX.Style,
 *  items?: JSX.Element[] | ((active: any, offset: number) => JSX.Element),
 *  active?: any,
 *  controls?: "all" | "gesture" | "none",
 *  renderOffset?: number,
 *  direction?: "horizontal" | "vertical",
 *  onChange?: (event: Event & { item: any, index: number }) => void,
 * }} CarouselProps
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
  /** @type {"horizontal" | "vertical"} */
  direction = "horizontal";

  get #isVertical() {
    return this.direction === "vertical";
  }

  get isVertical() {
    return this.#isVertical;
  }

  get #scrollProp() {
    return this.#isVertical ? "scrollTop" : "scrollLeft";
  }

  get #sizeProp() {
    return this.#isVertical ? "clientHeight" : "clientWidth";
  }

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

  #register(element) {
    this.#main = element;
    element.next = this.next.bind(this);
    element.previous = this.previous.bind(this);
    element.scrollTo = this.scrollTo.bind(this);
    element.focus?.();
  }

  #registerBody(body) {
    this.#body = body;
    const init = () => {
      const count = this.#isVirtual ? 3 : Array.isArray(this.items) ? this.items.length : 0;
      if (!body[this.#sizeProp] || !count) return false;
      body[this.#scrollProp] = this.#isVirtual ? body[this.#sizeProp] : this.index * body[this.#sizeProp];
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

  scrollTo(index, behavior = "smooth") {
    if (!this.#body) return;
    const size = this.#body[this.#sizeProp];
    const pos = this.#isVirtual ? size : index * size;
    this.#body.scrollTo({ [this.#isVertical ? "top" : "left"]: pos, behavior });
  }

  #onScrollEnd({ target: body }) {
    const size = body[this.#sizeProp];
    if (this.#isVirtual) {
      const page = Math.round(body[this.#scrollProp] / size);
      if (page === 1) return;
      this.#navigate(page === 0 ? -1 : 1);
      body.scrollTo({ [this.#isVertical ? "top" : "left"]: size, behavior: "instant" });
    } else {
      const page = Math.round(body[this.#scrollProp] / size);
      if (page === this.index) return;
      const item = this.items[page];
      if (item == null) return;
      const event = /** @type {any} */ (new CustomEvent("change", { cancelable: true }));
      event.item = item;
      event.index = page;
      this.#main?.dispatchEvent(event);
      if (event.defaultPrevented) {
        body.scrollTo({ [this.#isVertical ? "top" : "left"]: this.index * size, behavior: "instant" });
        return;
      }
      this.active = page;
    }
  }

  next() {
    if (!this.#body || !this.hasNext) return;
    const size = this.#body[this.#sizeProp];
    if (this.#isVirtual) {
      this.#body.scrollTo({ [this.#isVertical ? "top" : "left"]: size * 2, behavior: "smooth" });
    } else {
      this.#body.scrollTo({ [this.#isVertical ? "top" : "left"]: (this.index + 1) * size, behavior: "smooth" });
    }
  }

  previous() {
    if (!this.#body || !this.hasPrev) return;
    const size = this.#body[this.#sizeProp];
    if (this.#isVirtual) {
      this.#body.scrollTo({ [this.#isVertical ? "top" : "left"]: 0, behavior: "smooth" });
    } else {
      this.#body.scrollTo({ [this.#isVertical ? "top" : "left"]: (this.index - 1) * size, behavior: "smooth" });
    }
  }

  #onKeyDown(e) {
    if (this.#isVertical) {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        this.previous();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        this.next();
      }
    } else {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        this.previous();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        this.next();
      }
    }
  }

  render() {
    return (
      <div
        ref={Ref.forward(this.ref, this.#register.bind(this))}
        tabIndex={0}
        onKeyDown={this.#onKeyDown.bind(this)}
        style={Style.assign(
          { position: "relative", height: "100%", width: "100%", outline: "none", overflow: "clip" },
          this.style,
        )}
        {...this.props(...HANDLED_PROPS)}
      >
        <div
          ref={this.#registerBody.bind(this)}
          style={{
            position: "relative",
            height: "100%",
            width: "100%",
            display: "flex",
            flexWrap: "nowrap",
            overflow: "auto clip",
            scrollSnapType: this.#isVertical ? "y mandatory" : "x mandatory",
            scrollbar: "hidden",
            flexDirection: this.#isVertical ? "column" : "row",
          }}
          onScrollEnd={this.controls !== "none" && this.#onScrollEnd.bind(this)}
        >
          {this.#isVirtual ? (
            <>
              <Panel carousel={this} offset={-1} key="prev" />
              <Panel carousel={this} offset={0} key="active" />
              <Panel carousel={this} offset={1} key="next" />
            </>
          ) : (
            this.items.map((_, i) => <Panel carousel={this} offset={i - this.index} key={i} />)
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
  #item = null;

  render() {
    const item = this.carousel.itemAt(this.offset);
    const near = Math.abs(this.offset) <= (this.carousel.renderOffset ?? 1);
    if (near && !this.#rendered) {
      this.#rendered = true;
      this.#item = item;
    }
    return (
      <div
        style={`flex:none; scroll-snap-align:center; ${this.carousel.isVertical ? "height:100%; width:auto" : "width:100%; height:auto"}`}
      >
        {this.#rendered && this.#item != null && this.#item}
      </div>
    );
  }
}

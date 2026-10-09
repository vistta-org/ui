import { Component, Ref } from "@vistta/js";
import Popover from "../../popover";

/**
 * @typedef {object} ColorProps
 * @property {string} [id]
 * @property {Ref<HTMLInputElement> | ((element: HTMLInputElement) => void)} [ref]
 * @property {import("@vistta/js").Anchor} [anchor]
 * @property {string} [name]
 * @property {string} [value]
 * @property {string[]} [presets]
 * @property {string[]} [recent]
 * @property {boolean} [required]
 * @property {boolean} [disabled]
 * @property {boolean} [readonly]
 * @property {JSX.Style & { variant?: "default" | "basic" | "flat" }} [style]
 * @property {(event?: any) => any} [onChange]
 * @property {(event?: InputEvent) => any} [onInput]
 */

const SWATCH_STYLE = {
  width: "6rem",
  height: "6rem",
  minWidth: "6rem",
  radius: "circular",
  cursor: "pointer",
  padding: 0,
  col: "auto",
  transition: "border-color $duration",
};

/**
 * @extends {Component<ColorProps>}
 */
class Color extends Component {
  #node;
  open = false;

  #select(color) {
    if (this.disabled || this.readonly || this.value === color) return;
    this.value = color;
    this.#node.dispatchEvent(new Event("change", { bubbles: false }));
  }

  #register(element) {
    this.#node = element;
    Object.defineProperties(element, {
      value: {
        get: () => this.value,
        set: (value) => {
          if (this.disabled || this.readonly || this.value === value) return;
          this.value = value;
        },
        configurable: false,
      },
      click: {
        value: () => {
          if (!this.disabled && !this.readonly) this.open = true;
        },
        configurable: false,
      },
    });
  }

  render() {
    if (this.style?.variant === "flat") {
      return (
        <ColorPicker
          ref={Ref.forward(this.ref, this.#register.bind(this))}
          current={this.value}
          presets={this.presets}
          recent={this.recent}
          onSelect={(color) => this.#select(color)}
        />
      );
    }
    return (
      <>
        <div
          ref={Ref.forward(this.ref, this.#register.bind(this))}
          role="select"
          id={this.id}
          name={this.name}
          aria-label={this.name}
          aria-expanded={this.open}
          aria-selected={!!this.value}
          required={this.required}
          disabled={this.disabled}
          onChange={this.onChange}
          onInput={this.onInput}
          style={{
            position: "relative",
            container: "default",
            alignItems: "center",
            gap: "2rem",
            cursor: this.disabled || this.readonly ? "default" : "pointer",
            minHeight: "10rem",
          }}
        >
          <span
            style={{
              width: "6rem",
              height: "6rem",
              minWidth: "6rem",
              radius: "circular",
              backgroundColor: this.value || "$neutral-color",
              border: ".5rem solid $fore-color",
              display: "inline-block",
            }}
          />
          <span style={{ col: "default", opacity: this.value ? 1 : 0.5 }}>{this.value || "Select color"}</span>
        </div>
        {this.open && (
          <ColorPopover
            anchor={this.anchor}
            current={this.value}
            presets={this.presets}
            recent={this.recent}
            onClose={() => (this.open = false)}
            onSelect={(color) => this.#select(color)}
          />
        )}
      </>
    );
  }
}

class ColorPopover extends Component {
  #popover;
  #boundClose;

  onConnect() {
    this.#boundClose = (e) => {
      if (this.#popover && !this.#popover.contains(e.target)) this.onClose?.();
    };
    requestAnimationFrame(() => document.addEventListener("pointerdown", this.#boundClose));
  }

  onDisconnect() {
    document.removeEventListener("pointerdown", this.#boundClose);
  }

  render() {
    return (
      <Popover
        ref={(el) => (this.#popover = el)}
        open
        style={{
          ...this.anchor("bottom", { gap: "2rem" }),
          container: "default",
          gap: "0",
          padding: "0",
          width: "min-content",
        }}
        inert
      >
        <ColorPicker current={this.current} presets={this.presets} recent={this.recent} onSelect={this.onSelect} />
      </Popover>
    );
  }
}

class ColorPicker extends Component {
  #canvas;
  #hueBar;
  #dragging = null;
  #boundMove;
  #boundUp;
  hue = 0;
  sat = 100;
  val = 100;

  onConnect() {
    this.#boundMove = (e) => this.#onMove(e);
    this.#boundUp = () => {
      if (this.#dragging) this.onSelect?.(hsvToHex(this.hue, this.sat, this.val));
      this.#dragging = null;
    };
    document.addEventListener("mousemove", this.#boundMove);
    document.addEventListener("mouseup", this.#boundUp);
    document.addEventListener("touchmove", this.#boundMove, { passive: false });
    document.addEventListener("touchend", this.#boundUp);
    if (this.current) {
      const [h, s, v] = hexToHSV(this.current);
      this.hue = h;
      this.sat = s;
      this.val = v;
    }
  }

  onDisconnect() {
    document.removeEventListener("mousemove", this.#boundMove);
    document.removeEventListener("mouseup", this.#boundUp);
    document.removeEventListener("touchmove", this.#boundMove);
    document.removeEventListener("touchend", this.#boundUp);
  }

  get #currentHex() {
    return hsvToHex(this.hue, this.sat, this.val);
  }

  #onMove(e) {
    if (!this.#dragging) return;
    e.preventDefault();
    if (this.#dragging === "area") this.#updateArea(e);
    else if (this.#dragging === "hue") this.#updateHue(e);
  }

  #updateArea(e) {
    const rect = this.#canvas?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.touches?.[0]?.clientX ?? e.clientX) - rect.left;
    const y = (e.touches?.[0]?.clientY ?? e.clientY) - rect.top;
    this.sat = Math.round(Math.min(100, Math.max(0, (x / rect.width) * 100)));
    this.val = Math.round(Math.min(100, Math.max(0, 100 - (y / rect.height) * 100)));
  }

  #updateHue(e) {
    const rect = this.#hueBar?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.touches?.[0]?.clientX ?? e.clientX) - rect.left;
    this.hue = Math.round(Math.min(360, Math.max(0, (x / rect.width) * 360)));
  }

  #onRGBInput(channel, e) {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) return;
    const clamped = Math.min(255, Math.max(0, val));
    const [r, g, b] = hexToRGB(this.#currentHex);
    const rgb = [r, g, b];
    rgb[channel] = clamped;
    const hex = "#" + rgb.map((c) => c.toString(16).padStart(2, "0")).join("");
    this.#selectHex(hex);
  }

  #selectHex(hex) {
    const [h, s, v] = hexToHSV(hex);
    this.hue = h;
    this.sat = s;
    this.val = v;
    this.onSelect?.(hex);
  }

  get #recentFiltered() {
    const presetSet = new Set(this.presets);
    return (this.recent || []).filter((c) => !presetSet.has(c));
  }

  render() {
    return (
      <>
        <div
          ref={(el) => (this.#canvas = el)}
          onMouseDown={(e) => {
            this.#dragging = "area";
            this.#updateArea(e);
          }}
          onTouchStart={(e) => {
            this.#dragging = "area";
            this.#updateArea(e);
          }}
          style={{
            col: "full",
            position: "relative",
            width: "calc(100% - 4rem)",
            height: "40rem",
            margin: "2rem",
            radius: "rounded",
            cursor: "crosshair",
            backgroundImage: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hsvToHex(this.hue, 100, 100)})`,
            touchAction: "none",
          }}
        >
          <span
            style={{
              position: "absolute",
              width: "4rem",
              height: "4rem",
              radius: "circular",
              border: ".5rem solid #fff",
              boxShadow: "0 0 .5rem rgba(0,0,0,.5)",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
              left: this.sat + "%",
              top: 100 - this.val + "%",
            }}
          />
        </div>
        <div
          ref={(el) => (this.#hueBar = el)}
          onMouseDown={(e) => {
            this.#dragging = "hue";
            this.#updateHue(e);
          }}
          onTouchStart={(e) => {
            this.#dragging = "hue";
            this.#updateHue(e);
          }}
          style={{
            col: "full",
            position: "relative",
            width: "calc(100% - 4rem)",
            height: "5rem",
            margin: "2rem",
            radius: "rounded",
            cursor: "pointer",
            backgroundImage:
              "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
            touchAction: "none",
          }}
        >
          <span
            style={{
              position: "absolute",
              width: "4rem",
              height: "100%",
              radius: "rounded",
              border: ".5rem solid #fff",
              boxShadow: "0 0 .5rem rgba(0,0,0,.5)",
              transform: "translateX(-50%)",
              pointerEvents: "none",
              left: (this.hue / 360) * 100 + "%",
              top: 0,
            }}
          />
        </div>
        <div style="col:full; container:default; gap:1rem; padding:2rem; align-items:center">
          <span
            style={{
              width: "8rem",
              height: "8rem",
              minWidth: "8rem",
              radius: "circular",
              backgroundColor: this.#currentHex,
              border: ".5rem solid $fore-color",
            }}
          />
          {["R", "G", "B"].map((label, i) => (
            <div style="container:center; col:default; width: 16rem; gap:.5rem; align-items:center">
              <span style="font:small; opacity:.6">{label}</span>
              <input
                type="number"
                role="part"
                min={0}
                max={255}
                value={hexToRGB(this.#currentHex)[i]}
                onInput={(e) => this.#onRGBInput(i, e)}
                style={{
                  width: "13rem",
                  textAlign: "center",
                  border: "default",
                  radius: "rounded",
                  padding: "1rem",
                  background: "inherit",
                  color: "inherit",
                  fontFamily: "monospace",
                }}
              />
            </div>
          ))}
        </div>
        {this.presets?.length > 0 && (
          <div style="col:full; container:default; gap:1rem; flex-wrap:wrap; align-items:center">
            {this.presets.map((color) => (
              <button
                type="button"
                onClick={() => this.#selectHex(color)}
                style={{
                  ...SWATCH_STYLE,
                  backgroundColor: color,
                  border: this.#currentHex === color ? ".5rem solid $fore-color" : ".5rem solid transparent",
                }}
              />
            ))}
          </div>
        )}
        {this.#recentFiltered.length > 0 && (
          <>
            <span style="col:full; font:small; opacity:.6">Recent</span>
            <div style="col:full; container:default; gap:1rem; flex-wrap:wrap; align-items:center">
              {this.#recentFiltered.map((color) => (
                <button
                  type="button"
                  onClick={() => this.#selectHex(color)}
                  style={{
                    ...SWATCH_STYLE,
                    backgroundColor: color,
                    border: this.#currentHex === color ? ".5rem solid $fore-color" : ".5rem solid transparent",
                  }}
                />
              ))}
            </div>
          </>
        )}
      </>
    );
  }
}

export default Color;

function hsvToHex(h, s, v) {
  s /= 100;
  v /= 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r, g, b;
  if (h < 60) ((r = c), (g = x), (b = 0));
  else if (h < 120) ((r = x), (g = c), (b = 0));
  else if (h < 180) ((r = 0), (g = c), (b = x));
  else if (h < 240) ((r = 0), (g = x), (b = c));
  else if (h < 300) ((r = x), (g = 0), (b = c));
  else ((r = c), (g = 0), (b = x));
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

function hexToHSV(hex) {
  const [r, g, b] = hexToRGB(hex);
  const rn = r / 255,
    gn = g / 255,
    bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d + 6) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
  }
  const s = max === 0 ? 0 : (d / max) * 100;
  const v = max * 100;
  return [Math.round(h), Math.round(s), Math.round(v)];
}

function hexToRGB(hex) {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

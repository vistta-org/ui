import { Component, Style } from "@vistta/js";
import { style as globalStyle } from "../utils";

/**
 * @typedef {object} SkeletonProps
 * @property {string} [id] - The unique identifier for the skeleton element.
 * @property {JSX.Style | JSX.StyleObject & { variant?: "text" | "circle" | "rect"; height?: string; width?: string }} [style] - Style object or array of style objects to apply to the skeleton.
 * @property {boolean} [animate] - Whether to show the pulse animation. Defaults to true.
 */

/**
 * @extends {Component<SkeletonProps>}
 */
export default class Skeleton extends Component {
  static set style(value) {
    globalStyle.update("skeleton", value);
  }

  static get style() {
    return globalStyle.value?.skeleton || {};
  }
  /** @type {any} */
  style = undefined;
  globalStyle = globalStyle();

  render() {
    const animation = this.animate !== false && {
      "0%": { opacity: "0" },
      "50%": { opacity: ".4" },
      "100%": { opacity: "0" },
      duration: "2s",
      timingFunction: "ease-in-out",
      iterationCount: "infinite",
    };

    if (this.style?.variant === "text" && this.style?.height) {
      return (
        <div
          id={this.id}
          style={Style.assign(
            {
              display: "flex",
              flexDirection: "column",
              gap: ".4em",
              width: "100%",
              overflow: "hidden",
            },
            this.globalStyle.skeleton || {},
            this.style,
          )}
        >
          {Array.from({ length: 8 }, (_, i) => (
            <div
              style={{
                background: "$neutral-color",
                radius: "rounded",
                width: i === 7 ? "60%" : "100%",
                height: "1em",
                flexShrink: 0,
                opacity: animation ? "0" : ".4",
                animation,
              }}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        id={this.id}
        style={Style.assign(
          {
            display: "inline-block",
            background: "$neutral-color",
            radius: this.style?.variant === "circle" ? "circular" : "rounded",
            width:
              this.style?.variant === "circle"
                ? this.style?.width && this.style?.height
                  ? `min(${this.style?.width}, ${this.style?.height})`
                  : (this.style?.width ?? this.style?.height ?? "3rem")
                : (this.style?.width ?? "100%"),
            height:
              this.style?.variant === "circle"
                ? this.style?.width && this.style?.height
                  ? `min(${this.style?.width}, ${this.style?.height})`
                  : (this.style?.height ?? this.style?.width ?? "3rem")
                : (this.style?.height ?? (this.style?.variant === "text" ? "1em" : "100%")),
            opacity: animation ? "0" : ".4",
            animation,
          },
          this.globalStyle.skeleton || {},
          this.style,
        )}
      />
    );
  }
}

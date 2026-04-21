import { Component, Style } from "@vistta/js";

/**
 * @typedef {object} SkeletonProps
 * @property {string} [id] - The unique identifier for the skeleton element.
 * @property {JSX.Style} [style] - Style object or array of style objects to apply to the skeleton.
 * @property {string} [width] - Width of the skeleton.
 * @property {string} [height] - Height of the skeleton.
 * @property {"text" | "circle" | "rect"} [variant] - Shape variant of the skeleton.
 * @property {boolean} [animate] - Whether to show the pulse animation. Defaults to true.
 */

/**
 * @extends {Component<SkeletonProps>}
 */
export default class Skeleton extends Component {
  render() {
    const animation = this.animate !== false && {
      "0%": { opacity: ".4" },
      "50%": { opacity: ".05" },
      "100%": { opacity: ".4" },
      duration: "2s",
      timingFunction: "ease-in-out",
      iterationCount: "infinite",
    };

    if (this.variant === "text" && this.height) {
      return (
        <div
          id={this.id}
          style={Style.assign(
            {
              display: "flex",
              flexDirection: "column",
              gap: ".4em",
              width: this.width ?? "100%",
              height: this.height,
              overflow: "hidden",
            },
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
                opacity: ".4",
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
            radius: this.variant === "circle" ? "circular" : "rounded",
            width:
              this.variant === "circle"
                ? this.width && this.height
                  ? `min(${this.width}, ${this.height})`
                  : (this.width ?? this.height ?? "3rem")
                : (this.width ?? "100%"),
            height:
              this.variant === "circle"
                ? this.width && this.height
                  ? `min(${this.width}, ${this.height})`
                  : (this.height ?? this.width ?? "3rem")
                : (this.height ?? (this.variant === "text" ? "1em" : "100%")),
            opacity: ".4",
            animation,
          },
          this.style,
        )}
      />
    );
  }
}

import { Component, Ref } from "@vistta/js";
import { DateTime, formatDate } from "@vistta/utils";
import Button from "../button";
import { Style } from "../utils";

const DEFAULT_DATE = new DateTime([1996, 0, 14]); // Sunday, 14 January 1996 00:00:00
const WEEKDAY_TO_INDEX = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

/**
 * @typedef {"month"|"week"|"day"} CalendarType
 *
 * @typedef {object} CalendarProps
 * @property {string} [id]
 * @property {Ref<HTMLElement> | ((element: HTMLElement) => void)} [ref]
 * @property {string} [name]
 * @property {CalendarType} [type] Calendar view type
 * @property {"mon"|"tue"|"wed"|"thu"|"fri"|"sat"|"sun"} [starting] Starting day of the week
 * @property {Date | DateTime} [date] Current date to display in the calendar
 * @property {"all" | "gesture" | "none"} [controls] Whether to show navigation buttons
 * @property {JSX.Style} [style]
 * @property {(date: Date, enabled: boolean) => JSX.Element[]} [renderDay] Function to render the contents of each day
 * @property {(event: Event) => void} [onChange] Callback function when the displayed date changes
 * @property {(event: MouseEvent) => void} [onClick] Callback function when a click happens on the calendar
 * @property {(event: MouseEvent) => void} [onDblClick] Callback function when a double click happens on the calendar
 */

const today = new DateTime();

/**
 * @extends {Component<CalendarProps>}
 */
export default class Calendar extends Component {
  #body;
  #main;
  /** @type {CalendarType} */
  type = "month";
  /** @type {"mon"|"tue"|"wed"|"thu"|"fri"|"sat"|"sun"} */
  starting = "mon";
  events = [];
  /** @type {DateTime} */
  date = new DateTime();
  /** @type {"all" | "gesture" | "none"} */
  controls = "all";

  register(element) {
    element.next = this.next.bind(this);
    element.previous = this.previous.bind(this);
    element.select = this.select.bind(this);
    this.#main = element;
  }

  registerBody(body) {
    this.#body = body;
    queueMicrotask(() => {
      body.scrollLeft = body.clientWidth;
    });
  }

  onScrollEnd({ target: body }) {
    let target;
    for (let i = 0, len = body.children.length; i < len; i++) {
      if (body.scrollLeft > body.children[i].offsetLeft) continue;
      if (i === 0) target = "previous";
      else if (i === 2) target = "next";
      else return;
      break;
    }
    const date = new DateTime(this.date)[target](this.type);
    const event = /** @type {any} */ (new CustomEvent("change", { cancelable: true }));
    event.date = date;
    this.#main.dispatchEvent(event);
    if (event.defaultPrevented) return;
    this.date = date;
    body.scrollTo({ left: body.clientWidth, behavior: "instant" });
  }

  next() {
    if (!this.#body) return;
    this.#body.scrollTo({ left: this.#body.clientWidth * 2, behavior: "smooth" });
  }

  previous() {
    if (!this.#body) return;
    this.#body.scrollTo({ left: 0, behavior: "smooth" });
  }

  select(day) {
    this.date = new DateTime(day);
  }

  render() {
    return (
      <div
        ref={Ref.forward(this.ref, this.register.bind(this))}
        id={this.id}
        onChange={this.onChange}
        style={Style.assign(
          {
            position: "relative",
            container: "default",
            height: "100%",
            background: "default",
            border: "default",
            radius: "rounded",
          },
          this.style,
        )}
      >
        <div style="relative; col:full; container; gap:0">
          <div style="col:full; container:center; gap:0; p:1rem 1rem 0">
            {this.controls === "all" && (
              <Button variant="raw" style="col:auto; mr:11rem" action icon="e5cb" onClick={this.previous.bind(this)} />
            )}
            <h5 style={["col", "text:center", this.controls === "all" && " pt:2rem"]}>
              {formatDate(this.date, {
                locales: "en-US",
                month: "long",
                year: "numeric",
              })}
            </h5>
            {this.controls === "all" && (
              <>
                <Button variant="raw" style="col:auto" action icon="e8df" onClick={this.select.bind(this, new DateTime())} />
                <Button variant="raw" style="col:auto; ml:1rem" action icon="e5cc" onClick={this.next.bind(this)} />
              </>
            )}
          </div>
          {this.type !== "day" &&
            Array.from({ length: 7 }, (_, i) => {
              const date = DEFAULT_DATE.clone();
              date.day += (i + (WEEKDAY_TO_INDEX[this.starting] ?? 1)) % 7;
              return (
                <div style="col; p: 2rem 0; text:center; text-transform: uppercase">
                  {date.format({
                    locales: "en-US",
                    weekday: "short",
                  })}
                </div>
              );
            })}
        </div>
        <div
          ref={this.registerBody.bind(this)}
          style={{
            position: "relative",
            col: "full",
            container: "default",
            height: "calc(100% - 22rem)",
            gap: 0,
            flexWrap: "nowrap",
            overflow: "auto clip",
            scrollSnapType: "x mandatory",
            scrollbar: "hidden",
          }}
          onWheel={this.controls === "none" ? (e) => e.preventDefault() : undefined}
          onTouchMove={this.controls === "none" ? (e) => e.preventDefault() : undefined}
          onScrollEnd={this.controls !== "none" && this.onScrollEnd.bind(this)}
        >
          <View
            type={this.type}
            date={new DateTime(this.date).previous(/** @type {any} */ (this.type))}
            renderDay={this.renderDay}
            starting={this.starting}
          />
          <View
            type={this.type}
            date={new DateTime(this.date)}
            renderDay={this.renderDay}
            starting={this.starting}
            onClick={this.onClick}
            onDblClick={this.onDblClick}
          />
          <View
            type={this.type}
            date={new DateTime(this.date).next(/** @type {any} */ (this.type))}
            renderDay={this.renderDay}
            starting={this.starting}
          />
        </div>
      </div>
    );
  }
}

class View extends Component {
  container = new Ref();

  render() {
    const body = [];
    const weekStartIndex = WEEKDAY_TO_INDEX[this.starting] ?? 1;
    if (this.type === "day")
      body.push(
        <Day
          type={this.type}
          date={this.date}
          renderDay={this.renderDay}
          onClick={this.onClick}
          onDblClick={this.onDblClick}
        />,
      );
    else if (this.type === "week") {
      const delta = weekStartIndex - this.date.weekday;
      for (let i = 0; i < 7; i++) {
        const day = this.date.clone();
        day.day += delta + i;
        body.push(
          <Day type={this.type} date={day} renderDay={this.renderDay} onClick={this.onClick} onDblClick={this.onDblClick} />,
        );
      }
    } else {
      const lastDayFromPreviousMonth = new DateTime([this.date.year, this.date.month, 0]).day;
      for (let i = 0, len = new DateTime([this.date.year, this.date.month, 1]).weekday - weekStartIndex; i < len; i++)
        body.push(
          <Day
            type={this.type}
            date={new DateTime([this.date.year, this.date.month - 1, lastDayFromPreviousMonth - len + 1 + i])}
            renderDay={this.renderDay}
            disabled
          />,
        );
      for (let i = 1; i <= new DateTime([this.date.year, this.date.month + 1, 0]).day; i++)
        body.push(
          <Day
            type={this.type}
            date={new DateTime([this.date.year, this.date.month, i])}
            renderDay={this.renderDay}
            onClick={this.onClick}
            onDblClick={this.onDblClick}
          />,
        );
      for (let i = 1, len = 42 - body.length; i <= len; i++)
        body.push(
          <Day
            type={this.type}
            date={new DateTime([this.date.year, this.date.month + 1, i])}
            renderDay={this.renderDay}
            disabled
          />,
        );
    }
    return (
      <div style="relative; col:full; height:100%; container; gap:0; overflow:clip; scroll-snap-align: center; user-select: none">
        {body}
      </div>
    );
  }
}

class Day extends Component {
  render() {
    return (
      <div
        ref={(element) =>
          Object.defineProperty(element, "value", {
            get: () => this.date.toISOString(),
          })
        }
        style={{
          position: "relative",
          flex: "none",
          container: "default",
          paddingTop: "5rem",
          height: this.type === "week" || this.type === "day" ? "100%" : 100 / 6 + "%",
          width: this.type === "day" ? "100%" : 100 / 7 + "%",
          gap: this.type === "month" ? ".5rem" : "2rem",
          border: "top",
          ":not(:nth-child(7n))": { border: this.type !== "day" && "right" },
          text: "left",
          overflow: "clip",
          ":before": {
            content: `"${
              (this.type === "day"
                ? this.date.format({
                    locales: "en-US",
                    weekday: "long",
                  }) + ", "
                : "") + this.date.day
            }"`,
            position: "absolute",
            top: "0",
            left: this.type !== "day" ? "calc(50% - 2.5rem)" : "0",
            height: "5rem",
            width: this.type !== "day" ? "5rem" : "100%",
            padding: "0.4rem",
            radius: "rounded",
            text: "center",
            font: this.type !== "day" && "small",
            lineHeight: "130%",
            ...(this.type !== "day" && isToday(this.date)
              ? {
                  background: "$fore-color",
                  color: "$back-color",
                }
              : {}),
            opacity: this.disabled ? 0.5 : 1,
          },
        }}
        onClick={this.onClick}
        onDblClick={this.onDblClick}
      >
        {this.renderDay?.(this.date, !this.disabled)}
      </div>
    );
  }
}

function isToday(date) {
  return date.year === today.year && date.month === today.month && date.day === today.day;
}

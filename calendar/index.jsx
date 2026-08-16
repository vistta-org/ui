import { Component, Ref } from "@vistta/js";
import { DateTime, formatDate } from "@vistta/utils";
import Button from "../button";
import Carousel from "../carousel";
import { Style } from "../utils";

const DEFAULT_DATE = new DateTime([1996, 0, 14]); // Sunday, 14 January 1996 00:00:00
const WEEKDAY_TO_INDEX = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
const HANDLED_PROPS = ["ref", "name", "type", "starting", "date", "controls", "style", "items", "onClick", "onDblClick"];

/**
 * @typedef {"month"|"week"|"day"} CalendarType
 *
 * @typedef {Omit<JSX.EventHandlers, "onChange" | "onClick" | "onDblClick"> & {
 *  id?: string,
 *  ref?: Ref<HTMLElement> | ((element: HTMLElement) => void),
 *  name?: string,
 *  type?: CalendarType,
 *  starting?: "mon"|"tue"|"wed"|"thu"|"fri"|"sat"|"sun",
 *  date?: Date | DateTime,
 *  controls?: "all" | "gesture" | "none",
 *  style?: JSX.Style,
 *  items?: (date: Date, enabled: boolean) => JSX.Element[],
 *  onChange?: (event: Event) => void,
 *  onClick?: (event: MouseEvent) => void,
 *  onDblClick?: (event: MouseEvent) => void,
 * }} CalendarProps
 */

/**
 * @extends {Component<CalendarProps>}
 */
export default class Calendar extends Component {
  #main;
  #carousel = new Ref();
  /** @type {CalendarType} */
  type = "month";
  /** @type {"mon"|"tue"|"wed"|"thu"|"fri"|"sat"|"sun"} */
  starting = "mon";
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

  #getItem(_, offset) {
    if (offset === 0)
      return (
        <View
          type={this.type}
          date={new DateTime(this.date)}
          items={this.items}
          starting={this.starting}
          onClick={this.onClick}
          onDblClick={this.onDblClick}
        />
      );
    const date = new DateTime(this.date);
    if (offset < 0) for (let i = 0; i > offset; i--) date.previous(/** @type {any} */ (this.type));
    else for (let i = 0; i < offset; i++) date.next(/** @type {any} */ (this.type));
    return <View type={this.type} date={date} items={this.items} starting={this.starting} />;
  }

  #onChange(event) {
    const date = new DateTime(this.date)[event.index < 0 ? "previous" : "next"](this.type);
    const calEvent = /** @type {any} */ (new CustomEvent("change", { cancelable: true }));
    calEvent.date = date;
    this.#main.dispatchEvent(calEvent);
    if (calEvent.defaultPrevented) {
      event.preventDefault();
      return;
    }
    this.date = date;
  }

  next() {
    this.#carousel.node?.next();
  }

  previous() {
    this.#carousel.node?.previous();
  }

  select(day) {
    const event = /** @type {any} */ (new CustomEvent("change", { cancelable: true }));
    event.date = new DateTime(day);
    this.#main.dispatchEvent(event);
    if (event.defaultPrevented) return;
    this.date = new DateTime(day);
  }

  render() {
    return (
      <div
        ref={Ref.forward(this.ref, this.register.bind(this))}
        style={Style.assign(
          {
            position: "relative",
            container: "default",
            height: "100%",
            background: "default",
            border: "default",
            radius: "rounded",
            gap: 0,
          },
          this.style,
        )}
        {...this.props(...HANDLED_PROPS)}
      >
        <div style="col:full; container:center; gap:0; p:1rem 1rem 0">
          {this.controls === "all" && (
            <Button variant="raw" style="col:auto; mr:11rem" icon="e5cb" onClick={this.previous.bind(this)} />
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
              <Button variant="raw" style="col:auto" icon="e8df" onClick={this.select.bind(this, new DateTime())} />
              <Button variant="raw" style="col:auto; ml:1rem" icon="e5cc" onClick={this.next.bind(this)} />
            </>
          )}
        </div>
        <div style="col:full; container:default; gap:0">
          {this.type !== "day" ? (
            Array.from({ length: 7 }, (_, i) => {
              const date = DEFAULT_DATE.clone();
              date.day += (i + (WEEKDAY_TO_INDEX[this.starting] ?? 1)) % 7;
              return (
                <div style="col:default; p: 2rem 0; text:center; text-transform: uppercase">
                  {date.format({
                    locales: "en-US",
                    weekday: "short",
                  })}
                </div>
              );
            })
          ) : (
            <div style="col:default; p: 2rem 0; text:center; text-transform: uppercase">
              {this.date.format({
                locales: "en-US",
                weekday: "long",
              })}
            </div>
          )}
        </div>
        <Carousel
          ref={this.#carousel}
          items={this.#getItem.bind(this)}
          active={this.date}
          controls={this.controls === "all" ? "gesture" : this.controls}
          onChange={this.#onChange.bind(this)}
          style={{
            col: "full",
            height: "calc(100% - 21rem)",
          }}
        />
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
        <Day type={this.type} date={this.date} items={this.items} onClick={this.onClick} onDblClick={this.onDblClick} />,
      );
    else if (this.type === "week") {
      let delta = weekStartIndex - this.date.weekday;
      if (delta > 0) delta -= 7;
      for (let i = 0; i < 7; i++) {
        const day = this.date.clone();
        day.day += delta + i;
        body.push(
          <Day type={this.type} date={day} items={this.items} onClick={this.onClick} onDblClick={this.onDblClick} />,
        );
      }
    } else {
      const lastDayFromPreviousMonth = new DateTime([this.date.year, this.date.month, 0]).day;
      for (
        let i = 0, len = (new DateTime([this.date.year, this.date.month, 1]).weekday - weekStartIndex + 7) % 7;
        i < len;
        i++
      )
        body.push(
          <Day
            type={this.type}
            date={new DateTime([this.date.year, this.date.month - 1, lastDayFromPreviousMonth - len + 1 + i])}
            items={this.items}
            disabled
          />,
        );
      for (let i = 1; i <= new DateTime([this.date.year, this.date.month + 1, 0]).day; i++)
        body.push(
          <Day
            type={this.type}
            date={new DateTime([this.date.year, this.date.month, i])}
            items={this.items}
            onClick={this.onClick}
            onDblClick={this.onDblClick}
          />,
        );
      for (let i = 1, len = 42 - body.length; i <= len; i++)
        body.push(
          <Day type={this.type} date={new DateTime([this.date.year, this.date.month + 1, i])} items={this.items} disabled />,
        );
    }
    return (
      <div style="relative; col:full; height:100%; container:default; gap:0; overflow:clip; scroll-snap-align: center; user-select: none">
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
            get: () => {
              const now = new DateTime();
              const date = new DateTime(this.date);
              date.hours = now.hours;
              return date.toISOString();
            },
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
            content: `"${this.date.day}"`,
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
        {this.items?.(this.date, !this.disabled)}
      </div>
    );
  }
}

function isToday(date) {
  const today = new DateTime();
  return date.year === today.year && date.month === today.month && date.day === today.day;
}

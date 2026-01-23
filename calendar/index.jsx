import { Component, Ref } from "@vistta/js";
import { DateTime, formatDate } from "@vistta/utils";
import Button from "../button";

const DEFAULT_DATE = new DateTime([1996, 0, 14]); // Sunday, 14 January 1996 00:00:00
const WEEKDAY_TO_INDEX = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

/**
 * @typedef {"month"|"week"|"day"} CalendarType
 *
 * @typedef {{ title: string, start: Date, end: Date, description?: string, location?: string, color?: string }} CalendarEvent
 *
 * @typedef {object} CalendarProps
 * @property {string} [id]
 * @property {Ref<HTMLElement> | ((element: HTMLElement) => void)} [ref]
 * @property {string} [name]
 * @property {JSX.Anchor} [anchor]
 * @property {CalendarType} [type] Calendar view type
 * @property {"mon"|"tue"|"wed"|"thu"|"fri"|"sat"|"sun"} [starting] Starting day of the week
 * @property {Array<CalendarEvent>} [events] List of events for the calendar
 * @property {Date} [date] Current date to display in the calendar
 * @property {"all" | "gesture" | "none"} [controls] Whether to show navigation buttons
 * @property {(event: MouseEvent) => void} [onClick] Callback function when a click happens on the calendar
 */

/**
 * @extends {Component<CalendarProps>}
 */
export default class Calendar extends Component {
  #body = new Ref();
  type = "month";
  starting = "mon";
  events = [];
  date = new DateTime();
  controls = "all";

  register(element) {
    element.next = this.next.bind(this);
    element.previous = this.previous.bind(this);
    element.select = this.select.bind(this);
  }

  onScrollEnd(event) {
    const element = event.target;
    if (element.scrollLeft === element.clientWidth) return;
    this.date =
      element.scrollLeft + element.clientWidth >= element.scrollWidth - 1
        ? new DateTime(this.date).next(this.type)
        : new DateTime(this.date).previous(this.type);
    this.snapToCenter(element, false);
  }

  snapToCenter(element, initial = true) {
    if (initial && element.clientWidth === element.scrollWidth) return setTimeout(() => this.snapToCenter(element), 10);
    element.scrollLeft = element.offsetWidth;
  }

  next() {
    const body = this.#body.node;
    if (!body) return;
    body.scrollBy({ left: body.offsetWidth, behavior: "smooth" });
  }

  previous() {
    const body = this.#body.node;
    if (!body) return;
    body.scrollBy({ left: -body.offsetWidth, behavior: "smooth" });
  }

  select(day) {
    this.date = new DateTime(day);
  }

  render() {
    return (
      <div
        ref={Ref.forward(this.ref, this.register.bind(this))}
        id={this.id}
        anchor={this.anchor}
        style="relative; container; height:100%"
      >
        <div style="relative; col:full; container; gap:0">
          <div style="col:full; container:center; gap:4rem">
            {this.controls === "all" && (
              <Button raw style="col:auto" action icon="e5cb" onClick={this.previous.bind(this)} />
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
                <Button raw style="col:auto" action icon="e935" onClick={this.select.bind(this, new DateTime())} />
                <Button raw style="col:auto" action icon="e5cc" onClick={this.next.bind(this)} />
              </>
            )}
          </div>
          {this.type !== "day" &&
            Array.from({ length: 7 }, (_, i) => {
              const date = DEFAULT_DATE.clone();
              date.day += (i + WEEKDAY_TO_INDEX[this.starting] ?? 1) % 7;
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
          ref={Ref.forward(this.#body, this.snapToCenter.bind(this))}
          style="relative; col:full; container; height:calc(100% - 20rem); gap: 0; flex-wrap: nowrap; overflow: scroll clip; scrollbar:hidden"
          onWheel={this.controls === "none" ? (e) => e.preventDefault() : undefined}
          onTouchMove={this.controls === "none" ? (e) => e.preventDefault() : undefined}
          onScrollEnd={this.controls !== "none" && this.onScrollEnd.bind(this)}
        >
          <View
            type={this.type}
            date={new DateTime(this.date).previous(this.type)}
            events={this.events}
            starting={this.starting}
          />
          <View
            type={this.type}
            date={new DateTime(this.date)}
            events={this.events}
            starting={this.starting}
            onClick={this.onClick}
          />
          <View
            type={this.type}
            date={new DateTime(this.date).next(this.type)}
            events={this.events}
            starting={this.starting}
          />
        </div>
      </div>
    );
  }
}

class View extends Component {
  container = new Ref();
  #eventIndex = {};

  clickHandler(e) {
    if (!this.onClick) return;
    let current = e.target;
    const data = {};
    while (current && current !== this.container?.node) {
      if (current.data) Object.assign(data, current.data);
      current = current.parentElement;
    }
    data.date = new Date(data.date);
    if (data.hour) data.date.setHours(data.hour, 0, 0, 0);
    e.data = { date: data.date?.toString(), event: this.events?.[data.event] };
    this.onClick(e);
  }

  render() {
    const body = [];
    const weekStartIndex = WEEKDAY_TO_INDEX[this.starting] ?? 1;
    if (this.type === "day")
      body.push(
        <div ref={insertOnElement({ date: this.date.date })} style={getDayStyle(this.type)}>
          {this.date.day}
        </div>,
      );
    else if (this.type === "week") {
      const delta = weekStartIndex - this.date.weekday;
      for (let i = 0; i < 7; i++) {
        const day = this.date.clone();
        day.day += delta + i;
        body.push(
          <div ref={insertOnElement({ date: day.date })} style={getDayStyle(this.type)}>
            {day.day}
          </div>,
        );
      }
    } else {
      const lastDayFromPreviousMonth = new DateTime([this.date.year, this.date.month, 0]).day;
      for (let i = 0, len = new DateTime([this.date.year, this.date.month, 1]).weekday - weekStartIndex; i < len; i++) {
        const day = new DateTime([this.date.year, this.date.month - 1, lastDayFromPreviousMonth - len + 1 + i]);
        body.push(
          <div ref={insertOnElement({ date: day.date })} style={getDayStyle(this.type, true)}>
            {day.day}
          </div>,
        );
      }
      for (let i = 1; i <= new DateTime([this.date.year, this.date.month + 1, 0]).day; i++) {
        const day = new DateTime([this.date.year, this.date.month, i]);
        body.push(
          <div ref={insertOnElement({ date: day.date })} style={getDayStyle(this.type)}>
            {day.day}
          </div>,
        );
      }
      for (let i = 1, len = 42 - body.length; i <= len; i++) {
        const day = new DateTime([this.date.year, this.date.month + 1, i]);
        body.push(
          <div ref={insertOnElement({ date: day.date })} style={getDayStyle(this.type, true)}>
            {day.day}
          </div>,
        );
      }
    }
    return (
      <div style="relative; col:full; height:100%; container; gap:0; overflow:clip; scroll-snap-align: center">{body}</div>
    );
  }
}

function getDayStyle(type, disabled = false) {
  const result = {
    position: "relative",
    flex: "none",
    height: 100 / 6 + "%",
    width: 100 / 7 + "%",
    text: "center",
    opacity: disabled && "0.5",
  };
  if (type === "week") result.height = "100%";
  else if (type === "day") {
    result.width = "100%";
    result.height = "100%";
  }
  return result;
}

function insertOnElement(data) {
  return (e) => (e.data = Object.assign(e.data || {}, data));
}

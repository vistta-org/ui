import { Component, Ref } from "@vistta/js";
import { DateTime, formatDate } from "@vistta/utils";
import Button from "../button";
import { assignStyle } from "../utils";

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
  // Events render
  #body;
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

  registerBody(body) {
    if (body.clientWidth === body.scrollWidth) return setTimeout(() => this.registerBody(body), 10);
    this.#body = body;
    body.scrollTo({ left: body.clientWidth, behavior: "instant" });
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
    this.date = new DateTime(this.date)[target](this.type);
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
        anchor={this.anchor}
        style={assignStyle(
          {
            position: "relative",
            container: "default",
            height: "100%",
          },
          this.style,
        )}
      >
        <div style="relative; col:full; container; gap:0">
          <div style="col:full; container:center; gap:0">
            {this.controls === "all" && (
              <Button raw style="col:auto; mr:11rem" action icon="e5cb" onClick={this.previous.bind(this)} />
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
                <Button raw style="col:auto" action icon="e8df" onClick={this.select.bind(this, new DateTime())} />
                <Button raw style="col:auto; ml:1rem" action icon="e5cc" onClick={this.next.bind(this)} />
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
    if (this.type === "day") body.push(<Day type={this.type} date={this.date} events={this.events} />);
    else if (this.type === "week") {
      const delta = weekStartIndex - this.date.weekday;
      for (let i = 0; i < 7; i++) {
        const day = this.date.clone();
        day.day += delta + i;
        body.push(<Day type={this.type} date={day} events={this.events} />);
      }
    } else {
      const lastDayFromPreviousMonth = new DateTime([this.date.year, this.date.month, 0]).day;
      for (let i = 0, len = new DateTime([this.date.year, this.date.month, 1]).weekday - weekStartIndex; i < len; i++)
        body.push(
          <Day
            type={this.type}
            date={new DateTime([this.date.year, this.date.month - 1, lastDayFromPreviousMonth - len + 1 + i])}
            events={this.events}
            disabled
          />,
        );
      for (let i = 1; i <= new DateTime([this.date.year, this.date.month + 1, 0]).day; i++)
        body.push(<Day type={this.type} date={new DateTime([this.date.year, this.date.month, i])} events={this.events} />);
      for (let i = 1, len = 42 - body.length; i <= len; i++)
        body.push(
          <Day
            type={this.type}
            date={new DateTime([this.date.year, this.date.month + 1, i])}
            events={this.events}
            disabled
          />,
        );
    }
    return (
      <div
        style="relative; col:full; height:100%; container; gap:0; overflow:clip; scroll-snap-align: center; user-select: none"
        onClick={this.clickHandler.bind(this)}
      >
        {body}
      </div>
    );
  }
}

class Day extends Component {
  render() {
    const children = [
      <div style="col:full; text:center">
        {(this.type === "day"
          ? this.date.format({
              locales: "en-US",
              weekday: "long",
            }) + ", "
          : "") + this.date.day}
      </div>,
    ];
    const startOfDay = new DateTime([this.date.year, this.date.month, this.date.day]).time;
    const endOfDay = startOfDay + 24 * 3600 * 1000;
    for (let i = 0, len = this.events.length; i < len; i++) {
      const event = this.events[i];
      const start = new DateTime(event.start);
      const end = new DateTime(event.end);
      if (start.time > endOfDay || end.time < startOfDay) continue;
      let insert = (element) => children.push(element);
      for (let e = 0; e < i; e++) {
        if (start.time - new DateTime(this.events[e].start).time < 0) {
          insert = (element) => children.splice(e + 1, 0, element);
          break;
        }
      }
      insert(
        <Button
          ref={insertOnElement({ event: i })}
          raw
          style={{
            col: "full",
            mt: this.type === "month" ? "1rem" : "2rem",
            p: this.type === "day" ? "2rem!" : "0 0 0 3px!",
            borderLeft: "2px solid " + (event.color || "$neutral-color"),
            text: "left",
            radius: "0",
          }}
        >
          <p
            style={{
              text: this.type === "month" && "ellipsis",
              fontSize: this.type !== "day" ? "2.5rem" : "3rem",
              opacity: ".75",
              lineHeight: this.type === "month" && 0.8,
            }}
          >{`${start.format({ hour: "2-digit", minute: "2-digit" })} - ${end.format({ hour: "2-digit", minute: "2-digit" })}`}</p>
          {this.type !== "month" && event.location && (
            <p
              style={{
                text: this.type === "week" && "ellipsis",
                fontSize: "3.5rem",
                opacity: ".75",
              }}
            >
              {event.location}
            </p>
          )}
          <p
            style={{
              text: this.type === "month" && "ellipsis",
            }}
          >
            {event.title}
          </p>
        </Button>,
      );
    }
    return (
      <div
        ref={insertOnElement({ date: this.date })}
        style={{
          position: "relative",
          flex: "none",
          container: "default",
          height: this.type === "week" || this.type === "day" ? "100%" : 100 / 6 + "%",
          width: this.type === "day" ? "100%" : 100 / 7 + "%",
          gap: 0,
          border: "top",
          text: "left",
          overflow: "clip",
          "> *": {
            opacity: this.disabled && "0.5",
          },
        }}
      >
        {children}
      </div>
    );
  }
}

function insertOnElement(data) {
  return (e) => (e.data = Object.assign(e.data || {}, data));
}

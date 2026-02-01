import { Component, Form } from "@vistta/js";
import Input from "../input/index.jsx";
import Modal from "../modal/index.jsx";
import Toast from "../toast/index.jsx";
import { assignStyle } from "../utils";

const VARIANTS = ["success", "error", "info", "warning"];

export class CustomGlobalDialogs extends Component {
  alerts = [];
  confirm;
  prompt;
  alertPositioning = "top";

  async onConnect() {
    if (window.isServer) return;
    window.alert = (alert) => {
      if (typeof alert === "string") alert = { message: alert };
      else if (!alert || typeof alert !== "object") return;
      let count = 0;
      for (let i = 0, len = VARIANTS.length; i < len; i++) {
        if (!alert[VARIANTS[i]]) continue;
        alert.message = alert.error;
        alert.type = "error";
        count++;
      }
      if (count > 1) throw new Error("Alert can only have one variant type.");
      alert.key = `${new Date().getTime()}`;
      if (alert.type !== "error")
        setTimeout(() => (this.alerts = this.alerts.filter((a) => a !== alert)), alert.timeout ?? 5000);
      else alert.close = () => (this.alerts = this.alerts.filter((a) => a !== alert));
      this.alerts = [...this.alerts, alert];
    };
    window.confirm = (message) =>
      new Promise((resolve) => {
        if (typeof message === "string") message = { message };
        else if (!message || typeof message !== "object") return;
        this.confirm = { ...message, callback: (v) => ((this.confirm = null), resolve(v)) };
      });
    window.prompt = (prompt, fields) =>
      new Promise((resolve) => {
        if (typeof prompt === "string") prompt = { message: prompt, fields };
        if (!prompt.fields)
          prompt.fields = [{ name: "default", type: "text", label: prompt.label, value: prompt.value || "" }];
        this.prompt = {
          ...prompt,
          callback: (values) => {
            this.prompt = null;
            if (values === null) return resolve(null);
            const keys = Object.keys(values);
            if (keys.length === 1) return resolve(values[keys[0]]);
            return resolve(values);
          },
        };
      });
  }

  render() {
    return (
      <>
        {this.alerts.map((alert, index) => (
          <Toast
            key={alert.key}
            position={this.alertPositioning}
            variant={alert.type}
            message={alert.message}
            onDismiss={alert.close}
            style={
              this.alertPositioning === "top"
                ? `translate:-50% calc((${index + 1} * 4rem) + (${index} * 100%))`
                : `translate:-50% calc(${index + 1} * (-100% - 4rem))`
            }
          />
        ))}
        {this.confirm && (
          <Modal
            title={this.confirm.title}
            actions={[
              { raw: true, label: "Cancel", onClick: () => this.confirm.callback(false) },
              { label: this.confirm.submit || "OK", onClick: () => this.confirm.callback(true) },
            ]}
            open
          >
            <div style="col:full; p:4rem">{this.confirm.message}</div>
          </Modal>
        )}
        {this.prompt && (
          <Modal
            title={this.prompt.title}
            actions={[
              { raw: true, label: "Cancel", onClick: () => this.prompt.callback(null) },
              {
                label: this.prompt.submit || "Ok",
                onClick: () => this.prompt.callback(this.prompt.form.values()),
              },
            ]}
            open
          >
            {this.prompt.message && <div style="col:full; p:0 2rem">{this.prompt.message}</div>}
            <Form ref={(ref) => (this.prompt.form = ref)} style="display:contents">
              {this.prompt.fields.map((input) => (
                <Input {...input} style={assignStyle({ col: "full" }, input.style)} />
              ))}
            </Form>
          </Modal>
        )}
      </>
    );
  }
}

import { Component } from "@vistta/js";
import Modal from "../modal/index.jsx";
import Toast from "../toast/index.jsx";

const VARIANTS = ["success", "error", "info", "warning"];

export class CustomGlobalDialogs extends Component {
  alerts = [];
  confirm;
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
              { variant: "basic", label: "Cancel", onClick: () => this.confirm.callback(false) },
              { variant: "primary", label: "OK", onClick: () => this.confirm.callback(true) },
            ]}
            open
          >
            <div style="col:full; p:4rem">{this.confirm.message}</div>
          </Modal>
        )}
      </>
    );
  }
}

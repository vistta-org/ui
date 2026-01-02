import { Component } from "@vistta/js";
import Modal from "../modal/index.jsx";
import Toast from "../toast/index.jsx";

export class CustomGlobalDialogs extends Component {
  alerts = [];
  confirm;
  alertPositioning = "top";

  async onConnect() {
    if (window.isServer) return;
    window.alert = (alert) => {
      if (typeof alert === "string") alert = { message: alert };
      else if (!alert || typeof alert !== "object") return;
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
            style="max-width:min(600px, calc(100vw - 8rem)); p:4rem; gap:4rem;"
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

import base from "./base.js";
import colors from "./colors.js";
import forms from "./forms.js";
import interactive from "./interactive.js";
import layout from "./layout.js";
import misc from "./misc.js";
import typography from "./typography.js";
import utilities from "./utilities.js";

/**
 * @typedef {Object} Viewports
 * @property {string} [small] small viewport (default: 64ch)
 * @property {string} [medium] medium viewport (default: 78ch)
 * @property {string} [large] large viewport (default: 102ch)
 * @property {string} [xlarge] xlarge viewport (default: 128ch)
 * @property {string} [xxlarge] xxlarge viewport (default: 154ch)
 */

/**
 *
 * Generate style configuration
 * @param {object} config Style configuration
 * @param {number} [config.layout] Number of layout columns
 * @param {string} [config.size] Base size unit
 * @param {string} [config.duration] Base duration unit
 * @param {{ height: string }} [config.line] Base line height
 * @param {{ spacing: string }} [config.letter] Base letter spacing
 * @param {string} [config.radius] Base border radius
 * @param {string} [config.blur] Base blur
 * @param {import("./typography.js").Font} [config.font] Font configuration
 * @param {Viewports} [config.viewports] Viewports configuration
 * @param {object} [config.colors] Colors configuration
 * @param {import("./utilities.js").Animation} [config.animation] Animation configuration
 * @param {import("./utilities.js").Icon} [config.icon] Icon configuration
 * @param {import("./utilities.js").Border} [config.border] Border configuration
 * @param {import("./utilities.js").Shadow} [config.shadow] Shadow configuration
 */
export default (config = {}) => {
  const result = {
    properties: {},
    functions: {},
    vars: { size: config.size || "4px" },
    fonts: {},
    animations: {},
    queries: {
      sm: `(max-width: ${config.viewports?.small ?? "576px"})`,
      md: `(max-width: ${config.viewports?.medium ?? "768px"})`,
      lg: `(max-width: ${config.viewports?.large ?? "992px"})`,
      xl: `(max-width: ${config.viewports?.xlarge ?? "1200px"})`,
      xxl: `(max-width: ${config.viewports?.xxlarge ?? "1400px"})`,
    },
  };

  base(config, result);
  colors(config, result);
  interactive(config, result);
  forms(config, result);
  layout(config, result);
  misc(config, result);
  typography(config, result);
  utilities(config, result);

  return result;
};

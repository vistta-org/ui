export default (config, result) => {
  const baseContainer = "display: flex; width: 100%; flex-flow: row wrap; gap: 2rem; >*:($gap: 2rem);";
  result.properties.container = {
    default: baseContainer + " align-content: baseline;",
    start: baseContainer + " justify-content: flex-start;",
    center: baseContainer + " justify-content: center;",
    end: baseContainer + " justify-content: flex-end;",
    "space-between": baseContainer + " justify-content: space-between;",
    "space-around": baseContainer + " justify-content: space-around;",
    "space-evenly": baseContainer + " justify-content: space-evenly;",
    "*": baseContainer + " justify-content: ${};",
  };

  result.properties.col = {
    default: "flex: 1; margin: 0; max-width: 100%;",
    full: "flex: none; width: 100%;",
    "*": "flex: none; width: ${};",
  };
  for (let i = 1, len = config.layout ?? 12; i <= len; i++)
    result.properties.col[`${i}`] =
      `flex: none; width: calc(((100% - (${len - 1} * $gap)) / ${len}) * ${i} + ${i - 1} * $gap);`;

  result.properties.gap = {
    default: "gap: 2rem; >*:($gap: 2rem)",
    "*": "gap: ${}; >*:($gap: ${})",
  };

  return result;
};

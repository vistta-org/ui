export default (config, result) => {
  const baseContainer = "display: flex; width: 100%; flex-flow: row wrap; gap: $size; >*:($gap: $size);";
  result.properties.container = {
    default: baseContainer + " align-content: baseline;",
    start: baseContainer + " place-content: flex-start;",
    center: baseContainer + " place-content: center;",
    end: baseContainer + " place-content: flex-end;",
    between: baseContainer + " place-content: space-between;",
    around: baseContainer + " place-content: space-around;",
    evenly: baseContainer + " place-content: space-evenly;",
    "*": baseContainer + " place-content: ${};",
  };

  result.properties.col = {
    default: "flex: 1; margin: 0; max-width: 100%;",
    full: "flex: none; width: 100%;",
    auto: "flex: none; width: auto;",
  };
  for (let i = 1, len = config.layout ?? 12; i <= len; i++)
    result.properties.col[`${i}`] =
      `flex: none; width: calc(((100% - (${len - 1} * $gap)) / ${len}) * ${i} + ${i - 1} * $gap);`;

  result.properties.gap = {
    default: "gap: $size; >*:($gap: $size)",
    "*": "gap: ${}; >*:($gap: ${})",
  };

  return result;
};

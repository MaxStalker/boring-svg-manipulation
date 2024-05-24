import parse from "parse-svg-path";
import offsetWithLines from "./offset/with-lines.js";
import zip from "./points";

export default function warpToLine(path, line) {
  const points = parse(path);
  const offsetPoints = offsetWithLines(points, line);

  return zip(offsetPoints);
}

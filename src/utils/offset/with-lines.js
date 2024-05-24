import { getCoordinates, getOffset } from "../../utils-2";

export default function offsetWithLines(points, guidePoints) {
  let result = []; // this one will store our offseted points
  let lines = []; // and here we will keep "fixed" instructions for backward lookup

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const [instruction, ...coordinates] = point;

    switch (instruction) {
      // Lines and pointer Moves
      // ------------------------------------------------------------------
      case "L":
      case "M": {
        const [x, y] = coordinates;
        const offset = getOffset(guidePoints, [x, y]);
        const newY = y + offset;

        result.push([instruction, x, newY]);
        lines.push(point);

        break;
      }

      // Horizontal Lines
      // ------------------------------------------------------------------
      case "H": {
        const [newX] = coordinates;
        const prev = getCoordinates(lines[i - 1]);
        const line = ["L", newX, prev[1]];
        lines.push(line);

        const y = prev[1];
        const offset = getOffset(guidePoints, [newX, y]);
        const newY = y + offset;
        result.push(["L", newX, newY]);

        break;
      }

      // Vertical Lines
      // ------------------------------------------------------------------
      case "V": {
        const [y] = coordinates;
        const prev = getCoordinates(lines[i - 1]);
        const line = ["L", prev[0], y];
        lines.push(line);

        const x = prev[0];
        const offset = getOffset(guidePoints, [x, y]);
        const newY = y + offset;
        result.push(["L", x, newY]);

        break;
      }

      // Bezier Curves
      // -------------------------------------------------------------------
      case "C": {
        const [cp0x, cp0y, cp1x, cp1y, x, y] = coordinates;
        const cp0_Offset = getOffset(guidePoints, [cp0x, cp0y]);
        const cp1_Offset = getOffset(guidePoints, [cp0x, cp0y]);
        const offset = getOffset(guidePoints, [x, y]);

        const newCP0Y = cp0y + cp0_Offset;
        const newCP1Y = cp1y + cp1_Offset;
        const newY = y + offset;

        result.push(["C", cp0x, newCP0Y, cp1x, newCP1Y, x, newY]);
        lines.push(point);

        break;
      }

      // Everything else
      // ------------------------------------------------------------------
      default:
        result.push(point);
        lines.push(point);
        break;
    }
  }

  return result;
}

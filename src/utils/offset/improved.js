import getOffset from "./get-offset";

export default function offsetImproved(guidePoints) {
  return function (acc, point, i) {
    const [instruction, ...coordinates] = point;

    switch (instruction) {
      case "L":
      case "M": {
        // calculate offset
        const [x, y] = coordinates;
        const offset = getOffset(guidePoints, [x, y]);
        // apply it to Y coordinate
        const newY = y + offset;

        // plug it back into instruction set
        acc.push([instruction, x, newY]);
        break;
      }

      case "C": {
        const [cp0x, cp0y, cp1x, cp1y, x, y] = coordinates;
        const cp0_Offset = getOffset(guidePoints, [cp0x, cp0y]);
        const cp1_Offset = getOffset(guidePoints, [cp0x, cp0y]);
        const offset = getOffset(guidePoints, [x, y]);

        const newCP0Y = cp0y + cp0_Offset;
        const newCP1Y = cp1y + cp1_Offset;
        const newY = y + offset;
        acc.push(["C", cp0x, newCP0Y, cp1x, newCP1Y, x, newY]);
        break;
      }
      default:
        acc.push(point);
        break;
    }

    return acc;
  };
}

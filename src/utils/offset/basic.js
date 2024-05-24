import { getOffset } from "../../utils-2";

export default function offset(guidePoints) {
  return function (point) {
    const [instruction, x, y] = point;
    if (instruction === "Z") {
      return point;
    }

    // calculate offset
    const offset = getOffset(guidePoints, [x, y]);
    // apply it to Y coordinate
    const newY = y + offset;

    // plug it back into instruction set
    return [instruction, x, newY];
  };
}

import parse from "parse-svg-path";
import {offsetWithLines} from "../utils-2";

export function getCoordinates(point) {
  const [instruction, ...coordinates] = point;
  switch (instruction) {
    case "L":
    case "M": {
      return coordinates;
    }

    case "C": {
      return coordinates.slice(4);
    }
  }
  return [];
}

export function warpToLine(path, line) {
  const points = parse(path);
  const offsetPoints = offsetWithLines(points, line);

  return zip(offsetPoints);
}

export function zip(instructionSet) {
  return instructionSet.reduce((path, instruction) => {
    // we will add new line character there, so we can debug it easier
    return path + instruction.join(" ") + "\n";
  }, "");
}

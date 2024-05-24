import parse from "parse-svg-path";

export function getOffset(guidePoints, point) {
  const [[x0, y0], [x1, y1]] = guidePoints;
  const [x, y] = point;

  const ratio = (x - x0) / (x1 - x0);
  const maxOffset = y1 - y0;

  return ratio * maxOffset;
}

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

export function offset(guidePoints) {
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

export function offsetImproved(guidePoints) {
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

export function offsetWithLines(points, guidePoints) {
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

export function zip(instructionSet) {
  return instructionSet.reduce((path, instruction) => {
    // we will add new line character there, so we can debug it easier
    return path + instruction.join(" ") + "\n";
  }, "");
}

export function warpToLine(path, line) {
  const points = parse(path);
  const offsetPoints = offsetWithLines(points, line);

  return zip(offsetPoints);
}

export function insertPath(parentNode, path) {
  const child = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path",
  );
  child.setAttribute("d", path);
  parentNode.appendChild(child);
}

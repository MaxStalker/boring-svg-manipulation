export default function getCoordinates(point) {
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

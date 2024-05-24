import parse from "parse-svg-path";
import { offsetWithLines, zip } from "../utils";

function warp() {
  // Grab nodes
  const guide = document.getElementById("guide");
  const target = document.getElementById("target");

  // Extract path definitions
  const guidePath = guide.getAttribute("d");
  const targetPath = target.getAttribute("d");

  // Parse points
  const guidePoints = parse(guidePath).map((point) => point.slice(1));
  const targetPoints = parse(targetPath);
  const offsetPoints = offsetWithLines(targetPoints, guidePoints);

  // Apply offset
  const offsetPath = zip(offsetPoints);
  const offsetShape = document.getElementById("offsetShape");
  offsetShape.setAttribute("d", offsetPath);
}

// Run, Forest, run!
warp();

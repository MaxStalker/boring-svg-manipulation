import parse from "parse-svg-path";
import { insertPath, warpToLine } from "../utils";

function warp() {
  // Grab nodes
  const guide = document.getElementById("guide");
  const offsetGroup = document.getElementById("offset");

  // Extract guide line
  const guidePath = guide.getAttribute("d");
  const guideline = parse(guidePath).map((point) => point.slice(1));

  // Iterate over all elements in target group
  const letters = document.querySelectorAll("#target path");
  for (let i = 0; i < letters.length; i++) {
    const letterPath = letters[i].getAttribute("d");
    const offsetPath = warpToLine(letterPath, guideline);
    insertPath(offsetGroup, offsetPath);
  }
}

// Run, Forest, run!
warp();

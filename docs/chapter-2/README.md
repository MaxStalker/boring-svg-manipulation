# Chapter 2: A Bit More Complicated

Last time we were able to skew simple polygon according to guide line. Now let’s try to apply the same technique to something more complex. Ultimately we would want to skew the whole line of text, so how about we take single character first.

Pick your font, write a letter, convert to outline strokes and export to SVG. Here’s what I’ve got:

```jsx
  <path
    id="target"
    d="M335.75 100C354.417 100 370.917 104.167 385.25 112.5C399.75 120.667 410.917 132.083 418.75 146.75C426.75 161.417 430.75 178 430.75 196.5C430.75 215.5 424.75 233.083 412.75 249.25C400.917 265.25 386.167 278 368.5 287.5C350.833 296.833 334 301.5 318 301.5C310.333 301.5 302.75 301.083 295.25 300.25C282.75 299.417 273.167 299 266.5 299H227V285L250.5 266.5V127.25L222.75 118.75L231 102.5H266.25C281.583 102.5 296.583 102 311.25 101C322.583 100.333 330.75 100 335.75 100ZM325.25 278.25C335.75 278.25 345.25 275.25 353.75 269.25C362.417 263.25 369.167 254.917 374 244.25C379 233.583 381.5 221.583 381.5 208.25C381.5 192.25 379.083 177.833 374.25 165C369.583 152 362.333 141.667 352.5 134C342.833 126.167 330.833 122.25 316.5 122.25C309 122.25 302.083 124.25 295.75 128.25V273.5C304.25 276.667 314 278.25 325 278.25H325.25Z"
    stroke="#CCC"
    stroke-width="1"
    stroke-dasharray="4 6"
  />
```

![canvas (4).jpg](Chapter%202%20A%20Bit%20More%20Complicated%207baa21a86f29481f8f786d8dd7f2a045/canvas_(4).jpg)

Let’s clean up the `d` path and see what is happening inside that instruction:

```jsx
[
	["M",335,100],
	["C",354,100,370,104,385,112],
	["C",399,120,410,132,418,146],
	... // more instructions here
	["C",282,299,273,299,266,299]
	["H",227], 
	["V",285],
	["L",250,266],
	["V",127],
	["L",222,118],
	... // more lines
	["Z"], // oh, this is new
	["M",325,278],
	["C",335,278,345,275,353,269],
	... // more lines here
	,["Z"]]
```

We have some new guests:

- `C` is a [cubic bezier curve](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#b%C3%A9zier_curves) and instruction represents two control point and destination point - sorta like this `C x1 y1, x2 y2, x y`
- `H` and `L` are line commands - **H**orizontal and **V**ertical - it only have single number next to it which denotes new coordinates on respective axis. Second value will remain unchanged
- Notice that we have two instances of `Z` and `M` instructions, since we want to draw two overlapping shapes to “cut out” the middle part of that D character.

Let’s replace our polygon with letter shape on SVG canvas and try to run our code.

And it breaks… 😭

```jsx
Error: <path> attribute d: Expected number, "….94496610169492\nC 399.75 159.527…".
```

Right, it doesn’t know how to handle new instructions. We need a new method called `offsetImproved` :

```jsx
export function offsetImproved(guidePoints) {
  return function (point, index, points) {
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
        return [instruction, x, newY];
      }
      
      case "C": {
        const [cp0x, cp0y, cp1x, cp1y, x, y] = coordinates;
        const cp0_Offset = getOffset(guidePoints, [cp0x, cp0y]);
        const cp1_Offset = getOffset(guidePoints, [cp0x, cp0y]);
        const offset = getOffset(guidePoints, [x, y]);

        const newCP0Y = cp0y + cp0_Offset;
        const newCP1Y = cp1y + cp1_Offset;
        const newY = y + offset;
        return [instruction, cp0x, newCP0Y, cp1x, newCP1Y, x, newY];
      }
      
      case "Z":
        return point;
    }

    return point;
  };
}
```

Now it works, but vertical and horizontal instructions were simply ignored and they break the flow:

![Untitled](Chapter%202%20A%20Bit%20More%20Complicated%207baa21a86f29481f8f786d8dd7f2a045/Untitled.png)

We need to convert those `H` and `V` into `L` instructions. In order to do it, we can grab previous instruction and extract necessary coordinates from it. We will also convert this into reducer function instead of map, since we want to access already modified point:

```jsx
export function offsetImproved(guidePoints) {
  return function (acc, point, index) {
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

      case "H": {
        const [newX] = coordinates;
        const [y] = getCoordinates(acc[index - 1]).slice(1)
        // Notice that we already applied offset to previous point, so we don't need to calculate it again
        acc.push(["L", newX, y]);
        break;
      }

      case "V": {
        const [y] = coordinates;
        const [x] = getCoordinates(acc[index - 1])

        // But we need to calculate new Y position for vertical line, since it will be changed
        const offset = getOffset(guidePoints, [x, y]);
        const newY = y + offset;

        acc.push(["L", x, newY]);
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
```

Now let’s import it and update the code:

```jsx
  import { offset, offsetImproved, zip } from "../utils";
  
  // ... more of the setup here
  const offsetPoints = targetPoints.reduce(offsetImproved(guidePoints), []);
```

![Untitled](Chapter%202%20A%20Bit%20More%20Complicated%207baa21a86f29481f8f786d8dd7f2a045/Untitled%201.png)

Much better! Try to adjust guideline and invert the slope.

![Untitled](Chapter%202%20A%20Bit%20More%20Complicated%207baa21a86f29481f8f786d8dd7f2a045/Untitled%202.png)

Create new character and give it a go:

![Untitled](Chapter%202%20A%20Bit%20More%20Complicated%207baa21a86f29481f8f786d8dd7f2a045/Untitled%203.png)

…and some more:

![Untitled](Chapter%202%20A%20Bit%20More%20Complicated%207baa21a86f29481f8f786d8dd7f2a045/Untitled%204.png)

![Untitled](Chapter%202%20A%20Bit%20More%20Complicated%207baa21a86f29481f8f786d8dd7f2a045/Untitled%205.png)

![https://media2.giphy.com/media/l0K4mq3yRICCW4czm/giphy.gif?cid=7941fdc689r919aluoaa3dcjy26uudstbf7ff1db84qqo7uq&ep=v1_gifs_search&rid=giphy.gif&ct=g](https://media2.giphy.com/media/l0K4mq3yRICCW4czm/giphy.gif?cid=7941fdc689r919aluoaa3dcjy26uudstbf7ff1db84qqo7uq&ep=v1_gifs_search&rid=giphy.gif&ct=g)

We were this 🤏close.

Now what is happening there. We shall comment out offset shape, so we could see the original one. 

![Untitled](Chapter%202%20A%20Bit%20More%20Complicated%207baa21a86f29481f8f786d8dd7f2a045/Untitled%206.png)

This looks fine.

The problem is that our reducer takes some coordinate value from previous point, but that point already includes offset we need to apply. This is most apparent on horizontal lines. We shall remember unmodified coordinates of a previous point in order to calculate new offset. To the “whiteboard”!

```jsx
export function offsetWithLines(points, guidePoints) {
  let result = []; // this one will store our offseted points
  let lines = [];  // and here we will keep "fixed" instructions for backward lookup

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
```

Now we can update the call in our main code and keep the rest unchanged:

```jsx
  const offsetPoints = offsetWithLines(targetPoints, guidePoints);
```

![Untitled](Chapter%202%20A%20Bit%20More%20Complicated%207baa21a86f29481f8f786d8dd7f2a045/Untitled%207.png)

![Untitled](Chapter%202%20A%20Bit%20More%20Complicated%207baa21a86f29481f8f786d8dd7f2a045/Untitled%208.png)

![Untitled](Chapter%202%20A%20Bit%20More%20Complicated%207baa21a86f29481f8f786d8dd7f2a045/Untitled%209.png)

![https://media4.giphy.com/media/glvyCVWYJ21fq/giphy.gif?cid=7941fdc690lly59kxhqeskh79wff2r0wx6us1dl2h3ximnqk&ep=v1_gifs_search&rid=giphy.gif&ct=g](https://media4.giphy.com/media/glvyCVWYJ21fq/giphy.gif?cid=7941fdc690lly59kxhqeskh79wff2r0wx6us1dl2h3ximnqk&ep=v1_gifs_search&rid=giphy.gif&ct=g)

## “Hello” Word

Since our algorithm works with individual letters, we should be able to warp whole word as well. We can simply iterate over all `path` children of a specific SVG group and apply our transformation.

Open Figma, write “hello” word in font that you like, outline strokes and export SVG file. Then we can copy/paste all the relevant paths and put them into `<g>` tag - which is used to **g**roup items. Here’s what I’ve got:

```html
  <svg
    width="640"
    height="480"
    viewBox="0 0 640 480"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path id="guide" d="M145 366L499 420" stroke="orange" />

    <g id="target" class="dashed">
      <path
        d="M417.905 236.182V234.644C417.905 228.833 418.735 223.486 420.396 218.604C422.056 213.672 424.497 209.399 427.72 205.786C430.942 202.173 434.922 199.365 439.658 197.363C444.395 195.312 449.863 194.287 456.064 194.287C462.314 194.287 467.808 195.312 472.544 197.363C477.329 199.365 481.333 202.173 484.556 205.786C487.778 209.399 490.22 213.672 491.88 218.604C493.54 223.486 494.37 228.833 494.37 234.644V236.182C494.37 241.943 493.54 247.29 491.88 252.222C490.22 257.104 487.778 261.377 484.556 265.039C481.333 268.652 477.354 271.46 472.617 273.462C467.881 275.464 462.412 276.465 456.211 276.465C450.01 276.465 444.517 275.464 439.731 273.462C434.946 271.46 430.942 268.652 427.72 265.039C424.497 261.377 422.056 257.104 420.396 252.222C418.735 247.29 417.905 241.943 417.905 236.182ZM442.588 234.644V236.182C442.588 239.16 442.808 241.943 443.247 244.531C443.687 247.119 444.419 249.39 445.444 251.343C446.47 253.247 447.861 254.736 449.619 255.811C451.377 256.885 453.574 257.422 456.211 257.422C458.799 257.422 460.947 256.885 462.656 255.811C464.414 254.736 465.806 253.247 466.831 251.343C467.856 249.39 468.589 247.119 469.028 244.531C469.468 241.943 469.688 239.16 469.688 236.182V234.644C469.688 231.763 469.468 229.053 469.028 226.514C468.589 223.926 467.856 221.655 466.831 219.702C465.806 217.7 464.414 216.138 462.656 215.015C460.898 213.892 458.701 213.33 456.064 213.33C453.477 213.33 451.304 213.892 449.546 215.015C447.837 216.138 446.47 217.7 445.444 219.702C444.419 221.655 443.687 223.926 443.247 226.514C442.808 229.053 442.588 231.763 442.588 234.644Z"
      />
      <path
        d="M405.747 162.5V275H380.991V162.5H405.747Z"
      />
      <path
        d="M364.438 162.5V275H339.683V162.5H364.438Z"
      />
      <path
        d="M295.005 276.465C288.56 276.465 282.798 275.464 277.72 273.462C272.642 271.411 268.345 268.604 264.829 265.039C261.362 261.475 258.701 257.373 256.846 252.734C255.039 248.096 254.136 243.188 254.136 238.013V235.229C254.136 229.419 254.941 224.048 256.553 219.116C258.164 214.136 260.557 209.79 263.73 206.079C266.904 202.368 270.884 199.487 275.669 197.437C280.454 195.337 286.021 194.287 292.368 194.287C297.983 194.287 303.013 195.19 307.456 196.997C311.899 198.804 315.659 201.392 318.735 204.761C321.86 208.13 324.229 212.207 325.84 216.992C327.5 221.777 328.33 227.148 328.33 233.105V243.14H263.584V227.686H304.233V225.781C304.282 223.145 303.818 220.898 302.842 219.043C301.914 217.188 300.547 215.771 298.74 214.795C296.934 213.818 294.736 213.33 292.148 213.33C289.463 213.33 287.241 213.916 285.483 215.088C283.774 216.26 282.432 217.871 281.455 219.922C280.527 221.924 279.868 224.243 279.478 226.88C279.087 229.517 278.892 232.3 278.892 235.229V238.013C278.892 240.942 279.282 243.604 280.063 245.996C280.894 248.389 282.065 250.439 283.579 252.148C285.142 253.809 286.997 255.103 289.146 256.03C291.343 256.958 293.833 257.422 296.616 257.422C299.985 257.422 303.306 256.787 306.577 255.518C309.849 254.248 312.656 252.148 315 249.219L326.206 262.549C324.595 264.844 322.3 267.065 319.321 269.214C316.392 271.362 312.876 273.12 308.774 274.487C304.673 275.806 300.083 276.465 295.005 276.465Z"
      />
      <path
        d="M196.128 162.5V275H171.445V162.5H196.128ZM193.198 232.666L187.412 232.812C187.412 227.246 188.096 222.119 189.463 217.432C190.83 212.744 192.783 208.667 195.322 205.2C197.861 201.733 200.913 199.048 204.478 197.144C208.042 195.239 211.997 194.287 216.343 194.287C220.249 194.287 223.813 194.849 227.036 195.972C230.308 197.095 233.115 198.901 235.459 201.392C237.852 203.882 239.683 207.129 240.952 211.133C242.271 215.137 242.93 220.02 242.93 225.781V275H218.101V225.635C218.101 222.412 217.637 219.922 216.709 218.164C215.83 216.357 214.561 215.112 212.9 214.429C211.24 213.696 209.214 213.33 206.821 213.33C203.94 213.33 201.597 213.818 199.79 214.795C197.983 215.771 196.592 217.139 195.615 218.896C194.688 220.605 194.053 222.632 193.711 224.976C193.369 227.319 193.198 229.883 193.198 232.666Z"
      />
    </g>

    <g id="offset" class="solid"></g>
  </svg>
```

Let’s condense the code from our previous step into separate `warpToLine` utility function:

```jsx
export function warpToLine(path, line) {
  const points = parse(path);
  const offsetPoints = offsetWithLines(points, line);

  return zip(offsetPoints);
}
```

Then create another `inserPath` function, which will create new element and paste it into parent node:

```jsx
export function insertPath(parentNode, path) {
  const child = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path",
  );
  child.setAttribute("d", path);
  parentNode.appendChild(child);
}
```

Now we can utilize them and rewrite our main procedure:

```jsx
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
```

![Untitled](Chapter%202%20A%20Bit%20More%20Complicated%207baa21a86f29481f8f786d8dd7f2a045/Untitled%2010.png)

![Untitled](Chapter%202%20A%20Bit%20More%20Complicated%207baa21a86f29481f8f786d8dd7f2a045/Untitled%2011.png)

Easy! 😤
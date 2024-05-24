## How **WE** gonna do it?

Kittl feature is quite complex, but we will start small. Let’s try to modify the corners of the rectangular shape based on the slope of the straight line. We will assume that leftmost point of rectangle perfectly aligns with left side of rectangle and the same is true for the right side.

For any point on the edge of rectangle, we will take `x` coordinate of the point, project it on the guide line to calculate the `y` difference of that point, relative to it’s edge. This will give us the difference we need to apply to original point.

![Basic Idea](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/2wzmc0f20471yfd9szgb.png)

## Let's start

Instead of going “whole mile” with using something like React template, we will create a blank HTML file and populate it with minimum content:

```html
<html>
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
    />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>SVG Alteration Study</title>
  </head>
  <body></body>
</html>
```

Next we will open Figma, create rectangle, convert it to outlines (this is important, since we want to adjust position of individual points), slightly offset the points up and to the side (I will explain why in a bit), add another line below it (we will use it as guide) and export it. Then open file with your text editor (I have Notepad here, it’s more than enough). This is what I got here:

```html
<svg
  width="640"
  height="480"
  viewBox="0 0 640 480"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M146.034 288.994L150.967 140.994L498.945 139.006L491.052 287.005L146.034 288.994Z"
    stroke="#0F66EA"
    stroke-width="2"
  />
  <path d="M145 366L499 326" stroke="#00B347" />
</svg>
```

Plug that into the body tag and open the page in browser. Plain boring pair of rectangle and a line should appear:

![Boring rectangle](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/aq253hay92n112zq3zt6.png)

But boring is good! It will allow us to manually adjust the values and see how it affects the output.

Let’s examine our SVG in detail. We can see that viewbox of our canvas is 640px wide and 480px. That will be our working area. Anything that would go outside of bounds would be cropped. You can think about it as a `camera`. Also notice, even though we have `width` and `height` properties on `<svg>` tag - those represent browser dimensions of SVG container, not the working area size. We can make it smaller or bigger if needed, while keeping the same logic and inner elements.

Then we have two paths. First one is most likely define our “rectangular”, since it’s `d` value (which is responsible for path definition) have more data in it. Second one is our guide line. Let’s add `id` property to both of them, so we could reference them later:

```html
<svg
  width="640"
  height="480"
  viewBox="0 0 640 480"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    id="target"
    d="M146.034 288.994L150.967 140.994L498.945 139.006L491.052 287.005L146.034 288.994Z"
    stroke="#0F66EA"
    stroke-width="2"
  />
  <path id="guide" d="M145 366L499 326" stroke="#00B347" />
</svg>
```

Back to the `d` property. Take a look at guide’s path - `M145 366L499 326` . That’s a bit cryptic isn’t it? But inside of it there is a set of instructions how to plot this line. Let’s modify it to look like a tabular data, using characters like `M` and `L` as a marker to start a new line:

```html
M 145 366 L 499 326
```

Ha, now this is a bit easier:

- capital `M` instruction will move the “tip” of your pen to a specific location (X, Y) relative to (0, 0) point and will wait for next instruction.
- capital `L` will draw a line from current “tip” position to (X, Y) coordinate (relative to zero point)

Meaning those two lines of instructions will move the pen to **(145, 366)** and then draw a line to **(499, 326).**

> Note that `L` instruction will keep the tip at **(499, 326).** If we would write another `L` instruction, for example, `L 520, 350` it will connect points at **(499, 326)** and **(520, 350)**.
> Even though it doesn’t affect how we approach the solution, it’s important to understand the process in details.

Now to our `target` path. We will do the same - split instructions on individual lines:

```html
M 146.034 288.994 L 150.967 140.994 L 498.945 139.006 L 491.052 287.005 L
146.034 288.994 Z
```

Let’s round decimal parts on points to closest integer:

```html
M 146 289 L 150 140 L 498 139 L 491 287 L 146 289 Z
```

Capital `Z` instructions signifies that shape is closed and can be `filled` with color.

> You can also define multiple overlapping paths, dividing the definition with Z instructions. We will see the example later on, when we would try to warp the text.

Let’s translate it:

- **M**ove cursor to (146, 289)
- Draw a **L**ine (146, 289) → (150, 140)
- Draw a **L**ine (150, 140) → (498, 139)
- Draw a **L**ine (489, 139) → (491, 287)
- Draw a **L**ine (491, 287) → (146, 289)
- **Z**e end

Now we understand how shapes and paths are created, so we can edit them! We can try to create our own parser (which I did 🙈) , but let’s use some existing solution instead. I’ve found [parse-svg-path](https://www.npmjs.com/package/parse-svg-path) library, which will do the job.

## Add complexity

Let’s initialize our project with **pnpm** and **Vite**, so we can utilize 3rd party libraries in the project.

```bash
pnpm init
pnpm add vite
```

Then install `prettier` (to keep the code nice and tidy) and `parse-svg-path`:

```bash
pnpm add prettier parse-svg-path
```

Add dev command to scripts in `package.json`

```html
"scripts": { "dev": "vite" }
```

Make `index.html` and plug the code from above:

```html
<html>
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
    />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>SVG Alteration Study</title>
  </head>
  <body>
    <svg
      width="640"
      height="480"
      viewBox="0 0 640 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        id="target"
        d="M146.034 288.994L150.967 140.994L498.945 139.006L491.052 287.005L146.034 288.994Z"
        stroke="#0F66EA"
        stroke-width="2"
      />
      <path id="guide" d="M145 366L499 326" stroke="#00B347" />
    </svg>

    <script type="module" src="main.js"></script>
  </body>
</html>
```

Create `main.js` and `utils` files and put some simple code to make sure our Vite setup is working properly:

```js
// this goes into utils.js
export function hello() {
  console.log("Hello, world!");
}

// ------------------------------------------------------
// and this is our main.js
import { hello } from "./utils";

hello();
```

Now run `pnpm run dev` and you should see the page with our rectangle and `hello world` in the console. Well done! 👍

### Geometry Time ⌚

In order to calculate the offset we need to apply to the point, we can use basic geometry a devise a ratio using points coordinates:

![Offset calculation](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ued4xgepljribkycpdnt.png)

On the left hand side we have our Y offset and on the right we have ratio in the range from 0 to 1 multiplied by maximum offset. Let’s capture this in form of utility function we can use later.

First let’s check what `parse-svg-path` library will provide us. This way we won’t need to make extra conversions later on and make our utility work with formatted data right away:

```js
parse("m1 2 3 4"); // => [['m',1,2],['l',3,4]]
```

Right, so it will be array of arrays. Got it!

Our utility function will accept a tuple of tuples for guide points as first param and another tuple for point we want to offset.

```js
export function getOffset(guidePoints, offsetPoint) {
  const [[x0, y0], [x1, y1]] = guidePoints;
  const [x, y] = point;

  const ratio = (x - x0) / (x1 - x0);
  const maxOffset = y1 - y0;

  return ratio * maxOffset;
}
```

Back to our `main.js`:

```js
import parse from "parse-svg-path";

function run() {
  // Grab nodes
  const guide = document.getElementById("guide");
  const target = document.getElementById("target");

  // Extract path definitions
  const guidePath = guide.getAttribute("d");
  const targetPath = target.getAttribute("d");

  // Parse points
  const guidePoints = parse(guidePath);
  const targetPoints = parse(targetPath);

  console.log(guidePoints);
}

// Run, Forest, run!
run();
```

This will grab the DOM nodes, extract paths from them and try to parse guide points:

```js
[
  ["M", 145, 366],
  ["L", 499, 326],
];
```

That’s good! Now, since we know that this path will always have only two points (since we control how it is created) and parsing it will produce known result we can convert it to desired shape - something that `getOffset` can consume. We will use `.map` method on array and simply slice first value:

```js
const guidePoints = parse(guidePath).map((point) => point.slice(1));
```

This will give us clean pair of tuples to use as guide points.

```js
[
  [145, 366],
  [499, 326],
];
```

Next we will create a mapper for targetPath. We will use [currying](https://javascript.info/currying-partials) to create a function, which will return us another function, which then be applied to every point in our parsed instruction set via `.map` method:

```js
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
```

And apply it:

```js
const targetPoints = parse(targetPath);
const offsetPoints = targetPoints.map(offset(guidePoints));
```

If we will output the result into console we will see that Y coordinate of the point actually changed, compared to reference (targetPoints). Though right now it’s in array form and to display it we need to convert it back to path definition. Let’s implement `zip` function that will do just that:

```js
export function zip(instructionSet) {
  return instructionSet.reduce((path, instruction) => {
    return path + instruction.join(" ") + "\n";
  }, "");
}
```

Import it in `main.js` and apply to `offsetPoints`:

```js
import parse from "parse-svg-path";
import { offset, zip } from "./utils";

// ...

const offsetPath = zip(offsetPoints);
console.log(offsetPath);
```

This will produce nice and clean output:

```text
    M 146.034 288.87716384180794
    L 150.967 140.3197627118644
    L 498.945 99.01221468926553
    L 491.052 247.9030790960452
    L 146.034 288.87716384180794
    Z
```

Now let’s plug it back into our SVG canvas.

Create another path on the canvas, add `offsetShape` id so it can be referenced and adjust the style of `target` path to be displayed with dashed stroke line:

```html
<svg
  width="640"
  height="480"
  viewBox="0 0 640 480"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    id="target"
    d="M146.034 288.994L150.967 140.994L498.945 139.006L491.052 287.005L146.034 288.994Z"
    stroke="#CCC"
    stroke-width="1"
    stroke-dasharray="4 6"
  />
  <path id="guide" d="M145 366L499 326" stroke="orange" />

  <path id="offsetShape" d="" stroke="green" stroke-width="2" />
</svg>
```

Update the code in `main.js` :

```js
// Apply offset
const offsetPath = zip(offsetPoints);
const offsetShape = document.getElementById("offsetShape");
offsetShape.setAttribute("d", offsetPath);
```

..and voilà 👇

![Skewed!](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/7y8nw39z0s2rwfltgq5u.png)

You can play around with second coordinate of the guide path to check how it affects the target shape. For example, let’s slope it down instead of up. The beauty of our setup is that we only need to change the d parameter of the guide path and refresh the page (actually Vite will do refreshing part, if you still have dev server running):

```js
<path id="guide" d="M145 366L499 420" stroke="orange" />
```

![Skewed again](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/r7g3n0l2bx14e37cvtaf.png)

That’s a win! We can apply this to any shape now, right?

![Padme suspects something](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/jqvjop9xd6bfyim5r6g1.png)

## P.S.

[Second chapter](./chapter-2/README.md) will be more fun, I promise. Stay tuned! 😁
In the meantime, I’ve compiled the code from above into sandbox, so you can [fork it here](https://codesandbox.io/p/sandbox/svg-manipulation-w5x2gr) 👈

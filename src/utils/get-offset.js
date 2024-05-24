export default function getOffset(guidePoints, point) {
	const [[x0, y0], [x1, y1]] = guidePoints;
	const [x, y] = point;

	const ratio = (x - x0) / (x1 - x0);
	const maxOffset = y1 - y0;

	return ratio * maxOffset;
}
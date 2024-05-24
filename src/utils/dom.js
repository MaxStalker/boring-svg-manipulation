export default function insertPath(parentNode, path) {
	const child = document.createElementNS(
		"http://www.w3.org/2000/svg",
		"path",
	);
	child.setAttribute("d", path);
	parentNode.appendChild(child);
}

let canvas = undefined;
let context = undefined;

let parser = undefined;
let parsedSTL = undefined;

const OUTPUT_SCALE = 8;

const ANIMATION_DELAY = 20;
const SLICE_HEIGHT = 0.1;

let animationRunning = false;

function loadSTL() {
	let fileBlob = document.getElementById("fileInput").files[0];

	let parsingUpdates = document.getElementById("parsingUpdates");
	parsingUpdates.innerText = "Parsing file...";

	let reader = new FileReader();
	reader.onload = function (event) {
		try {
			let stlData = event.target.result;
			parser = new STLParser(stlData);
			parsedSTL = parser.parseSTL();
			parsingUpdates.innerText = "File parsed successfully.";
		} catch (e) {
			console.error(e);

			parsingUpdates.innerText = "Parsing failed, check console.";
		}
	}

	reader.readAsText(fileBlob);
}

function initCanvas(stl) {
	canvas = document.querySelector("canvas");
	context = canvas.getContext("2d");

	let stlBounds = stl.getHorizontalBounds();

	canvas.width = OUTPUT_SCALE * (stlBounds.maxX - stlBounds.minX);
	canvas.height = OUTPUT_SCALE * (stlBounds.maxY - stlBounds.minY);

	context.scale(OUTPUT_SCALE, OUTPUT_SCALE);
	context.translate(-stlBounds.minX, -stlBounds.minY);
}

function drawPathToCanvas(path) {
	// clear canvas
	context.save();
	context.setTransform(1, 0, 0, 1, 0, 0);
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.restore();

	let length = path.length;
	context.beginPath();
	context.lineWidth = 1 / OUTPUT_SCALE;
	for (let i = 0; i < length; i++) {
		let data = path[i];
		context.moveTo(data[0].x, data[0].y);
		/* not worth the overhead if we're just animating
		if (data.length == 1) {
			context.lineTo(data[0].x, data[0].y);
		}*/

		if (data.length >= 2) {
			if (Math.abs(data[0].x - data[1].x) > 100) {
				console.log(i);
			}
			context.lineTo(data[1].x, data[1].y);
		}

		if (data.length == 3) {
			context.lineTo(data[2].x, data[2].y);
		}
	}

	context.stroke();
}

function animateSTL() {
	if (parsedSTL === undefined) {
		alert("Input an ASCII STL file first!");
		return
	}

	if (animationRunning)
		return

	animationRunning = true;

	let stl = parsedSTL;
	initCanvas(stl);
	document.getElementById("frameInfo").style.visibility = "visible";

	let precision = 0;
	if ((SLICE_HEIGHT % 1) != 0) 
		precision = SLICE_HEIGHT.toString().split(".")[1].length;

	let stlBounds = stl.getVerticalBounds();

	let sliceHandler = new SliceHandler(stl);

	function nextFrame(sliceHandler, current, max) {
		current += SLICE_HEIGHT;
		document.getElementById("layerNumber").innerText = current.toFixed(precision);

		let path = sliceHandler.doSlice(current);
		drawPathToCanvas(path);

		if (current < max) {
			setTimeout(nextFrame, ANIMATION_DELAY, sliceHandler, current, max);
		} else {
			animationRunning = false;
		}
	}

	nextFrame(sliceHandler, stlBounds.min, stlBounds.max);
}
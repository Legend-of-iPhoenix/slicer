const EPSILON = .001;
const EPSILON_SQUARED = EPSILON * EPSILON;

let sliceHeight = 0;

class SliceHandler {
	constructor(stl) {
		this.stl = stl;
	}

	static getLineIntersection(point1, point2, sliceHeight, resultArrayPointer) {
		let d1 = point1.z - sliceHeight;
		let d2 = point2.z - sliceHeight;

		let found = 0;
		if (d1 * d1 < EPSILON_SQUARED) {
			found++;
			// check if it's already in the array, if so, don't add it.
			if (!resultArrayPointer.find(point => point1.equals(point))) {
				resultArrayPointer.push(point1);
			}
		}

		if (d2 * d2 < EPSILON_SQUARED) {
			found++;
			if (!resultArrayPointer.find(point => point2.equals(point))) {
				resultArrayPointer.push(point2);
			}
		}

		if (d1*d2 > EPSILON_SQUARED) {
			return;
		}

		if (found == 2) {
			return;
		}

		let t = d1 / (d1 - d2);
		// point1 + t * (point2 - point1)
		let pointCalculated = point1.plus(point2.minus(point1).times(t));

		if (!resultArrayPointer.find(point => pointCalculated.equals(point))) {
			resultArrayPointer.push(pointCalculated);
		}
	}

	static getTriangleIntersection(facet, sliceHeight) {
		let result = [];
			
		// arrays are passed as pointers in JS
		SliceHandler.getLineIntersection(facet.v1, facet.v2, sliceHeight, result);
		SliceHandler.getLineIntersection(facet.v2, facet.v3, sliceHeight, result);
		SliceHandler.getLineIntersection(facet.v3, facet.v1, sliceHeight, result);

		return result;
	}

	doSlice(height) {
		let facets = this.stl.facets;
		let length = facets.length;
		let results = [];
		for (let i = 0; i < length; i++) {
			let facet = facets[i];
			if (facet.getLowestPoint() > height)
				continue;
			if (facet.getHighestPoint() < height)
				continue;

			let result = SliceHandler.getTriangleIntersection(facet, height);
			if (result.length > 0) {
				results.push(result);
			}
		}

		return results;
	}
}
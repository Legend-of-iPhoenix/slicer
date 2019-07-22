class STL {
	constructor(facets) {
		this.facets = facets || [];
	}

	getHorizontalBounds() {
		let facets = this.facets;

		// there may be a lot of facets, so we can't use Math.max
		// or we'll exceed the max call stack size.
		let minX = facets.reduce((min, facet) => {
			let facetMinX = facet.getMinX();
			return min !== null ? Math.min(min, facetMinX) : facetMinX;
		}, null);

		let maxX = facets.reduce((max, facet) => {
			let facetMaxX = facet.getMaxX();
			return max !== null ? Math.max(max, facetMaxX) : facetMaxX;
		}, null);

		let minY = facets.reduce((min, facet) => {
			let facetMinY = facet.getMinY();
			return min !== null ?  Math.min(min, facetMinY) : facetMinY;
		}, null);

		let maxY = facets.reduce((max, facet) => {
			let facetMaxY = facet.getMaxY();
			return max !== null ? Math.max(max, facetMaxY) : facetMaxY;
		}, null);

		return {
			minX: minX,
			maxX: maxX,

			minY: minY,
			maxY: maxY
		};
	}

	getVerticalBounds() {
		let facets = this.facets;

		let min = facets.reduce((min, facet) => {
			let facetMin = facet.getLowestPoint();
			return min !== null ?  Math.min(min, facetMin) : facetMin;
		}, null);

		let max = facets.reduce((max, facet) => {
			let facetMax = facet.getHighestPoint();
			return max !== null ? Math.max(max, facetMax) : facetMax;
		}, null);

		return {
			min: min,
			max: max
		};
	}
}

class Facet {
	constructor(normal, v1, v2, v3) {
		this.normal = normal;

		this.v1 = v1;
		this.v2 = v2;
		this.v3 = v3;
	}

	getLowestPoint() {
		return Math.min(this.v1.z, this.v2.z, this.v3.z);
	}
	getHighestPoint() {
		return Math.max(this.v1.z, this.v2.z, this.v3.z);
	}

	getMinX() {
		return Math.min(this.v1.x, this.v2.x, this.v3.x);
	}
	getMaxX() {
		return Math.max(this.v1.x, this.v2.x, this.v3.x);
	}

	getMinY() {
		return Math.min(this.v1.y, this.v2.y, this.v3.y);
	}
	getMaxY() {
		return Math.max(this.v1.y, this.v2.y, this.v3.y);
	}
}

class Vector3D {
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	static dot(v1, v2) {
		return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
	}

	plus(vector) {
		return new Vector3D(
			this.x + vector.x,
			this.y + vector.y,
			this.z + vector.z
		);
	}

	minus(vector) {
		return new Vector3D(
			this.x - vector.x,
			this.y - vector.y,
			this.z - vector.z
		);
	}

	times(scalar) {
		return new Vector3D(
			this.x * scalar,
			this.y * scalar,
			this.z * scalar
		);
	}

	equals(vector) { // all our calculations are rough
		return (
			Math.abs(this.x - vector.x) < EPSILON &&
			Math.abs(this.y - vector.y) < EPSILON &&
			Math.abs(this.z - vector.z) < EPSILON
		);
	}
}
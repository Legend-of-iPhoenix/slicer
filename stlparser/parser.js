class STLParser {
	constructor(stlData) {
		this.stlData = stlData;

		this.position = 0;

		this.result = null;
	}

	expect(string) {
		let slicedData = this.stlData.substring(this.position);
		if (slicedData.startsWith(string)) {
			this.position += string.length;
		} else {
			let errorText = 'Invalid STL: Expected string "' + string + '" at ' + this.position + '.';
			throw new Error(errorText);
		}
	}

	anticipate(string) {
		let slicedData = this.stlData.substring(this.position);
		return slicedData.startsWith(string);
	}

	seek() {
		while(this.stlData.charAt(this.position) != '\n') {
			this.position++;
		}

		this.clearWhitespace();
	}

	expectNumerals() {
		let result = '';
		while (!isNaN(parseInt(this.stlData.charAt(this.position)))) {
			result += this.stlData.charAt(this.position);
			this.position++;
		}

		return result;
	}

	clearWhitespace() {
		while (this.stlData.charAt(this.position).trim() == '') {
			this.position++;
		}
	}

	parseSTL() {
		this.expect("solid ");

		// technically there's a name attr but do I look like I care
		this.seek();

		this.result = new STL();

		this.expectFacets();

		this.expect("endsolid ");

		return this.result;
	}

	expectFacets() {
		while (this.anticipate("facet ")) {
			let facet = this.expectFacet();
			this.result.facets.push(facet);
			this.clearWhitespace();
		}
	}

	expectFacet() {
		this.expect("facet ");

		this.expect("normal ");
		let normal = this.expectVector3();
		this.seek();

		this.expect("outer loop");
		this.seek();

		let verts = [];

		for (let i = 0; i < 3; i++) {
			this.expect("vertex ");
			verts.push(this.expectVector3());
			this.seek();
		}

		this.expect("endloop");
		this.seek();

		this.expect("endfacet");
		this.seek();

		let facet = new Facet(normal, ...verts);

		return facet;
	}

	expectVector3() {
		let vector = [];

		for (let i = 0; i < 3; i++) {
			vector.push(this.expectFloat());
			if (i != 2) { // without this, bad things happen
				this.clearWhitespace();
			}
		}

		return new Vector3D(...vector);
	}

	expectFloat() {
		let sign = "";

		if (this.anticipate("-")) {
			this.expect("-");
			sign = "-";
		}

		let mantissa = this.expectNumerals();
		if (this.anticipate(".")) {
			this.expect(".");
			mantissa += ".";

			mantissa += this.expectNumerals();
		}

		let exponent = "";
		if (this.anticipate("e")) {
			this.expect("e");
			exponent += "e";

			if (this.anticipate("-")) {
				this.expect("-");
				exponent += "-";
			}

			exponent += this.expectNumerals();
		}

		return parseFloat(sign + mantissa + exponent);
	}
}
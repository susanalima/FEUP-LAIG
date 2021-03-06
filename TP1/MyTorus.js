/**
 * MyTorus 
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
/**
  * MyTorus class is used to represent torus
  */
class MyTorus extends CGFobject {

	/**
	 * Class constructor for MyTorus
	 * @param {Object} scene Scene where the object will be displayed
	 * @param {Object} inner Inner radius, is the tube radius
	 * @param {Object} outer Outer radius, radius of the circular axis of the torus
	 * @param {Object} slices Number of slices of the torus
	 * @param {Object} loops Number of loops of the torus
	 */
	constructor(scene, inner, outer, slices, loops) {
		super(scene);

		this.inner = inner;
		this.outer = outer;
		this.slices = slices;
		this.loops = loops;
		this.initBuffers();
	};

	/**
	 * Function used to define the vertices, indices, normals and texture coordinates for the object
	 */
	initBuffers() {
		this.vertices = [
		];

		this.indices = [
		];

		this.normals = [
		];

		this.texCoords = [
		];

		let curve = 2 * Math.PI;
		for (let loop = 0; loop <= this.loops; loop++) {
			let angle1 = curve * loop / this.loops;
			for (let slice = 0; slice <= this.slices; slice++) {
				let angle2 = slice / this.slices * curve;

				let vertex_x = (this.inner * Math.cos(angle1) + this.outer) * Math.cos(angle2);
				let vertex_y = (this.inner * Math.cos(angle1) + this.outer) * Math.sin(angle2);
				let vertex_z = this.inner * Math.sin(angle1);

				//vertices
				this.vertices.push(vertex_x, vertex_y, vertex_z);

				let center_x = Math.cos(angle2) * this.outer;
				let center_y = Math.sin(angle2) * this.outer;
				//normals
				this.normals.push(vertex_x - center_x, vertex_y - center_y, vertex_z);

				//textCoords
				this.texCoords.push(slice / this.slices, loop / this.loops);

				//indices
				if (loop > 0 && slice > 0) {
					let i1 = (1 + this.slices) * loop + slice - 1;
					let i2 = (1 + this.slices) * (loop - 1) + slice - 1;
					let i3 = (1 + this.slices) * (loop - 1) + slice;
					let i4 = (1 + this.slices) * loop + slice;

					this.indices.push(i1, i2, i4, i2, i3, i4);
				}
			}
		}
		

		console.log(this.indices);
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};
	
};
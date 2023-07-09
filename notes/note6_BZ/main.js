import { Shader } from "./shader.js";


class Circle {
	constructor(centerX, centerY){
		this.centerX = centerX;
		this.centerY = centerY;
		this.radius = 0;
	}
	addRad(x){
		this.radius += x;
	}
}


class App {
	constructor() {

		const canvas = document.querySelector("#c");
		this.canvas = canvas;
		const gl = canvas.getContext("webgl2");
		this.gl = gl;


		const program = webglUtils.createProgramFromSources(gl, [Shader.vertex, Shader.fragment]);
		this.program = program;
		this.gl.useProgram(this.program);

		webglUtils.resizeCanvasToDisplaySize(gl.canvas);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		this.setAttribute();
		this.setUniform();

		this.setInteration();


		this.then = 0;
		this.time = 0;
		this.counter = 0;
		this.period = 1;
		this.currPointers = []
		requestAnimationFrame(this.render.bind(this));

	}
	setInteration() {
		const downEvent = e => {
			if ('ontouchstart' in window) {
				this.currPointers = e.targetTouches

			}
			else {
				this.currPointers = [e]

			}
		}
		const upEvent = e => {
			if ('ontouchstart' in window) {
				for (let touch of e.changedTouches) {
					this.currPointers = this.currPointers.filter(e => e !== touch);
				}


			}
			else {
				this.currPointers = []

			}
		}


		if ('ontouchstart' in window) this.canvas.addEventListener('touchstart', downEvent)
		else this.canvas.addEventListener('mousedown', downEvent)
		if ('ontouchstart' in window) this.canvas.addEventListener('touchend', upEvent)
		else this.canvas.addEventListener('mouseup', upEvent)

	}

	setUniform() {


		function getUniformLocationMap(gl, program, uniformNameArr) {
			const obj = {};
			uniformNameArr.forEach(name => {
				const location = gl.getUniformLocation(program, name);
				obj[name] = location;

			});
			return obj;
		}
		this.uniformLocationMap = getUniformLocationMap(this.gl, this.program, [
			"u_resolution",
			"u_center",
			"u_radius"
		])

		this.gl.uniform2f(this.uniformLocationMap["u_resolution"], this.canvas.width, this.canvas.height)

	}
	setAttribute() {









		// attribute는 buffer에서 가져옴 buffer 생성
		let positionBuffer = this.gl.createBuffer();
		// 전역 바인드 포인트가 positionBuffer을 가리키게 함. gpu가 positionBuffer 접근 가능. 바인드 하는 순간 GPU가 현재 그것을 사용할 수 있게 됨.
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
		let positions = [
			0, 0,
			100, 0,
			0, 100,
			100, 0,
			100, 100,
			0, 100
		];
		// positions 배열을 바인드 포인트가 가리키는 버퍼에 복사
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);





		let positionAttributeLocation = this.gl.getAttribLocation(this.program, "a_position");
		//vao == attribute 상태 집합
		let vao = this.gl.createVertexArray();
		//vao 바인드 == 현재 그것을 사용
		this.gl.bindVertexArray(vao);
		// attribute를 켬. positionAttributeLocation이 버퍼에서 데이터를 가져오게 
		this.gl.enableVertexAttribArray(positionAttributeLocation);
		let attrOption = {
			size: 2,
			type: this.gl.FLOAT,
			normalize: false,
			stride: 0,
			offset: 0,
		}
		//gl.ARRAY_BUFFER에 바인드된 버퍼를 vao에 바인드
		this.gl.vertexAttribPointer(
			positionAttributeLocation, ...Object.values(attrOption));

		this.gl.bindVertexArray(vao);



	}

	render(now) {

		now *= 0.001;
		this.deltaTime = now - this.then;
		this.then = now;
		this.time += this.deltaTime;
		this.counter += this.deltaTime;

		if (this.counter > this.period) {
			this.counter = 0;
			this.periodAct();
		}


		this.resize();
		this.valueUpdate();
		// this.draw();
		requestAnimationFrame(this.render.bind(this));

	}
	periodAct() {
		console.log(this.currPointers)
		for (let touch of this.currPointers) {
			new Circle(touch.clientX, touch.clinentY);
			
		}

	}
	valueUpdate() {



	}
	resize() {

		webglUtils.resizeCanvasToDisplaySize(this.canvas);


	}

	draw() {

		// this.gl.clearColor(0, 0, 0, 0);
		// this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		let primitiveType = this.gl.TRIANGLES;
		let offset = 0;
		let count = 6;
		let center = [100, 100]
		let radius = this.time * 10;
		this.setRect(this.gl, ...center, radius);
		this.gl.uniform2f(this.uniformLocationMap["u_center"], ...center);
		this.gl.uniform1f(this.uniformLocationMap["u_radius"], radius);
		this.gl.drawArrays(primitiveType, offset, count);

	}
	setRect(gl, x, y, rad) {
		const x1 = x - rad;
		const x2 = x + rad;
		const y1 = y - rad;
		const y2 = y + rad;
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			x1, y1,
			x2, y1,
			x1, y2,
			x1, y2,
			x2, y1,
			x2, y2
		]), gl.STATIC_DRAW)
	}
	timeUpdate() {

	}
}




function main() {
	new App();

}

window.onload = main;



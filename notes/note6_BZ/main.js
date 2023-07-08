// import {Shader} from "./shader.js";




// class App{
//     constructor(){
//         const canvas = document.querySelector("#c");
//         this.canvas = canvas;
//         const gl = canvas.getContext("webgl2");
//         this.gl = gl;


//         const program = webglUtils.createProgramFromSources(gl, [Shader.vertex, Shader.fragment]);
//         this.program = program;

        
//         webglUtils.resizeCanvasToDisplaySize(gl.canvas);
//         gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
//         this.setAttribute();
//         this.setUniform();

//         this.setInteration();
        
        
//         this.then = 0;
//         this.time = 0;
//         requestAnimationFrame(this.drawScene.bind(this));

//     }
//     setInteration(){
//         const downEvent = e=>{
            
//             [this.currX,this.currY] = [e.clientX ?? e.touches[0].clientX, e.clientY ?? e.touches[0].clientY];
            
            


//         }
//         const upEvent = e=>{

//         }


//         if ('ontouchstart' in window) this.canvas.addEventListener('touchstart',downEvent)
// 		else this.canvas.addEventListener('mousedown',downEvent)
//         if ('ontouchstart' in window) this.canvas.addEventListener('touchend',upEvent)
// 		else this.canvas.addEventListener('mouseup',upEvent)
        
//     }

//     setUniform(){


//         function getUniformLocationMap(gl, program, uniformNameArr){
//             const obj = {};
//             uniformNameArr.forEach(name => {
//                 const location = gl.getUniformLocation(program, name);
//                 obj[name] = location;
                
//             });
//             return obj;
//         }
//         this.uniformLocationMap = getUniformLocationMap(this.gl,this.program,[
//             "u_resolution",
//             "u_radius",
//             "u_center"
//         ])
        
//         this.gl.uniform2f(this.uniformLocationMap["u_resolution"], this.canvas.width, this.canvas.height)
//         this.gl.uniform2f(this.uniformLocationMap["u_center"],0,0)
        
//     }
//     setAttribute(){




        
//         this.gl.useProgram(this.program);
//         let positionAttributeLocation = this.gl.getAttribLocation(this.program, "a_position");
//         let positionBuffer = this.gl.createBuffer();
//         this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
//         let positions = [
//             0,0,
//             100, 0,
//             0, 100,
//             100,0,
//             100, 100,
//             0, 100
//         ];
//         this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
        






    
//         let vao = this.gl.createVertexArray();
//         this.gl.bindVertexArray(vao);
//         this.gl.enableVertexAttribArray(positionAttributeLocation);
//         let attrOption = {
//             size : 2,
//             type : this.gl.FLOAT,
//             normalize : false,
//             stride : 0,
//             offset : 0,      
//         }
//         this.gl.vertexAttribPointer(
//             positionAttributeLocation, ...Object.values(attrOption));

//         this.gl.bindVertexArray(vao);


        
//     }

//     drawScene(now){
        
//         now *= 0.001;
//         this.deltaTime = now - this.then;
//         this.then = now;
        
//         this.time += this.deltaTime;
//         // this.gl.uniform1f(this.uniformLocationMap["u_time"], this.time);

        
//         this.resize();
//         this.valueUpdate();
//         this.render();
//         requestAnimationFrame(this.drawScene.bind(this));
        
//     }    
//     valueUpdate(){

        

//     }
//     resize(){
        
//         webglUtils.resizeCanvasToDisplaySize(this.canvas);
        

//     }

//     render(){
        
//         this.gl.clearColor(0, 0, 0, 0);
//         this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
//         let primitiveType = this.gl.TRIANGLES;
//         let offset = 0;
//         let count = 6;
//         // this.gl.drawArrays(primitiveType, offset, count);


//         this.gl.uniform2f(this.uniformLocationMap["u_center"], 100,100)

//         this.gl.drawArrays(primitiveType, offset, count);
//     }
//     timeUpdate(){
        
//     }
// }




// function main(){
//     new App();

// }

// window.onload = main;


// WebGL 컨텍스트 초기화
const canvas = document.getElementById('c');
const gl = canvas.getContext('webgl');
const vs = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

// 프래그먼트 셰이더 소스 코드
const fs = `
  precision mediump float;
  uniform vec4 u_color;
  void main() {
    gl_FragColor = u_color;
  }
`;

// WebGL 프로그램 생성
const programInfo = twgl.createProgramInfo(gl, [vs, fs]);

// 원 객체 생성 함수
function createCircle(x, y, radius, color) {
  const arrays = {
    position: [],
    color: []
  };

  const segments = 36; // 원을 구성하는 세그먼트 수

  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const vx = x + Math.cos(theta) * radius;
    const vy = y + Math.sin(theta) * radius;
    arrays.position.push(vx, vy);
    arrays.color.push(...color);
  }

  return twgl.createBufferInfoFromArrays(gl, arrays);
}

// WebGL 초기화
twgl.resizeCanvasToDisplaySize(gl.canvas);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// 여러 개의 원 그리기
const circle1 = createCircle(0, 0, 0.3, [1.0, 0.0, 0.0, 1.0]); // 원 1
const circle2 = createCircle(0.5, 0.5, 0.2, [0.0, 1.0, 0.0, 1.0]); // 원 2
const circle3 = createCircle(-0.5, -0.5, 0.4, [0.0, 0.0, 1.0, 1.0]); // 원 3

// 원 그리기 함수
function drawCircle(bufferInfo) {
  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
  twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLE_FAN);
}

// 원 그리기
twgl.drawObjectList(gl, [
  { programInfo, bufferInfo: circle1 },
  { programInfo, bufferInfo: circle2 },
  { programInfo, bufferInfo: circle3 }
]);
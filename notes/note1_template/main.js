import {Shader} from "./shader.js";

let vertexShaderSource = Shader.vertex;
let fragmentShaderSource = Shader.fragment;


function setUniforms(gl, program, uniforms){

    Object.keys(uniforms).forEach(name => {
        const location = gl.getUniformLocation(program, name);
        const typeFn = uniforms[name].type;
        
        const value = uniforms[name].value;
        gl[typeFn](location, value);
        
    });

}


function main() {
    // Get A WebGL context
    let canvas = document.querySelector("#c");
    let gl = canvas.getContext("webgl2");
    if (!gl) {
        return;
    }

    let program = webglUtils.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);

    let positionAttributeLocation = gl.getAttribLocation(program, "a_position");


    let resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    // let pixelSizeUniformLocation = gl.getUniformLocation(program, "u_pixelSize");


    let positionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    let positions = [
        0,0,
        window.innerWidth, 0,
        0, window.innerHeight,
        window.innerWidth,0,
        window.innerWidth, window.innerHeight,
        0, window.innerHeight,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    let vao = gl.createVertexArray();

    gl.bindVertexArray(vao);

    gl.enableVertexAttribArray(positionAttributeLocation);

    let attrOption = {
        size : 2,
        type : gl.FLOAT,
        normalize : false,
        stride : 0,
        offset : 0,      
    }
    gl.vertexAttribPointer(
        positionAttributeLocation, ...Object.values(attrOption));

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    gl.bindVertexArray(vao);

    // gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    // gl.uniform1f(pixelSizeUniformLocation, 20.0);

    setUniforms(gl, program, {
        u_resolution : {type : "uniform2fv", value : [gl.canvas.width, gl.canvas.height]},
        u_pixelSize : {type : "uniform1fv", value : [20]},
        u_colors : {type : "uniform3fv", value : [0,0,0, 1,1,1]},
    })

    // draw
    let primitiveType = gl.TRIANGLES;
    let offset = 0;
    let count = 6;
    gl.drawArrays(primitiveType, offset, count);
}

main();

import {Shader} from "./shader.js";




class App{
    constructor(){
        const canvas = document.querySelector("#c");
        this.canvas = canvas;
        const gl = canvas.getContext("webgl2");
        this.gl = gl;


        const program = webglUtils.createProgramFromSources(gl, [Shader.vertex, Shader.fragment]);
        this.program = program;

        
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        this.setAttribute();
        this.setUniform();
        this.setInteration();
        
        
        this.then = 0;
        this.time = 0;
        requestAnimationFrame(this.drawScene.bind(this));

    }

    setInteration(){
        const downEvent = ()=>{
            this.canvas.addEventListener("mousemove", moveEvent,false);
            console.log(1)
        }
        const moveEvent = ()=>{
            console.log(2)
        }
        const upEvent = ()=>{
            this.canvas.removeEventListener("mousemove", moveEvent,false);
            console.log(3)
        }

        this.canvas.addEventListener("mousedown", downEvent,false);
    
        this.canvas.addEventListener("mouseup", upEvent,false);
        
    }

    setUniform(){
        function getUniformLocationMap(gl, program, uniformNameArr){
            const obj = {};
            uniformNameArr.forEach(name => {
                const location = gl.getUniformLocation(program, name);
                obj[name] = location;
                
            });
            return obj;
        }
        this.uniformLocationMap = getUniformLocationMap(this.gl,this.program,[
            "u_resolution", "u_pixelSize", "u_colors", "u_center", "u_time"
        ])
        this.gl.uniform2f(this.uniformLocationMap["u_resolution"], this.canvas.width, this.canvas.height)
        this.gl.uniform1f(this.uniformLocationMap["u_pixelSize"], 15)
        this.gl.uniform3fv(this.uniformLocationMap["u_colors"],[0,0,0, 1,1,1])
        this.gl.uniform2f(this.uniformLocationMap["u_center"],this.canvas.width / 2, this.canvas.height / 2)
    }
    setAttribute(){
        let positionAttributeLocation = this.gl.getAttribLocation(this.program, "a_position");
        let positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        let positions = [
            0,0,
            window.innerWidth, 0,
            0, window.innerHeight,
            window.innerWidth,0,
            window.innerWidth, window.innerHeight,
            0, window.innerHeight,
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
    
        let vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(vao);
        this.gl.enableVertexAttribArray(positionAttributeLocation);
        let attrOption = {
            size : 2,
            type : this.gl.FLOAT,
            normalize : false,
            stride : 0,
            offset : 0,      
        }
        this.gl.vertexAttribPointer(
            positionAttributeLocation, ...Object.values(attrOption));
        this.gl.useProgram(this.program);
        this.gl.bindVertexArray(vao);
    }

    drawScene(now){
        
        now *= 0.001;
        let deltaTime = now - this.then;
        this.then = now;
        
        this.time += deltaTime;
        this.gl.uniform1f(this.uniformLocationMap["u_time"], this.time);

        
        this.resize();
        this.render();
        requestAnimationFrame(this.drawScene.bind(this));
        
    }    
    resize(){
        
        webglUtils.resizeCanvasToDisplaySize(this.canvas);
        // this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.uniform2f(this.uniformLocationMap["u_center"],this.canvas.width / 2, this.canvas.height / 2)


    }

    render(){
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        let primitiveType = this.gl.TRIANGLES;
        let offset = 0;
        let count = 6;
        this.gl.drawArrays(primitiveType, offset, count);
    }
    timeUpdate(){
        
    }
}



function getUniformLocationMap(gl, program, uniformNameArr){
    const obj = {};
    uniformNameArr.forEach(name => {
        const location = gl.getUniformLocation(program, name);
        obj[name] = location;
        
    });
    return obj;
}


// function main() {
//     // Get A WebGL context
//     let canvas = document.querySelector("#c");
//     let gl = canvas.getContext("webgl2");
//     if (!gl) {
//         return;
//     }

//     let program = webglUtils.createProgramFromSources(gl, [Shader.vertex, Shader.fragment]);

//     let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
//     let positionBuffer = gl.createBuffer();
//     gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
//     let positions = [
//         0,0,
//         window.innerWidth, 0,
//         0, window.innerHeight,
//         window.innerWidth,0,
//         window.innerWidth, window.innerHeight,
//         0, window.innerHeight,
//     ];
//     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

//     let vao = gl.createVertexArray();
//     gl.bindVertexArray(vao);
//     gl.enableVertexAttribArray(positionAttributeLocation);
//     let attrOption = {
//         size : 2,
//         type : gl.FLOAT,
//         normalize : false,
//         stride : 0,
//         offset : 0,      
//     }
//     gl.vertexAttribPointer(
//         positionAttributeLocation, ...Object.values(attrOption));
//     gl.useProgram(program);
//     gl.bindVertexArray(vao);


//     webglUtils.resizeCanvasToDisplaySize(gl.canvas);
//     gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);




//     const uniformLocationMap = getUniformLocationMap(gl,program,[
//         "u_resolution", "u_pixelSize", "u_colors", "u_center", "u_time"
//     ])
//     gl.uniform2f(uniformLocationMap["u_resolution"], gl.canvas.width, gl.canvas.height)
//     gl.uniform1f(uniformLocationMap["u_pixelSize"], 15)
//     gl.uniform3fv(uniformLocationMap["u_colors"],[0,0,0, 1,1,1])
//     gl.uniform2f(uniformLocationMap["u_center"],gl.canvas.width / 2, gl.canvas.height / 2)
    
    
    


//     let then = 0;
//     let time = 0;
//     requestAnimationFrame(drawScene);
//     function drawScene(now){
        
//         now *= 0.001;
//         let deltaTime = now - then;
//         then = now;
        
//         time += deltaTime;
//         gl.uniform1f(uniformLocationMap["u_time"], time);

        
//         resize();
//         render();
//         requestAnimationFrame(drawScene);
        
//     }    
//     function resize(){
//         webglUtils.resizeCanvasToDisplaySize(gl.canvas);
//         gl.uniform2f(uniformLocationMap["u_center"],gl.canvas.width / 2, gl.canvas.height / 2)
        

//     }

//     function render(){
//         gl.clearColor(0, 0, 0, 0);
//         gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
//         let primitiveType = gl.TRIANGLES;
//         let offset = 0;
//         let count = 6;
//         gl.drawArrays(primitiveType, offset, count);
//     }
//     function timeUpdate(){
        
//     }
// }



function main(){
    new App();

}

window.onload = main;
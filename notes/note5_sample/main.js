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

        
    }

    setUniform(){
        // const ubo = this.gl.createBuffer();

        // this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, ubo);
        // // 유니폼 데이터 설정
        // const uniformData = new Float32Array([1.0, 2.0, 3.0]);

        // // UBO에 데이터 업로드
        // this.gl.bufferData(this.gl.UNIFORM_BUFFER, uniformData, this.gl.STATIC_DRAW);
        function getUniformLocationMap(gl, program, uniformNameArr){
            const obj = {};
            uniformNameArr.forEach(name => {
                const location = gl.getUniformLocation(program, name);
                obj[name] = location;
                
            });
            return obj;
        }
        this.uniformLocationMap = getUniformLocationMap(this.gl,this.program,[
            "u_resolution"
        ])
        
        this.gl.uniform2f(this.uniformLocationMap["u_resolution"], this.canvas.width, this.canvas.height)
        // this.gl.uniform1f(this.uniformLocationMap["u_pixelSize"], this.u_pixelSize)
        // this.gl.uniform3f(this.uniformLocationMap["u_bgColor"], 0.325, 0.4, 0.224)
        // this.gl.uniform3fv(this.uniformLocationMap["u_colors"],new Float32Array([
        //     0.643, 0.584, 0.424, 
        //     0.165, 0.188, 0.149, 
        //     0.345, 0.282, 0.153
        // ]));
        // this.gl.uniform2fv(this.uniformLocationMap["u_minMaxRads"], new Float32Array([ -6,4, -6,4, -2,2]))
        // this.gl.uniform2fv(this.uniformLocationMap["u_centers"], [])
        // this.gl.uniform1fv(this.uniformLocationMap["u_sizes"], [])
        // this.gl.uniform1i(this.uniformLocationMap["u_arrayLength"], 0)
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
        this.deltaTime = now - this.then;
        this.then = now;
        
        this.time += this.deltaTime;
        // this.gl.uniform1f(this.uniformLocationMap["u_time"], this.time);

        
        this.resize();
        this.valueUpdate();
        this.render();
        requestAnimationFrame(this.drawScene.bind(this));
        
    }    
    valueUpdate(){

        

    }
    resize(){
        
        webglUtils.resizeCanvasToDisplaySize(this.canvas);
        

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




function main(){
    new App();

}

window.onload = main;
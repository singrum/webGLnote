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

        // this.setAttribute();
        this.setUniform();
        this.setFrameBuffer();
        
        
        
        
        this.then = 0;
        this.time = 0;
        requestAnimationFrame(this.drawScene.bind(this));

    }
    setFrameBuffer(){
        const gl = this.gl
        const framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.canvas.width, gl.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        const framebufferStatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (framebufferStatus !== gl.FRAMEBUFFER_COMPLETE) {
          console.error('Framebuffer is incomplete: ' + framebufferStatus.toString(16));
        }
    }

    setInteration(){
        this.isDown = false;
        this.growingCircle = null;
        this.shrinkingCircle = [];
        this.currX = null;
        this.currY = null;

        class Circle{
            constructor(centerX, centerY, size){
                this.centerX = centerX;
                this.centerY = centerY;
                this.size = size;
            }
        }
        const coordToPixel = coord => Math.floor(coord / (this.u_pixelSize * 8)) * this.u_pixelSize * 8;

        const isSamePixel = (prevX, prevY, currX, currY) => coordToPixel(prevX) === coordToPixel(currX) && coordToPixel(prevY) === coordToPixel(currY);

        const downEvent = e=>{
            if ('ontouchstart' in window) this.canvas.addEventListener("touchmove", moveEvent,false)
            else this.canvas.addEventListener("mousemove", moveEvent,false)
            
            this.isDown = true;
            [this.currX,this.currY] = [coordToPixel(e.clientX ?? e.touches[0].clientX), coordToPixel(e.clientY ?? e.touches[0].clientY)];
            this.growingCircle = new Circle(this.currX, this.currY, 60);
            


        }
        const moveEvent = e=>{
            const newX = coordToPixel(e.clientX ?? e.touches[0].clientX);
            const newY = coordToPixel(e.clientY ?? e.touches[0].clientY);
            if(isSamePixel(this.currX, this.currY, newX, newY)) return;
            this.currX = newX;
            this.currY = newY;
            this.shrinkingCircle.push(this.growingCircle);
            this.growingCircle = new Circle(this.currX, this.currY, 60);



        }
        const upEvent = e=>{
            if ('ontouchstart' in window) this.canvas.removeEventListener("touchmove", moveEvent,false)
            else this.canvas.removeEventListener("mousemove", moveEvent,false)
            this.isDown = false;
            this.currX = null;
            this.currY = null;
            this.shrinkingCircle.push(this.growingCircle);
            this.growingCircle = null;
        }


        if ('ontouchstart' in window) this.canvas.addEventListener('touchstart',downEvent)
		else this.canvas.addEventListener('mousedown',downEvent)
        if ('ontouchstart' in window) this.canvas.addEventListener('touchend',upEvent)
		else this.canvas.addEventListener('mouseup',upEvent)
        
    }

    setUniform(){
        this.u_pixelSize = 5;

        function getUniformLocationMap(gl, program, uniformNameArr){
            const obj = {};
            uniformNameArr.forEach(name => {
                const location = gl.getUniformLocation(program, name);
                obj[name] = location;
                
            });
            return obj;
        }
        this.uniformLocationMap = getUniformLocationMap(this.gl,this.program,[
            "u_resolution", 
            "u_pixelSize", 
            "u_colors", 
            "u_bgColor", 
            "u_minMaxRads", 
            "u_time", 
            "u_centers", 
            "u_sizes", 
            "u_arrayLength"
        ])
        this.gl.uniform2f(this.uniformLocationMap["u_resolution"], this.canvas.width, this.canvas.height)
        this.gl.uniform1f(this.uniformLocationMap["u_pixelSize"], this.u_pixelSize)
        this.gl.uniform3f(this.uniformLocationMap["u_bgColor"], 0.325, 0.4, 0.224)
        this.gl.uniform3fv(this.uniformLocationMap["u_colors"],new Float32Array([
            0.643, 0.584, 0.424, 
            0.165, 0.188, 0.149, 
            0.345, 0.282, 0.153
        ]));
        this.gl.uniform2fv(this.uniformLocationMap["u_minMaxRads"], new Float32Array([ -6,4, -6,4, -2,2]))
        this.gl.uniform2fv(this.uniformLocationMap["u_centers"], [])
        this.gl.uniform1fv(this.uniformLocationMap["u_sizes"], [])
        this.gl.uniform1i(this.uniformLocationMap["u_arrayLength"], 0)
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
        this.gl.uniform1f(this.uniformLocationMap["u_time"], this.time);

        
        this.resize();
        this.valueUpdate();
        this.render();
        requestAnimationFrame(this.drawScene.bind(this));
        
    }    
    valueUpdate(){


    }
    resize(){
        
        // this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        
        webglUtils.resizeCanvasToDisplaySize(this.canvas);
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




function main(){
    new App();

}

window.onload = main;
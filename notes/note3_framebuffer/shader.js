const Shader = {
    vertex:/*glsl*/`#version 300 es

    in vec2 a_position;
    
    uniform vec2 u_resolution;
    
    out vec2 clipCoord;
    out vec2 coord;

    void main() {
        coord = a_position;
        // convert the position from pixels to 0.0 to 1.0
        vec2 zeroToOne = a_position / u_resolution;
        
        // convert from 0->1 to 0->2
        vec2 zeroToTwo = zeroToOne * 2.0;
        
        // convert from 0->2 to -1->+1 (clipspace)
        vec2 clipSpace = zeroToTwo - 1.0;
        clipCoord = clipSpace * vec2(1, -1);
        gl_Position = vec4(clipCoord, 0, 1);
    }
    `,




    fragment: /*glsl*/`#version 300 es

    precision highp float;

    uniform float u_pixelSize;
    in vec2 clipCoord;
    in vec2 coord;
    out vec4 outColor;

    void main() {
        vec2 roundCoord = round(coord / u_pixelSize) * u_pixelSize;
        outColor = vec4(roundCoord / 100.0, 0.0, 1.0);
    }
    `
}



export {Shader};
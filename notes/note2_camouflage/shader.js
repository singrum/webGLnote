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
    uniform vec3 u_bgColor;
    uniform vec3 u_colors[3];
    uniform vec2 u_minMaxRads[3];
    uniform float u_time;
    uniform vec2 u_centers[64];
    uniform float u_sizes[64];
    uniform int u_arrayLength;
    uniform int u_pixel;

    in vec2 clipCoord;
    in vec2 coord;
    out vec4 outColor;



    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
    vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}
    
    float noise(vec3 P){
      vec3 Pi0 = floor(P); // Integer part for indexing
      vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
      Pi0 = mod(Pi0, 289.0);
      Pi1 = mod(Pi1, 289.0);
      vec3 Pf0 = fract(P); // Fractional part for interpolation
      vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
      vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
      vec4 iy = vec4(Pi0.yy, Pi1.yy);
      vec4 iz0 = Pi0.zzzz;
      vec4 iz1 = Pi1.zzzz;
    
      vec4 ixy = permute(permute(ix) + iy);
      vec4 ixy0 = permute(ixy + iz0);
      vec4 ixy1 = permute(ixy + iz1);
    
      vec4 gx0 = ixy0 / 7.0;
      vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
      gx0 = fract(gx0);
      vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
      vec4 sz0 = step(gz0, vec4(0.0));
      gx0 -= sz0 * (step(0.0, gx0) - 0.5);
      gy0 -= sz0 * (step(0.0, gy0) - 0.5);
    
      vec4 gx1 = ixy1 / 7.0;
      vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
      gx1 = fract(gx1);
      vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
      vec4 sz1 = step(gz1, vec4(0.0));
      gx1 -= sz1 * (step(0.0, gx1) - 0.5);
      gy1 -= sz1 * (step(0.0, gy1) - 0.5);
    
      vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
      vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
      vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
      vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
      vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
      vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
      vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
      vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
    
      vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
      g000 *= norm0.x;
      g010 *= norm0.y;
      g100 *= norm0.z;
      g110 *= norm0.w;
      vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
      g001 *= norm1.x;
      g011 *= norm1.y;
      g101 *= norm1.z;
      g111 *= norm1.w;
    
      float n000 = dot(g000, Pf0);
      float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
      float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
      float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
      float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
      float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
      float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
      float n111 = dot(g111, Pf1);
    
      vec3 fade_xyz = fade(Pf0);
      vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
      vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
      float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
      return (2.2 * n_xyz + 1.0) / 2.0; // (0, 1)
    //   return 2.2 * n_xyz; //(-1, 1)
    }
    vec3 camo(vec2 coord){
        float t;
        vec3 color;

        int key = 2;
        bool isBackground = true;
        color = u_bgColor;
        for(int i = 0; i < u_arrayLength; i++){

            vec2 center = u_centers[i];
            float size = u_sizes[i];
            float length = length(coord - center);
            float noiseFreq = 0.02;

            for(int j =0; j <= key ; j++){
                float minRad = size * u_minMaxRads[j].x;
                float maxRad = size * u_minMaxRads[j].y;
                if(length < maxRad){
                    t = length - noise(vec3(coord.xy * noiseFreq, u_time  *1.0 + float(j) * 10.0)) * (maxRad - minRad);
                    t = step(minRad,t);
                }
                else {
                    t = 1.0;
                }

                if(t == 0.0) {key = j; isBackground = false; break;}
            }
            

            
            
            
            
            



        }
        if(isBackground){
            color =u_bgColor;
        }
        else{
            color = u_colors[key];
        }
        return color;

    }

    void main() {
        float i;
        vec2 roundCoord;
        if(u_pixel == 1){
            roundCoord = floor(coord / u_pixelSize) * u_pixelSize;
        }
        else{
            roundCoord = coord;
        }
        
        
        vec3 color;
        color = camo(roundCoord);
        
        outColor = vec4(color, 1.0);
    }
    `
}



export {Shader};
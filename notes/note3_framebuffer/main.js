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
    const canvas = document.getElementById('c');
    const gl = canvas.getContext('webgl2');
    
// Vertex Shader 코드
const vertexShaderSource = `
  // attribute로 정점 위치를 받습니다.
  attribute vec2 a_position;

  void main() {
    // 정점 위치를 클립 공간으로 변환합니다.
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

// Fragment Shader 코드
const fragmentShaderSource = `
  // Fragment Shader에 대한 유니폼 변수를 정의합니다.
  uniform vec4 u_color;

  void main() {
    // 모든 픽셀을 지정된 색상으로 설정합니다.
    gl_FragColor = u_color;
  }
`;

// Vertex Shader 컴파일
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);

// Fragment Shader 컴파일
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);

// WebGL 프로그램 생성 및 쉐이더 첨부 및 링크
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

// WebGL 프로그램 사용하도록 활성화
gl.useProgram(program);


    // 프레임 버퍼 객체 생성 및 초기화
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    
    // 텍스처 생성 및 연결
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    
    // 렌더 버퍼 생성 및 연결
    const renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, canvas.width, canvas.height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
    
    // WebGL2 프로그램 생성 및 쉐이더 첨부 및 링크
    
    // 프레임 버퍼 객체 확인
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    
    // 렌더링 루프 설정
    function renderLoop() {
      // 프레임 버퍼 객체를 바인딩하여 현재 렌더 타겟으로 설정
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      
      // WebGL2 컨텍스트를 지우고 프레임 버퍼 객체에 대해 쉐이더를 적용하여 렌더링
      
      // 프레임 버퍼 객체를 기본 렌더 타겟으로 변경
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      
      // 프레임 버퍼 객체의 텍스처를 사용하여 전체 화면에 사각형을 렌더링하고 쉐이더 결과를 표시
      
      // 렌더링 루프 반복
      requestAnimationFrame(renderLoop);
    }
    
    // 렌더링 루프 시작
    renderLoop();
}

main();

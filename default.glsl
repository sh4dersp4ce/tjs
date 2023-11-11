precision mediump float;
precision mediump int;
                
varying vec2 _uv;
uniform float time;
uniform sampler2D backbuffer;
uniform sampler2D camera;
uniform sampler2D texture0;
uniform sampler2D texture1;
uniform sampler2D texture2;
uniform int plane_id;
uniform vec2 resolution;

void main() {
    vec2 uv = _uv * 2. - 1.;
    vec3 color = vec3(0.0);
    
    gl_FragColor = vec4(color, 1.);
    
}


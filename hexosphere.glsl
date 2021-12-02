precision mediump float;
precision mediump int;
                
varying vec2 _uv;
uniform sampler2D camera;
uniform sampler2D texture0;
uniform sampler2D texture1;
uniform sampler2D texture2;
uniform int plane_id;
uniform vec4 osc1;
uniform vec4 osc2;
uniform vec4 osc3;
uniform vec4 osc4;

uniform float angle;
uniform float emit;

uniform float time;
uniform vec2 resolution;
uniform sampler2D backbuffer;

float circle(vec2 p, float r) {
        return length(p) - sqrt(r);
    }
    
mat2 rot(float phi) {
    return mat2 (cos(phi), -sin(phi), sin(phi), cos(phi));
}

float pi = -acos(-1.);



void main() {
    mat4 gs = mat4(osc1, osc2, osc3, osc4);    
    vec2 uv = _uv;
    vec2 res = resolution;
    
    vec2 u = 8. * gl_FragCoord.xy / resolution.x;
    float t = 1.;
    
    vec2 s = vec2(1.,mix(2.0, 1.732, t));
    vec2 a = mod(u     ,s)*2.-s;
    vec2 b = mod(u+s*vec2(.5*t, .5),s)*2.-s;
   
    
   gl_FragColor = vec4(.5*min(dot(a,a),dot(b,b)));
    
    
  
    
}
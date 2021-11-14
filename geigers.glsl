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

const float ParticleDensity = 1.; // 0.0-1.0

void main() {
    mat4 gs = mat4(osc1, osc2, osc3, osc4);    
    vec2 uv = _uv;
    vec2 res = resolution;
    float pDir = texture2D(backbuffer, uv).r;
    vec2 pPos = texture2D(backbuffer, uv).gb;
    
    vec2 px = 1. / res;
    vec4 buf[9];
    
    buf[0] = texture2D(backbuffer, uv);
    buf[1] = texture2D(backbuffer, fract(uv-vec2(px.x, 0.)));
    buf[2] = texture2D(backbuffer, fract(uv-vec2(-px.x, 0.)));
    buf[3] = texture2D(backbuffer, fract(uv-vec2(0., px.y)));
    buf[4] = texture2D(backbuffer, fract(uv-vec2(0., -px.y)));
    buf[5] = texture2D(backbuffer, fract(uv-vec2(px.x, px.y)));
    buf[6] = texture2D(backbuffer, fract(uv-vec2(-px.x, px.y)));
    buf[7] = texture2D(backbuffer, fract(uv-vec2(px.x, -px.y)));
    buf[8] = texture2D(backbuffer, fract(uv-vec2(-px.x, -px.y)));
    
    
    pDir = buf[0].r;
    pPos = buf[0].gb * res;
    pPos = mod(pPos + vec2(pDir, 0.) , res);

    float ct = 0.;

    float pDirAdd = 0.;
    vec2 pPosAdd = vec2(0.);
    
    for(int i=1; i<9; i++) {
    
        vec2 pPosI = buf[i].gb * res;
        pPosI = mod(pPosI + vec2(buf[i].r), res);
        if (floor(pPos) != floor(uv * res)) {
            pDirAdd += buf[i].r;
            pPosAdd += pPosI;
            ct ++;
     }
        
    }
    
    
    if(ct>0.) {
        pDir = 1.;
        pPos = pPosAdd / ct; 
    }

    pPos /= res;
    gl_FragColor = vec4(pDir, pPos, 1.);
    float eps = .005 * (sin(time * 10.) + 1.) / 4.;
    gl_FragColor.b = (uv.x > angle - eps )&& uv.x < (angle + eps ) ? 40. * pow( uv.y, 3.) * emit : 0.;
    gl_FragColor.b *= uv.y < .9 ? 1. : 0.;
    
    gl_FragColor.g += gl_FragColor.b / 10.;
    gl_FragColor.b += texture2D(backbuffer, uv).b * .9;

    
  
    
}


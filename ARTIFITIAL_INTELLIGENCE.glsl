precision mediump float;
precision mediump int;
                
varying vec2 _uv;
uniform float time;
uniform sampler2D backbuffer;
uniform sampler2D camera;
uniform sampler2D texture0;
uniform sampler2D texture1;
uniform int plane_id;
uniform vec2 resolution;

float circle(vec2 p, float r) {
    return length(p) - r;
}

float color_discriminator(vec3 c, vec3 color0, vec3 color1) {
    vec3 c0 = c * color0;
    vec3 c1 = c * color1;
    
    float l0 = 0.;
    float l1 = 0.;
    
    for(int i = 0; i < 3; i++) {
        l0 += c0[i];
        l1 += c1[i];
    }
    
    if(l0 > l1) {
        return l0;
    } else {
        return -l1;
    }
}

float rb_discriminator(vec3 c) {
    return color_discriminator(c, vec3(1., -0.5, -0.5), vec3(-0.5, -0.5, 1.));
}

const float THRESHOLD = 0.0;

float color_sobel_x(vec2 p, sampler2D tex) {
    // const float THRESHOLD = 0.3;
    
    float left = 0.;
    float right = 0.;
    
    for(int i=0; i<3; i++) {
        vec2 p_left = vec2(-1, i-1);
        vec2 p_right = vec2(1, i-1);
        vec3 tex_left = texture2D(tex, (p + p_left / resolution )).xyz;
        vec3 tex_right = texture2D(tex, (p + p_right / resolution )).xyz;
        left += rb_discriminator(tex_left);
        right += rb_discriminator(tex_right);
    }
    
    if(left * right < -THRESHOLD) {
        return -(left * right) * sign(left);
    } else {
        return 0.;
    }
}

float color_sobel_y(vec2 p, sampler2D tex) {
    
    
    float up = 0.;
    float down = 0.;
    
    for(int i=0; i<3; i++) {
        vec2 p_up = vec2(i-1, -1);
        vec2 p_down = vec2(i-1, 1);
        vec3 tex_up = texture2D(tex, (p + p_up / resolution )).xyz;
        vec3 tex_down = texture2D(tex, (p + p_down / resolution )).xyz;
        up += rb_discriminator(tex_up);
        down += rb_discriminator(tex_down);
    }
    
    if(up * down < -THRESHOLD) {
        return -(up * down) * sign(up);
    } else {
        return 0.;
    }
}

void main() {
    vec2 uv = _uv;
    
    vec3 color = vec3(0.0);
    
    
    // color += length(grad) * 10. * vec3(1., 1., 1.);
    
    float c0 = circle((uv - .5) * vec2(1, .6), .2);
    
    float c1 = circle((uv - .5) * vec2(1, .6), .19);
    
    float c2 = circle((uv - .5) * vec2(1, .6), .18);
    
    color += step(.0, - max(c0, -c1) )  * vec3(1, 0, 0);
    color += step(.0, - max(c1, -c2) )  * vec3(0, 0, 1);
    
    
    float grid = 0.;
    
    float mn = .2;
    float mx = .8;
    if (uv.x > mn && uv.x < mx && uv.y > mn && uv.y < mx) {
        color += step(0.9, fract(uv.x * 10.)) * vec3(1., 0., 0.);
        color += step(0.9, fract(uv.x * 10. + 0.1)) * vec3(0., 0., 1.);
        if(length(color) < 0.1) {
            color += step(0.9, fract(uv.y * 10.)) * vec3(1., 0., 0.);
            color += step(0.9, fract(uv.y * 10. + 0.1)) * vec3(0., 0., 1.);
        }
    }
    // grid += clamp(cos(uv.y * 200.) * 2. - 0.1, 0., 1.);
    
    
    // vec3 grid_color = vec3(1., 0., 0.);
    /*
    if(plane_id == 0) {
        grid_color.r = 1.;
    } else if(plane_id == 1) {
        grid_color.g = 1.;
    } else if(plane_id == 2) {
        grid_color.b = 1.;
    }
    */
    
    // color += grid_color * grid;
    // color += texture(backbuffer, uv - vec2(0.0010, 0.)).xzy * vec3(0., 1., 1.) * 0.95;
    // vec3 face = smoothstep(0.15, 0.35, texture(camera, vec2(1.-uv.x, uv.y)).xyz);
    // color += step(0.5, face.r - (face.b + face.g)/2.);
    
    // color += texture(camera, uv).xyz * 0.8;
    
    // color += 0.5 + color_sobel_x(uv, texture1) * vec3(1., 0., 0.);
    // color += color_sobel_y(uv, texture1) * vec3(0., 1., 0.);

    vec2 shakal = vec2(1., .75) * 1.3 ;
    vec2 grad = vec2(
        color_sobel_x(uv * shakal, camera),
        color_sobel_y(uv * shakal, camera)
    );

    const float PI = acos(-1.);

    // color += length(grad) > 0.0
    //     ? atan(grad.y, grad.x)/(2. * PI) * vec3(1.) * .8 + .2
    //     : vec3(0.); // length(grad) * vec3(1., 0., 0.);
    
    gl_FragColor = vec4(color, 1.) + length(grad) * 10.* vec4(0, 1, 0, 1) ;
    
}


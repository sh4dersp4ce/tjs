
    const radiusTop =  10;  
    const radiusBottom =  60;  
    const tunnel_height =  20;  
    const radialSegments = 16;  
    const heightSegments = 32;  
    const openEnded = true;  
    const thetaStart = Math.PI * 0.00;  
    const thetaLength = Math.PI * 2.00;  


function add_tunnel(scene, backstage, folder, uniforms) {


    const tunnel_vertex_shader = vert`
        varying vec2 _uv;
        void main() {
            gl_PointSize = 1.0;
            _uv = fract(uv * 8.);

            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
            gl_Position = projectionMatrix * mvPosition;
            _uv = uv;
            
        }
    `; 

    const tunnel_fragment_shader = frag`
        precision mediump float;
        precision mediump int;

        uniform sampler2D backbuffer;
        uniform vec2 resolution;

        varying vec2 _uv;



        mat3 laplace = mat3(0, 1, 0, 
                            1, -4, 1,
                            0, 1, 0) / 8.;


        vec3 conv(vec2 p, sampler2D tex, mat3 fil) {
            vec3 l = vec3(0.);
            for (int y=0; y<3; y++)
                for (int x = 0; x < 3; x++) {
        
                    l += fil[x][y] * texture2D(tex, p + vec2(x - 1, y - 1) / resolution ).xyz ;
            
                }
            return l;
        }

        void main() {
            gl_FragColor =  texture(backbuffer, _uv) * .9;;

            // gl_FragColor.xz = (conv(_uv, backbuffer, laplace) * 60.).xz;

            // gl_FragColor.a = fract(_uv.x * 16.);
            gl_FragColor.a = 1.;
            float green = gl_FragColor.b;


            gl_FragColor.xyz *= (1. - _uv.y * 1.2 );

            gl_FragColor.rgb *= gl_FragColor.g > .5 ? _uv.y * _uv.y : 1.;
            gl_FragColor.rgb *= _uv.y < .1 ? 0. : 1.;

            gl_FragColor.rgb = vec3(dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114)));
            // gl_FragColor.x = (conv(_uv, backbuffer, laplace) * 30.).z;
            // gl_FragColor.yxz = (conv(_uv, backbuffer, laplace) * 30.).yxz;


            gl_FragColor.rb *= green > .5 ? 0. : 1.;

        }
    `;


    const tunnel_geometry = new THREE.CylinderGeometry(
        radiusTop, radiusBottom, tunnel_height,
        radialSegments, heightSegments,
        openEnded,
        thetaStart, thetaLength);
    
    
    // const tunnel_material = new THREE.MeshNormalMaterial();
    
    const tunnel_material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: tunnel_vertex_shader[0],
        fragmentShader: tunnel_fragment_shader[0]
        // lights: true
    });
    tunnel_material.side = THREE.BackSide;


const tunnel = new THREE.Mesh(tunnel_geometry, tunnel_material);
tunnel.position.z = - 67;
tunnel.rotation.x =  - Math.PI / 2;  
tunnel.rotation.y = Math.PI;  


scene.add(tunnel);


//backtunnel
const backplane_geometry = new THREE.PlaneGeometry(2, 2);

// const backplane_geometry = new THREE.CylinderGeometry(
//     radiusTop, radiusBottom, tunnel_height,
//     radialSegments, heightSegments,
//     openEnded,
//     thetaStart, thetaLength);


// trivial backplane vertex
const backplane_vertex_shader = vert`
    varying vec2 _uv;

    void main() {
        gl_Position = vec4(position, 1.0 );
        _uv = uv;
    }
`;

const backplane_fragment_shader = vert`
    uniform sampler2D backbuffer;
    uniform sampler2D compute;

    varying vec2 _uv;

    void main() {
        gl_FragColor =  texture(backbuffer, _uv) ;
    }
`;

// default fragment for non-trivial backplane
// const backplane_material = new THREE.MeshBasicMaterial({
//     color: 'black',
// });
const backplane_material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: tunnel_vertex_shader[0],
    fragmentShader: tunnel_fragment_shader[0],
});

// combine our image geometry and material into a mesh
const backplane = new THREE.Mesh(backplane_geometry, backplane_material);
backplane.position.set(0,0,0);

backstage.add(backplane);

function update_material(fragment_text) {
    console.log('update material');
    const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: backplane_vertex_shader[0],
        fragmentShader: fragment_text,
        depthTest: false,
        transparent: true,
        opacity: 0.5,
    });
    material.transparent = false;

    backplane.material = material;
}

function update_uniform(data) {
    for(key in data) {
        tunnel.material.uniforms[key].value = data[key];
        backplane.material.uniforms[key].value = data[key];   
    }
}

return {update_material, update_uniform};


}
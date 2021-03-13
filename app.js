const glsl = x => x;
const vert = x => x;
const frag = x => x;

const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
);

/*
const geometry = new THREE.BufferGeometry();
const vertices = new Float32Array([
	-1.0, -1.0,  1.0,
	 1.0, -1.0,  1.0,
	 1.0,  1.0,  1.0,
]);
const uv = new Float32Array([
	0.0, 0.0,
	1.0, 0.0,
	1.0, 1.0,
]);
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
*/

function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}

function add_plane(scene, folder) {
    const geometry = new THREE.PlaneGeometry(1, 1);

    const vertex_shader = vert`
        varying vec2 _uv;

        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            _uv = uv;
        }
    `;

    const fragment_shader = frag`
        precision mediump float;
        precision mediump int;

        varying vec2 _uv;

        void main() {
            gl_FragColor = vec4(vec3(pow(_uv.x - 0.5, 2.) * 2. + pow(_uv.y - 0.5, 2.) * 2., 0., 0.), 1.);
        }
    `;

    const material = new THREE.ShaderMaterial( {
        uniforms: {
            time: { value: 1.0 }
        },
        vertexShader: vertex_shader[0],
        fragmentShader: fragment_shader[0],
    } );
    
    const plane = new THREE.Mesh(geometry, material);

    scene.add(plane);

    
    let param = {
        rotate_x: 0,
        rotate_y: 0,
        rotate_z: 0,
        x: 0,
        y: 0,
    };

    folder.add(param, 'rotate_x')
        .min(-1.5).max(1.5).step(.01)
        .listen().onChange(value => plane.rotation.x = value);
    folder.add(param, 'rotate_y')
        .min(-1.5).max(1.5).step(.01)
        .listen().onChange(value => plane.rotation.y = value);
    folder.add(param, 'rotate_z')
        .min(-1.5).max(1.5).step(.01)
        .listen().onChange(value => plane.rotation.z = value);
    
    folder.add(param, 'x')
        .min(-12).max(12).step(.05)
        .listen().onChange(value => plane.position.x = value);
    folder.add(param, 'y')
        .min(-5).max(5).step(.05)
        .listen().onChange(value => plane.position.y = value);
}

function app() {
    const gui = new dat.GUI();

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    let plane_id = 0;

    let param = {
        add_plane: () => {
            let folder = gui.addFolder("plane" + plane_id);
            plane_id++;
            add_plane(scene, folder);
        }
    };

    gui.add(param, "add_plane");

    camera.position.z = 5;

    animate();
}

window.onload = app;

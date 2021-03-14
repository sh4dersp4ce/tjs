const glsl = x => x;
const vert = x => x;
const frag = x => x;

const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
);

let cbs = [];

let time = 0;
let prev_time = (+new Date());

function animate() {
    let now = (+new Date());
    let dt = (now - prev_time) / 1000;
    prev_time = now;
    
    time += dt;
    cbs.forEach(cb => cb.update_uniform({time}));
    // console.log(time);

	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}

function add_plane(scene, folder) {
    const geometry = new THREE.BufferGeometry();

    let vertices = [];
    let uv = [];

    function set_corners(N) {
        const Z = 0.;

        vertices = [];
        uv = [];

        let corners = [];

        for(let i = 0; i < N; i++) {
            let x = Math.cos(Math.PI * 2 * i / N);
            let y = Math.sin(Math.PI * 2 * i / N);
            corners.push({x, y});
        }

        for(let i = 0; i < N; i++) {
            vertices.push(0., 0., Z);
            vertices.push(corners[i].x, corners[i].y, Z);
            vertices.push(corners[(i + 1) % N].x, corners[(i + 1) % N].y, Z);

            uv.push(0.5, 0.5);
            uv.push(corners[i].x + 0.5, corners[i].y + 0.5);
            uv.push(corners[(i + 1) % N].x + 0.5, corners[(i + 1) % N].y + 0.5);
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv), 2));
    }

    set_corners(3);

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
            gl_FragColor = vec4(vec3(0.), 1.);
        }
    `;

    let uniforms = {
        time: {value: 1.0}
    };

    const material = new THREE.ShaderMaterial( {
        uniforms,
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
        scale_x: 1,
        scale_y: 1,
        corners: 3,
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

    folder.add(param, 'scale_x')
        .min(0).max(5).step(.01)
        .listen().onChange(value => plane.scale.x = value);
    folder.add(param, 'scale_y')
        .min(0).max(5).step(.01)
        .listen().onChange(value => plane.scale.y = value);
    
    folder.add(param, 'corners')
        .min(3).max(12).step(1)
        .listen().onChange(value => set_corners(value));

    function update_material(fragment_text) {
        const material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader: vertex_shader[0],
            fragmentShader: fragment_text,
        });

        plane.material = material;
    }

    function update_uniform(data) {
        // plane.material.uniforms.time.value = data.time;

        for(key in data) {
            plane.material.uniforms[key].value = data[key];
            // console.log(key, ":", plane.material.uniforms[key].value);
        }
    }

    return {update_material, update_uniform};
}

function app() {
    const gui = new dat.GUI();

    let editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/glsl");
    editor.setOption("highlightActiveLine", true);
    editor.session.addMarker(new ace.Range(0, 0, 1000, 1000), "Highlight", "text", false);

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    let plane_id = 0;

    let param = {
        add_plane: () => {
            let folder = gui.addFolder("plane" + plane_id);
            plane_id++;
            let plane = add_plane(scene, folder);
            cbs.push(plane);
            plane.update_material(editor.getValue());
        }
    };

    editor.on("change", (_) => cbs.forEach(cb => cb.update_material(editor.getValue())));

    gui.add(param, "add_plane");

    camera.position.z = 5;

    animate();
}

window.onload = app;

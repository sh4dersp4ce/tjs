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

    let test_texture = null;

    let param = {
        add_plane: () => {
            let folder = gui.addFolder("plane" + plane_id);
            plane_id++;
            let plane = add_plane(scene, folder, {texture0: test_texture, plane_id});
            cbs.push(plane);
            plane.update_material(editor.getValue());
        },
        loaded: false,
    };

    editor.on("change", (_) => cbs.forEach(cb => cb.update_material(editor.getValue())));

    gui.add(param, "add_plane");

    const texture_loader = new THREE.TextureLoader();
    texture_loader.load("assets/test.jpg",
        (texture) => {
            test_texture = texture;
            gui.add(param, "loaded");
            param.add_plane();
        },
        null,
        (err) => alert("texture load error " + JSON.stringify(err))
    );

    camera.position.z = 5;

    animate();
}

window.onload = app;

const glsl = x => x;
const vert = x => x;
const frag = x => x;

const renderer = new THREE.WebGLRenderer({alpha: false});
const scene = new THREE.Scene();

scene.background = new THREE.Color('purple');


const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
);

// const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);


const backstage = new THREE.Scene();
const ortcamera = new THREE.OrthographicCamera(
    -1, // left
     1, // right
     1, // top
    -1, // bottom
    -1, // near,
     1, // far
  );
backstage.add(ortcamera);


let cbs = [];  // callbacks

let time = 0;
let prev_time = (+new Date());

let videoTex = null;

const video = document.createElement('video');
video.autoplay="";
video.style="display:none";
video.id="feedCam";

let videoLoaded = false;
let vidtexture = null;


if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && video) {
        var constraints = {audio: false, video: true};

        navigator.mediaDevices.getUserMedia( constraints ).then( function ( stream ) {
                video.playsInline = true;
                video.srcObject = stream;
                video.play();
                videoLoaded = true;

                vidtexture = new THREE.VideoTexture( video );
                console.log('vid', vidtexture);


        } ).catch( function ( error ) {
               console.error( 'Unable to access the camera/webcam.', error );

        } );

} else {
        console.error( 'MediaDevices interface not available.' );
}

// console.log(window.innerHeight, window.innerWidth);
const rtWidth = window.innerWidth;
const rtHeight = window.innerHeight;

const renderTargets = [new THREE.WebGLRenderTarget(rtWidth, rtHeight, {
    depthBuffer: false,
    stencilBuffer: false,
  }), 
  new THREE.WebGLRenderTarget(rtWidth, rtHeight, {
    depthBuffer: false,
    stencilBuffer: false,
  })];
  
let pass = 1;

function animate() {

    let now = (+new Date());
    let dt = (now - prev_time) / 1000;
    prev_time = now;
    
    time += dt;
  
    if (videoLoaded)
    cbs.forEach(cb => cb.update_uniform({time, texture0: vidtexture}));
    // console.log(time);

    renderer.setRenderTarget(renderTargets[pass % 2]);
    renderer.render(backstage, ortcamera);
    
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);

    pass += 1;
    cbs.forEach(cb => cb.update_uniform({time, backbuffer: renderTargets[(pass - 1) % 2].texture}));
        
    requestAnimationFrame(animate);   
    
        
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
            let plane = add_plane(scene, backstage, folder, {backbuffer: test_texture, plane_id});
            cbs.push(plane);
            plane.update_material(editor.getValue());           
        },
        loaded: false,
        plane_id: 0
    };

    let corner_id = null;

    let move_corners = "edit";

    document.addEventListener('keydown', (event) => {
        if(event.key === "F9") {
            if(move_corners == "view") {
                move_corners = "edit";
                dat.GUI.toggleHide();
            }
            else if(move_corners == "edit") {
                move_corners = "map";
            }
            else if(move_corners == "map") {
                dat.GUI.toggleHide();
                move_corners = "view";
            }

            cbs[param.plane_id].set_visible(move_corners === "map");

            if(move_corners !== "map") {
                corner_id = null;
            }

            editor.container.style.visibility = (move_corners == "edit") ? "visible" : "hidden";
        }
    });

    window.addEventListener('mousedown', (evt) => {
        let x = evt.pageX;
        let y = evt.pageY;

        if(move_corners === "map") {
            corner_id = cbs[param.plane_id].get_corner_id(x, y);
        }
    });
    window.addEventListener('mousemove', (evt) => {
        if(cbs.length > 0 && (move_corners === "map")) {
            cbs[param.plane_id].move_corner(corner_id, evt.pageX, evt.pageY);
        }
    });
    window.addEventListener('mouseup', () => {corner_id = null});

    editor.on("change", (_) => cbs.forEach(cb => cb.update_material(editor.getValue())));

    gui.add(param, "add_plane");
    gui.add(param, 'plane_id')
        .min(0).max(5).step(1)
        .listen().onChange(value => param.plane_id = value);

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

    // console.log(test_texture);

    camera.position.z = 5;


    // param.add_plane();
    animate();
    
}

window.onload = app;


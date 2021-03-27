
function add_plane(scene, backstage, folder, param) {
    const geometry = new THREE.BufferGeometry();

    let vertices = [];
    let uv = [];

    // create corners
    let corner_planes = [];
    for(let i = 0; i < 4; i++) {
        const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        const geometry = new THREE.PlaneGeometry(0.04,0.04);
        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.z = Math.PI/4;
        plane.position.x = Math.cos(Math.PI * 2 * i / 4 + Math.PI/4);
        plane.position.y = Math.sin(Math.PI * 2 * i / 4 + Math.PI/4);
        plane.position.z = 0.1;

        corner_planes.push(plane);
        scene.add(plane);

        plane.visible = false;
    }

    function set_visible(flag) {
        corner_planes.forEach(corner => corner.visible = flag);
    }

    const geometry = new THREE.BufferGeometry();

    // create geometry

    function set_corners(N) {
        const Z = 0.;

        vertices = [];
        uv = [];

        let corners = [];

        for(let i = 0; i < N; i++) {
            let x = Math.cos(Math.PI * 2 * i / N + Math.PI/4);
            let y = Math.sin(Math.PI * 2 * i / N + Math.PI/4);
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

    set_corners(4);

    const vertex_shader = vert`
        varying vec2 _uv;
        uniform mat4 projection;

        void main() {
            vec3 _position = position * 0.355; // WAT
            _position = _position + 0.25;

            gl_Position = projection * vec4(_position, 1.0 );
            _uv = (uv - 0.5) * 0.7 + 0.5; // WAT x2
        }
    `;

    // create shading

    const fragment_shader = frag`
        precision mediump float;
        precision mediump int;

        varying vec2 _uv;

        void main() {
            gl_FragColor = vec4(vec3(0.), 1.);
        }
    `;

    let projection = new THREE.Matrix4();
    projection.set(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );

    let uniforms = {
        time: {value: 1.0},
        texture0: {type: "t", value: param.texture0},
        resolution: {value: [window.innerWidth, window.innerHeight]},
        projection: {value: projection},
        plane_id: {value: param.plane_id},
    };

    console.log(uniforms);

    const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: vertex_shader[0],
        fragmentShader: fragment_shader[0],
        depthTest: false,
        transparent: true,
        opacity: 0.5,
    });

    material.transparent = true;
    
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.z = Math.PI / 4;
    plane.scale.x = 4;
    plane.scale.y = 4;
    scene.add(plane);
    const screenplane = new THREE.PlaneGeometry(2, 2);    
    const mat = new THREE.MeshBasicMaterial({
        color: 'red',
    });

    // combine our image geometry and material into a mesh
    var mesh = new THREE.Mesh(screenplane, mat);
    mesh.position.set(0,0,0);

    backstage.add(mesh);

    
    let gui_param = {
        rotate_x: 0,
        rotate_y: 0,
        rotate_z: 0,
        x: 0,
        y: 0,
        scale_x: 1,
        scale_y: 1,
        corners: 3,
    };

    folder.add(gui_param, 'rotate_x')
        .min(-Math.PI).max(Math.PI).step(.01)
        .listen().onChange(value => plane.rotation.x = value);
    folder.add(gui_param, 'rotate_y')
        .min(-Math.PI).max(Math.PI).step(.01)
        .listen().onChange(value => plane.rotation.y = value);
    folder.add(gui_param, 'rotate_z')
        .min(-Math.PI).max(Math.PI).step(.01)
        .listen().onChange(value => plane.rotation.z = value);
    
    folder.add(gui_param, 'x')
        .min(-1).max(1).step(.05)
        .listen().onChange(value => plane.position.x = value);
    folder.add(gui_param, 'y')
        .min(-1).max(1).step(.05)
        .listen().onChange(value => plane.position.y = value);

    folder.add(gui_param, 'scale_x')
        .min(0).max(5).step(.01)
        .listen().onChange(value => plane.scale.x = value);
    folder.add(gui_param, 'scale_y')
        .min(0).max(5).step(.01)
        .listen().onChange(value => plane.scale.y = value);
    
    folder.add(gui_param, 'corners')
        .min(3).max(12).step(1)
        .listen().onChange(value => set_corners(value));

    function update_material(fragment_text) {
        const material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader: vertex_shader[0],
            fragmentShader: fragment_text,
        });

        plane.material = material;
        mesh.material = material;

    }

    function update_uniform(data) {
        for(key in data) {
            plane.material.uniforms[key].value = data[key];            
        }
    }

    function get_corner_id(x, y) {
        x = x * 2 / window.innerWidth - 1;
        y = -y * 2 / window.innerHeight + 1.;

        let dists = corner_planes.map((corner, id) => {
            return {id, dist: Math.sqrt(Math.pow(corner.position.x - x, 2) + Math.pow(corner.position.y - y, 2))};
        });

        console.log(JSON.stringify(dists));

        return dists.sort((a, b) => a.dist - b.dist)[0].id;
    }

    function update_transform() {
        let t = transform2d(
            0.5, 0.5,
            corner_planes[2].position.x, corner_planes[2].position.y,
            corner_planes[3].position.x, corner_planes[3].position.y,
            corner_planes[1].position.x, corner_planes[1].position.y,
            corner_planes[0].position.x, corner_planes[0].position.y
        );

        projection.set(
            t[0], t[1], 0, t[2],
            t[3], t[4], 0, t[5],
            0   , 0   , 1, 0   ,
            t[6], t[7], 0, t[8]
        );
    }

    function move_corner(id, x, y) {
        if(id === null) return;

        console.log(id, x, y);
        corner_planes[id].position.x = x * 2 / window.innerWidth - 1;
        corner_planes[id].position.y = -y * 2 / window.innerHeight + 1.;

        update_transform();
    }

    update_transform();

    return {update_material, update_uniform, get_corner_id, move_corner, set_visible};
}
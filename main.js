
        // Scene variables
        let scene, camera, renderer, controls;
        let character;
        let leftLeg, rightLeg, leftArm, rightArm;
        let ground;
        
        // Movement variables
        const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
        let isMoving = false;
        let moveDirection = { forward: 0, right: 0 };
        let position = { x: 0, y: 0, z: 0 };
        let rotation = 0;
        const walkingSpeed = 0.05;
        
        // Ground settings
        const groundSize = 200;
        
        // Initialize the scene
        function init() {
            // Create scene
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x87CEEB); // Sky blue
            scene.fog = new THREE.FogExp2(0x87CEEB, 0.01);
            
            // Create camera
            const container = document.getElementById('scene-container');
            camera = new THREE.PerspectiveCamera(
                60, 
                container.clientWidth / container.clientHeight, 
                0.1, 
                1000
            );
            camera.position.set(0, 5, 10);
            
            // Create renderer
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            container.appendChild(renderer.domElement);
            
            // Add lights
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(50, 100, 50);
            directionalLight.castShadow = true;
            directionalLight.shadow.mapSize.width = 2048;
            directionalLight.shadow.mapSize.height = 2048;
            directionalLight.shadow.camera.near = 0.5;
            directionalLight.shadow.camera.far = 500;
            directionalLight.shadow.camera.left = -100;
            directionalLight.shadow.camera.right = 100;
            directionalLight.shadow.camera.top = 100;
            directionalLight.shadow.camera.bottom = -100;
            scene.add(directionalLight);
            
            // Create flat ground
            createGround();
            
            // Create character
            createCharacter();
            
            // Place character on ground
            position.x = 0;
            position.z = 0;
            position.y = 0.5; // Character stands directly on ground, adjusted to prevent leg clipping
            character.position.set(position.x, position.y, position.z);
            
            // Add houses
            createHouses();
            
            // Add trees
            createTrees();
            
            // Add controls
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.maxPolarAngle = Math.PI / 2 - 0.1;
            controls.minDistance = 5;
            controls.maxDistance = 20;
            controls.target.set(character.position.x, character.position.y + 1, character.position.z);
            controls.update();
            
            // Add event listeners
            window.addEventListener('resize', onWindowResize);
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('keyup', handleKeyUp);
            setupButtonListeners();
            
            // Start animation loop
            animate();
        }
        
        function createGround() {
            // Create a completely flat ground plane
            const geometry = new THREE.PlaneGeometry(groundSize, groundSize);
            
            // Create ground material with bright green color
            const material = new THREE.MeshStandardMaterial({
                color: 0x7CFC00, // Bright green for grass
                roughness: 0.8,
                metalness: 0.1
            });
            
            // Create ground mesh
            ground = new THREE.Mesh(geometry, material);
            ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
            ground.position.y = 0; // At y=0
            ground.receiveShadow = true;
            scene.add(ground);
        }
        
        function createCharacter() {
            character = new THREE.Group();
            scene.add(character);
            
            // Body
            const bodyGeometry = new THREE.BoxGeometry(0.8, 1, 0.5);
            const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x3498db });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 0.5; // Half the height of the body
            body.castShadow = true;
            character.add(body);
            
            // Head
            const headGeometry = new THREE.SphereGeometry(0.3, 32, 32);
            const headMaterial = new THREE.MeshStandardMaterial({ color: 0xf1c40f });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 1.3; // Position on top of body
            head.castShadow = true;
            character.add(head);
            
            // Left Arm
            leftArm = new THREE.Group();
            leftArm.position.set(0.6, 0.8, 0);
            character.add(leftArm);
            
            const leftArmGeometry = new THREE.BoxGeometry(0.2, 0.8, 0.2);
            const leftArmMaterial = new THREE.MeshStandardMaterial({ color: 0x2980b9 });
            const leftArmMesh = new THREE.Mesh(leftArmGeometry, leftArmMaterial);
            leftArmMesh.position.y = -0.4;
            leftArmMesh.castShadow = true;
            leftArm.add(leftArmMesh);
            
            // Right Arm
            rightArm = new THREE.Group();
            rightArm.position.set(-0.6, 0.8, 0);
            character.add(rightArm);
            
            const rightArmGeometry = new THREE.BoxGeometry(0.2, 0.8, 0.2);
            const rightArmMaterial = new THREE.MeshStandardMaterial({ color: 0x2980b9 });
            const rightArmMesh = new THREE.Mesh(rightArmGeometry, rightArmMaterial);
            rightArmMesh.position.y = -0.4;
            rightArmMesh.castShadow = true;
            rightArm.add(rightArmMesh);
            
            // Left Leg
            leftLeg = new THREE.Group();
            leftLeg.position.set(0.25, 0, 0);
            character.add(leftLeg);
            
            const leftLegGeometry = new THREE.BoxGeometry(0.25, 1, 0.25);
            const leftLegMaterial = new THREE.MeshStandardMaterial({ color: 0x34495e });
            const leftLegMesh = new THREE.Mesh(leftLegGeometry, leftLegMaterial);
            leftLegMesh.position.y = -0.5; // Position leg below body
            leftLegMesh.castShadow = true;
            leftLeg.add(leftLegMesh);
            
            // Right Leg
            rightLeg = new THREE.Group();
            rightLeg.position.set(-0.25, 0, 0);
            character.add(rightLeg);
            
            const rightLegGeometry = new THREE.BoxGeometry(0.25, 1, 0.25);
            const rightLegMaterial = new THREE.MeshStandardMaterial({ color: 0x34495e });
            const rightLegMesh = new THREE.Mesh(rightLegGeometry, rightLegMaterial);
            rightLegMesh.position.y = -0.5; // Position leg below body
            rightLegMesh.castShadow = true;
            rightLeg.add(rightLegMesh);
        }
        
        function createHouses() {
            // Create several small houses around the village
            const housePositions = [
                { x: 10, z: -30 },
                { x: -15, z: -20 },
                { x: 20, z: -10 },
                { x: -25, z: 0 },
                { x: 30, z: 10 },
                { x: -20, z: 20 },
                { x: 15, z: 30 }
            ];
            
            housePositions.forEach(pos => {
                createHouse(pos.x, pos.z);
            });
        }
        
        function createHouse(x, z) {
            const house = new THREE.Group();
            house.position.set(x, 0, z); // Place directly on ground
            
            // Rotate house to face random direction
            house.rotation.y = Math.random() * Math.PI * 2;
            
            // House base
            const baseWidth = 2 + Math.random() * 2;
            const baseDepth = 2 + Math.random() * 2;
            const baseHeight = 2 + Math.random() * 1;
            
            const baseGeometry = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
            const baseMaterial = new THREE.MeshStandardMaterial({ 
                color: Math.random() > 0.5 ? 0xE0E0E0 : 0xD2B48C 
            });
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            base.position.y = baseHeight / 2;
            base.castShadow = true;
            base.receiveShadow = true;
            house.add(base);
            
            // Roof
            const roofGeometry = new THREE.ConeGeometry(
                Math.max(baseWidth, baseDepth) * 0.7, 
                1.5, 
                4
            );
            const roofMaterial = new THREE.MeshStandardMaterial({ 
                color: Math.random() > 0.5 ? 0x8B4513 : 0xA52A2A 
            });
            const roof = new THREE.Mesh(roofGeometry, roofMaterial);
            roof.position.y = baseHeight + 0.75;
            roof.rotation.y = Math.PI / 4;
            roof.castShadow = true;
            house.add(roof);
            
            // Door
            const doorGeometry = new THREE.PlaneGeometry(0.6, 1.2);
            const doorMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x5D4037,
                side: THREE.DoubleSide
            });
            const door = new THREE.Mesh(doorGeometry, doorMaterial);
            door.position.set(0, 0.6, baseDepth / 2 + 0.01);
            house.add(door);
            
            // Windows
            const windowGeometry = new THREE.PlaneGeometry(0.5, 0.5);
            const windowMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x90CAF9,
                emissive: 0x90CAF9,
                emissiveIntensity: 0.2,
                side: THREE.DoubleSide
            });
            
            // Front windows
            const frontWindow1 = new THREE.Mesh(windowGeometry, windowMaterial);
            frontWindow1.position.set(-0.6, 1.2, baseDepth / 2 + 0.01);
            house.add(frontWindow1);
            
            const frontWindow2 = new THREE.Mesh(windowGeometry, windowMaterial);
            frontWindow2.position.set(0.6, 1.2, baseDepth / 2 + 0.01);
            house.add(frontWindow2);
            
            // Side windows
            const sideWindow1 = new THREE.Mesh(windowGeometry, windowMaterial);
            sideWindow1.position.set(baseWidth / 2 + 0.01, 1.2, 0);
            sideWindow1.rotation.y = Math.PI / 2;
            house.add(sideWindow1);
            
            const sideWindow2 = new THREE.Mesh(windowGeometry, windowMaterial);
            sideWindow2.position.set(-baseWidth / 2 - 0.01, 1.2, 0);
            sideWindow2.rotation.y = Math.PI / 2;
            house.add(sideWindow2);
            
            // Add chimney
            if (Math.random() > 0.5) {
                const chimneyGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);
                const chimneyMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
                const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
                chimney.position.set(baseWidth / 3, baseHeight + 1, baseDepth / 4);
                chimney.castShadow = true;
                house.add(chimney);
            }
            
            scene.add(house);
        }
        
        function createTrees() {
            // Add trees throughout the village
            for (let i = 0; i < 50; i++) {
                const x = (Math.random() - 0.5) * 180;
                const z = (Math.random() - 0.5) * 180;
                
                createTree(x, z);
            }
        }
        
        function createTree(x, z) {
            const tree = new THREE.Group();
            tree.position.set(x, 0, z); // Place directly on ground
            
            // Tree height
            const height = 3 + Math.random() * 3;
            const scale = height / 4;
            
            // Trunk
            const trunkGeometry = new THREE.CylinderGeometry(0.2 * scale, 0.3 * scale, height, 8);
            const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = height / 2;
            trunk.castShadow = true;
            tree.add(trunk);
            
            // Tree type (pine or regular)
            if (Math.random() > 0.5) {
                // Pine tree (multiple cones)
                const levels = Math.floor(2 + Math.random() * 3);
                for (let i = 0; i < levels; i++) {
                    const coneSize = (1.5 - i * 0.3) * scale;
                    const coneHeight = (1.5 - i * 0.2) * scale;
                    const leavesGeometry = new THREE.ConeGeometry(coneSize, coneHeight, 8);
                    const leavesMaterial = new THREE.MeshStandardMaterial({ 
                        color: 0x2E8B57
                    });
                    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
                    leaves.position.y = height - i * coneHeight * 0.7;
                    leaves.castShadow = true;
                    tree.add(leaves);
                }
            } else {
                // Regular tree (sphere foliage)
                const leavesGeometry = new THREE.SphereGeometry(1.5 * scale, 8, 8);
                const leavesMaterial = new THREE.MeshStandardMaterial({ 
                    color: 0x228B22
                });
                const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
                leaves.position.y = height + 0.5 * scale;
                leaves.scale.y = 1.2;
                leaves.castShadow = true;
                tree.add(leaves);
            }
            
            scene.add(tree);
        }
        
        function setupButtonListeners() {
            const buttons = {
                'up-btn': 'ArrowUp',
                'down-btn': 'ArrowDown',
                'left-btn': 'ArrowLeft',
                'right-btn': 'ArrowRight'
            };
            
            Object.entries(buttons).forEach(([id, key]) => {
                const btn = document.getElementById(id);
                
                // Mouse events
                btn.addEventListener('mousedown', () => simulateKeyDown(key));
                btn.addEventListener('mouseup', () => simulateKeyUp(key));
                btn.addEventListener('mouseleave', () => keys[key] && simulateKeyUp(key));
                
                // Touch events
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    simulateKeyDown(key);
                }, { passive: false });
                
                btn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    simulateKeyUp(key);
                }, { passive: false });
            });
        }
        
        function handleKeyDown(e) {
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                keys[e.key] = true;
                updateMovement();
            }
        }
        
        function handleKeyUp(e) {
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                keys[e.key] = false;
                updateMovement();
            }
        }
        
        function simulateKeyDown(key) {
            keys[key] = true;
            updateMovement();
            
            // Change button color
            const btnId = key.toLowerCase().replace('arrow', '') + '-btn';
            document.getElementById(btnId).style.backgroundColor = 'rgba(28, 110, 164, 0.7)';
        }
        
        function simulateKeyUp(key) {
            keys[key] = false;
            updateMovement();
            
            // Reset button color
            const btnId = key.toLowerCase().replace('arrow', '') + '-btn';
            document.getElementById(btnId).style.backgroundColor = 'rgba(52, 152, 219, 0.7)';
        }
        
        function updateMovement() {
            const forward = Number(keys.ArrowUp) - Number(keys.ArrowDown);
            const right = Number(keys.ArrowRight) - Number(keys.ArrowLeft);
            
            moveDirection.forward = forward;
            moveDirection.right = right;
            isMoving = forward !== 0 || right !== 0;
            
            if (isMoving) {
                rotation = Math.atan2(right, forward);
            }
        }
        
        function onWindowResize() {
            const container = document.getElementById('scene-container');
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }
        
        let animationTime = 0;
        
        function animate() {
            requestAnimationFrame(animate);
            
            // Move character
            if (isMoving) {
                // Calculate new position
                const newX = position.x + moveDirection.right * walkingSpeed;
                const newZ = position.z + moveDirection.forward * walkingSpeed;
                
                // Update position (ground is completely flat)
                position.x = newX;
                position.z = newZ;
                
                // Update character position and rotation
                character.position.set(position.x, position.y, position.z);
                character.rotation.y = rotation;
                
                // Animate limbs
                animationTime += 0.1;
                const legRotation = Math.sin(animationTime * 0.1) * (Math.PI / 4);
                const armRotation = Math.sin(animationTime * 0.1) * (Math.PI / 6);
                
                leftLeg.rotation.x = legRotation;
                rightLeg.rotation.x = -legRotation;
                leftArm.rotation.x = -armRotation;
                rightArm.rotation.x = armRotation;
            } else {
                // Reset to idle pose
                leftLeg.rotation.x = 0;
                rightLeg.rotation.x = 0;
                leftArm.rotation.x = 0;
                rightArm.rotation.x = 0;
            }
            
            // Update camera target
            controls.target.set(character.position.x, character.position.y + 1, character.position.z);
            controls.update();
            
            // Render scene
            renderer.render(scene, camera);
        }
        
        // Initialize when the window loads
        window.addEventListener('load', init);
    
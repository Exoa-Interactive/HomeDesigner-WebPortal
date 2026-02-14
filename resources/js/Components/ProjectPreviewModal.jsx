import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function createRadialGradientTexture(centerColor, edgeColor, size = 1024) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(
        size / 2, size / 2, 0,
        size / 2, size / 2, size / 2
    );
    gradient.addColorStop(0, centerColor);
    gradient.addColorStop(1, edgeColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
}

export default function ProjectPreviewModal({ project, onClose }) {
    const containerRef = useRef(null);
    const sceneRef = useRef({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [wireframe, setWireframe] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Scene
        const scene = new THREE.Scene();
        scene.background = createRadialGradientTexture('#2a2aff', '#0a0a33');

        // Camera
        const camera = new THREE.PerspectiveCamera(
            50,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        const initialPosition = new THREE.Vector3(0, 1.5, 3);
        const initialTarget = new THREE.Vector3(0, 1, 0);
        camera.position.copy(initialPosition);

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        container.appendChild(renderer.domElement);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = true;
        controls.minDistance = 0.5;
        controls.maxDistance = 5;
        controls.target.copy(initialTarget);

        // 3-point studio lighting
        const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
        keyLight.position.set(2, 3, 2);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 2048;
        keyLight.shadow.mapSize.height = 2048;
        keyLight.shadow.bias = -0.0001;
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0x6794FF, 1.0);
        fillLight.position.set(-2, 2, -1);
        scene.add(fillLight);

        const backLight = new THREE.DirectionalLight(0xFFB878, 1.5);
        backLight.position.set(0, 2, -3);
        scene.add(backLight);

        const rimLight = new THREE.DirectionalLight(0xffffff, 3.0);
        rimLight.position.set(-1, 2, -2);
        scene.add(rimLight);

        const ambient = new THREE.AmbientLight(0xffffff, 0.3);
        scene.add(ambient);

        // Shadow ground
        const shadowPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 10),
            new THREE.ShadowMaterial({ opacity: 0.3 })
        );
        shadowPlane.rotation.x = -Math.PI / 2;
        shadowPlane.receiveShadow = true;
        scene.add(shadowPlane);

        // Animation
        const clock = new THREE.Clock();
        let mixer = null;
        let model = null;
        let animId;

        function animate() {
            animId = requestAnimationFrame(animate);
            const delta = clock.getDelta();
            if (mixer) mixer.update(delta);
            controls.update();
            renderer.render(scene, camera);
        }
        animate();

        // Load GLB
        const loader = new GLTFLoader();
        const glbUrl = `/storage/${project.glb_url}`;

        loader.load(
            glbUrl,
            (gltf) => {
                model = gltf.scene;

                // Center model
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                model.position.x = -center.x;
                model.position.y = -box.min.y;
                model.position.z = -center.z;

                // Shadows
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                // Rotate 180° on Y axis so the model faces the camera
                model.rotation.y = Math.PI;

                scene.add(model);

                // Frame the model
                const maxDim = Math.max(size.x, size.y, size.z);
                camera.position.set(0, size.y * 0.6, maxDim * 2);
                controls.target.set(0, size.y * 0.4, 0);
                controls.update();

                // Play animations if present
                if (gltf.animations.length > 0) {
                    mixer = new THREE.AnimationMixer(model);
                    const action = mixer.clipAction(gltf.animations[0]);
                    action.play();
                }

                setLoading(false);
            },
            undefined,
            (err) => {
                console.error('Error loading GLB:', err);
                setError('Failed to load 3D model.');
                setLoading(false);
            }
        );

        // Resize
        function onResize() {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }
        window.addEventListener('resize', onResize);

        // Store refs for toolbar actions
        sceneRef.current = {
            camera, controls, model: () => model,
            initialPosition, initialTarget,
        };

        return () => {
            window.removeEventListener('resize', onResize);
            cancelAnimationFrame(animId);
            if (mixer) mixer.stopAllAction();
            controls.dispose();
            renderer.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            // Dispose scene resources
            scene.traverse((child) => {
                if (child.isMesh) {
                    child.geometry.dispose();
                    const mats = Array.isArray(child.material) ? child.material : [child.material];
                    mats.forEach(m => m.dispose());
                }
            });
        };
    }, [project.glb_url]);

    function resetCamera() {
        const { camera, controls, initialPosition, initialTarget, model } = sceneRef.current;
        if (!camera) return;
        camera.position.copy(initialPosition);
        controls.target.copy(initialTarget);
        controls.update();
        const m = model();
        if (m) m.rotation.set(0, 0, 0);
    }

    function toggleWireframe() {
        const m = sceneRef.current.model?.();
        if (!m) return;
        const next = !wireframe;
        setWireframe(next);
        m.traverse((child) => {
            if (child.isMesh && child.material) {
                const mats = Array.isArray(child.material) ? child.material : [child.material];
                mats.forEach(mat => mat.wireframe = next);
            }
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0a0a33' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3" style={{ background: 'rgba(0,0,0,0.7)' }}>
                <h2 className="text-white font-medium text-lg">{project.name}</h2>
                <button onClick={onClose} className="text-white hover:text-gray-300 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* 3D Viewport */}
            <div ref={containerRef} className="flex-1 relative">
                {/* Loading spinner */}
                {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                        <div
                            className="w-12 h-12 border-3 rounded-full animate-spin"
                            style={{
                                borderWidth: '3px',
                                borderColor: 'rgba(255,255,255,0.2)',
                                borderTopColor: '#4fc3f7',
                            }}
                        />
                        <span className="text-white text-lg">Loading model...</span>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-red-400 text-lg">{error}</span>
                    </div>
                )}

                {/* Toolbar */}
                {!loading && !error && (
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <button
                            onClick={resetCamera}
                            className="text-white text-sm px-4 py-2 rounded-md transition-colors"
                            style={{ background: 'rgba(0,0,0,0.7)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.9)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
                        >
                            Reset View
                        </button>
                        <button
                            onClick={toggleWireframe}
                            className="text-white text-sm px-4 py-2 rounded-md transition-colors"
                            style={{ background: wireframe ? 'rgba(79,195,247,0.5)' : 'rgba(0,0,0,0.7)' }}
                            onMouseEnter={e => e.currentTarget.style.background = wireframe ? 'rgba(79,195,247,0.7)' : 'rgba(0,0,0,0.9)'}
                            onMouseLeave={e => e.currentTarget.style.background = wireframe ? 'rgba(79,195,247,0.5)' : 'rgba(0,0,0,0.7)'}
                        >
                            Wireframe
                        </button>
                    </div>
                )}

                {/* Controls info */}
                <div
                    className="absolute bottom-4 right-4 text-white text-sm rounded-lg p-4 leading-relaxed"
                    style={{ background: 'rgba(0,0,0,0.7)' }}
                >
                    <h4 className="font-medium mb-2" style={{ color: '#4fc3f7' }}>Controls</h4>
                    <div><kbd className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: 'rgba(255,255,255,0.15)' }}>Left Mouse</kbd> Rotate</div>
                    <div><kbd className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: 'rgba(255,255,255,0.15)' }}>Right Mouse</kbd> Pan</div>
                    <div><kbd className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: 'rgba(255,255,255,0.15)' }}>Scroll</kbd> Zoom</div>
                </div>
            </div>
        </div>
    );
}

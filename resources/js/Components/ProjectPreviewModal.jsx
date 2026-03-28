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

        const scene = new THREE.Scene();
        scene.background = createRadialGradientTexture('#1e1b4b', '#0f0a2e');

        const camera = new THREE.PerspectiveCamera(
            50,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        const initialPosition = new THREE.Vector3(0, 1.5, 3);
        const initialTarget = new THREE.Vector3(0, 1, 0);
        camera.position.copy(initialPosition);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        container.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = true;
        controls.minDistance = 0.5;
        controls.maxDistance = 5;
        controls.target.copy(initialTarget);

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

        const shadowPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 10),
            new THREE.ShadowMaterial({ opacity: 0.3 })
        );
        shadowPlane.rotation.x = -Math.PI / 2;
        shadowPlane.receiveShadow = true;
        scene.add(shadowPlane);

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

        const loader = new GLTFLoader();
        const glbUrl = `/storage/${project.glb_url}`;

        loader.load(
            glbUrl,
            (gltf) => {
                model = gltf.scene;
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                model.position.x = -center.x;
                model.position.y = -box.min.y;
                model.position.z = -center.z;

                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                model.rotation.y = Math.PI;
                scene.add(model);

                const maxDim = Math.max(size.x, size.y, size.z);
                camera.position.set(0, size.y * 0.6, maxDim * 2);
                controls.target.set(0, size.y * 0.4, 0);
                controls.update();

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

        function onResize() {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }
        window.addEventListener('resize', onResize);

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
        <div className="fixed inset-0 z-50 flex flex-col animate-fade-in" style={{ background: '#0f0a2e' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3.5 bg-black/40 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-white font-semibold text-sm">{project.name}</h2>
                        <p className="text-white/40 text-xs">3D Preview</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* 3D Viewport */}
            <div ref={containerRef} className="flex-1 relative">
                {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full border-2 border-brand-500/20 border-t-brand-400 animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                                </svg>
                            </div>
                        </div>
                        <span className="text-white/60 text-sm font-medium">Loading 3D model...</span>
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
                            <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                        </div>
                        <span className="text-red-400 text-sm">{error}</span>
                    </div>
                )}

                {/* Toolbar */}
                {!loading && !error && (
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <button
                            onClick={resetCamera}
                            className="flex items-center gap-2 text-white/70 hover:text-white text-xs font-medium px-3.5 py-2.5 rounded-xl bg-black/30 backdrop-blur-md border border-white/10 hover:bg-black/50 transition-all"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                            </svg>
                            Reset
                        </button>
                        <button
                            onClick={toggleWireframe}
                            className={`flex items-center gap-2 text-xs font-medium px-3.5 py-2.5 rounded-xl backdrop-blur-md border transition-all ${
                                wireframe
                                    ? 'text-brand-300 bg-brand-500/20 border-brand-400/30'
                                    : 'text-white/70 hover:text-white bg-black/30 border-white/10 hover:bg-black/50'
                            }`}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                            </svg>
                            Wireframe
                        </button>
                    </div>
                )}

                {/* Controls help */}
                <div className="absolute bottom-4 right-4 rounded-xl p-4 bg-black/30 backdrop-blur-md border border-white/10 text-white/50 text-xs leading-relaxed">
                    <h4 className="font-semibold text-brand-300 mb-2 text-[11px] uppercase tracking-wider">Controls</h4>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <kbd className="px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-white/10 text-white/60 border border-white/5">LMB</kbd>
                            <span>Rotate</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <kbd className="px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-white/10 text-white/60 border border-white/5">RMB</kbd>
                            <span>Pan</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <kbd className="px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-white/10 text-white/60 border border-white/5">Scroll</kbd>
                            <span>Zoom</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

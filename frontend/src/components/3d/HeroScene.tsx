import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

function ParticleField(props: any) {
    const ref = useRef<THREE.Points>(null!);

    const [positions, bgColors] = useMemo(() => {
        const count = 5000;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const color = new THREE.Color();

        for (let i = 0; i < count; i++) {
            // Spherical distribution
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 10 + Math.random() * 10; // Wider spread

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            // Cyberpunk colors: Cyan, Purple, White
            const seed = Math.random();
            if (seed > 0.6) color.setHex(0x00ffff); // Cyan
            else if (seed > 0.3) color.setHex(0xa855f7); // Purple
            else color.setHex(0xffffff); // White

            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        return [positions, colors];
    }, []);

    useFrame((state, delta) => {
        if (ref.current) {
            // Continuous slow rotation
            ref.current.rotation.y -= delta / 20;

            // Interactive Parallax
            const x = state.pointer.x * 0.5;
            const y = state.pointer.y * 0.5;

            // Smoothly interpolate rotation towards mouse position
            ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, y * 0.2, 0.1);
            ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, (x * 0.2) - (state.clock.elapsedTime * 0.05), 0.1);
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]} {...props}>
            <Points ref={ref} positions={positions} colors={bgColors} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    vertexColors
                    size={0.05}
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </Points>
        </group>
    );
}

function FloatingShards() {
    const count = 50;
    return (
        <group>
            {Array.from({ length: count }).map((_, i) => (
                <Float key={i} speed={2} rotationIntensity={5} floatIntensity={10}>
                    <mesh position={[
                        (Math.random() - 0.5) * 50,
                        (Math.random() - 0.5) * 50,
                        (Math.random() - 0.5) * 30 - 10
                    ]}>
                        <octahedronGeometry args={[Math.random() * 0.5]} />
                        <meshBasicMaterial color={Math.random() > 0.5 ? 0x00ffff : 0xa855f7} wireframe transparent opacity={0.3} />
                    </mesh>
                </Float>
            ))}
        </group>
    );
}

const HeroScene = () => {
    return (
        <Canvas camera={{ position: [0, 0, 25], fov: 60 }} gl={{ antialias: false }}>
            <color attach="background" args={['#000000']} />

            <ParticleField />
            <FloatingShards />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            <EffectComposer>
                <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
            </EffectComposer>
        </Canvas>
    );
};

export default HeroScene;

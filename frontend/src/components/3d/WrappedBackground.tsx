import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

function DataRain(props: any) {
    const ref = useRef<THREE.Points>(null!);

    const [positions, colors] = useMemo(() => {
        const count = 3000;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const color = new THREE.Color();

        for (let i = 0; i < count; i++) {
            // Cylindrical/Tube distribution for a "tunnel" feel
            const theta = Math.random() * 2 * Math.PI;
            const r = 15 + Math.random() * 20; // Tunnel radius

            const x = r * Math.cos(theta);
            const y = (Math.random() - 0.5) * 100; // Tall column
            const z = r * Math.sin(theta); // Deep tunnel

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            // Codeforces Colors + Matrix Green
            const seed = Math.random();
            if (seed > 0.8) color.setHex(0xfacc15); // Yellow (Gold/Grandmaster)
            else if (seed > 0.6) color.setHex(0xf87171); // Red (Grandmaster)
            else if (seed > 0.4) color.setHex(0x3b82f6); // Blue (Expert)
            else color.setHex(0x22c55e); // Green (Matrix data)

            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        return [positions, colors];
    }, []);

    useFrame((_state, delta) => {
        if (ref.current) {
            // Fall down effect
            const positions = ref.current.geometry.attributes.position.array as Float32Array;
            for (let i = 1; i < positions.length; i += 3) {
                positions[i] -= delta * 5; // Speed
                if (positions[i] < -50) {
                    positions[i] = 50; // Reset to top
                }
            }
            ref.current.geometry.attributes.position.needsUpdate = true;

            // Rotate tunnel
            ref.current.rotation.y += delta * 0.1;
        }
    });

    return (
        <group rotation={[0, 0, 0]} {...props}>
            <Points ref={ref} positions={positions} colors={colors} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    vertexColors
                    size={0.15}
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </Points>
        </group>
    );
}

const WrappedBackground = () => {
    return (
        <div className="absolute inset-0 z-0">
            <Canvas camera={{ position: [0, 0, 30], fov: 75 }} gl={{ antialias: false }}>
                <color attach="background" args={['#020617']} />
                <fog attach="fog" args={['#020617', 20, 60]} />

                <DataRain />

                <EffectComposer>
                    <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} intensity={1.5} />
                </EffectComposer>
            </Canvas>
        </div>
    );
};

export default WrappedBackground;

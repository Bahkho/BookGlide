import { Environment, Float, OrbitControls } from "@react-three/drei"; // Import components from Drei for advanced 3D features
import { Book } from "./Book"; // Import the Book component

// Experience component: Sets up the 3D scene and interactions
export const Experience = () => {
  return (
    <>
      {/* Float component: Adds floating and rotation animation to the Book */}
      <Float
        rotation-x={-Math.PI / 4} // Rotates the object on the X-axis by -45 degrees (in radians)
        floatIntensity={1} // Controls how much the object floats
        speed={2} // Sets the speed of floating animation
        rotationIntensity={2} // Controls how much the object rotates during the float animation
      >
        <Book /> {/* The 3D Book model */}
      </Float>

      {/* OrbitControls: Adds camera controls for user interaction (pan, zoom, rotate) */}
      <OrbitControls />

      {/* Environment: Adds a realistic lighting environment using a preset */}
      <Environment preset="studio"></Environment>

      {/* Directional light: Simulates sunlight with shadows */}
      <directionalLight
        position={[2, 5, 2]} // Sets the light's position in the 3D space
        intensity={2.5} // Controls the brightness of the light
        castShadow // Enables shadow casting from this light
        shadow-mapSize-width={2048} // Sets the resolution of the shadow map (width)
        shadow-mapSize-height={2048} // Sets the resolution of the shadow map (height)
        shadow-bias={-0.0001} // Prevents shadow artifacts by offsetting shadow calculations
      />

      {/* Mesh: Represents a flat plane beneath the book to catch shadows */}
      <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[100, 100]} /> {/* A large plane with dimensions 100x100 */}
        <shadowMaterial transparent opacity={0.2} /> {/* Material for shadow projection */}
      </mesh>
    </>
  );
};

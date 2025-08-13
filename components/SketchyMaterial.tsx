import { useMemo } from "react";
import * as THREE from "three";

interface SketchyMaterialProps {
  texture: THREE.Texture;
}

export const SketchyMaterial: React.FC<SketchyMaterialProps> = ({
  texture,
}) => {
  return (
    <shaderMaterial
      uniforms={{
        uTexture: { value: texture },
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
      }}
      vertexShader={`
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `}
      fragmentShader={`
        uniform sampler2D uTexture;
        uniform float uTime;
        uniform vec2 uResolution;
        varying vec2 vUv;

        // Aggressive noise function for punk grain
        float punkNoise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }

        // More chaotic noise for texture
        float chaosNoise(vec2 p) {
          float n = punkNoise(p);
          n += punkNoise(p * 2.0) * 0.05;
          n += punkNoise(p * 4.0) * 0.025;
          n += punkNoise(p * 8.0) * 0.0125;
          return n;
        }

        // Jagged edge detection for punk aesthetic
        float jaggedEdge(sampler2D tex, vec2 uv, vec2 pixelSize) {
          float topLeft = texture2D(tex, uv + vec2(-1.0, -1.0) * pixelSize).r;
          float top = texture2D(tex, uv + vec2(0.0, -1.0) * pixelSize).r;
          float topRight = texture2D(tex, uv + vec2(1.0, -1.0) * pixelSize).r;
          float left = texture2D(tex, uv + vec2(-1.0, 0.0) * pixelSize).r;
          float right = texture2D(tex, uv + vec2(1.0, 0.0) * pixelSize).r;
          float bottomLeft = texture2D(tex, uv + vec2(-1.0, 1.0) * pixelSize).r;
          float bottom = texture2D(tex, uv + vec2(0.0, 1.0) * pixelSize).r;
          float bottomRight = texture2D(tex, uv + vec2(1.0, 1.0) * pixelSize).r;

          float dX = topRight + 2.0 * right + bottomRight - topLeft - 2.0 * left - bottomLeft;
          float dY = bottomLeft + 2.0 * bottom + bottomRight - topLeft - 2.0 * top - topRight;

          return sqrt(dX * dX + dY * dY);
        }

        void main() {
          vec2 uv = vUv;
          vec2 pixelSize = 1.0 / vec2(512.0, 512.0);
          
          // Add some UV distortion for punk effect
          vec2 distortedUv = uv + vec2(
            chaosNoise(uv * 10.0 + uTime * 0.1) * 0.02,
            chaosNoise(uv * 10.0 + uTime * 0.15) * 0.02
          );
          
          // Sample the texture
          vec4 texColor = texture2D(uTexture, distortedUv);
          
          // Calculate brightness with more contrast
          float brightness = (texColor.r + texColor.g + texColor.b) / 3.0;
          brightness = pow(brightness, 0.8); // Increase contrast
          
          // Apply jagged edge detection
          float edgeValue = jaggedEdge(uTexture, distortedUv, pixelSize);
          
          // Add aggressive punk grain
          float punkGrain = chaosNoise(gl_FragCoord.xy * 0.5 + uTime * 0.2);
          float fineGrain = chaosNoise(gl_FragCoord.xy * 2.0 + uTime * 0.3);
          
          // Combine grains for texture
          float totalGrain = punkGrain * 0.7 + fineGrain * 0.3;
          
          // Add some "distressed" areas
          float distress = chaosNoise(uv * 20.0 + uTime * 0.05);
          float scratchEffect = step(0.95, chaosNoise(uv * 50.0 + uTime * 0.1));
          
          // Create punk-style pencil effect
          float punkValue = 0.0;
          
          // Harsher edge detection
          if (edgeValue > 0.15) {
            punkValue = 1.0;
            // Add some randomness to edges
            punkValue *= 0.8 + chaosNoise(gl_FragCoord.xy * 0.1) * 0.4;
          } else if (brightness < 0.4) {
            // Dark areas with heavy grain
            float darkGrain = chaosNoise(gl_FragCoord.xy * 0.02 + uTime * 0.1);
            punkValue = brightness * (0.6 + darkGrain * 0.8);
          } else if (brightness > 0.8) {
            // Bright areas with some grain
            punkValue = 0.0;
            // Add subtle grain to bright areas
            punkValue += totalGrain * 0.1;
          } else {
            // Mid tones with heavy texture
            float midGrain = chaosNoise(gl_FragCoord.xy * 0.015 + uTime * 0.08);
            punkValue = brightness * (0.4 + midGrain * 0.6);
          }
          
          // Add distress effects
          punkValue += distress * 0.2;
          punkValue += scratchEffect * 0.3;
          
          // Add overall grain
          punkValue += totalGrain * 0.15;
          
          // Clamp values
          punkValue = clamp(punkValue, 0.0, 1.0);
          
          // Final color - black on white with punk aesthetic
          vec3 finalColor = vec3(1.0 - punkValue);
          
          // Add some color variation for more punk feel
          float colorNoise = chaosNoise(gl_FragCoord.xy * 0.01 + uTime * 0.2);
          finalColor += vec3(colorNoise * 0.05, colorNoise * 0.03, colorNoise * 0.02);
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `}
    />
  );
};

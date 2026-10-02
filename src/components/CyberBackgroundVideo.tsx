import React, { useEffect, useRef, useState } from 'react';
import aiNeuralBgPoster from '../assets/images/ai_neural_mesh_bg_1790929073633.jpg';
import { Play, Pause } from 'lucide-react';

interface AiBackgroundProps {
  theme: 'dark' | 'light';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  glowColor: string;
  alpha: number;
  layer: 'far' | 'mid' | 'near';
  pulse: number;
  pulseSpeed: number;
  hemisphere: 'blue' | 'red' | 'center';
}

interface SynapsePulse {
  fromNode: number;
  toNode: number;
  progress: number;
  speed: number;
  color: string;
}

interface HexShape {
  x: number;
  y: number;
  size: number;
  angle: number;
  vAngle: number;
  vx: number;
  vy: number;
  color: string;
}

export const CyberBackgroundVideo: React.FC<AiBackgroundProps> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const mousePos = useRef({ x: -1000, y: -1000 });
  const targetMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initElements();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      // Normalize mouse (-1 to 1) for gentle 3D parallax
      targetMouse.current = {
        x: (e.clientX / width - 0.5) * 20,
        y: (e.clientY / height - 0.5) * 20,
      };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Particles & Neural Node Networks
    let particles: Particle[] = [];
    let pulses: SynapsePulse[] = [];
    let hexShapes: HexShape[] = [];

    const initElements = () => {
      particles = [];
      pulses = [];
      hexShapes = [];

      const isMobile = width < 768;
      const count = isMobile ? 40 : 85;

      // Create Neural Network particles with hemispheric distribution (Blue on Left, Red on Right)
      for (let i = 0; i < count; i++) {
        // Far: 40%, Mid: 45%, Near: 15%
        const rand = Math.random();
        const layer: 'far' | 'mid' | 'near' =
          rand < 0.4 ? 'far' : rand < 0.85 ? 'mid' : 'near';

        const x = Math.random() * width;
        const y = Math.random() * height;

        // Hemispheric coloring: Left favors Electric Blue, Right favors Neon Red
        const isLeft = x < width * 0.48;
        const isRight = x > width * 0.52;
        const hemisphere = isLeft ? 'blue' : isRight ? 'red' : 'center';

        let color = '#00E5FF';
        let glowColor = 'rgba(0, 229, 255, 0.7)';
        if (hemisphere === 'red' || (hemisphere === 'center' && Math.random() > 0.5)) {
          color = '#FF1744';
          glowColor = 'rgba(255, 23, 68, 0.7)';
        }

        const baseRadius =
          layer === 'far' ? 1.0 : layer === 'mid' ? 2.0 : 4.0;
        const speedMultiplier =
          layer === 'far' ? 0.25 : layer === 'mid' ? 0.45 : 0.6;

        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * speedMultiplier,
          vy: (Math.random() - 0.5) * speedMultiplier,
          radius: baseRadius,
          baseRadius,
          color,
          glowColor,
          alpha: layer === 'far' ? 0.25 : layer === 'mid' ? 0.65 : 0.85,
          layer,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.02 + Math.random() * 0.03,
          hemisphere,
        });
      }

      // Add a few subtle floating geometric wireframes (hexagons)
      const hexCount = isMobile ? 3 : 6;
      for (let h = 0; h < hexCount; h++) {
        const hx = Math.random() * width;
        const isLeft = hx < width / 2;
        hexShapes.push({
          x: hx,
          y: Math.random() * height,
          size: 24 + Math.random() * 32,
          angle: Math.random() * Math.PI * 2,
          vAngle: (Math.random() - 0.5) * 0.005,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          color: isLeft ? 'rgba(0, 229, 255, 0.07)' : 'rgba(255, 23, 68, 0.06)',
        });
      }
    };

    initElements();

    let waveOffset = 0;

    // Helper: Draw a delicate wireframe hexagon
    const drawHexagon = (hx: number, hy: number, size: number, angle: number, color: string) => {
      ctx.save();
      ctx.translate(hx, hy);
      ctx.rotate(angle);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const px = size * Math.cos(a);
        const py = size * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Slow Futuristic AI Energy Flow Waves
      if (isPlaying) waveOffset += 0.006;

      const drawEnergyWave = (
        yBase: number,
        amplitude: number,
        wavelength: number,
        color: string,
        strokeWidth: number,
        offset: number
      ) => {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 15) {
          const y =
            yBase +
            Math.sin(x * wavelength + waveOffset + offset) * amplitude +
            Math.cos(x * 0.002 + waveOffset * 0.5) * (amplitude * 0.4);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
      };

      // Subtle Cyan-Blue waves on upper & left, Red on lower & right
      drawEnergyWave(height * 0.28, 30, 0.003, 'rgba(0, 229, 255, 0.05)', 1.2, 0);
      drawEnergyWave(height * 0.32, 22, 0.0025, 'rgba(0, 180, 255, 0.04)', 1, 1.5);
      drawEnergyWave(height * 0.72, 35, 0.003, 'rgba(255, 23, 68, 0.05)', 1.2, 2.5);
      drawEnergyWave(height * 0.76, 25, 0.002, 'rgba(255, 0, 85, 0.04)', 1, 4.0);

      // 2. Draw Floating Wireframe Hexagons
      for (const hex of hexShapes) {
        if (isPlaying) {
          hex.x += hex.vx;
          hex.y += hex.vy;
          hex.angle += hex.vAngle;

          if (hex.x < -50) hex.x = width + 50;
          if (hex.x > width + 50) hex.x = -50;
          if (hex.y < -50) hex.y = height + 50;
          if (hex.y > height + 50) hex.y = -50;
        }
        drawHexagon(hex.x, hex.y, hex.size, hex.angle, hex.color);
      }

      // 3. Connect Mid-layer Nodes to form AI Neural Synapses
      const maxConnectDist = width < 768 ? 100 : 135;
      const midParticles = particles.filter((p) => p.layer === 'mid');

      for (let i = 0; i < midParticles.length; i++) {
        for (let j = i + 1; j < midParticles.length; j++) {
          const p1 = midParticles[i];
          const p2 = midParticles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectDist) {
            const alpha = (1 - dist / maxConnectDist) * 0.22;
            // Line color blends from p1 to p2
            const isLeftLine = (p1.x + p2.x) / 2 < width / 2;
            ctx.strokeStyle = isLeftLine
              ? `rgba(0, 229, 255, ${alpha})`
              : `rgba(255, 23, 68, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();

            // Randomly trigger a synaptic signal pulse along this connection
            if (isPlaying && Math.random() < 0.0006 && pulses.length < 15) {
              pulses.push({
                fromNode: i,
                toNode: j,
                progress: 0,
                speed: 0.02 + Math.random() * 0.02,
                color: isLeftLine ? '#00E5FF' : '#FF1744',
              });
            }
          }
        }
      }

      // 4. Render Active Synaptic Signal Pulses Traveling Along Neural Lines
      for (let k = pulses.length - 1; k >= 0; k--) {
        const pulse = pulses[k];
        const p1 = midParticles[pulse.fromNode];
        const p2 = midParticles[pulse.toNode];

        if (p1 && p2) {
          const px = p1.x + (p2.x - p1.x) * pulse.progress;
          const py = p1.y + (p2.y - p1.y) * pulse.progress;

          ctx.fillStyle = pulse.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = pulse.color;
          ctx.beginPath();
          ctx.arc(px, py, 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          if (isPlaying) {
            pulse.progress += pulse.speed;
            if (pulse.progress >= 1) {
              pulses.splice(k, 1);
            }
          }
        } else {
          pulses.splice(k, 1);
        }
      }

      // 5. Draw and Update Particles with Parallax & Pulsing Glow
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (isPlaying) {
          p.x += p.vx;
          p.y += p.vy;
          p.pulse += p.pulseSpeed;

          // Gentle mouse interactive repulsion
          const mdx = mousePos.current.x - p.x;
          const mdy = mousePos.current.y - p.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 140) {
            const force = (1 - mdist / 140) * 0.8;
            p.x -= (mdx / mdist) * force;
            p.y -= (mdy / mdist) * force;
          }

          // Screen wrap
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        }

        const currentRadius = p.baseRadius + Math.sin(p.pulse) * 0.6;
        const currentAlpha = p.alpha * (0.8 + Math.sin(p.pulse) * 0.2);

        // Glow effects for mid and near particles
        if (p.layer !== 'far') {
          ctx.shadowBlur = p.layer === 'near' ? 14 : 8;
          ctx.shadowColor = p.glowColor;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, currentRadius), 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isPlaying, theme]);

  return (
    <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden select-none">
      {/* 1. Underlying Abstract AI Neural Artwork Backdrop */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 scale-105"
        style={{
          backgroundImage: `url(${aiNeuralBgPoster})`,
          opacity: theme === 'dark' ? 0.42 : 0.12,
          filter: 'blur(3px) contrast(1.2)',
        }}
      />

      {/* 2. Soft Volumetric Neon Light Hemispheres (Left: Electric Blue, Right: Neon Red) */}
      {/* Left Hemisphere: Deep Electric Blue Glow */}
      <div
        className="absolute top-1/4 -left-32 w-[700px] h-[700px] rounded-full blur-[160px] opacity-35 anim-orb-blue pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #00E5FF 0%, #0055FF 40%, transparent 70%)',
        }}
      />

      {/* Right Hemisphere: Deep Crimson Red Glow */}
      <div
        className="absolute top-1/3 -right-32 w-[700px] h-[700px] rounded-full blur-[170px] opacity-35 anim-orb-red pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #FF1744 0%, #B7092B 40%, transparent 70%)',
        }}
      />

      {/* 3. Subtle Digital AI Grid Floor / Mesh Perspective */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 229, 255, 0.45) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 23, 68, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* 4. Canvas: Neural Network Synapses, Energy Waves & 3D Layered Particles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* 5. Center Soft Dark Radial Vignette Layer for 100% Crisp Content Readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            theme === 'dark'
              ? 'radial-gradient(ellipse at center, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.65) 60%, rgba(10,10,10,0.4) 100%)'
              : 'radial-gradient(ellipse at center, rgba(250,250,250,0.85) 0%, rgba(250,250,250,0.65) 60%, rgba(250,250,250,0.4) 100%)',
        }}
      />

      {/* 6. Subtle Glassmorphism Vignette Edges */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none" />

      {/* 7. Discreet Motion Control Toggle (Pause / Play Animation) */}
      <div className="absolute bottom-6 left-6 pointer-events-auto z-30">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? 'Pause AI neural background animation' : 'Resume AI neural background animation'}
          title={isPlaying ? 'Pause AI Neural Background' : 'Resume AI Neural Background'}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold tracking-wider uppercase border transition-all cursor-pointer backdrop-blur-xl bg-black/80 border-white/15 text-neutral-300 hover:border-[#00E5FF] hover:text-[#00E5FF] shadow-[0_0_20px_rgba(0,0,0,0.8)]"
        >
          {isPlaying ? (
            <>
              <Pause className="w-3 h-3 text-[#FF1744]" />
              <span>Neural BG: Active</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 text-[#00E5FF]" />
              <span>Neural BG: Paused</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

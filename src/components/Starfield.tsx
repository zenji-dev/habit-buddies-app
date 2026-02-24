import { useEffect, useState } from "react";

const StarLayer = ({ size, count, duration }: { size: number; count: number; duration: string }) => {
  const [shadow, setShadow] = useState("");

  useEffect(() => {
    let value = `${Math.floor(Math.random() * 2000)}px ${Math.floor(Math.random() * 2000)}px #FFF`;
    for (let i = 2; i <= count; i++) {
      value += `, ${Math.floor(Math.random() * 2000)}px ${Math.floor(Math.random() * 2000)}px #FFF`;
    }
    setShadow(value);
  }, [count]);

  if (!shadow) return null;

  return (
    <div style={{ animation: `animStar ${duration} linear infinite`, position: "absolute", inset: 0 }}>
      {/* Camada principal */}
      <div style={{ width: size, height: size, background: "transparent", boxShadow: shadow }} />
      {/* Camada duplicada posicionada 2000px abaixo para criar um loop infinito contínuo */}
      <div style={{ width: size, height: size, background: "transparent", boxShadow: shadow, position: "absolute", top: "2000px" }} />
    </div>
  );
};

export const Starfield = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <StarLayer size={1} count={700} duration="50s" />
      <StarLayer size={2} count={200} duration="100s" />
      <StarLayer size={3} count={100} duration="150s" />

      <style>{`
        @keyframes animStar {
          from {
            transform: translateY(0px);
          }
          to {
            transform: translateY(-2000px);
          }
        }
      `}</style>
    </div>
  );
};

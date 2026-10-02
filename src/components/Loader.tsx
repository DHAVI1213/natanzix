import { useEffect, useRef, useState } from "react";
import logo from "@/assets/logo-frango-no-pote.png";

export default function Loader({ onDone }: { onDone: () => void }) {
  const [sumiu, setSumiu] = useState(false);
  const numRef = useRef<HTMLSpanElement>(null);
  const cargaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calmo = matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.body.style.overflow = "hidden";

    let cancelado = false;

    async function rodar() {
      const gsapMod = await import("gsap").catch(() => null);
      const gsap = gsapMod?.gsap ?? gsapMod?.default;
      if (cancelado) return;

      if (!gsap || calmo) {
        terminar();
        return;
      }

      const tl = gsap.timeline({ onComplete: terminar });
      const num = { v: 0 };
      tl.from(".carga .logo-carga", { scale: 0, rotate: -90, duration: 0.7, ease: "back.out(2)" })
        .from(".carga p", { y: 20, opacity: 0, duration: 0.4 }, "<.2")
        .to(
          num,
          {
            v: 100,
            duration: 1.1,
            ease: "power2.inOut",
            onUpdate: () => {
              if (numRef.current) numRef.current.textContent = String(Math.round(num.v));
            },
          },
          "<"
        )
        .to(".carga .miolo", { scale: 0.8, opacity: 0, duration: 0.35, ease: "back.in(2)" }, "+=.1")
        .to(".carga .cortina", { yPercent: -100, duration: 0.7, ease: "power3.inOut", stagger: 0.08 }, "-=.1");

      // se o GSAP demorar, não trava o site
      setTimeout(() => {
        if (!cancelado) terminar();
      }, 4500);
    }

    function terminar() {
      if (cancelado) return;
      cancelado = true;
      document.body.style.overflow = "";
      setSumiu(true);
      setTimeout(onDone, 50);
    }

    rodar();
    const seguranca = setTimeout(terminar, 5000);
    return () => {
      cancelado = true;
      clearTimeout(seguranca);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (sumiu) return null;

  return (
    <div className="carga" ref={cargaRef} aria-hidden="true">
      <div className="cortina" style={{ position: "absolute", inset: 0, background: "#4C0016", zIndex: 1 }} />
      <div className="cortina" style={{ position: "absolute", inset: 0, background: "#EF6F2E", zIndex: 2 }} />
      <div className="cortina" style={{ position: "absolute", inset: 0, background: "#E3121B", zIndex: 3 }} />
      <div className="miolo" style={{ zIndex: 10 }}>
        <div className="logo-carga">
          <img src={logo} alt="" />
        </div>
        <div className="num">
          <span ref={numRef}>0</span>%
        </div>
        <p>esquentando o óleo…</p>
      </div>
    </div>
  );
}

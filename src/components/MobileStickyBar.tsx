import { useEffect, useState } from "react";
import { scrollToId } from "@/lib/utils";

export default function MobileStickyBar() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    function onScroll() {
      const cardapio = document.getElementById("cardapio");
      const passouHeroi = window.scrollY > window.innerHeight * 0.8;
      const dentroCardapio = cardapio
        ? cardapio.getBoundingClientRect().top < window.innerHeight * 0.7 &&
          cardapio.getBoundingClientRect().bottom > 0
        : false;
      const pertoDoFim = window.scrollY > document.documentElement.scrollHeight - window.innerHeight * 1.3;
      setVisivel(passouHeroi && !dentroCardapio && !pertoDoFim);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`fixo${visivel ? " ve" : ""}`}>
      <a
        className="btn vermelho"
        href="#cardapio"
        onClick={(e) => {
          e.preventDefault();
          scrollToId("cardapio");
        }}
      >
        Ver cardápio <span className="seta">➜</span>
      </a>
    </div>
  );
}

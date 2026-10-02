import { useEffect } from "react";
import { useStoreData } from "@/hooks/useStoreData";
import { useFavorites } from "@/hooks/useFavorites";
import Hero from "@/components/Hero";
import MarqueeBands from "@/components/MarqueeBands";
import StackedWords from "@/components/StackedWords";
import Badges from "@/components/Badges";
import TakeAway from "@/components/TakeAway";
import Layers from "@/components/Layers";
import Menu from "@/components/Menu";
import HowToOrder from "@/components/HowToOrder";
import LocationMap from "@/components/LocationMap";
import FinalCta from "@/components/FinalCta";

export default function Home() {
  const { carregando, erro, categorias, produtos, loja } = useStoreData();
  const { favoritos, alternar } = useFavorites();

  useEffect(() => {
    if (window.location.hash === "#cardapio") {
      setTimeout(() => document.getElementById("cardapio")?.scrollIntoView({ behavior: "smooth" }), 300);
    }
  }, []);

  return (
    <main>
      <Hero produtos={produtos} ifoodUrl={loja?.ifood_url ?? null} />
      <MarqueeBands notaIfood={loja?.nota_ifood ?? null} seloIfood={loja?.selo_ifood ?? null} />
      <StackedWords />
      <Badges loja={loja} totalProdutos={produtos.length} />
      <TakeAway />
      <Layers />
      <Menu
        categorias={categorias}
        produtos={produtos}
        ifoodUrl={loja?.ifood_url ?? null}
        favoritos={favoritos}
        onAlternarFavorito={alternar}
        erro={erro}
        carregando={carregando}
      />
      <HowToOrder />
      <LocationMap loja={loja} />
      <FinalCta />
    </main>
  );
}

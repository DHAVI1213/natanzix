const F1 = ["crocante por fora", "macio por dentro", "no pote", "molhos da casa", "Formosa-GO"];
const F2 = ["super restaurante", "feito na hora", "peito · croquinho · burger", "pede pelo iFood"];

function Trilho({ palavras, reverso }: { palavras: string[]; reverso?: boolean }) {
  const dobrado = [...palavras, ...palavras];
  return (
    <div className="trilho" style={reverso ? { animationDirection: "reverse", animationDuration: "32s" } : undefined}>
      {dobrado.map((t, i) => (
        <span key={i}>{t}</span>
      ))}
    </div>
  );
}

export default function MarqueeBands({ notaIfood, seloIfood }: { notaIfood: number | null; seloIfood: string | null }) {
  const faixa2 = [notaIfood ? `${notaIfood.toString().replace(".", ",")} no iFood` : "avaliado no iFood", seloIfood || "", ...F2].filter(Boolean);
  return (
    <div className="faixas" aria-hidden="true">
      <div className="faixa um">
        <Trilho palavras={F1} />
      </div>
      <div className="faixa dois">
        <Trilho palavras={faixa2} reverso />
      </div>
    </div>
  );
}

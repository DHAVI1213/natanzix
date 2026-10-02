const ESTRELA_PATH =
  "M20 1 C 22 14 26 18 39 20 C 26 22 22 26 20 39 C 18 26 14 22 1 20 C 14 18 18 14 20 1 Z";

export default function Estrelas({ posicoes }: { posicoes: Array<[string, string, number?]> }) {
  return (
    <>
      {posicoes.map(([left, top, scale], i) => (
        <svg
          key={i}
          className="estrela decor"
          viewBox="0 0 40 40"
          aria-hidden="true"
          style={{
            left,
            top,
            transform: `scale(${scale || 1})`,
            animation: `giraEstrela ${3 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
          }}
        >
          <path d={ESTRELA_PATH} />
        </svg>
      ))}
    </>
  );
}

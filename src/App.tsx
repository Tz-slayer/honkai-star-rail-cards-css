import React, { useState, useEffect } from "react";
import Search from "./Search";
import CardGrid from "./CardGrid";
import CardProxy from "./lib/components/CardProxy";
import Header from "./lib/components/Header/Header";
import LeftDrawer from "./lib/components/LeftDrawer/LeftDrawer";
import CardSmall from "./lib/components/Utils/CardSmall";

interface PokemonCard {
  id: string;
  name: string;
  number: string;
  set: string;
  types?: string[];
  supertype?: string;
  subtypes?: string[];
  rarity?: string;
  images?: { large: string };
  isReverse?: boolean;
}

function App() {
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/data/cards.json")
      .then((r) => r.json())
      .then((data: PokemonCard[]) => {
        setCards(data);
        setIsLoading(false);
      });

    // Anchor scroll on load
    const headings = document.querySelectorAll("h1,h2,h3");
    const anchor = [...headings].find((el) => {
      const id = el.getAttribute("id")?.replace(/^.*?-/, "");
      const hash = window.location.hash?.replace(/^.*?-/, "");
      return id === hash;
    });
    if (anchor) {
      setTimeout(() => anchor.scrollIntoView(), 100);
    }
  }, []);

  // ── card groups ──────────────────────────────────────────────────────────
  const showcase = cards[0];
  const basics = cards.slice(1, 4);
  const reverse = [...cards.slice(4, 7), ...cards.slice(70, 76)];
  const holos = cards.slice(7, 13);
  const cosmos = cards.slice(13, 16);
  const amazings = cards.slice(76, 85);
  const radiant = cards.slice(16, 19);
  const basicGallery = cards.slice(19, 22);
  const vee = cards.slice(22, 25);
  const veeUltra = cards.slice(25, 28);
  const veeAlt = cards.slice(28, 34);
  const veeMax = cards.slice(37, 40);
  const veeMaxAlt = cards.slice(40, 43);
  const veeStar = cards.slice(43, 46);
  const trainerHolo = cards.slice(46, 52);
  const rainbow = cards.slice(52, 58);
  const gold = cards.slice(58, 64);
  const veeGallery = cards.slice(64, 70);
  const shinyVault = cards.slice(85, 91);

  // ── helper to render a card group ────────────────────────────────────────
  const renderGroup = (
    group: PokemonCard[],
    extraProps?: Partial<PokemonCard>,
  ) =>
    isLoading ? (
      <p>loading...</p>
    ) : (
      group.map((card) => (
        <CardProxy
          key={card.id}
          id={card.id}
          name={card.name}
          number={card.number}
          set={card.set}
          types={card.types}
          supertype={card.supertype}
          subtypes={card.subtypes}
          rarity={card.rarity}
          {...extraProps}
        />
      ))
    );

  return (
    <>
      <Header />

      <main>
        <LeftDrawer />

        <section>
          <div className="showcase">
            {!showcase ? (
              <p>loading...</p>
            ) : (
              <CardProxy
                id={showcase.id}
                name={showcase.name}
                set={showcase.set}
                number={showcase.number}
                types={showcase.types}
                supertype={showcase.supertype}
                subtypes={showcase.subtypes}
                rarity={showcase.rarity}
                showcase={true}
              />
            )}
          </div>
        </section>
      </main>

      <div className="back-to-top">
        <a href="#⚓-top">Back to Top</a>
      </div>
    </>
  );
}

export default App;

import Header from './components/Header';
export default function Home() {
  return (
    <main className="flex flex-col">
      <Header />      {/* La pièce qui tourne */}
      {/* <Tracklist />  */}  {/* Choix du son + modif couleurs */}
      {/* <Generator />   */} {/* Le canvas Warhol */}
      {/* <Gallery /> */}     {/* Les deux lignes de covers */}
    </main>
  );
}
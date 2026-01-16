import Tracklist from './components/Tracklist';
import Header from './components/Header';   
import CanvaCover from './components/CanvaCover';

export default function Home() {
  return (
    <main className="flex flex-col">
      <Header />
      <Tracklist />  
      <CanvaCover />
    </main>
  );
}

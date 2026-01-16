import Tracklist from './components/Tracklist';
import CanvaCover from './components/CanvaCover';
import Header from './components/Header';
import Footer from './components/Footer';

export default function Home() {
  return (
    <main className="flex flex-col">
      <Header />
      <Tracklist />  
      <CanvaCover />
      <Footer />
    </main>
  );
} 

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Search, Play, X, Globe, Star, Home, Plus, Tv, Film, Monitor, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const API_KEY = '86d102f2c842b9a2af4db55b99fdb9f5';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';

const translations = {
  en: {
    home: 'HOME',
    search: 'SEARCH',
    watchlist: 'WATCHLIST',
    originals: 'ORIGINALS',
    movies: 'MOVIES',
    series: 'SERIES',
    myList: 'MY LIST',
    trending: 'Trending Now',
    newReleases: 'New Releases',
    continueWatching: 'Continue Watching',
    netflix: 'Netflix Originals',
    disney: 'Disney+',
    pixar: 'Pixar',
    marvel: 'Marvel',
    starwars: 'Star Wars',
    natgeo: 'National Geographic',
    action: 'Action & Adventure',
    comedy: 'Comedy',
    horror: 'Horror',
    watchNow: 'WATCH NOW',
    trailer: 'TRAILER',
    results: 'Search Results',
    noResults: 'No results found',
    dir: 'ltr',
    lang: 'العربية',
  },
  ar: {
    home: 'الرئيسية',
    search: 'بحث',
    watchlist: 'قائمتي',
    originals: 'أصلي',
    movies: 'أفلام',
    series: 'مسلسلات',
    myList: 'قائمتي',
    trending: 'الأكثر رواجاً',
    newReleases: 'إصدارات جديدة',
    continueWatching: 'متابعة المشاهدة',
    netflix: 'نتفليكس',
    disney: 'ديزني+',
    pixar: 'بيكسار',
    marvel: 'مارفل',
    starwars: 'حرب النجوم',
    natgeo: 'ناشيونال جيوغرافيك',
    action: 'أكشن ومغامرة',
    comedy: 'كوميديا',
    horror: 'رعب',
    watchNow: 'شاهد الآن',
    trailer: 'عرض دعائي',
    results: 'نتائج البحث',
    noResults: 'لا توجد نتائج',
    dir: 'rtl',
    lang: 'English',
  }
};

interface Movie {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  genres?: { name: string }[];
}

export default function App() {
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [trending, setTrending] = useState<Movie[]>([]);
  const [netflix, setNetflix] = useState<Movie[]>([]);
  const [disney, setDisney] = useState<Movie[]>([]);
  const [pixar, setPixar] = useState<Movie[]>([]);
  const [marvel, setMarvel] = useState<Movie[]>([]);
  const [starwars, setStarwars] = useState<Movie[]>([]);
  const [natgeo, setNatgeo] = useState<Movie[]>([]);
  const [action, setAction] = useState<Movie[]>([]);
  const [comedy, setComedy] = useState<Movie[]>([]);
  const [horror, setHorror] = useState<Movie[]>([]);
  const [series, setSeries] = useState<Movie[]>([]);
  const [animation, setAnimation] = useState<Movie[]>([]);
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [heroIndex, setHeroIndex] = useState(0);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<{ title: string, movies: Movie[] } | null>(null);

  const t = translations[lang];

  const uniqueMovies = (movies: Movie[]) => {
    const seen = new Set();
    return movies.filter(m => {
      const duplicate = seen.has(m.id);
      seen.add(m.id);
      return !duplicate;
    });
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [lang]);

  useEffect(() => {
    const saved = localStorage.getItem('watchlist');
    if (saved) setWatchlist(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const toggleWatchlist = (movie: Movie) => {
    setWatchlist(prev => 
      prev.find(m => m.id === movie.id) 
        ? prev.filter(m => m.id !== movie.id)
        : [...prev, movie]
    );
  };

  const fetchTrailer = async (id: number, type: 'movie' | 'tv') => {
    try {
      const res = await fetch(`${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}`);
      const data = await res.json();
      const trailer = data.results.find((v: any) => v.type === 'Trailer');
      if (trailer) setTrailerKey(trailer.key);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (trending.length > 0 && !selectedMovie && !selectedBrand) {
      const interval = setInterval(() => {
        setHeroIndex((prev) => (prev + 1) % 5);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [trending, selectedMovie, selectedBrand]);

  const fetchMovies = async () => {
    const language = lang === 'en' ? 'en-US' : 'ar-SA';
    const fetchCat = async (endpoint: string, pages = 1) => {
      let res: Movie[] = [];
      for(let i=1; i<=pages; i++) {
        try {
          const r = await fetch(`${BASE_URL}${endpoint}&api_key=${API_KEY}&language=${language}&page=${i}`);
          const d = await r.json();
          if(d.results) res = [...res, ...d.results];
        } catch (e) { console.error(e); }
      }
      return res;
    };

    const [tr, nf, ds, px, mv, sw, ng, ac, cm, hr, sr, an] = await Promise.all([
      fetchCat('/trending/all/week?'),
      fetchCat('/discover/tv?with_networks=213', 10),
      fetchCat('/discover/movie?with_companies=2', 10),
      fetchCat('/discover/movie?with_companies=3', 5),
      fetchCat('/discover/movie?with_companies=420', 5),
      fetchCat('/discover/movie?with_companies=1', 5),
      fetchCat('/discover/movie?with_companies=7521', 5),
      fetchCat('/discover/movie?with_genres=28', 5),
      fetchCat('/discover/movie?with_genres=35', 5),
      fetchCat('/discover/movie?with_genres=27', 5),
      fetchCat('/discover/tv?sort_by=popularity.desc', 5),
      fetchCat('/discover/movie?with_genres=16', 5),
    ]);

    setTrending(uniqueMovies(tr));
    setNetflix(uniqueMovies(nf));
    setDisney(uniqueMovies(ds));
    setPixar(uniqueMovies(px));
    setMarvel(uniqueMovies(mv));
    setStarwars(uniqueMovies(sw));
    setNatgeo(uniqueMovies(ng));
    setAction(uniqueMovies(ac));
    setComedy(uniqueMovies(cm));
    setHorror(uniqueMovies(hr));
    setSeries(uniqueMovies(sr));
    setAnimation(uniqueMovies(an));
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length > 2) {
      const language = lang === 'en' ? 'en-US' : 'ar-SA';
      const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${q}&language=${language}`);
      const data = await res.json();
      setSearchResults(uniqueMovies(data.results.filter((m: any) => m.backdrop_path || m.poster_path)));
    } else setSearchResults([]);
  };

  const BrandTile = ({ id, img, video, title }: { id: string, img: string, video: string, title: string }) => (
    <div 
      onClick={() => setSelectedBrand(id)}
      className="brand-tile relative rounded-xl overflow-hidden cursor-pointer group aspect-video flex items-center justify-center bg-[#1a1d29]"
    >
      <img src={img} alt={title} className="w-full h-full object-contain z-10 p-4 transition-transform duration-300 group-hover:scale-110" />
      <video 
        autoPlay loop muted playsInline 
        className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      >
        <source src={video} type="video/mp4" />
      </video>
    </div>
  );

  const MovieRow = ({ title, movies }: { title: string, movies: Movie[] }) => {
    const rowRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
      if (rowRef.current) {
        const { scrollLeft, clientWidth } = rowRef.current;
        const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
        rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
      }
    };

    if (movies.length === 0) return null;

    return (
      <div className="mb-16 px-4 md:px-12 group/row relative">
        <div className="flex items-end justify-between mb-6 px-1">
          <h2 className="text-2xl font-display font-bold text-white/90 tracking-tight">{title}</h2>
          <button 
            onClick={() => setSelectedCategory({ title, movies })}
            className="text-[11px] font-black tracking-[2px] uppercase text-white/40 hover:text-white transition-all cursor-pointer"
          >
            {lang === 'en' ? 'View All' : 'عرض الكل'}
          </button>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-30 w-16 bg-gradient-to-r from-[#040714] to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-start pl-2"
          >
            <ChevronLeft size={40} className="text-white hover:scale-125 transition-transform" />
          </button>
          
          <div 
            ref={rowRef}
            className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-8 pt-2 px-1"
          >
            {movies.map((m, idx) => (
              <motion.div
                key={m.id}
                whileHover={{ scale: 1.05, y: -5 }}
                onClick={() => setSelectedMovie(m)}
                className="disney-card flex-none w-40 md:w-64 rounded-xl overflow-hidden bg-[#1a1d29] group/card shadow-lg"
              >
                <div className="relative aspect-[2/3] overflow-hidden">
                  <img 
                    src={`${IMG_URL}${m.poster_path}`} 
                    alt={m.title || m.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3 z-10">
                    <span className="glass px-2 py-1 rounded text-[10px] font-black tracking-tighter uppercase">HD</span>
                  </div>
                  
                  {/* Progress Bar for Continue Watching */}
                  {title === t.continueWatching && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-20">
                      <div 
                        className="h-full bg-gradient-to-r from-[#00d2ff] to-[#3a1c71]" 
                        style={{ width: `${Math.floor(Math.random() * 60) + 20}%` }}
                      />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-all duration-500 flex flex-col items-center justify-end p-4">
                    <div className="w-12 h-12 rounded-full glass flex items-center justify-center mb-4 transform translate-y-4 group-hover/card:translate-y-0 transition-transform duration-500 shadow-2xl">
                      <Play size={24} fill="white" className="ml-1" />
                    </div>
                    <div className="text-center transform translate-y-4 group-hover/card:translate-y-0 transition-transform duration-500 delay-75">
                      <p className="text-xs font-black uppercase tracking-widest mb-1">{m.title || m.name}</p>
                      <div className="flex items-center justify-center gap-2 text-[10px] text-white/60 font-bold">
                        <span>{m.release_date?.split('-')[0] || m.first_air_date?.split('-')[0]}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Star size={10} fill="currentColor" /> {m.vote_average.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-30 w-16 bg-gradient-to-l from-[#040714] to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-end pr-2"
          >
            <ChevronRight size={40} className="text-white hover:scale-125 transition-transform" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#040714] text-[#f9f9f9]" dir={t.dir}>
      {/* Disney+ Navbar */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 px-4 md:px-12 py-4 flex items-center justify-between ${isScrolled ? 'glass py-3' : 'bg-transparent'}`}>
        <div className="flex items-center gap-10">
          <div className="cursor-pointer group" onClick={() => { setSelectedBrand(null); setSelectedCategory(null); setSearchQuery(''); }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg" alt="Disney+" className="h-10 md:h-12 transition-transform duration-300 group-hover:scale-105" />
          </div>
          <div className="hidden lg:flex items-center gap-8">
            {[
              { id: 'home', icon: Home, label: t.home, action: () => { setSelectedBrand(null); setSelectedCategory(null); setSearchQuery(''); } },
              { id: 'movies', icon: Film, label: t.movies, action: () => setSelectedCategory({ title: t.movies, movies: uniqueMovies([...disney, ...action, ...comedy, ...horror]) }) },
              { id: 'series', icon: Tv, label: t.series, action: () => setSelectedCategory({ title: t.series, movies: uniqueMovies([...netflix, ...series]) }) },
              { id: 'watchlist', icon: Plus, label: t.myList, action: () => setSelectedCategory({ title: t.myList, movies: watchlist }) },
              { id: 'originals', icon: Star, label: t.originals, action: () => setSelectedCategory({ title: t.originals, movies: uniqueMovies(netflix) }) },
            ].map((item) => (
              <button 
                key={item.id}
                onClick={item.action}
                className="flex items-center gap-3 text-[13px] font-bold tracking-[1.5px] uppercase relative group py-2"
              >
                <item.icon size={18} className="text-white/70 group-hover:text-white transition-colors" />
                <span className="relative">
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full" />
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white transition-colors" size={18} />
            <input 
              type="text" 
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-white/5 border border-white/10 focus:border-white/30 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none w-40 md:w-64 transition-all placeholder:text-white/20 focus:bg-white/10"
            />
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} 
              className="glass-hover px-4 py-2 rounded-xl text-[11px] font-black tracking-widest transition-all uppercase border border-white/10"
            >
              {t.lang}
            </button>
            <div className="relative group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d2ff] to-[#3a1c71] border border-white/20 flex items-center justify-center overflow-hidden shadow-lg transition-transform group-hover:scale-110">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full object-cover" />
              </div>
              <div className="absolute top-full right-0 mt-2 w-48 glass rounded-2xl p-4 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all z-50">
                <p className="text-xs font-bold mb-2">Premium Member</p>
                <div className="h-[1px] bg-white/10 my-2" />
                <button className="text-[10px] font-black uppercase tracking-widest hover:text-[#00d2ff] transition-colors">Settings</button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-20">
        {searchQuery ? (
          <div className="px-4 md:px-12 animate-fade-in">
            <h2 className="text-2xl font-display font-bold mb-10 text-white/90 tracking-tight">{t.results}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {searchResults.map((m) => (
                <motion.div
                  key={m.id}
                  whileHover={{ scale: 1.05, y: -10 }}
                  onClick={() => setSelectedMovie(m)}
                  className="disney-card cursor-pointer rounded-xl overflow-hidden bg-[#1a1d29] group shadow-xl"
                >
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <img src={`${IMG_URL}${m.poster_path}`} alt={m.title || m.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-end p-4">
                      <div className="w-12 h-12 rounded-full glass flex items-center justify-center mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-2xl">
                        <Play size={24} fill="white" className="ml-1" />
                      </div>
                      <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                        <p className="text-xs font-black uppercase tracking-widest mb-1">{m.title || m.name}</p>
                        <div className="flex items-center justify-center gap-2 text-[10px] text-white/60 font-bold">
                          <span>{m.release_date?.split('-')[0] || m.first_air_date?.split('-')[0]}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Star size={10} fill="currentColor" /> {m.vote_average.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : selectedCategory ? (
          <div className="px-4 md:px-12 animate-fade-in">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-display font-bold text-white tracking-tight">{selectedCategory.title}</h2>
              <button 
                onClick={() => setSelectedCategory(null)}
                className="glass-hover px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase border border-white/10 transition-all"
              >
                {lang === 'en' ? 'Back to Home' : 'العودة للرئيسية'}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {selectedCategory.movies.map((movie) => (
                <motion.div
                  key={movie.id}
                  whileHover={{ scale: 1.05, y: -10 }}
                  onClick={() => setSelectedMovie(movie)}
                  className="disney-card cursor-pointer rounded-xl overflow-hidden bg-[#1a1d29] group shadow-2xl"
                >
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <img 
                      src={`${IMG_URL}${movie.poster_path}`} 
                      alt={movie.title || movie.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-end p-4">
                      <div className="w-12 h-12 rounded-full glass flex items-center justify-center mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-2xl">
                        <Play size={24} fill="white" className="ml-1" />
                      </div>
                      <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                        <p className="text-xs font-black uppercase tracking-widest mb-1">{movie.title || movie.name}</p>
                        <div className="flex items-center justify-center gap-2 text-[10px] text-white/60 font-bold">
                          <span>{movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0]}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Star size={10} fill="currentColor" /> {movie.vote_average.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : selectedBrand ? (
          <div className="px-4 md:px-12 animate-fade-in">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl md:text-5xl font-display font-black text-white uppercase tracking-widest">{selectedBrand}</h2>
              <button 
                onClick={() => setSelectedBrand(null)}
                className="glass-hover p-3 rounded-full text-white transition-all border border-white/10"
              >
                <X size={32} />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {(() => {
                let moviesToDisplay = [];
                switch(selectedBrand) {
                  case 'Netflix': moviesToDisplay = netflix; break;
                  case 'Disney': moviesToDisplay = disney; break;
                  case 'Pixar': moviesToDisplay = pixar; break;
                  case 'Marvel': moviesToDisplay = marvel; break;
                  case 'Star Wars': moviesToDisplay = starwars; break;
                  case 'Nat Geo': moviesToDisplay = natgeo; break;
                  default: moviesToDisplay = disney;
                }
                return moviesToDisplay.map((m) => (
                  <motion.div
                    key={m.id}
                    whileHover={{ scale: 1.05, y: -10 }}
                    onClick={() => setSelectedMovie(m)}
                    className="disney-card cursor-pointer rounded-xl overflow-hidden bg-[#1a1d29] group shadow-2xl"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden">
                      <img src={`${IMG_URL}${m.poster_path}`} alt={m.title || m.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-end p-4">
                        <div className="w-12 h-12 rounded-full glass flex items-center justify-center mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-2xl">
                          <Play size={24} fill="white" className="ml-1" />
                        </div>
                        <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                          <p className="text-xs font-black uppercase tracking-widest mb-1">{m.title || m.name}</p>
                          <div className="flex items-center justify-center gap-2 text-[10px] text-white/60 font-bold">
                            <span>{m.release_date?.split('-')[0] || m.first_air_date?.split('-')[0]}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Star size={10} fill="currentColor" /> {m.vote_average.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ));
              })()}
            </div>
          </div>
        ) : (
          <>
            {/* Hero Slider */}
            {trending.length > 0 && (
              <div className="relative h-[85vh] w-full mb-16 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={trending[heroIndex].id}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => setSelectedMovie(trending[heroIndex])}
                  >
                    <img 
                      src={`${IMG_URL}${trending[heroIndex].backdrop_path}`} 
                      alt={trending[heroIndex].title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 hero-overlay" />
                    
                    <div className="absolute bottom-0 left-0 w-full p-8 md:p-20 z-10">
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="max-w-3xl"
                      >
                        <h1 className="text-6xl md:text-8xl font-display font-black mb-6 leading-none tracking-tighter drop-shadow-2xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                          {trending[heroIndex].title || trending[heroIndex].name}
                        </h1>
                        <p className="text-lg md:text-xl text-white/70 mb-10 line-clamp-3 max-w-2xl font-light leading-relaxed drop-shadow-lg backdrop-blur-sm bg-black/10 p-4 rounded-xl">
                          {trending[heroIndex].overview}
                        </p>
                        <div className="flex items-center gap-5">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedMovie(trending[heroIndex]); }}
                            className="flex items-center gap-3 bg-gradient-to-r from-[#00d2ff] to-[#3a1c71] text-white px-12 py-5 rounded-2xl font-black text-sm tracking-widest uppercase hover:scale-105 transition-all shadow-[0_0_30px_rgba(0,210,255,0.4)]"
                          >
                            <Play size={22} fill="white" /> {t.play}
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleWatchlist(trending[heroIndex]); }}
                            className="flex items-center gap-3 glass px-12 py-5 rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-white/10 transition-all hover:scale-105 border border-white/20"
                          >
                            <Plus size={22} /> {t.myList}
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Hero Navigation Dots */}
                <div className="absolute bottom-10 right-10 flex gap-3 z-20">
                  {trending.slice(0, 5).map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setHeroIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-500 ${heroIndex === idx ? 'w-10 bg-white' : 'w-3 bg-white/30 hover:bg-white/50'}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Brand Viewers */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 px-4 md:px-12 mb-20 animate-fade-in">
              <BrandTile id="Disney" img="https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg" video="https://raw.githubusercontent.com/clem961/disney-plus-clone/master/public/videos/1564674844-disney.mp4" title="Disney" />
              <BrandTile id="Pixar" img="https://upload.wikimedia.org/wikipedia/commons/0/03/Pixar_Logo.svg" video="https://raw.githubusercontent.com/clem961/disney-plus-clone/master/public/videos/1564676714-pixar.mp4" title="Pixar" />
              <BrandTile id="Marvel" img="https://upload.wikimedia.org/wikipedia/commons/b/b9/Marvel_Logo.svg" video="https://raw.githubusercontent.com/clem961/disney-plus-clone/master/public/videos/1564676115-marvel.mp4" title="Marvel" />
              <BrandTile id="Star Wars" img="https://upload.wikimedia.org/wikipedia/commons/6/6c/Star_Wars_Logo.svg" video="https://raw.githubusercontent.com/clem961/disney-plus-clone/master/public/videos/1608229455-star-wars.mp4" title="Star Wars" />
              <BrandTile id="Nat Geo" img="https://upload.wikimedia.org/wikipedia/commons/6/6a/National_Geographic_logo.svg" video="https://raw.githubusercontent.com/clem961/disney-plus-clone/master/public/videos/1564676296-national-geographic.mp4" title="National Geographic" />
              <BrandTile id="Netflix" img="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" video="https://raw.githubusercontent.com/clem961/disney-plus-clone/master/public/videos/1564676115-marvel.mp4" title="Netflix" />
            </div>

            {/* Rows */}
            <MovieRow title={t.continueWatching} movies={trending.slice(5, 10)} />
            <MovieRow title={t.trending} movies={trending} />
            <MovieRow title={t.newReleases} movies={uniqueMovies([...action, ...comedy]).slice(0, 15)} />
            <MovieRow title={t.netflix} movies={netflix} />
            <MovieRow title={t.disney} movies={disney} />
            <MovieRow title={lang === 'en' ? 'Popular Series' : 'مسلسلات مشهورة'} movies={series} />
            <MovieRow title={lang === 'en' ? 'Animation' : 'رسوم متحركة'} movies={animation} />
            <MovieRow title={t.action} movies={action} />
            <MovieRow title={t.comedy} movies={comedy} />
            <MovieRow title={t.horror} movies={horror} />
          </>
        )}
      </main>

      {/* Movie Details Modal */}
      <AnimatePresence>
        {selectedMovie && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-10"
          >
            <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setSelectedMovie(null)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-6xl glass rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10"
            >
              <button 
                onClick={() => setSelectedMovie(null)}
                className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full glass flex items-center justify-center hover:scale-110 transition-transform border border-white/20"
              >
                <X size={24} />
              </button>

              <div className="flex flex-col lg:flex-row">
                <div className="relative w-full lg:w-2/3 aspect-video">
                  <img 
                    src={`${IMG_URL}${selectedMovie.backdrop_path || selectedMovie.poster_path}`} 
                    alt={selectedMovie.title || selectedMovie.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#040714] via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#040714] via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center group">
                    <button 
                      onClick={() => setIsPlayerOpen(true)}
                      className="w-24 h-24 rounded-full glass flex items-center justify-center hover:scale-110 transition-all duration-500 border border-white/30 group-hover:bg-white/10 shadow-2xl"
                    >
                      <Play size={40} fill="white" className="ml-2" />
                    </button>
                  </div>
                </div>

                <div className="w-full lg:w-1/3 p-8 md:p-12 flex flex-col justify-center bg-[#040714]/40 backdrop-blur-xl">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h2 className="text-4xl font-display font-black mb-6 leading-tight tracking-tight text-white">
                      {selectedMovie.title || selectedMovie.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 mb-8 text-sm font-bold text-white/60">
                      <span className="text-yellow-500 flex items-center gap-1">
                        ★ {selectedMovie.vote_average?.toFixed(1)}
                      </span>
                      <span>{selectedMovie.release_date?.split('-')[0] || selectedMovie.first_air_date?.split('-')[0]}</span>
                      <span className="glass px-2 py-0.5 rounded text-[10px] border border-white/10 uppercase tracking-widest">4K Ultra HD</span>
                    </div>
                    <p className="text-base text-white/70 mb-10 leading-relaxed font-light line-clamp-6">
                      {selectedMovie.overview}
                    </p>
                    <div className="flex flex-col gap-4">
                      <button 
                        onClick={() => setIsPlayerOpen(true)}
                        className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-xl font-black text-sm tracking-widest uppercase hover:bg-white/90 transition-all hover:scale-[1.02] shadow-xl"
                      >
                        <Play size={20} fill="black" /> {t.play}
                      </button>
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => fetchTrailer(selectedMovie.id, selectedMovie.title ? 'movie' : 'tv')}
                          className="flex items-center justify-center gap-2 glass py-4 rounded-xl font-black text-[11px] tracking-widest uppercase hover:bg-white/10 transition-all border border-white/10"
                        >
                          {lang === 'en' ? 'Trailer' : 'تريلر'}
                        </button>
                        <button 
                          onClick={() => toggleWatchlist(selectedMovie)}
                          className={`flex items-center justify-center gap-2 py-4 rounded-xl font-black text-[11px] tracking-widest uppercase transition-all border ${watchlist.some(m => m.id === selectedMovie.id) ? 'bg-white/20 border-white/40' : 'glass border-white/10 hover:bg-white/10'}`}
                        >
                          {watchlist.some(m => m.id === selectedMovie.id) ? <Check size={18} /> : <Plus size={18} />}
                          {t.watchlist}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player Modal */}
      <AnimatePresence>
        {isPlayerOpen && selectedMovie && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-[500] bg-black flex flex-col"
          >
            {/* Player Header */}
            <div className="absolute top-0 left-0 w-full p-8 flex items-center justify-between z-[510] bg-gradient-to-b from-black/90 to-transparent pointer-events-none">
              <div className="flex items-center gap-6 pointer-events-auto">
                <button 
                  onClick={() => setIsPlayerOpen(false)}
                  className="w-12 h-12 rounded-full glass flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10"
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="flex flex-col">
                  <h2 className="text-2xl font-display font-bold tracking-tight text-white">{selectedMovie.title || selectedMovie.name}</h2>
                  <span className="text-[10px] font-black tracking-[2px] uppercase text-white/50">Streaming Now • 4K HDR</span>
                </div>
              </div>
              
              <div className="flex items-center gap-8 pointer-events-auto">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1">Quality</span>
                  <select className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer hover:text-white transition-colors text-white">
                    <option className="bg-[#040714]">Auto (4K)</option>
                    <option className="bg-[#040714]">1080p HD</option>
                    <option className="bg-[#040714]">720p</option>
                  </select>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1">Audio</span>
                  <select className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer hover:text-white transition-colors text-white">
                    <option className="bg-[#040714]">English (5.1)</option>
                    <option className="bg-[#040714]">Arabic (Dub)</option>
                  </select>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1">Subtitles</span>
                  <select className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer hover:text-white transition-colors text-white">
                    <option className="bg-[#040714]">English</option>
                    <option className="bg-[#040714]">Arabic</option>
                    <option className="bg-[#040714]">Off</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex-1 relative bg-black">
              <iframe 
                src={`https://vidsrc.me/embed/${selectedMovie.title ? 'movie' : 'tv'}?tmdb=${selectedMovie.id}`}
                className="w-full h-full border-none"
                allowFullScreen
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trailer Modal */}
      <AnimatePresence>
        {trailerKey && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] bg-black/95 flex items-center justify-center p-4 backdrop-blur-2xl"
          >
            <div className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              <button 
                onClick={() => setTrailerKey(null)}
                className="absolute top-6 right-6 z-10 glass-hover p-3 rounded-full text-white border border-white/10"
              >
                <X size={24} />
              </button>
              <iframe 
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                className="w-full h-full border-none"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Search, Play, X, Globe, Star, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const API_KEY = '86d102f2c842b9a2af4db55b99fdb9f5';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';

const translations = {
  en: {
    home: 'Home',
    movies: 'Movies',
    series: 'Series',
    search: 'Search movies...',
    trending: 'Trending Now',
    netflix: 'Netflix Originals',
    disney: 'Disney+ & Animation',
    watchNow: 'Watch Now',
    moreInfo: 'More Info',
    results: 'Search Results',
    noResults: 'No results found',
    dir: 'ltr',
    lang: 'العربية',
  },
  ar: {
    home: 'الرئيسية',
    movies: 'أفلام',
    series: 'مسلسلات',
    search: 'ابحث عن أفلام...',
    trending: 'الأكثر رواجاً',
    netflix: 'إنتاجات نتفليكس الأصلية',
    disney: 'ديزني والأنيميشن',
    watchNow: 'شاهد الآن',
    moreInfo: 'المزيد من المعلومات',
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
}

export default function App() {
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [trending, setTrending] = useState<Movie[]>([]);
  const [netflix, setNetflix] = useState<Movie[]>([]);
  const [disney, setDisney] = useState<Movie[]>([]);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [lang]);

  const fetchMovies = async () => {
    const language = lang === 'en' ? 'en-US' : 'ar-SA';
    
    // Trending
    const trendingRes = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=${language}`);
    const trendingData = await trendingRes.json();
    setTrending(trendingData.results);
    setHeroMovie(trendingData.results[0]);

    // Netflix (using network 213 for TV, but user asked for content)
    const netflixRes = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_networks=213&language=${language}`);
    const netflixData = await netflixRes.json();
    setNetflix(netflixData.results);

    // Disney+ (using company 2 or genre 16)
    const disneyRes = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_companies=2&language=${language}`);
    const disneyData = await disneyRes.json();
    setDisney(disneyData.results);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      const language = lang === 'en' ? 'en-US' : 'ar-SA';
      const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}&language=${language}`);
      const data = await res.json();
      setSearchResults(data.results);
    } else {
      setSearchResults([]);
    }
  };

  const openModal = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const MovieRow = ({ title, movies }: { title: string, movies: Movie[] }) => {
    const rowRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
      if (rowRef.current) {
        const { scrollLeft, clientWidth } = rowRef.current;
        const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
        rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
      }
    };

    return (
      <div className="mb-12 px-4 md:px-12 group relative">
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-white/90">{title}</h2>
        <div className="relative">
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-40 bg-black/40 hover:bg-black/60 px-2 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
          >
            <ChevronLeft className="text-white" size={40} />
          </button>
          <div 
            ref={rowRef}
            className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-4"
          >
            {movies.map((movie) => (
              <motion.div
                key={movie.id}
                whileHover={{ scale: 1.05 }}
                onClick={() => openModal(movie)}
                className="flex-none w-40 md:w-56 cursor-pointer rounded-lg overflow-hidden relative group/card"
              >
                <img 
                  src={`${IMG_URL}${movie.poster_path}`} 
                  alt={movie.title || movie.name}
                  className="w-full h-full object-cover rounded-lg shadow-lg"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/card:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <h3 className="text-sm font-bold text-white mb-1">{movie.title || movie.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-yellow-400">
                    <Star size={12} fill="currentColor" />
                    <span>{movie.vote_average.toFixed(1)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-40 bg-black/40 hover:bg-black/60 px-2 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
          >
            <ChevronRight className="text-white" size={40} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-500`} dir={t.dir}>
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 px-4 md:px-12 py-4 flex items-center justify-between ${isScrolled ? 'bg-black/90 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
        <div className="flex items-center gap-8">
          <h1 className="text-2xl md:text-3xl font-black text-accent tracking-tighter cursor-pointer">CINEVERSE</h1>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/70">
            <a href="#" className="hover:text-accent transition-colors">{t.home}</a>
            <a href="#" className="hover:text-accent transition-colors">{t.movies}</a>
            <a href="#" className="hover:text-accent transition-colors">{t.series}</a>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-accent transition-colors" size={18} />
            <input 
              type="text" 
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-white/10 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent w-32 md:w-64 transition-all"
            />
          </div>
          
          <button 
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-2 text-sm font-bold hover:text-accent transition-colors"
          >
            <Globe size={18} />
            <span className="hidden sm:inline">{t.lang}</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      {heroMovie && !searchQuery && (
        <div className="relative h-[80vh] md:h-screen w-full overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src={`${IMG_URL}${heroMovie.backdrop_path}`} 
              alt={heroMovie.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
          </div>

          <div className="absolute bottom-0 left-0 w-full p-4 md:p-12 md:pb-32 flex flex-col gap-4 md:gap-6 max-w-3xl">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-4xl md:text-7xl font-black text-white leading-tight"
            >
              {heroMovie.title || heroMovie.name}
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-sm md:text-lg text-white/80 line-clamp-3 md:line-clamp-4 max-w-2xl"
            >
              {heroMovie.overview}
            </motion.p>
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4 mt-4"
            >
              <button 
                onClick={() => openModal(heroMovie)}
                className="bg-accent text-black font-bold px-6 md:px-10 py-3 rounded-lg flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,210,255,0.4)]"
              >
                <Play size={20} fill="currentColor" />
                {t.watchNow}
              </button>
              <button className="bg-white/20 backdrop-blur-md text-white font-bold px-6 md:px-10 py-3 rounded-lg flex items-center gap-2 hover:bg-white/30 transition-colors">
                <Info size={20} />
                {t.moreInfo}
              </button>
            </motion.div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`relative z-10 ${searchQuery ? 'pt-32' : '-mt-20 md:-mt-32'}`}>
        {searchQuery ? (
          <div className="px-4 md:px-12">
            <h2 className="text-2xl font-bold mb-8 text-accent">{t.results}</h2>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {searchResults.map((movie) => (
                  <motion.div
                    key={movie.id}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => openModal(movie)}
                    className="cursor-pointer rounded-lg overflow-hidden bg-white/5 border border-white/10"
                  >
                    <img 
                      src={`${IMG_URL}${movie.poster_path}`} 
                      alt={movie.title}
                      className="w-full aspect-[2/3] object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="p-3">
                      <h3 className="text-sm font-bold truncate">{movie.title || movie.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-yellow-400 mt-1">
                        <Star size={12} fill="currentColor" />
                        <span>{movie.vote_average.toFixed(1)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-white/50">{t.noResults}</div>
            )}
          </div>
        ) : (
          <>
            <MovieRow title={t.trending} movies={trending} />
            <MovieRow title={t.netflix} movies={netflix} />
            <MovieRow title={t.disney} movies={disney} />
          </>
        )}
      </main>

      {/* Video Modal */}
      <AnimatePresence>
        {isModalOpen && selectedMovie && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-xl"
          >
            <div className="relative w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,210,255,0.2)] border border-white/10">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 z-[110] bg-black/50 hover:bg-black/80 p-2 rounded-full text-white transition-colors"
              >
                <X size={24} />
              </button>
              
              <iframe 
                src={`https://vidsrc.me/embed/movie?tmdb=${selectedMovie.id}`}
                className="w-full h-full border-none"
                allowFullScreen
                title="Movie Player"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-20 px-4 md:px-12 border-t border-white/10 mt-20 text-center">
        <h2 className="text-3xl font-black text-accent mb-4">CINEVERSE</h2>
        <p className="text-white/40 text-sm max-w-md mx-auto">
          Premium movie streaming experience powered by CineVerse. All rights reserved © 2026.
        </p>
      </footer>
    </div>
  );
}

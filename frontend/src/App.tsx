import { useEffect, useState, useCallback } from 'react';
import { api, MovieDetail, PaginatedMovies } from './services/api';
import { Search, Plus, Trash2, Star, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function App() {
  const [moviesData, setMoviesData] = useState<PaginatedMovies | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState<MovieDetail | null>(null);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSynopsis, setNewSynopsis] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newDuration, setNewDuration] = useState('');

  const [reviewerName, setReviewerName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const fetchMovies = useCallback(async () => {
    try {
      const response = await api.get<PaginatedMovies>('/movies/', {
        params: { page, limit: 8, search: search || undefined }
      });
      setMoviesData(response.data);
    } catch (err) {
      console.error('Erro ao buscar filmes:', err);
    }
  }, [page, search]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const handleOpenDetail = async (id: string) => {
    try {
      const response = await api.get<MovieDetail>(`/movies/${id}`);
      setSelectedMovie(response.data);
    } catch (err) {
      console.error('Erro ao carregar detalhes do filme:', err);
      alert('Erro ao carregar detalhes do filme.');
    }
  };

  const handleCreateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/movies/', {
        titulo: newTitle,
        sinopse: newSynopsis,
        data_lancamento: newDate || undefined,
        duracao_minutos: newDuration ? parseInt(newDuration) : undefined,
      });
      setIsCreateOpen(false);
      setNewTitle('');
      setNewSynopsis('');
      setNewDate('');
      setNewDuration('');
      fetchMovies();
    } catch (err) {
      console.error('Erro ao cadastrar filme:', err);
      alert('Erro ao cadastrar filme.');
    }
  };

  const handleDeleteMovie = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja remover este filme?')) {
      try {
        await api.delete(`/movies/${id}`);
        fetchMovies();
        if (selectedMovie?.sk_movie_id === id) setSelectedMovie(null);
      } catch (err) {
        console.error('Erro ao remover filme:', err);
        alert('Erro ao remover filme.');
      }
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMovie) return;
    try {
      await api.post(`/movies/${selectedMovie.sk_movie_id}/reviews`, {
        nome: reviewerName,
        nota: reviewRating,
        comentario: reviewComment
      });
      setReviewerName('');
      setReviewComment('');
      handleOpenDetail(selectedMovie.sk_movie_id);
    } catch (err) {
      console.error('Erro ao enviar avaliação:', err);
      alert('Erro ao enviar avaliação.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121214', color: '#E1E1E6', fontFamily: 'sans-serif', padding: '20px 40px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, borderBottom: '1px solid #29292E', paddingBottom: 20 }}>
        <h1 style={{ color: '#00B37E', margin: 0 }}>🚀 RocketLab Movies</h1>
        <button 
          onClick={() => setIsCreateOpen(true)}
          style={{ backgroundColor: '#00875F', color: '#FFF', border: 'none', padding: '10px 16px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 'bold' }}
        >
          <Plus size={18} /> Novo Filme
        </button>
      </header>

      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', backgroundColor: '#202024', borderRadius: 6, padding: '8px 16px', border: '1px solid #29292E' }}>
        <Search size={20} color="#7C7C8A" style={{ marginRight: 10 }} />
        <input 
          type="text" 
          placeholder="Buscar filme por título ou sinopse..." 
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ background: 'transparent', border: 'none', outline: 'none', color: '#FFF', width: '100%', fontSize: 16 }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
        {moviesData?.items.map((movie) => (
          <div 
            key={movie.sk_movie_id}
            onClick={() => handleOpenDetail(movie.sk_movie_id)}
            style={{ backgroundColor: '#202024', borderRadius: 8, overflow: 'hidden', border: '1px solid #29292E', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            {movie.url_poster ? (
              <img src={movie.url_poster} alt={movie.titulo} style={{ width: '100%', height: 260, objectFit: 'cover' }} />
            ) : (
              <div style={{ height: 260, backgroundColor: '#29292E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C7C8A' }}>Sem Poster</div>
            )}
            <div style={{ padding: 14 }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 16, color: '#FFF' }}>{movie.titulo}</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#7C7C8A' }}>Lançamento: {movie.data_lancamento || 'N/I'}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <span style={{ fontSize: 12, color: '#00B37E', display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={14}/> Detalhes</span>
                <button 
                  onClick={(e) => handleDeleteMovie(movie.sk_movie_id, e)}
                  style={{ background: 'transparent', border: 'none', color: '#F75A68', cursor: 'pointer' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {moviesData && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 30 }}>
          <button 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
            style={{ backgroundColor: '#29292E', color: '#FFF', border: 'none', padding: '8px 12px', borderRadius: 4, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
          >
            <ChevronLeft size={18} />
          </button>
          <span>Página {moviesData.page} de {moviesData.total_pages || 1}</span>
          <button 
            disabled={page >= moviesData.total_pages} 
            onClick={() => setPage(p => p + 1)}
            style={{ backgroundColor: '#29292E', color: '#FFF', border: 'none', padding: '8px 12px', borderRadius: 4, cursor: page >= moviesData.total_pages ? 'not-allowed' : 'pointer', opacity: page >= moviesData.total_pages ? 0.5 : 1 }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {selectedMovie && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#202024', padding: 24, borderRadius: 8, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', border: '1px solid #29292E', position: 'relative' }}>
            <button onClick={() => setSelectedMovie(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: '#7C7C8A', cursor: 'pointer' }}>
              <X size={20} />
            </button>

            <h2>{selectedMovie.titulo}</h2>
            <p style={{ color: '#A8A8B3' }}>{selectedMovie.sinopse || 'Sem sinopse cadastrada.'}</p>
            <p><strong>Média de Notas:</strong> <Star size={16} color="#FBA94C" style={{ verticalAlign: 'middle' }} /> {selectedMovie.media_notas} / 10</p>

            <hr style={{ borderColor: '#29292E', margin: '20px 0' }} />

            <h3>Avaliações</h3>
            {selectedMovie.reviews.length === 0 ? <p style={{ color: '#7C7C8A' }}>Nenhuma avaliação ainda.</p> : (
              selectedMovie.reviews.map(r => (
                <div key={r.sk_movie_review_id} style={{ backgroundColor: '#121214', padding: 12, borderRadius: 6, marginBottom: 10 }}>
                  <strong>{r.nome}</strong> - <span style={{ color: '#FBA94C' }}>★ {r.nota}</span>
                  {r.comentario && <p style={{ margin: '6px 0 0 0', color: '#C4C4CC' }}>{r.comentario}</p>}
                </div>
              ))
            )}

            <form onSubmit={handleAddReview} style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h4>Adicionar Avaliação</h4>
              <input type="text" placeholder="Seu nome" value={reviewerName} onChange={e => setReviewerName(e.target.value)} required style={{ padding: 8, borderRadius: 4, backgroundColor: '#121214', border: '1px solid #29292E', color: '#FFF' }} />
              <input type="number" min="0" max="10" step="0.1" placeholder="Nota (0 a 10)" value={reviewRating} onChange={e => setReviewRating(parseFloat(e.target.value))} required style={{ padding: 8, borderRadius: 4, backgroundColor: '#121214', border: '1px solid #29292E', color: '#FFF' }} />
              <textarea placeholder="Comentário/Resenha" value={reviewComment} onChange={e => setReviewComment(e.target.value)} style={{ padding: 8, borderRadius: 4, backgroundColor: '#121214', border: '1px solid #29292E', color: '#FFF', height: 60 }} />
              <button type="submit" style={{ backgroundColor: '#00875F', color: '#FFF', border: 'none', padding: 10, borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}>Enviar Resenha</button>
            </form>
          </div>
        </div>
      )}

      {isCreateOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#202024', padding: 24, borderRadius: 8, width: '100%', maxWidth: 450, border: '1px solid #29292E', position: 'relative' }}>
            <button onClick={() => setIsCreateOpen(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: '#7C7C8A', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h2>Cadastrar Filme</h2>
            <form onSubmit={handleCreateMovie} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
              <input type="text" placeholder="Título *" value={newTitle} onChange={e => setNewTitle(e.target.value)} required style={{ padding: 10, borderRadius: 4, backgroundColor: '#121214', border: '1px solid #29292E', color: '#FFF' }} />
              <textarea placeholder="Sinopse" value={newSynopsis} onChange={e => setNewSynopsis(e.target.value)} style={{ padding: 10, borderRadius: 4, backgroundColor: '#121214', border: '1px solid #29292E', color: '#FFF', height: 80 }} />
              <input type="date" placeholder="Data de Lançamento" value={newDate} onChange={e => setNewDate(e.target.value)} style={{ padding: 10, borderRadius: 4, backgroundColor: '#121214', border: '1px solid #29292E', color: '#FFF' }} />
              <input type="number" placeholder="Duração (minutos)" value={newDuration} onChange={e => setNewDuration(e.target.value)} style={{ padding: 10, borderRadius: 4, backgroundColor: '#121214', border: '1px solid #29292E', color: '#FFF' }} />
              <button type="submit" style={{ backgroundColor: '#00875F', color: '#FFF', border: 'none', padding: 12, borderRadius: 4, cursor: 'pointer', fontWeight: 'bold', marginTop: 10 }}>Salvar Filme</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
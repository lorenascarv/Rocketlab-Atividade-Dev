import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',
});

export interface Movie {
  sk_movie_id: string;
  id_filme?: string;
  titulo: string;
  sinopse?: string;
  data_lancamento?: string;
  duracao_minutos?: number;
  url_poster?: string;
}

export interface Review {
  sk_movie_review_id: string;
  sk_movie_id: string;
  nome: string;
  nota: number;
  comentario?: string;
}

export interface MovieDetail extends Movie {
  media_notas: number;
  reviews: Review[];
}

export interface PaginatedMovies {
  items: Movie[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
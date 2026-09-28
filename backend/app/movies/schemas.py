from datetime import date
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

class ReviewBase(BaseModel):
    nome: str
    nota: float = Field(..., ge=0, le=10)
    comentario: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    model_config = ConfigDict(from_attributes=True)

    sk_movie_review_id: str
    sk_movie_id: str

class MovieBase(BaseModel):
    titulo: Optional[str] = None
    sinopse: Optional[str] = None
    data_lancamento: Optional[date | str] = None
    duracao_minutos: Optional[int] = None
    url_poster: Optional[str] = None

class MovieCreate(MovieBase):
    titulo: str

class MovieUpdate(BaseModel):
    titulo: Optional[str] = None
    sinopse: Optional[str] = None
    data_lancamento: Optional[date | str] = None
    duracao_minutos: Optional[int] = None
    url_poster: Optional[str] = None

class MovieResponse(MovieBase):
    model_config = ConfigDict(from_attributes=True)

    sk_movie_id: str
    id_filme: Optional[str] = None

class MovieDetailResponse(MovieResponse):
    media_notas: Optional[float] = 0.0
    reviews: List[ReviewResponse] = []

class PaginatedMoviesResponse(BaseModel):
    items: List[MovieResponse]
    total: int
    page: int
    limit: int
    total_pages: int
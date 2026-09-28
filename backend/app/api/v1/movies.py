import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.movies.models import DimMovie, MovieReview
from app.movies.schemas import (
    MovieCreate,
    MovieDetailResponse,
    MovieResponse,
    MovieUpdate,
    PaginatedMoviesResponse,
    ReviewCreate,
    ReviewResponse,
)

router = APIRouter(prefix="/movies", tags=["Movies"])

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@router.get("/", response_model=PaginatedMoviesResponse)
async def list_movies(
    page: int = Query(1, ge=1, description="Número da página"),
    limit: int = Query(10, ge=1, le=100, description="Itens por página"),
    search: Optional[str] = Query(None, description="Termo de pesquisa por título ou sinopse"),
    db: AsyncSession = Depends(get_db)
):
    offset = (page - 1) * limit
    query = select(DimMovie)

    if search:
        query = query.where(
            or_(
                DimMovie.titulo.ilike(f"%{search}%"),
                DimMovie.sinopse.ilike(f"%{search}%")
            )
        )

    total_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(total_query)
    total = total_result.scalar() or 0

    paginated_query = query.offset(offset).limit(limit)
    result = await db.execute(paginated_query)
    movies_db = result.scalars().all()

    movies = [MovieResponse.model_validate(m) for m in movies_db]
    total_pages = (total + limit - 1) // limit if total > 0 else 0

    return {
        "items": movies,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages
    }

@router.get("/{sk_movie_id}", response_model=MovieDetailResponse)
async def get_movie(sk_movie_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DimMovie).where(DimMovie.sk_movie_id == sk_movie_id))
    movie = result.scalar_one_or_none()
    
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Filme não encontrado")

    reviews_result = await db.execute(select(MovieReview).where(MovieReview.sk_movie_id == sk_movie_id))
    reviews = reviews_result.scalars().all()

    avg_result = await db.execute(
        select(func.avg(MovieReview.nota)).where(MovieReview.sk_movie_id == sk_movie_id)
    )
    media_notas = avg_result.scalar() or 0.0

    movie_data = MovieResponse.model_validate(movie).model_dump()
    movie_data["media_notas"] = round(media_notas, 1)
    movie_data["reviews"] = [ReviewResponse.model_validate(r) for r in reviews]

    return movie_data

@router.post("/", response_model=MovieResponse, status_code=status.HTTP_201_CREATED)
async def create_movie(movie_in: MovieCreate, db: AsyncSession = Depends(get_db)):
    new_sk_id = str(uuid.uuid4())
    new_movie = DimMovie(
        sk_movie_id=new_sk_id,
        titulo=movie_in.titulo,
        sinopse=movie_in.sinopse,
        data_lancamento=movie_in.data_lancamento,
        duracao_minutos=movie_in.duracao_minutos,
        url_poster=movie_in.url_poster
    )
    db.add(new_movie)
    await db.commit()
    await db.refresh(new_movie)
    return MovieResponse.model_validate(new_movie)

@router.put("/{sk_movie_id}", response_model=MovieResponse)
async def update_movie(sk_movie_id: str, movie_in: MovieUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DimMovie).where(DimMovie.sk_movie_id == sk_movie_id))
    movie = result.scalar_one_or_none()

    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Filme não encontrado")

    update_data = movie_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(movie, field, value)

    await db.commit()
    await db.refresh(movie)
    return MovieResponse.model_validate(movie)

@router.delete("/{sk_movie_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_movie(sk_movie_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DimMovie).where(DimMovie.sk_movie_id == sk_movie_id))
    movie = result.scalar_one_or_none()

    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Filme não encontrado")

    await db.delete(movie)
    await db.commit()

@router.post("/{sk_movie_id}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(sk_movie_id: str, review_in: ReviewCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DimMovie).where(DimMovie.sk_movie_id == sk_movie_id))
    movie = result.scalar_one_or_none()

    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Filme não encontrado")

    new_review = MovieReview(
        sk_movie_review_id=str(uuid.uuid4()),
        sk_movie_id=sk_movie_id,
        nome=review_in.nome,
        nota=review_in.nota,
        comentario=review_in.comentario
    )
    db.add(new_review)
    await db.commit()
    await db.refresh(new_review)
    return ReviewResponse.model_validate(new_review)
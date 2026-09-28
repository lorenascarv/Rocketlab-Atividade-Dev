import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_list_movies(client: AsyncClient):
    response = await client.get("/api/v1/movies/?page=1&limit=5")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert data["page"] == 1
    assert data["limit"] == 5

@pytest.mark.asyncio
async def test_get_movie_not_found(client: AsyncClient):
    response = await client.get("/api/v1/movies/id_inexistente")
    assert response.status_code == 404
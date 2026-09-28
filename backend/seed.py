import csv
import asyncio
from sqlalchemy import text
from app.db.session import AsyncSessionLocal

async def import_csv_data():
    async with AsyncSessionLocal() as session:
        filmes_ok = False
        reviews_ok = False

        try:
            with open("dim_movies.csv", mode="r", encoding="utf-8") as file:
                reader = csv.DictReader(file)
                for row in reader:
                    await session.execute(
                        text("""
                            INSERT OR IGNORE INTO dim_movies (
                                sk_movie_id, 
                                id_filme,
                                titulo, 
                                data_lancamento,
                                ano_lancamento,
                                duracao_minutos,
                                status_filme,
                                sinopse,
                                url_poster,
                                url_backdrop
                            )
                            VALUES (
                                :sk_movie_id, 
                                :id_filme,
                                :titulo, 
                                :data_lancamento,
                                :ano_lancamento,
                                :duracao_minutos,
                                :status_filme,
                                :sinopse,
                                :url_poster,
                                :url_backdrop
                            )
                        """),
                        {
                            "sk_movie_id": row.get("sk_movie_id"),
                            "id_filme": row.get("id_filme"),
                            "titulo": row.get("titulo"),
                            "data_lancamento": row.get("data_lancamento"),
                            "ano_lancamento": int(row.get("ano_lancamento")) if row.get("ano_lancamento") else None,
                            "duracao_minutos": int(float(row.get("duracao_minutos"))) if row.get("duracao_minutos") else None,
                            "status_filme": row.get("status_filme"),
                            "sinopse": row.get("sinopse"),
                            "url_poster": row.get("url_poster"),
                            "url_backdrop": row.get("url_backdrop")
                        }
                    )
            filmes_ok = True
        except FileNotFoundError:
            print("\n❌ Aviso: dim_movies.csv não foi encontrado na pasta backend.")
        except Exception as e:
            print(f"\n❌ Erro ao importar filmes: {e}")

        await session.commit()

        try:
            with open("movies_reviews.csv", mode="r", encoding="utf-8") as file:
                reader = csv.DictReader(file)
                for row in reader:
                    await session.execute(
                        text("""
                            INSERT OR IGNORE INTO movie_reviews (
                                sk_movie_review_id, 
                                sk_movie_id, 
                                nome, 
                                nota, 
                                comentario
                            )
                            VALUES (
                                :sk_movie_review_id, 
                                :sk_movie_id, 
                                :nome, 
                                :nota, 
                                :comentario
                            )
                        """),
                        {
                            "sk_movie_review_id": row.get("sk_movie_review_id"),
                            "sk_movie_id": row.get("sk_movie_id"),
                            "nome": row.get("nome") or row.get("name"),
                            "nota": float(row.get("nota") or row.get("rating") or 0),
                            "comentario": row.get("comentario") or row.get("comment")
                        }
                    )
            reviews_ok = True
        except FileNotFoundError:
            print("\n❌ Aviso: movies_reviews.csv não foi encontrado na pasta backend.")
        except Exception as e:
            print(f"\n❌ Erro ao importar avaliações: {e}")

        await session.commit()


        print("\n" + "="*50)
        if filmes_ok:
            print("✅ FILMES IMPORTADOS COM SUCESSO!")
        if reviews_ok:
            print("✅ AVALIAÇÕES IMPORTADAS COM SUCESSO!")
        print("="*50 + "\n")

if __name__ == "__main__":
    asyncio.run(import_csv_data())
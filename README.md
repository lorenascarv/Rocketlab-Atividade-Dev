# Rocketlab-Atividade-Dev

# RocketLab Movies

Uma aplicação Full-Stack inspirada em plataformas de catálogo de filmes (como o Letterboxd), desenvolvida para o desafio **Rocket Lab 2026**. Permite gerenciar um catálogo de filmes, buscar por títulos/sinopses e cadastrar resenhas/avaliações.

---

## Tecnologias Utilizadas

### Backend
- **Python 3.12**
- **FastAPI** (API RESTful assíncrona)
- **SQLAlchemy** (ORM) & **Alembic** (Migrações)
- **SQLite** (Banco de dados)
- **Pytest** (Testes automatizados)

### Frontend
- **React + TypeScript + Vite**
- **Axios** (Integração HTTP)
- **Lucide React** (Ícones)

---

## Como Executar o Projeto

### Pré-requisitos
- **Python 3.10+**
- **Node.js 20+** e **npm**

---

### 1️⃣ Configuração e Execução do Backend

1. Navegue até a pasta do backend:
   cd backend

2. Crie e ative o ambiente virtual (venv):
   - Windows (PowerShell):
     python -m venv venv
     .\venv\Scripts\Activate.ps1
   - Linux/macOS:
     python3 -m venv venv
     source venv/bin/activate

3. Instale as dependências:
   pip install -r requirements.txt

4. Execute as migrações do banco de dados e a população inicial (Seed):
   alembic upgrade head
   python seed.py

5. Inicie o servidor do backend:
   uvicorn app.main:app --reload

   > O backend estará rodando em: http://127.0.0.1:8000

---

### 2️⃣ Execução dos Testes Automatizados

Com o ambiente virtual do backend ativo, execute:
pytest

---

### 3️⃣ Configuração e Execução do Frontend

1. Em um novo terminal, navegue até a pasta do frontend:
   cd frontend

2. Instale as dependências:
   npm install

3. Inicie o servidor de desenvolvimento:
   npm run dev

   > O frontend estará disponível em: http://localhost:5173

## Dificuldades
Na conexão entre a API (FastAPI) e a interface (Vite/React), as requisições foram inicialmente bloqueadas por políticas de segurança do navegador. A questão foi solucionada com a adição e configuração do middleware CORSMiddleware no FastAPI para liberar as origens em ambiente de desenvolvimento.
comando padrão do create-vite apresentou inconsistência com a versão do Node.js instalada no ambiente de desenvolvimento. Para garantir a estabilidade do setup sem a necessidade de atualizar todo o ecossistema local, a inicialização do projeto foi fixada na versão estável do Vite (npm create vite@5).
No ambiente Windows, a ativação do ambiente virtual Python (venv) foi impedida pelas políticas de restrição de scripts do PowerShell. A liberação foi realizada ajustando a política de execução da sessão via Set-ExecutionPolicy.
A validação estrita do ESLint sinalizou avisos sobre ciclo de vida de hooks (useEffect) e tratamento de exceções não utilizadas. O fluxo de chamadas foi refatorado utilizando o useCallback para memorização de funções e inclusão dos logs estruturados nos blocos de catch.
---

## Funcionalidades
- **Catálogo Paginado:** Visualização dos filmes em grade com paginação.
- **Barra de Pesquisa:** Busca em tempo real por título ou sinopse.
- **Gerenciamento de Filmes:** Cadastro e remoção de filmes.
- **Resenhas e Avaliações:** Detalhes do filme, cálculo da média geral de notas e inclusão de novas resenhas.

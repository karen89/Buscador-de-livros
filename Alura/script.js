let dados = [];
const secaoLivros = document.getElementById('secao-livros');
const inputBusca = document.getElementById('input-busca');
const selectOrdem = document.getElementById('ordenar-por');
const modal = document.getElementById('modal-capa');
const imagemModal = document.getElementById('imagem-modal');
const closeModal = document.querySelector('.modal-close');
const themeToggleButton = document.getElementById('theme-toggle-btn');


// Adiciona um "escutador de eventos" para a tecla "Enter" no campo de busca
inputBusca.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        buscarLivros();
    }
});

async function buscarLivros() {
    // Limpa a seção de livros antes de exibir novos resultados
    secaoLivros.innerHTML = '';

    try {
        const termoBusca = inputBusca.value.toLowerCase(); // Pega o valor do input (para uso futuro)
        // Voltando a buscar do arquivo JSON local
        let resposta = await fetch("livros.json");

        if (!resposta.ok) {
            throw new Error(`Erro HTTP! Status: ${resposta.status}`);
        }

        dados = await resposta.json();
        console.log("Dados carregados:", dados);

        // Filtra os livros com base no termo de busca (exemplo simples)
        let livrosFiltrados = dados.filter(livro =>
            livro.titulo.toLowerCase().includes(termoBusca) ||
            livro.autor.toLowerCase().includes(termoBusca) ||
            livro.categoria.toLowerCase().includes(termoBusca) ||
            livro.ano.toString().includes(termoBusca)
        );

        // Pega o valor da ordenação e aplica o sort
        const ordem = selectOrdem.value;

        // Verifica se algum livro foi encontrado
        if (livrosFiltrados.length === 0) {
            secaoLivros.innerHTML = `<p>Nenhum livro encontrado para a sua busca. Tente outras palavras.</p>`;
        } else if (ordem === 'categoria') {
            // Lógica especial para agrupar por categoria
            exibirLivrosAgrupadosPorCategoria(livrosFiltrados);
        } else {
            // Ordena por autor ou relevância (padrão)
            if (ordem === 'autor') {
                livrosFiltrados.sort((a, b) => a.autor.localeCompare(b.autor));
            }
            // Exibe a lista de livros normalmente
            exibirLivros(livrosFiltrados);
        }

        // Limpa o campo de busca após a pesquisa ser concluída
        inputBusca.value = '';

    } catch (error) {
        console.error("Ocorreu um erro ao buscar os livros:", error);
        secaoLivros.innerHTML = `<p>Não foi possível carregar os livros. Tente novamente mais tarde.</p>`;
    }
}

function exibirLivros(listaDeLivros) {
    secaoLivros.innerHTML = ''; // Limpa a seção antes de adicionar novos livros
    listaDeLivros.forEach(livro => criarCardLivro(livro));
}

function exibirLivrosAgrupadosPorCategoria(listaDeLivros) {
    secaoLivros.innerHTML = ''; // Limpa a seção
    const livrosAgrupados = listaDeLivros.reduce((acc, livro) => {
        const categoria = livro.categoria;
        if (!acc[categoria]) {
            acc[categoria] = [];
        }
        acc[categoria].push(livro);
        return acc;
    }, {});

    // Ordena as categorias em ordem alfabética
    const categoriasOrdenadas = Object.keys(livrosAgrupados).sort();

    categoriasOrdenadas.forEach(categoria => {
        // Cria e adiciona o título da categoria
        const tituloCategoria = document.createElement('h3');
        tituloCategoria.className = 'titulo-grupo';
        tituloCategoria.textContent = categoria;
        secaoLivros.appendChild(tituloCategoria);

        // Ordena os livros dentro de cada categoria por autor
        livrosAgrupados[categoria].sort((a, b) => a.autor.localeCompare(b.autor));

        // Cria os cards para os livros da categoria
        livrosAgrupados[categoria].forEach(livro => criarCardLivro(livro));
    });
}

function criarCardLivro(livro) {
    const article = document.createElement('article');
    article.classList.add('card');
    article.innerHTML = `
        <img src="${livro.capa}" alt="Capa do livro ${livro.titulo}" class="card-imagem">
        <div class="card-info">
            <span class="card-categoria">${livro.categoria}</span>
            <h2>${livro.titulo} (${livro.ano})</h2>
            <p>Autor: <strong>${livro.autor}</strong></p>
            <p>${livro.descricao}</p>
            <a href="${livro.link}" target="_blank">Saiba mais sobre o autor</a>
        </div>
    `;
    secaoLivros.appendChild(article);

    // Adiciona o evento de clique na imagem para abrir o modal
    const imagemDoCard = article.querySelector('.card-imagem');
    imagemDoCard.addEventListener('click', () => {
        imagemModal.src = livro.capa;
        imagemModal.alt = `Capa do livro ${livro.titulo}`;
        modal.classList.add('ativo');
    });
}

function limparBusca() {
    secaoLivros.innerHTML = '';
    inputBusca.value = '';
}

// --- Lógica do Modal ---

// Fecha o modal ao clicar no 'X'
closeModal.addEventListener('click', () => {
    modal.classList.remove('ativo');
});

// Fecha o modal ao clicar fora da imagem (no fundo)
window.addEventListener('click', (event) => {
    if (event.target == modal) {
        modal.classList.remove('ativo');
    }
});

// --- Lógica do Tema (Modo Claro/Escuro) ---

// Função para aplicar o tema
function aplicarTema(tema) {
    if (tema === 'light') {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }
}

// Evento de clique no botão de alternância
themeToggleButton.addEventListener('click', () => {
    const isLightMode = document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
});

// Verifica o tema salvo no carregamento da página
const temaSalvo = localStorage.getItem('theme') || 'dark'; // 'dark' como padrão
aplicarTema(temaSalvo);

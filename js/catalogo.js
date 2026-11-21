// catálogo do front-end.
// Fonte principal: API Spring Boot (GET /livros), carregada uma vez ao importar este módulo.
// Se a API estiver fora do ar (ou USE_API = false), cai no catálogo de EXEMPLO abaixo e a loja segue
// funcionando. `catalogSource` diz qual fonte está em uso: 'api' ou 'mock'.
// Formato do livro no front: {slug, title, author, price (centavos), cover, categories[], synopsis, specs?}
// Na API o slug é o próprio id numérico do livro (como texto).

import {USE_API, coverUrlForIsbn, API_TIMEOUT_MS} from './config.js';
import {listarLivros, buscarLivro} from './api.js';

export const CATEGORIES = {
    infantis: 'Livros infantis',
    infantojuvenil: 'Infantojuvenil',
    ficcao: 'Ficção',
    romance: 'Romance',
    fantasia: 'Fantasia',
    'ficcao-cientifica': 'Ficção científica',
    misterio: 'Mistério e suspense',
    terror: 'Terror',
    'ficcao-historica': 'Ficção histórica',
    acao: 'Ação e aventura',
    biografias: 'Biografias e memórias',
    autoajuda: 'Autoajuda',
    historia: 'História',
    ciencia: 'Ciência e tecnologia',
    negocios: 'Negócios e economia',
    filosofia: 'Filosofia e sociologia',
    religiao: 'Religião e espiritualidade',
    saude: 'Saúde',
    culinaria: 'Culinária',
    poesia: 'Poesia',
    hqs: 'HQs e Mangás',
    didaticos: 'Obras didáticas',
};

// price em CENTAVOS (inteiro): evita erros de arredondamento
export let BOOKS = [
    {
        slug: 'box-trilogia-o-senhor-dos-aneis', title: 'Box Trilogia O Senhor dos Anéis', author: 'J. R. R. Tolkien',
        price: 20720, cover: 'assets/img/placeholder-capa.svg', categories: ['fantasia', 'ficcao'],
        synopsis: 'A fantástica jornada de Frodo Bolseiro para destruir o Um Anel e salvar a Terra-média do Senhor Sombrio Sauron. Este box reúne os três volumes da obra-prima de J.R.R. Tolkien: A Sociedade do Anel, As Duas Torres e O Retorno do Rei.',
        specs: {
            Editora: 'HarperCollins', Idioma: 'Português', Capa: 'Capa dura', 'Páginas': '1568 páginas',
            'ISBN-13': '978-8595086357', 'Dimensões': '21.6 x 14.2 x 9.6 cm',
        },
    },
    {
        slug: 'box-harry-potter-scholastic', title: 'Box Harry Potter Scholastic', author: 'J.K. Rowling',
        price: 30751, cover: 'assets/img/placeholder-capa.svg', categories: ['fantasia', 'infantojuvenil', 'ficcao'],
        synopsis: 'Coleção com a saga do bruxo Harry Potter, que descobre aos onze anos que é um bruxo e começa a estudar na Escola de Magia e Bruxaria de Hogwarts.',
    },
    {
        slug: 'dom-quixote', title: 'Dom Quixote', author: 'Miguel de Cervantes Saavedra',
        price: 16733, cover: 'assets/img/placeholder-capa.svg', categories: ['ficcao'],
        synopsis: 'Clássico da literatura espanhola: um fidalgo enlouquecido pela leitura de romances de cavalaria sai pelo mundo, ao lado de Sancho Pança, para viver como cavaleiro andante.',
    },
    {
        slug: 'biblia-sagrada-com-harpa-e-indice', title: 'Bíblia Sagrada Com Harpa e Índice', author: '',
        price: 3989, cover: 'assets/img/placeholder-capa.svg', categories: ['religiao'],
        synopsis: 'Edição da Bíblia Sagrada com Harpa Cristã e índice para consulta.',
    },
    {
        slug: 'o-pequeno-principe', title: 'O Pequeno Príncipe', author: 'Antoine de Saint-Exupéry',
        price: 2490, cover: 'assets/img/placeholder-capa.svg', categories: ['infantis', 'ficcao'],
        synopsis: 'Um piloto perdido no deserto encontra um pequeno príncipe vindo de outro planeta e conhece, pelas histórias dele, lições sobre amizade, amor e o essencial.',
    },
    {
        slug: '1984', title: '1984', author: 'George Orwell',
        price: 3490, cover: 'assets/img/placeholder-capa.svg', categories: ['ficcao', 'ficcao-cientifica'],
        synopsis: 'Em um Estado totalitário vigiado pelo Grande Irmão, Winston Smith tenta preservar a liberdade de pensar e se rebela em silêncio.',
    },
    {
        slug: 'orgulho-e-preconceito', title: 'Orgulho e Preconceito', author: 'Jane Austen',
        price: 4490, cover: 'assets/img/placeholder-capa.svg', categories: ['romance'],
        synopsis: 'Elizabeth Bennet e o orgulhoso Sr. Darcy precisam superar as primeiras impressões e os preconceitos de classe em uma das histórias de amor mais célebres da literatura.',
    },
    {
        slug: 'o-hobbit', title: 'O Hobbit', author: 'J. R. R. Tolkien',
        price: 4990, cover: 'assets/img/placeholder-capa.svg', categories: ['fantasia', 'infantojuvenil', 'ficcao'],
        synopsis: 'Prelúdio de O Senhor dos Anéis. Acompanhe a aventura de Bilbo Bolseiro, do mago Gandalf e de treze anões em busca do tesouro guardado pelo dragão Smaug.',
    },
    {
        slug: 'quando', title: 'Quando', author: 'Carla Madeira',
        price: 1990, cover: 'assets/img/placeholder-capa.svg', categories: ['romance', 'ficcao'],
        synopsis: 'Sinopse em breve.',
    },
    {
        slug: 'nao-se-deixe-enganar', title: 'Não se deixe enganar', author: 'Harlan Coben',
        price: 5250, cover: 'assets/img/placeholder-capa.svg', categories: ['misterio'],
        synopsis: 'Sinopse em breve.',
    },
    {
        slug: 'licoes-de-grego', title: 'Lições de grego', author: 'Han Kang',
        price: 6290, cover: 'assets/img/placeholder-capa.svg', categories: ['ficcao'],
        synopsis: 'Sinopse em breve.',
    },
    {
        slug: 'terra-a-deriva', title: 'Terra à deriva', author: 'Cixin Liu',
        price: 3989, cover: 'assets/img/placeholder-capa.svg', categories: ['ficcao-cientifica', 'ficcao'],
        synopsis: 'Sinopse em breve.',
    },
    {
        slug: 'torto-arado', title: 'Torto Arado', author: 'Itamar Vieira Junior',
        price: 5490, cover: 'assets/img/placeholder-capa.svg', categories: ['ficcao'],
        synopsis: 'Romance ambientado no sertão da Bahia que acompanha as irmãs Bibiana e Belonísia e a luta da família por terra e dignidade.',
    },
    {
        slug: 'dom-casmurro', title: 'Dom Casmurro', author: 'Machado de Assis',
        price: 1990, cover: 'assets/img/placeholder-capa.svg', categories: ['romance', 'ficcao'],
        synopsis: 'Bento Santiago, o Bentinho, narra sua vida e a dúvida que o consome: Capitu o teria traído?',
    },
    {
        slug: 'capitaes-da-areia', title: 'Capitães da Areia', author: 'Jorge Amado',
        price: 3990, cover: 'assets/img/placeholder-capa.svg', categories: ['ficcao'],
        synopsis: 'A vida de um grupo de meninos de rua que vive em um trapiche abandonado em Salvador, liderado por Pedro Bala.',
    },
    {
        slug: 'memorias-postumas-de-bras-cubas', title: 'Memórias Póstumas de Brás Cubas', author: 'Machado de Assis',
        price: 2290, cover: 'assets/img/placeholder-capa.svg', categories: ['ficcao'],
        synopsis: 'Brás Cubas, já morto, conta sua vida com ironia e humor ácido, em um marco do Realismo brasileiro.',
    },
];

export const findBook = (slug) => BOOKS.find((book) => book.slug === slug);

/* ----- Integração com a API ----- */
export let catalogSource = 'mock';

const COVER_PLACEHOLDER = 'assets/img/placeholder-capa.svg';

// Enum FormatoLivro da API -> texto para exibir
const FORMATS = {CAPA_COMUM: 'Capa comum', CAPA_DURA: 'Capa dura', EBOOK: 'E-book', AUDIOBOOK: 'Audiolivro'};

/** Só aceita capa https (qualquer outra coisa cai no fallback). */
function safeCoverUrl(url) {
    try {
        const parsed = new URL(String(url ?? ''));
        return parsed.protocol === 'https:' ? parsed.href : null;
    } catch {
        return null;
    }
}

const slugify = (text) => String(text).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** LivroResponseDTO -> livro do front. Valores inesperados da API viram padrões seguros. */
export function livroToBook(livro) {
    const price = Math.round(Number(livro.preco) * 100);
    return {
        slug: String(livro.id),
        title: String(livro.titulo ?? '').trim() || 'Sem título',
        // O dataset usa "A/B/C" para vários autores
        author: String(livro.autor ?? '').split('/').map((name) => name.replace(/\s+/g, ' ').trim()).filter(Boolean).join(', '),
        price: Number.isFinite(price) && price >= 0 ? price : 0,
        cover: safeCoverUrl(livro.urlCapa) ?? coverUrlForIsbn(livro.isbn) ?? COVER_PLACEHOLDER,
        categories: livro.categoria ? [slugify(livro.categoria)] : [],
        categoryLabel: livro.categoria ? String(livro.categoria) : '',
        synopsis: typeof livro.sinopse === 'string' ? livro.sinopse : '',
        year: Number.isInteger(livro.anoPublicacao) ? livro.anoPublicacao : null,
        stock: Number.isInteger(livro.quantidadeEstoque) ? livro.quantidadeEstoque : null,
        rating: Number.isFinite(Number(livro.avaliacao)) ? Number(livro.avaliacao) : null,
        format: typeof livro.formato === 'string' ? livro.formato : null,
        specs: {
            'Editora': livro.editora ? String(livro.editora) : '',
            'Idioma': livro.idioma ? String(livro.idioma) : '',
            'Formato': FORMATS[livro.formato] ?? '',
            'ISBN': livro.isbn ? String(livro.isbn) : '',
            'Ano de publicação': Number.isInteger(livro.anoPublicacao) ? String(livro.anoPublicacao) : '',
        },
    };
}

/**
 * O banco tem milhares de livros: o front guarda só os que já viu (home, busca, produto, carrinho).
 * Registra livros novos em BOOKS e devolve os objetos canônicos (sem duplicar).
 */
export function registerBooks(books) {
    return books.map((book) => {
        const existing = findBook(book.slug);
        if (existing) return existing;
        BOOKS.push(book);
        return book;
    });
}

/** Busca por id os livros que a página atual precisa e ainda não estão carregados. */
async function loadReferencedBooks() {
    const ids = new Set();
    const fromUrl = new URLSearchParams(window.location.search).get('livro');
    if (fromUrl) ids.add(fromUrl);
    for (const key of ['alexandria_cart', 'alexandria_wishlist']) {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            if (Array.isArray(value)) {
                value.forEach((entry) => ids.add(typeof entry === 'string' ? entry : entry?.slug));
            }
        } catch {
            /* sem armazenamento ou JSON inválido: ignora */
        }
    }
    const missing = [...ids].filter((id) => typeof id === 'string' && /^\d{1,12}$/.test(id) && !findBook(id)).slice(0, 50);
    await Promise.all(missing.map(async (id) => {
        try {
            registerBooks([livroToBook(await buscarLivro(id))]);
        } catch {
            /* livro removido/indisponível: a página trata como não encontrado */
        }
    }));
}

/** Aviso para quando a API demora (no Render grátis, a 1ª chamada pode levar ~1 minuto: servidor acordando). */
function showWakingNotice() {
    const notice = document.createElement('div');
    notice.className = 'api-waking';
    notice.setAttribute('role', 'status');
    notice.textContent = 'Conectando ao servidor… na primeira visita pode levar até 1 minuto.';
    document.body.prepend(notice);
    return notice;
}

if (USE_API) {
    let wakingNotice = null;
    const wakingTimer = setTimeout(() => {
        wakingNotice = showWakingNotice();
    }, 1500);
    try {
        // Só um teste de que a API responde (no Render grátis a 1ª chamada pode demorar ~1 min: servidor acordando)
        const livros = await listarLivros({size: 12, timeout: API_TIMEOUT_MS});
        if (livros.length) {
            BOOKS = livros.map(livroToBook);
            catalogSource = 'api';
            await loadReferencedBooks();
        }
    } catch {
        /* API indisponível: mantém o catálogo de exemplo */
    } finally {
        clearTimeout(wakingTimer);
        wakingNotice?.remove();
    }
}
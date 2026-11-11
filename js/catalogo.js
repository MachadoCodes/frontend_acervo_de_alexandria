// js/catalogo.js — catálogo MOCK (dados de exemplo).
// Quando a API Spring Boot estiver pronta, substitua BOOKS por uma chamada fetch('/api/livros')
// mantendo o mesmo formato de objeto: o restante do front-end não precisa mudar.

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
export const BOOKS = [
    {
        slug: 'box-trilogia-o-senhor-dos-aneis', title: 'Box Trilogia O Senhor dos Anéis', author: 'J. R. R. Tolkien',
        price: 20720, cover: 'assets/img/livro-aneis.jpg', categories: ['fantasia', 'ficcao'],
        synopsis: 'A fantástica jornada de Frodo Bolseiro para destruir o Um Anel e salvar a Terra-média do Senhor Sombrio Sauron. Este box reúne os três volumes da obra-prima de J.R.R. Tolkien: A Sociedade do Anel, As Duas Torres e O Retorno do Rei.',
        specs: {
            Editora: 'HarperCollins', Idioma: 'Português', Capa: 'Capa dura', 'Páginas': '1568 páginas',
            'ISBN-13': '978-8595086357', 'Dimensões': '21.6 x 14.2 x 9.6 cm',
        },
    },
    {
        slug: 'box-harry-potter-scholastic', title: 'Box Harry Potter Scholastic', author: 'J.K. Rowling',
        price: 30751, cover: 'assets/img/livro-hp.jpg', categories: ['fantasia', 'infantojuvenil', 'ficcao'],
        synopsis: 'Coleção com a saga do bruxo Harry Potter, que descobre aos onze anos que é um bruxo e começa a estudar na Escola de Magia e Bruxaria de Hogwarts.',
    },
    {
        slug: 'dom-quixote', title: 'Dom Quixote', author: 'Miguel de Cervantes Saavedra',
        price: 16733, cover: 'assets/img/livro-quixote.jpg', categories: ['ficcao'],
        synopsis: 'Clássico da literatura espanhola: um fidalgo enlouquecido pela leitura de romances de cavalaria sai pelo mundo, ao lado de Sancho Pança, para viver como cavaleiro andante.',
    },
    {
        slug: 'biblia-sagrada-com-harpa-e-indice', title: 'Bíblia Sagrada Com Harpa e Índice', author: '',
        price: 3989, cover: 'assets/img/livro-biblia.jpg', categories: ['religiao'],
        synopsis: 'Edição da Bíblia Sagrada com Harpa Cristã e índice para consulta.',
    },
    {
        slug: 'o-pequeno-principe', title: 'O Pequeno Príncipe', author: 'Antoine de Saint-Exupéry',
        price: 2490, cover: 'assets/img/livro-pequeno-principe.jpg', categories: ['infantis', 'ficcao'],
        synopsis: 'Um piloto perdido no deserto encontra um pequeno príncipe vindo de outro planeta e conhece, pelas histórias dele, lições sobre amizade, amor e o essencial.',
    },
    {
        slug: '1984', title: '1984', author: 'George Orwell',
        price: 3490, cover: 'assets/img/livro-1984.jpg', categories: ['ficcao', 'ficcao-cientifica'],
        synopsis: 'Em um Estado totalitário vigiado pelo Grande Irmão, Winston Smith tenta preservar a liberdade de pensar e se rebela em silêncio.',
    },
    {
        slug: 'orgulho-e-preconceito', title: 'Orgulho e Preconceito', author: 'Jane Austen',
        price: 4490, cover: 'assets/img/livro-orgulho.jpg', categories: ['romance'],
        synopsis: 'Elizabeth Bennet e o orgulhoso Sr. Darcy precisam superar as primeiras impressões e os preconceitos de classe em uma das histórias de amor mais célebres da literatura.',
    },
    {
        slug: 'o-hobbit', title: 'O Hobbit', author: 'J. R. R. Tolkien',
        price: 4990, cover: 'assets/img/livro-hobbit.jpg', categories: ['fantasia', 'infantojuvenil', 'ficcao'],
        synopsis: 'Prelúdio de O Senhor dos Anéis. Acompanhe a aventura de Bilbo Bolseiro, do mago Gandalf e de treze anões em busca do tesouro guardado pelo dragão Smaug.',
    },
    {
        slug: 'quando', title: 'Quando', author: 'Carla Madeira',
        price: 1990, cover: 'assets/img/livro-quando.jpg', categories: ['romance', 'ficcao'],
        synopsis: 'Sinopse em breve.',
    },
    {
        slug: 'nao-se-deixe-enganar', title: 'Não se deixe enganar', author: 'Harlan Coben',
        price: 5250, cover: 'assets/img/livro-coben.jpg', categories: ['misterio'],
        synopsis: 'Sinopse em breve.',
    },
    {
        slug: 'licoes-de-grego', title: 'Lições de grego', author: 'Han Kang',
        price: 6290, cover: 'assets/img/livro-grego.jpg', categories: ['ficcao'],
        synopsis: 'Sinopse em breve.',
    },
    {
        slug: 'terra-a-deriva', title: 'Terra à deriva', author: 'Cixin Liu',
        price: 3989, cover: 'assets/img/livro-terra.jpg', categories: ['ficcao-cientifica', 'ficcao'],
        synopsis: 'Sinopse em breve.',
    },
    {
        slug: 'torto-arado', title: 'Torto Arado', author: 'Itamar Vieira Junior',
        price: 5490, cover: 'assets/img/livro-torto-arado.jpg', categories: ['ficcao'],
        synopsis: 'Romance ambientado no sertão da Bahia que acompanha as irmãs Bibiana e Belonísia e a luta da família por terra e dignidade.',
    },
    {
        slug: 'dom-casmurro', title: 'Dom Casmurro', author: 'Machado de Assis',
        price: 1990, cover: 'assets/img/livro-dom-casmurro.jpg', categories: ['romance', 'ficcao'],
        synopsis: 'Bento Santiago, o Bentinho, narra sua vida e a dúvida que o consome: Capitu o teria traído?',
    },
    {
        slug: 'capitaes-da-areia', title: 'Capitães da Areia', author: 'Jorge Amado',
        price: 3990, cover: 'assets/img/livro-capitaes.jpg', categories: ['ficcao'],
        synopsis: 'A vida de um grupo de meninos de rua que vive em um trapiche abandonado em Salvador, liderado por Pedro Bala.',
    },
    {
        slug: 'memorias-postumas-de-bras-cubas', title: 'Memórias Póstumas de Brás Cubas', author: 'Machado de Assis',
        price: 2290, cover: 'assets/img/livro-bras-cubas.jpg', categories: ['ficcao'],
        synopsis: 'Brás Cubas, já morto, conta sua vida com ironia e humor ácido, em um marco do Realismo brasileiro.',
    },
];

export const findBook = (slug) => BOOKS.find((book) => book.slug === slug);

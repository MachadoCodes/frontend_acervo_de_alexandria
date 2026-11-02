document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const termoBusca = params.get('q');

    if (termoBusca) {
        // Atualiza o texto de destaque no H1
        const tituloHighlight = document.querySelector('.search-title .highlight');
        if (tituloHighlight) {
            tituloHighlight.textContent = `"${termoBusca}"`;
        }

        // Mantém a palavra digitada na barra de busca do header
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = termoBusca;
        }
    }
});
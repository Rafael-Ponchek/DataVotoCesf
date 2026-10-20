
const formulario = document.querySelector("#form-pesquisa");
const mensagem = document.querySelector("#mensagem");

formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const dados = new FormData(formulario);

    // Pega todas as opções marcadas
    const prioridades = dados.getAll("prioridades");
    const meiosInformacao = dados.getAll("meiosInformacao");

    // Exige pelo menos uma prioridade
    if (prioridades.length === 0) {
        mensagem.textContent =
            "Selecione pelo menos uma prioridade para continuar.";

        document.querySelector('input[name="prioridades"]').focus();
        return;
    }

    // Exige pelo menos um meio de informação
    if (meiosInformacao.length === 0) {
        mensagem.textContent =
            "Selecione pelo menos um meio de informação para continuar.";

        document.querySelector('input[name="meiosInformacao"]').focus();
        return;
    }

    // Organiza todas as respostas
    const respostas = {
        faixaEtaria: dados.get("faixaEtaria"),
        genero: dados.get("genero"),
        racaCor: dados.get("racaCor"),
        escolaridade: dados.get("escolaridade"),
        estado: dados.get("estado"),

        bairro: dados.get("bairro"),
        moradia: dados.get("moradia"),
        moradores: dados.get("moradores"),
        rendaFamiliar: dados.get("rendaFamiliar"),

        prioridades: prioridades,
        meiosInformacao: meiosInformacao,

        pretensaoVoto: dados.get("pretensaoVoto"),
        resultadoEsperado: dados.get("resultadoEsperado")
    };

    // Mostra as respostas no console para testes
    console.log("Respostas preenchidas:", respostas);

    
});

// Limpa a mensagem quando o formulário é reiniciado
formulario.addEventListener("reset", () => {
    mensagem.textContent = "";
});

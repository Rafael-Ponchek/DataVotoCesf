
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import {
    getDatabase,
    ref,
    push,
    set,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDqXGQcAPyZ37Pnl7bFmbqzNfv3a6SjCXE",
    authDomain: "data-voto-cesf2.firebaseapp.com",
    databaseURL: "https://data-voto-cesf2-default-rtdb.firebaseio.com",
    projectId: "data-voto-cesf2",
    storageBucket: "data-voto-cesf2.firebasestorage.app",
    messagingSenderId: "724147999457",
    appId: "1:724147999457:web:3254dbc2eea62aeb969da0"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const formulario = document.querySelector("#form-pesquisa");
const mensagem = document.querySelector("#mensagem");
const botaoEnviar = formulario.querySelector('button[type="submit"]');

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const dados = new FormData(formulario);
    const prioridades = dados.getAll("prioridades");
    const meiosInformacao = dados.getAll("meiosInformacao");

    if (prioridades.length === 0) {
        mensagem.textContent =
            "Selecione pelo menos uma prioridade para continuar.";
        document.querySelector('input[name="prioridades"]').focus();
        return;
    }

    if (meiosInformacao.length === 0) {
        mensagem.textContent =
            "Selecione pelo menos um meio de informação para continuar.";
        document.querySelector('input[name="meiosInformacao"]').focus();
        return;
    }

    // Reúne todas as respostas
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
        resultadoEsperado: dados.get("resultadoEsperado"),
        dataEnvio: serverTimestamp()
    };

    botaoEnviar.disabled = true;
    mensagem.textContent = "Enviando suas respostas...";

    try {
        // Cria um registro individual no Realtime Database
        const novaResposta = push(ref(database, "respostas"));

        await set(novaResposta, respostas);

        mensagem.textContent =
            "Respostas enviadas com sucesso. Obrigado por participar!";

        formulario.reset();

    } catch (erro) {
        console.error("Erro ao salvar no Firebase:", erro);

        mensagem.textContent =
            "Não foi possível enviar. Verifique a conexão e as regras do Firebase.";
    } finally {
        botaoEnviar.disabled = false;
    }
});

formulario.addEventListener("reset", () => {
    mensagem.textContent = "";
});

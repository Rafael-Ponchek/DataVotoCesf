const express = require("express");
const db = require("./firebase");

const app = express();

app.use(express.json());

app.post("/respostas", async (req, res) => {
    try {
        const respostas = req.body;

        const documento = await db
            .collection("respostas")
            .add({
                ...respostas,
                criadaEm: new Date()
            });

        res.status(201).json({
            mensagem: "Respostas salvas!",
            id: documento.id
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao salvar as respostas"
        });
    }
});

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});
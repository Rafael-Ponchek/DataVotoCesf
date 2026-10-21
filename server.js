
const express = require("express");
const Database = require("better-sqlite3");
const bcrypt = require("bcrypt");
const session = require("express-session");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const db = new Database("datavoto.db");

db.pragma("journal_mode = WAL");

db.exec(`
    CREATE TABLE IF NOT EXISTS respostas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dados TEXT NOT NULL,
        criada_em TEXT DEFAULT CURRENT_TIMESTAMP
    );
`);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            maxAge: 30 * 60 * 1000
        }
    })
);

// Disponibiliza o formulário público
app.use(express.static(path.join(__dirname, "FRONT-END")));

// Verifica se a pessoa é administradora
function exigirAdmin(req, res, next) {
    if (req.session && req.session.admin === true) {
        return next();
    }

    return res.status(401).json({
        erro: "Acesso não autorizado."
    });
}

// Página principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "FRONT-END", "index.html"));
});

// Login administrativo
app.get("/admin", (req, res) => {
    if (req.session && req.session.admin === true) {
        return res.sendFile(
            path.join(__dirname, "FRONT-END", "admin.html")
        );
    }

    res.sendFile(
        path.join(__dirname, "FRONT-END", "login-admin.html")
    );
});

// Verifica a senha de administradora
app.post("/api/admin/login", async (req, res) => {
    try {
        const senha = req.body.senha;
        const hash = process.env.ADMIN_PASSWORD_HASH;

        if (!senha || !hash) {
            return res.status(400).json({
                erro: "Configure a senha administrativa."
            });
        }

        const correta = await bcrypt.compare(senha, hash);

        if (!correta) {
            return res.status(401).json({
                erro: "Senha incorreta."
            });
        }

        req.session.admin = true;

        return res.json({
            mensagem: "Login realizado com sucesso."
        });
    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            erro: "Erro ao realizar login."
        });
    }
});

// Encerra a sessão administrativa
app.post("/api/admin/logout", exigirAdmin, (req, res) => {
    req.session.destroy((erro) => {
        if (erro) {
            return res.status(500).json({
                erro: "Não foi possível encerrar a sessão."
            });
        }

        res.clearCookie("connect.sid");
        res.json({ mensagem: "Sessão encerrada." });
    });
});

// Salva uma resposta
app.post("/api/respostas", (req, res) => {
    const dados = req.body;

    const camposObrigatorios = [
        "faixaEtaria",
        "genero",
        "racaCor",
        "escolaridade",
        "estado",
        "bairro",
        "moradia",
        "moradores",
        "rendaFamiliar",
        "pretensaoVoto",
        "resultadoEsperado"
    ];

    for (const campo of camposObrigatorios) {
        if (
            dados[campo] === undefined ||
            dados[campo] === null ||
            dados[campo] === ""
        ) {
            return res.status(400).json({
                erro: `Preencha o campo obrigatório: ${campo}.`
            });
        }
    }

    if (
        !Array.isArray(dados.prioridades) ||
        dados.prioridades.length === 0 ||
        !Array.isArray(dados.meiosInformacao) ||
        dados.meiosInformacao.length === 0
    ) {
        return res.status(400).json({
            erro: "Selecione as prioridades e os meios de informação."
        });
    }

    try {
        const inserir = db.prepare(
            "INSERT INTO respostas (dados) VALUES (?)"
        );

        inserir.run(JSON.stringify(dados));

        res.status(201).json({
            mensagem: "Resposta registrada com sucesso."
        });
    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Não foi possível salvar sua resposta."
        });
    }
});

// Lista respostas: somente administradora
app.get("/api/admin/respostas", exigirAdmin, (req, res) => {
    try {
        const respostas = db.prepare(
            "SELECT id, dados, criada_em FROM respostas ORDER BY id DESC"
        ).all();

        res.json(
            respostas.map((resposta) => ({
                id: resposta.id,
                ...JSON.parse(resposta.dados),
                criadaEm: resposta.criada_em
            }))
        );
    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Não foi possível consultar as respostas."
        });
    }
});

// Apaga todas as respostas: somente administradora
app.delete("/api/admin/respostas", exigirAdmin, (req, res) => {
    try {
        db.prepare("DELETE FROM respostas").run();

        res.json({
            mensagem: "Todas as respostas foram apagadas."
        });
    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Não foi possível apagar as respostas."
        });
    }
});

app.listen(PORT, () => {
    console.log(`DataVotoCesf rodando em http://localhost:${PORT}`);
});

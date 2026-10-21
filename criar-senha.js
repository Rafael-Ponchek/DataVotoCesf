
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

async function criarSenha() {
    const senha = process.argv[2];

    if (!senha || senha.length < 12) {
        console.log("A senha precisa ter pelo menos 12 caracteres.");
        console.log('Exemplo de uso: node criar-senha.js "MinhaSenhaForte123!"');
        process.exit(1);
    }

    const hash = await bcrypt.hash(senha, 12);
    const caminhoEnv = path.join(__dirname, ".env");

    if (!fs.existsSync(caminhoEnv)) {
        console.log("Crie o arquivo .env na pasta principal primeiro.");
        process.exit(1);
    }

    let conteudo = fs.readFileSync(caminhoEnv, "utf8");

    if (/^ADMIN_PASSWORD_HASH=/m.test(conteudo)) {
        conteudo = conteudo.replace(
            /^ADMIN_PASSWORD_HASH=.*$/m,
            `ADMIN_PASSWORD_HASH=${hash}`
        );
    } else {
        conteudo += `\nADMIN_PASSWORD_HASH=${hash}\n`;
    }

    fs.writeFileSync(caminhoEnv, conteudo);

    console.log("Senha administrativa configurada com sucesso!");
}

criarSenha().catch((erro) => {
    console.error("Erro ao configurar a senha:", erro.message);
    process.exit(1);
});

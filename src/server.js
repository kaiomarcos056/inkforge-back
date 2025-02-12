const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 3000;

const authRoutes = require("./routes/autenticarRoutes");
const livroRoutes = require("./routes/livroRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");
const planoRoutes = require("./routes/planoRoutes");
const estatisticaRoutes = require("./routes/estatisticaRoutes");
const favoritoRoutes = require("./routes/favoritoRoutes");
const capituloRoutes = require("./routes/capituloRoutes");
const comentarioRoutes = require("./routes/comentarioRoutes");
const votacaoRoutes = require("./routes/votacaoRoutes");
const generoRoutes = require("./routes/generoRoutes");

app.use(express.json());
app.use(
    cors({
        origin: "*",
    })
);

app.use("/auth", authRoutes);
app.use("/livros", livroRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/planos", planoRoutes);
app.use("/estatisticas", estatisticaRoutes);
app.use("/favoritos", favoritoRoutes);
app.use("/capitulos", capituloRoutes);
app.use("/comentarios", comentarioRoutes);
app.use("/votacao", votacaoRoutes);
app.use("/generos", generoRoutes);

app.listen(PORT, () => {
    console.log(`InkForge rodando na porta: ${PORT}`);
});

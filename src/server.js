const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 3000;
const { swaggerUi, swaggerDocs } = require("./config/swagger");

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
const interesseRoutes = require("./routes/interesseRoutes");
const historicoRoutes = require("./routes/historicoRoutes");

app.use(express.json());
app.use(
    cors({
        origin: "*",
    })
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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
app.use("/interesses", interesseRoutes);
app.use("/historico", historicoRoutes);

app.listen(PORT, () => {
    console.log(`InkForge rodando na porta: ${PORT}`);
});

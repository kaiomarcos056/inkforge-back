const express = require("express");
const {
    criarCapitulo,
    editarCapitulo,
    editarConteudo,
    excluirCapitulo,
    listarCapitulos,
    registrarLeituraCapitulo,
    listarUltimosCapitulosLidos,
    finalizarCapitulo
} = require("../controllers/capituloController");
const autenticar = require("../middlewares/autenticar");
const autorizarDono = require("../middlewares/autorizarDono");

// NÃO ALTERAR A ORDEM DAS ROTAS

const router = express.Router();

/**
 * @swagger
 * /capitulos:
 *   post:
 *     summary: Criar um novo capítulo
 *     description: Somente o dono do livro pode criar um capítulo.
 *     tags: [Capítulos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               uuid_livro:
 *                 type: string
 *               titulo:
 *                 type: string
 *               conteudo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Capítulo criado com sucesso
 *       403:
 *         description: Usuário não autorizado
 *       500:
 *         description: Erro ao criar capítulo
 */
router.post("/", autenticar, criarCapitulo);

/**
 * @swagger
 * /capitulos/ler/{uuid_capitulo}:
 *   post:
 *     summary: Registrar leitura de um capítulo
 *     description: Registra que um usuário leu determinado capítulo.
 *     tags: [Capítulos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid_capitulo
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Progresso salvo com sucesso
 *       500:
 *         description: Erro ao registrar leitura
 */
router.post("/ler/:uuid_capitulo", autenticar, registrarLeituraCapitulo);

/**
 * @swagger
 * /capitulos/ultimos-lidos:
 *   get:
 *     summary: Listar os últimos capítulos lidos pelo usuário
 *     description: Retorna os 4 últimos livros lidos e o último capítulo lido de cada um.
 *     tags: [Capítulos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de últimos capítulos lidos
 *       404:
 *         description: Nenhum capítulo encontrado
 *       500:
 *         description: Erro ao obter últimos capítulos lidos
 */
router.get("/ultimos-lidos", autenticar, listarUltimosCapitulosLidos);

/**
 * @swagger
 * /capitulos/{uuid_livro}:
 *   get:
 *     summary: Listar capítulos de um livro
 *     description: Retorna todos os capítulos de um livro específico.
 *     tags: [Capítulos]
 *     parameters:
 *       - in: path
 *         name: uuid_livro
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de capítulos
 *       500:
 *         description: Erro ao listar capítulos
 */
router.get("/:uuid_livro", listarCapitulos);

/**
 * @swagger
 * /capitulos/{uuid_capitulo}:
 *   put:
 *     summary: Editar um capítulo
 *     description: Somente o dono do livro pode editar um capítulo.
 *     tags: [Capítulos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid_capitulo
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               conteudo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Capítulo atualizado com sucesso
 *       403:
 *         description: Usuário não autorizado
 *       500:
 *         description: Erro ao editar capítulo
 */
router.put(
    "/:uuid_capitulo",
    autenticar,
    autorizarDono("capitulo", "uuid_livro", "uuid_capitulo"),
    editarCapitulo
);

router.put(
    "/conteudo/:uuid_capitulo",
    autenticar,
    autorizarDono("capitulo", "l.uuid_usuario", "uuid_capitulo"),
    editarConteudo
);

router.put(
    "/finalizar/:uuid_capitulo",
    autenticar,
    autorizarDono("capitulo", "l.uuid_usuario", "uuid_capitulo"),
    finalizarCapitulo
);

/**
 * @swagger
 * /capitulos/{uuid_capitulo}:
 *   delete:
 *     summary: Excluir um capítulo
 *     description: Somente o dono do livro pode excluir um capítulo.
 *     tags: [Capítulos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid_capitulo
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Capítulo excluído com sucesso
 *       403:
 *         description: Usuário não autorizado
 *       500:
 *         description: Erro ao excluir capítulo
 */
router.delete(
    "/:uuid_capitulo",
    autenticar,
    autorizarDono("Capitulo", "uuid_livro", "uuid_capitulo"),
    excluirCapitulo
);

module.exports = router;

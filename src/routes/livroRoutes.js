const express = require("express");
const router = express.Router();
const autenticar = require("../middlewares/autenticar");
const autorizarDono = require("../middlewares/autorizarDono");
const {
    criarLivro,
    atualizarLivro,
    excluirLivro,
    listarLivros,
    obterLivroPorUUID,
    buscarLivros,
    obterLivroPorGenero
} = require("../controllers/livroController");

/**
 * @swagger
 * /livros:
 *   post:
 *     tags: [Livros]
 *     summary: Cria um novo livro
 *     description: Permite que um usuário autenticado crie um novo livro
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               capa:
 *                 type: string
 *               generos:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Livro criado com sucesso
 *       500:
 *         description: Erro ao criar livro
 */
router.post("/", autenticar, criarLivro);

/**
 * @swagger
 * /livros:
 *   get:
 *     tags: [Livros]
 *     summary: Lista todos os livros
 *     description: Retorna todos os livros disponíveis no sistema
 *     responses:
 *       200:
 *         description: Lista de livros retornada com sucesso
 *       500:
 *         description: Erro ao obter livros
 */
router.get("/", listarLivros);

/**
 * @swagger
 * /livros/busca:
 *   get:
 *     tags: [Livros]
 *     summary: Busca livros por nome, autor ou gênero
 *     description: Realiza uma busca de livros utilizando diferentes filtros e ordenações
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Palavra-chave de busca
 *       - in: header
 *         name: filtro
 *         schema:
 *           type: string
 *         description: Define o filtro da busca ("nome", "autor" ou "genero")
 *       - in: header
 *         name: ordenar-por
 *         schema:
 *           type: string
 *         description: Critério de ordenação ("alfabetica" ou "data_criacao")
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Direção da ordenação (ascendente ou descendente)
 *     responses:
 *       200:
 *         description: Lista de livros filtrada com sucesso
 *       404:
 *         description: Nenhum livro encontrado
 *       500:
 *         description: Erro ao buscar livros
 */
router.get("/busca", buscarLivros);

router.get("/genero/:uuid_genero", obterLivroPorGenero);


/**
 * @swagger
 * /livros/{uuid_livro}:
 *   get:
 *     tags: [Livros]
 *     summary: Obtém um livro pelo UUID
 *     description: Retorna os detalhes de um livro específico
 *     parameters:
 *       - in: path
 *         name: uuid_livro
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID do livro
 *     responses:
 *       200:
 *         description: Livro encontrado
 *       404:
 *         description: Livro não encontrado
 *       500:
 *         description: Erro ao obter livro
 */
router.get("/:uuid_livro", obterLivroPorUUID);

/**
 * @swagger
 * /livros/{uuid_livro}:
 *   put:
 *     tags: [Livros]
 *     summary: Atualiza um livro existente
 *     description: Permite ao autor do livro atualizar seus detalhes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid_livro
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID do livro
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               capa:
 *                 type: string
 *               generos:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Livro atualizado com sucesso
 *       404:
 *         description: Livro não encontrado
 *       500:
 *         description: Erro ao atualizar livro
 */
router.put(
    "/:uuid_livro",
    autenticar,
    autorizarDono("Livro", "uuid_usuario", "uuid_livro"),
    atualizarLivro
);

/**
 * @swagger
 * /livros/{uuid_livro}:
 *   delete:
 *     tags: [Livros]
 *     summary: Exclui um livro
 *     description: Permite ao autor do livro excluir um livro existente
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid_livro
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID do livro
 *     responses:
 *       200:
 *         description: Livro excluído com sucesso
 *       404:
 *         description: Livro não encontrado
 *       500:
 *         description: Erro ao excluir livro
 */
router.delete(
    "/:uuid_livro",
    autenticar,
    autorizarDono("Livro", "uuid_usuario", "uuid_livro"),
    excluirLivro
);

module.exports = router;

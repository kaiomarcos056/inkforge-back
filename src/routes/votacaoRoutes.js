const express = require("express");
const router = express.Router();
const {
    criarVotacao,
    listarVotacoesPorCapitulo,
    editarVotacao,
    excluirVotacao,
    votar,
    usuarioVotacao
} = require("../controllers/votacaoController");

const autenticar = require("../middlewares/autenticar");
const autorizarDono = require("../middlewares/autorizarDono");

/**
 * @swagger
 * /votacao:
 *   post:
 *     summary: Cria uma nova votação
 *     tags: [Votações]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uuid_capitulo
 *               - titulo
 *               - data_inicio
 *               - data_fim
 *               - opcoes
 *             properties:
 *               uuid_capitulo:
 *                 type: string
 *                 format: uuid
 *                 description: UUID do capítulo onde a votação será criada.
 *               titulo:
 *                 type: string
 *                 description: Título da votação.
 *               data_inicio:
 *                 type: string
 *                 format: date-time
 *                 description: Data de início da votação.
 *               data_fim:
 *                 type: string
 *                 format: date-time
 *                 description: Data de término da votação.
 *               opcoes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     descricao:
 *                       type: string
 *                       description: Descrição da opção de voto.
 *     responses:
 *       201:
 *         description: Votação criada com sucesso.
 *       403:
 *         description: Usuário não tem permissão para criar votação.
 *       500:
 *         description: Erro ao criar votação.
 */
router.post("/", autenticar, criarVotacao);

/**
 * @swagger
 * /votacoes/votar:
 *   post:
 *     summary: Votar em uma opção de uma votação
 *     description: Permite que um usuário vote em uma das opções disponíveis na votação. Se o usuário já votou, ele pode alterar seu voto.
 *     tags: [Votações]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               uuid_votacao:
 *                 type: string
 *                 description: UUID da votação onde o usuário deseja votar
 *               opcao_index:
 *                 type: integer
 *                 description: Índice da opção escolhida
 *     responses:
 *       200:
 *         description: Voto registrado com sucesso
 *       400:
 *         description: Erro de validação ou usuário já votou nesta opção
 *       403:
 *         description: A votação já foi encerrada
 *       404:
 *         description: Votação não encontrada
 *       500:
 *         description: Erro ao registrar o voto
 */
router.post("/votar", autenticar, votar);

router.post("/usuario-votacao", usuarioVotacao);

/**
 * @swagger
 * /votacao/{uuid_capitulo}:
 *   get:
 *     summary: Lista todas as votações de um capítulo
 *     tags: [Votações]
 *     parameters:
 *       - in: path
 *         name: uuid_capitulo
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID do capítulo.
 *     responses:
 *       200:
 *         description: Lista de votações do capítulo.
 *       404:
 *         description: Nenhuma votação encontrada.
 *       500:
 *         description: Erro ao listar votações.
 */
router.get("/capitulo/:uuid_capitulo", listarVotacoesPorCapitulo);

/**
 * @swagger
 * /votacoes/{uuid_votacao}:
 *   put:
 *     summary: Editar uma votação
 *     description: Permite ao criador da votação editar título, data de início, data de fim e opções da votação.
 *     tags: [Votações]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid_votacao
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID da votação a ser editada
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 description: Novo título da votação
 *               data_inicio:
 *                 type: string
 *                 format: date-time
 *                 description: Nova data de início da votação
 *               data_fim:
 *                 type: string
 *                 format: date-time
 *                 description: Nova data de término da votação
 *               opcoes:
 *                 type: array
 *                 description: Lista de opções de votação
 *                 items:
 *                   type: object
 *                   properties:
 *                     descricao:
 *                       type: string
 *                       description: Nova descrição da opção
 *     responses:
 *       200:
 *         description: Votação editada com sucesso
 *       400:
 *         description: Erro de validação ou usuário não tem permissão para editar
 *       404:
 *         description: Votação não encontrada
 *       500:
 *         description: Erro ao editar votação
 */
router.put(
    "/:uuid_votacao",
    autenticar,
    autorizarDono("Votacao", "criador", "uuid_votacao"),
    editarVotacao
);

/**
 * @swagger
 * /votacoes/{uuid_votacao}:
 *   delete:
 *     summary: Excluir uma votação
 *     description: Permite ao criador da votação removê-la permanentemente.
 *     tags: [Votações]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid_votacao
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID da votação a ser excluída
 *     responses:
 *       200:
 *         description: Votação excluída com sucesso
 *       403:
 *         description: Usuário não tem permissão para excluir a votação
 *       404:
 *         description: Votação não encontrada
 *       500:
 *         description: Erro ao excluir votação
 */
router.delete(
    "/:uuid_votacao",
    autenticar,
    autorizarDono("Votacao", "criador", "uuid_votacao"),
    excluirVotacao
);



module.exports = router;

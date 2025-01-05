-- Tabela Plano
CREATE TABLE Plano (
    uuid_plano UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR NOT NULL,
    preco VARCHAR NOT NULL
);

-- Tabela Usuario
CREATE TABLE Usuario (
    uuid_usuario UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR NOT NULL,
    email VARCHAR NOT NULL UNIQUE,
    senha VARCHAR NOT NULL,
    tipo VARCHAR NOT NULL,
    plano VARCHAR NOT NULL,
    nivel VARCHAR NOT NULL,
    uuid_plano UUID REFERENCES Plano(uuid_plano)
);

-- Tabela Estatistica
CREATE TABLE Estatistica (
    uuid_estatistica UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid_usuario UUID REFERENCES Usuario(uuid_usuario),
    lidos INTEGER NOT NULL,
    votados INTEGER NOT NULL,
    publicados INTEGER NOT NULL
);

-- Tabela Genero
CREATE TABLE Genero (
    uuid_genero UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR NOT NULL UNIQUE
);

-- Tabela Livro
CREATE TABLE Livro (
    uuid_livro UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR NOT NULL,
    capa VARCHAR,
    uuid_usuario UUID REFERENCES Usuario(uuid_usuario)
);

-- Tabela Livro_Genero
CREATE TABLE Livro_Genero (
    uuid_livro UUID REFERENCES Livro(uuid_livro),
    uuid_genero UUID REFERENCES Genero(uuid_genero),
    PRIMARY KEY (uuid_livro, uuid_genero)
);

-- Tabela Favorito
CREATE TABLE Favorito (
    uuid_favorito UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid_usuario UUID REFERENCES Usuario(uuid_usuario),
    uuid_livro UUID REFERENCES Livro(uuid_livro)
);

-- Tabela Capitulo
CREATE TABLE Capitulo (
    uuid_capitulo UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid_livro UUID REFERENCES Livro(uuid_livro),
    titulo VARCHAR NOT NULL,
    conteudo TEXT NOT NULL
);

-- Tabela Comentario
CREATE TABLE Comentario (
    uuid_comentario UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid_capitulo UUID REFERENCES Capitulo(uuid_capitulo),
    uuid_usuario UUID REFERENCES Usuario(uuid_usuario),
    comentario VARCHAR NOT NULL
);

-- Tabela Votacao
CREATE TABLE Votacao (
    uuid_votacao UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid_capitulo UUID REFERENCES Capitulo(uuid_capitulo),
    titulo VARCHAR NOT NULL,
    status VARCHAR NOT NULL,
    criador UUID REFERENCES Usuario(uuid_usuario),
    data_inicio TIMESTAMP NOT NULL,
    data_fim TIMESTAMP
);

-- Tabela Item_Votacao
CREATE TABLE Item_Votacao (
    uuid_item UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid_votacao UUID REFERENCES Votacao(uuid_votacao),
    descricao VARCHAR NOT NULL,
    qtd_votos INTEGER NOT NULL DEFAULT 0,
    indicacao UUID REFERENCES Usuario(uuid_usuario)
);

-- Geração de Massa

-- Plano
INSERT INTO Plano (nome, preco) VALUES ('Free', '0');
INSERT INTO Plano (nome, preco) VALUES ('Premium', '9.99');

-- Genero
INSERT INTO Genero (nome) VALUES ('Fantasia');
INSERT INTO Genero (nome) VALUES ('Ficção Científica');
INSERT INTO Genero (nome) VALUES ('Romance');
INSERT INTO Genero (nome) VALUES ('Terror');

-- Usuario
INSERT INTO Usuario (nome, email, senha, tipo, plano, nivel, uuid_plano)
VALUES ('Max', 'max@example.com', 'password123', 'autor', 'premium', 'ouro', (SELECT uuid_plano FROM Plano WHERE nome = 'Premium'));
INSERT INTO Usuario (nome, email, senha, tipo, plano, nivel, uuid_plano)
VALUES ('Kaio', 'kaio@example.com', 'password123', 'leitor', 'free', 'bronze', (SELECT uuid_plano FROM Plano WHERE nome = 'Free'));

-- Livro
INSERT INTO Livro (nome, capa, uuid_usuario)
VALUES ('A Jornada do Herói', 'url_da_capa', (SELECT uuid_usuario FROM Usuario WHERE nome = 'Max'));
INSERT INTO Livro (nome, capa, uuid_usuario)
VALUES ('Espaço Infinito', 'url_da_capa', (SELECT uuid_usuario FROM Usuario WHERE nome = 'Max'));

-- Livro_Genero
INSERT INTO Livro_Genero (uuid_livro, uuid_genero)
VALUES ((SELECT uuid_livro FROM Livro WHERE nome = 'A Jornada do Herói'), (SELECT uuid_genero FROM Genero WHERE nome = 'Fantasia'));
INSERT INTO Livro_Genero (uuid_livro, uuid_genero)
VALUES ((SELECT uuid_livro FROM Livro WHERE nome = 'Espaço Infinito'), (SELECT uuid_genero FROM Genero WHERE nome = 'Ficção Científica'));

-- Capitulo
INSERT INTO Capitulo (uuid_livro, titulo, conteudo)
VALUES ((SELECT uuid_livro FROM Livro WHERE nome = 'A Jornada do Herói'), 'Capítulo 1 - O Início', 'Era uma vez...');
INSERT INTO Capitulo (uuid_livro, titulo, conteudo)
VALUES ((SELECT uuid_livro FROM Livro WHERE nome = 'A Jornada do Herói'), 'Capítulo 2 - A Jornada Continua', 'O herói enfrentou desafios...');

-- Comentario
INSERT INTO Comentario (uuid_capitulo, uuid_usuario, comentario)
VALUES ((SELECT uuid_capitulo FROM Capitulo WHERE titulo = 'Capítulo 1 - O Início'), (SELECT uuid_usuario FROM Usuario WHERE nome = 'Kaio'), 'Adorei o capítulo!');
INSERT INTO Comentario (uuid_capitulo, uuid_usuario, comentario)
VALUES ((SELECT uuid_capitulo FROM Capitulo WHERE titulo = 'Capítulo 2 - A Jornada Continua'), (SELECT uuid_usuario FROM Usuario WHERE nome = 'Kaio'), 'Mal posso esperar pelo próximo.');

-- Estatistica
INSERT INTO Estatistica (uuid_usuario, lidos, votados, publicados)
VALUES ((SELECT uuid_usuario FROM Usuario WHERE nome = 'Max'), 5, 3, 2);
INSERT INTO Estatistica (uuid_usuario, lidos, votados, publicados)
VALUES ((SELECT uuid_usuario FROM Usuario WHERE nome = 'Kaio'), 10, 5, 0);

-- Votacao
INSERT INTO Votacao (uuid_capitulo, titulo, status, criador, data_inicio, data_fim)
VALUES ((SELECT uuid_capitulo FROM Capitulo WHERE titulo = 'Capítulo 1 - O Início'), 'Escolha o que o personagem fará:', 'aberta', (SELECT uuid_usuario FROM Usuario WHERE nome = 'Max'), '2025-01-01 00:00:00', '2025-01-10 23:59:59');

-- Item_Votacao
INSERT INTO Item_Votacao (uuid_votacao, descricao, qtd_votos, indicacao)
VALUES ((SELECT uuid_votacao FROM Votacao WHERE titulo = 'Escolha o que o personagem fará:'), 'O herói abandona seu aliado', 10, (SELECT uuid_usuario FROM Usuario WHERE nome = 'Kaio'));
INSERT INTO Item_Votacao (uuid_votacao, descricao, qtd_votos, indicacao)
VALUES ((SELECT uuid_votacao FROM Votacao WHERE titulo = 'Escolha o que o personagem fará:'), 'O herói se junta ao aliado e enfrenta o vilão', 5, (SELECT uuid_usuario FROM Usuario WHERE nome = 'Kaio'));

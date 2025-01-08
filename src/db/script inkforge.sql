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
    uuid_usuario UUID REFERENCES Usuario(uuid_usuario) ON DELETE CASCADE,
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
    uuid_livro UUID REFERENCES Livro(uuid_livro) ON DELETE CASCADE,
    uuid_genero UUID REFERENCES Genero(uuid_genero) ON DELETE CASCADE,
    PRIMARY KEY (uuid_livro, uuid_genero)
);

-- Tabela Favorito
CREATE TABLE Favorito (
    uuid_favorito UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid_usuario UUID REFERENCES Usuario(uuid_usuario) ON DELETE CASCADE,
    uuid_livro UUID REFERENCES Livro(uuid_livro) ON DELETE CASCADE
);

-- Tabela Capitulo
CREATE TABLE Capitulo (
    uuid_capitulo UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid_livro UUID REFERENCES Livro(uuid_livro) ON DELETE CASCADE,
    titulo VARCHAR NOT NULL,
    conteudo TEXT NOT NULL
);

-- Tabela Comentario
CREATE TABLE Comentario (
    uuid_comentario UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid_capitulo UUID REFERENCES Capitulo(uuid_capitulo) ON DELETE CASCADE,
    uuid_usuario UUID REFERENCES Usuario(uuid_usuario) ON DELETE CASCADE,
    comentario VARCHAR NOT NULL
);

-- Tabela Votacao
CREATE TABLE Votacao (
    uuid_votacao UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid_capitulo UUID REFERENCES Capitulo(uuid_capitulo) ON DELETE CASCADE,
    titulo VARCHAR NOT NULL,
    status VARCHAR NOT NULL,
    criador UUID REFERENCES Usuario(uuid_usuario),
    data_inicio TIMESTAMP NOT NULL,
    data_fim TIMESTAMP
);

-- Tabela Item_Votacao
CREATE TABLE Item_Votacao (
    uuid_item UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid_votacao UUID REFERENCES Votacao(uuid_votacao) ON DELETE CASCADE,
    descricao VARCHAR NOT NULL,
    qtd_votos INTEGER NOT NULL DEFAULT 0,
    indicacao UUID REFERENCES Usuario(uuid_usuario)
);


-- Geração de Massa

-- Plano
INSERT INTO Plano (nome, preco) VALUES ('Free', '0');
INSERT INTO Plano (nome, preco) VALUES ('Premium', '9.99');
INSERT INTO Plano (nome, preco) VALUES ('Pro', '19.99');

-- Usuario
INSERT INTO Usuario (nome, email, senha, tipo, plano, nivel, uuid_plano)
VALUES ('Max', 'max@example.com', 'senha123', 'autor', 'Premium', 'ouro', (SELECT uuid_plano FROM Plano WHERE nome = 'Premium'));
INSERT INTO Usuario (nome, email, senha, tipo, plano, nivel, uuid_plano)
VALUES ('Luana', 'luana@example.com', 'senha456', 'leitor', 'Free', 'bronze', (SELECT uuid_plano FROM Plano WHERE nome = 'Free'));
INSERT INTO Usuario (nome, email, senha, tipo, plano, nivel, uuid_plano)
VALUES ('Kaio', 'kaio@example.com', 'senha789', 'autor', 'Pro', 'prata', (SELECT uuid_plano FROM Plano WHERE nome = 'Pro'));
INSERT INTO Usuario (nome, email, senha, tipo, plano, nivel, uuid_plano)
VALUES ('Pedro', 'pedro@example.com', 'senha321', 'leitor', 'Premium', 'prata', (SELECT uuid_plano FROM Plano WHERE nome = 'Premium'));

-- Estatistica
INSERT INTO Estatistica (uuid_usuario, lidos, votados, publicados)
VALUES ((SELECT uuid_usuario FROM Usuario WHERE email = 'max@example.com'), 10, 5, 3);
INSERT INTO Estatistica (uuid_usuario, lidos, votados, publicados)
VALUES ((SELECT uuid_usuario FROM Usuario WHERE email = 'luana@example.com'), 20, 10, 0);
INSERT INTO Estatistica (uuid_usuario, lidos, votados, publicados)
VALUES ((SELECT uuid_usuario FROM Usuario WHERE email = 'kaio@example.com'), 15, 8, 2);
INSERT INTO Estatistica (uuid_usuario, lidos, votados, publicados)
VALUES ((SELECT uuid_usuario FROM Usuario WHERE email = 'pedro@example.com'), 25, 12, 0);

-- Genero
INSERT INTO Genero (nome) VALUES ('Fantasia');
INSERT INTO Genero (nome) VALUES ('Terror');
INSERT INTO Genero (nome) VALUES ('Romance');

-- Livro
INSERT INTO Livro (nome, capa, uuid_usuario)
VALUES ('Viagem Fantástica', 'url_capa_fantastica', (SELECT uuid_usuario FROM Usuario WHERE email = 'max@example.com'));
INSERT INTO Livro (nome, capa, uuid_usuario)
VALUES ('Mistérios da Noite', 'url_capa_noite', (SELECT uuid_usuario FROM Usuario WHERE email = 'max@example.com'));
INSERT INTO Livro (nome, capa, uuid_usuario)
VALUES ('Amor Além do Tempo', 'url_capa_amor', (SELECT uuid_usuario FROM Usuario WHERE email = 'kaio@example.com'));

-- Livro_Genero
INSERT INTO Livro_Genero (uuid_livro, uuid_genero)
VALUES ((SELECT uuid_livro FROM Livro WHERE nome = 'Viagem Fantástica'), (SELECT uuid_genero FROM Genero WHERE nome = 'Fantasia'));
INSERT INTO Livro_Genero (uuid_livro, uuid_genero)
VALUES ((SELECT uuid_livro FROM Livro WHERE nome = 'Mistérios da Noite'), (SELECT uuid_genero FROM Genero WHERE nome = 'Terror'));
INSERT INTO Livro_Genero (uuid_livro, uuid_genero)
VALUES ((SELECT uuid_livro FROM Livro WHERE nome = 'Amor Além do Tempo'), (SELECT uuid_genero FROM Genero WHERE nome = 'Romance'));

-- Favorito
INSERT INTO Favorito (uuid_usuario, uuid_livro)
VALUES ((SELECT uuid_usuario FROM Usuario WHERE email = 'luana@example.com'), (SELECT uuid_livro FROM Livro WHERE nome = 'Viagem Fantástica'));
INSERT INTO Favorito (uuid_usuario, uuid_livro)
VALUES ((SELECT uuid_usuario FROM Usuario WHERE email = 'luana@example.com'), (SELECT uuid_livro FROM Livro WHERE nome = 'Mistérios da Noite'));
INSERT INTO Favorito (uuid_usuario, uuid_livro)
VALUES ((SELECT uuid_usuario FROM Usuario WHERE email = 'max@example.com'), (SELECT uuid_livro FROM Livro WHERE nome = 'Amor Além do Tempo'));

-- Capitulo
INSERT INTO Capitulo (uuid_livro, titulo, conteudo)
VALUES ((SELECT uuid_livro FROM Livro WHERE nome = 'Viagem Fantástica'), 'Capítulo 1 - A Jornada Começa', 'Era uma vez...');
INSERT INTO Capitulo (uuid_livro, titulo, conteudo)
VALUES ((SELECT uuid_livro FROM Livro WHERE nome = 'Mistérios da Noite'), 'Capítulo 1 - O Mistério', 'A noite estava escura...');
INSERT INTO Capitulo (uuid_livro, titulo, conteudo)
VALUES ((SELECT uuid_livro FROM Livro WHERE nome = 'Amor Além do Tempo'), 'Capítulo 1 - O Encontro', 'Eles se conheceram em um dia chuvoso...');

-- Comentario
INSERT INTO Comentario (uuid_capitulo, uuid_usuario, comentario)
VALUES ((SELECT uuid_capitulo FROM Capitulo WHERE titulo = 'Capítulo 1 - A Jornada Começa'), (SELECT uuid_usuario FROM Usuario WHERE email = 'luana@example.com'), 'Que capítulo incrível!');
INSERT INTO Comentario (uuid_capitulo, uuid_usuario, comentario)
VALUES ((SELECT uuid_capitulo FROM Capitulo WHERE titulo = 'Capítulo 1 - O Mistério'), (SELECT uuid_usuario FROM Usuario WHERE email = 'kaio@example.com'), 'Mal posso esperar pelo próximo!');
INSERT INTO Comentario (uuid_capitulo, uuid_usuario, comentario)
VALUES ((SELECT uuid_capitulo FROM Capitulo WHERE titulo = 'Capítulo 1 - O Encontro'), (SELECT uuid_usuario FROM Usuario WHERE email = 'luana@example.com'), 'Que história emocionante!');

-- Votacao
INSERT INTO Votacao (uuid_capitulo, titulo, status, criador, data_inicio, data_fim)
VALUES ((SELECT uuid_capitulo FROM Capitulo WHERE titulo = 'Capítulo 1 - A Jornada Começa'), 'O que o personagem fará agora?', 'aberta', (SELECT uuid_usuario FROM Usuario WHERE email = 'max@example.com'), '2025-01-01 00:00:00', '2025-01-07 23:59:59');
INSERT INTO Votacao (uuid_capitulo, titulo, status, criador, data_inicio, data_fim)
VALUES ((SELECT uuid_capitulo FROM Capitulo WHERE titulo = 'Capítulo 1 - O Mistério'), 'Como resolver o mistério?', 'aberta', (SELECT uuid_usuario FROM Usuario WHERE email = 'max@example.com'), '2025-01-01 00:00:00', '2025-01-07 23:59:59');
INSERT INTO Votacao (uuid_capitulo, titulo, status, criador, data_inicio, data_fim)
VALUES ((SELECT uuid_capitulo FROM Capitulo WHERE titulo = 'Capítulo 1 - O Encontro'), 'Deveriam se encontrar novamente?', 'aberta', (SELECT uuid_usuario FROM Usuario WHERE email = 'kaio@example.com'), '2025-01-01 00:00:00', '2025-01-07 23:59:59');

-- Item_Votacao
INSERT INTO Item_Votacao (uuid_votacao, descricao, qtd_votos, indicacao)
VALUES ((SELECT uuid_votacao FROM Votacao WHERE titulo = 'O que o personagem fará agora?'), 'Ele decide explorar a floresta', 5, (SELECT uuid_usuario FROM Usuario WHERE email = 'luana@example.com'));
INSERT INTO Item_Votacao (uuid_votacao, descricao, qtd_votos, indicacao)
VALUES ((SELECT uuid_votacao FROM Votacao WHERE titulo = 'Como resolver o mistério?'), 'Através de uma pista secreta', 10, (SELECT uuid_usuario FROM Usuario WHERE email = 'kaio@example.com'));
INSERT INTO Item_Votacao (uuid_votacao, descricao, qtd_votos, indicacao)
VALUES ((SELECT uuid_votacao FROM Votacao WHERE titulo = 'Deveriam se encontrar novamente?'), 'Sim, no mesmo lugar', 7, (SELECT uuid_usuario FROM Usuario WHERE email = 'max@example.com'));

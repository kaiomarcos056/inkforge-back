-- Criar a tabela Plano
CREATE TABLE Plano (
    uuid_plano UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR NOT NULL,
    preco VARCHAR NOT NULL,
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_atualizado TIMESTAMP DEFAULT NOW()
);

-- Criar a tabela Usuario
CREATE TABLE Usuario (
    uuid_usuario UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR NOT NULL,
    email VARCHAR NOT NULL UNIQUE,
    senha VARCHAR NOT NULL,
    tipo VARCHAR NOT NULL,
    plano VARCHAR NOT NULL,
    nivel VARCHAR NOT NULL,
    foto VARCHAR,
    descricao VARCHAR,
    uuid_plano UUID REFERENCES Plano(uuid_plano),
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_atualizado TIMESTAMP DEFAULT NOW()
);

-- Criar a tabela Estatistica
CREATE TABLE Estatistica (
    uuid_estatistica UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid_usuario UUID REFERENCES Usuario(uuid_usuario) ON DELETE CASCADE,
    lidos INTEGER NOT NULL,
    votados INTEGER NOT NULL,
    publicados INTEGER NOT NULL,
    data_atualizado TIMESTAMP DEFAULT NOW()
);

-- Criar a tabela Genero
CREATE TABLE Genero (
    uuid_genero UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR NOT NULL UNIQUE,
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_atualizado TIMESTAMP DEFAULT NOW()
);

-- Cria a tabela de Interesse
CREATE TABLE Interesse (
    uuid_interesse UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR NOT NULL UNIQUE,
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_atualizado TIMESTAMP DEFAULT NOW()
);

-- Criar a tabela Usuario_Interesse
CREATE TABLE Usuario_Interesse (
    uuid_usuario UUID REFERENCES Usuario(uuid_usuario) ON DELETE CASCADE,
    uuid_interesse UUID REFERENCES Interesse(uuid_interesse) ON DELETE CASCADE,
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_atualizado TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (uuid_usuario, uuid_interesse)
);

-- Criar a tabela Livro
CREATE TABLE Livro (
    uuid_livro UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR NOT NULL,
    capa VARCHAR,
	descricao VARCHAR,
    uuid_usuario UUID REFERENCES Usuario(uuid_usuario),
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_atualizado TIMESTAMP DEFAULT NOW()
);

-- Criar a tabela Livro_Genero
CREATE TABLE Livro_Genero (
    uuid_livro UUID REFERENCES Livro(uuid_livro) ON DELETE CASCADE,
    uuid_genero UUID REFERENCES Genero(uuid_genero) ON DELETE CASCADE,
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_atualizado TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (uuid_livro, uuid_genero)
);

-- Criar a tabela Favorito
CREATE TABLE Favorito (
    uuid_favorito UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid_usuario UUID REFERENCES Usuario(uuid_usuario) ON DELETE CASCADE,
    uuid_livro UUID REFERENCES Livro(uuid_livro) ON DELETE CASCADE,
    data_criacao TIMESTAMP DEFAULT NOW()
);

-- Criar a tabela Capitulo
CREATE TABLE Capitulo (
    uuid_capitulo UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid_livro UUID REFERENCES Livro(uuid_livro) ON DELETE CASCADE,
    titulo VARCHAR NOT NULL,
	descricao VARCHAR,
    conteudo TEXT NOT NULL,
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_atualizado TIMESTAMP DEFAULT NOW()
);

ALTER TABLE capitulo
ADD COLUMN finalizado BOOLEAN DEFAULT FALSE;

-- Criar a tabela Comentario
CREATE TABLE Comentario (
    uuid_comentario UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid_capitulo UUID REFERENCES Capitulo(uuid_capitulo) ON DELETE CASCADE,
    uuid_usuario UUID REFERENCES Usuario(uuid_usuario) ON DELETE CASCADE,
    comentario VARCHAR NOT NULL,
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_atualizado TIMESTAMP DEFAULT NOW()
);

-- Criar a tabela Votacao
CREATE TABLE Votacao (
    uuid_votacao UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid_capitulo UUID REFERENCES Capitulo(uuid_capitulo) ON DELETE CASCADE,
    titulo VARCHAR NOT NULL,
    status VARCHAR NOT NULL,
    criador UUID REFERENCES Usuario(uuid_usuario),
    data_inicio TIMESTAMP NOT NULL,
    data_fim TIMESTAMP,
    opcoes JSONB NOT NULL DEFAULT '[]',
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_atualizado TIMESTAMP DEFAULT NOW()
);

-- Criar a tabela Voto_Usuario
CREATE TABLE Voto_Usuario (
    uuid_voto UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid_usuario UUID REFERENCES Usuario(uuid_usuario) ON DELETE CASCADE,
    uuid_votacao UUID REFERENCES Votacao(uuid_votacao) ON DELETE CASCADE,
    opcao_escolhida VARCHAR NOT NULL,
    data_criacao TIMESTAMP DEFAULT NOW(),
    UNIQUE (uuid_usuario, uuid_votacao)
);

-- Criar a tabela de historico
CREATE TABLE Historico (
    uuid_historico UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid_capitulo UUID REFERENCES capitulo(uuid_capitulo) ON DELETE CASCADE,
    uuid_usuario UUID REFERENCES usuario(uuid_usuario) ON DELETE CASCADE,
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_atualizado TIMESTAMP DEFAULT NOW()
);

-- Inserindo generos
INSERT INTO genero(nome) VALUES 
('Horror'),
('Suspense'),
('Fantasia'),
('Romance'),
('Aventura'),
('Mistério')
('Terror'), 
('Comédia'), 
('Infantil'), 
('Drama')



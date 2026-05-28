-- Por que: Altera a sessao do Oracle para apontar para a Pluggable Database (PDB) padrao de desenvolvimento.
ALTER SESSION SET CONTAINER = FREEPDB1;

-- Por que: Cria o usuario CHRONOS com a senha operacional padrao e associa ao espaco de tabelas USERS.
CREATE USER CHRONOS IDENTIFIED BY ChronosPass123! DEFAULT TABLESPACE USERS QUOTA UNLIMITED ON USERS;

-- Por que: Concede as permissoes necessarias para conexao, definicao de recursos e administracao de objetos.
GRANT CONNECT, RESOURCE, DBA TO CHRONOS;

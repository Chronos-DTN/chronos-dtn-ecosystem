#!/bin/bash
# Por que: Script Bash para rodar os arquivos SQL do ChronosDTN usando o usuario CHRONOS recem-criado.
echo "Iniciando a carga de schema e data sob o usuario CHRONOS..."
# Por que: Executa o schema.sql conectando com o usuario CHRONOS na base local FREEPDB1.
sqlplus CHRONOS/ChronosPass123!@FREEPDB1 @/opt/oracle/scripts/schema.sql
# Por que: Executa o data.sql populando as 6 tabelas com 80 registros.
sqlplus CHRONOS/ChronosPass123!@FREEPDB1 @/opt/oracle/scripts/data.sql
# Por que: Executa o plsql.sql para registrar as procedures e blocos de processamento espacial.
sqlplus CHRONOS/ChronosPass123!@FREEPDB1 @/opt/oracle/scripts/plsql.sql

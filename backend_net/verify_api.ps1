# verify_api.ps1
# Por que: Script de teste automatizado para validar o fluxo do gateway financeiro ChronosDTN.

# Por que: Define a URL de login da API.
$loginUrl = "http://localhost:5056/api/auth/login"

# Por que: Prepara o payload de login com as credenciais padrão do operador.
$loginBody = @{
    username = "operator"
    password = "space_dtn_2026"
} | ConvertTo-Json

# Por que: Define os cabeçalhos padrão da requisição de login.
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "============================================="
Write-Host "1. Efetuando login na API do ChronosDTN..."
Write-Host "============================================="
# Por que: Faz a requisição POST para obter o token JWT.
$loginResponse = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $loginBody -Headers $headers
$token = $loginResponse.token
Write-Host "Token JWT recebido com sucesso!"

# Por que: Define os cabeçalhos de autorização com o token JWT.
$authHeaders = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "`n============================================="
Write-Host "2. Criando transação entre Terra e Lua (Cross-Node)..."
Write-Host "============================================="
# Por que: Configura os dados da transação cross-node (conta 101 da Terra para a 201 da Lua).
$txUrl = "http://localhost:5056/api/transactions"
$txBody = @{
    sourceAccountId = 101
    destAccountId = 201
    amount = 5000.00
    priority = 2
} | ConvertTo-Json

# Por que: Faz a requisição POST para registrar a transação e enfileirar o bundle.
$txResponse = Invoke-RestMethod -Uri $txUrl -Method Post -Body $txBody -Headers $authHeaders
Write-Host "Transação enviada!"
$txResponse | ConvertTo-Json -Depth 5

Write-Host "`n============================================="
Write-Host "3. Consultando fila de pacotes (Bundles) no buffer..."
Write-Host "============================================="
# Por que: Consulta os bundles armazenados no gateway.
$bundlesUrl = "http://localhost:5056/api/bundles"
$bundles = Invoke-RestMethod -Uri $bundlesUrl -Method Get -Headers $authHeaders
$bundles | ConvertTo-Json -Depth 5

Write-Host "`n============================================="
Write-Host "4. Simulando a Transmissão Orbital (Rádio Link UP)..."
Write-Host "============================================="
# Por que: Faz a requisição POST para forçar a simulação de rádio-link e transmissão.
$transmitUrl = "http://localhost:5056/api/bundles/transmit"
$transmitResponse = Invoke-RestMethod -Uri $transmitUrl -Method Post -Headers $authHeaders
$transmitResponse | ConvertTo-Json -Depth 5

Write-Host "`n============================================="
Write-Host "5. Verificando Status das Transações Reconciliadas..."
Write-Host "============================================="
# Por que: Consulta novamente as transações pós-transmissão.
$txsAfter = Invoke-RestMethod -Uri $txUrl -Method Get -Headers $authHeaders
$txsAfter | ConvertTo-Json -Depth 5

Write-Host "`n============================================="
Write-Host "6. Verificando Status dos Bundles Pós-Envio..."
Write-Host "============================================="
# Por que: Consulta novamente os bundles pós-transmissão.
$bundlesAfter = Invoke-RestMethod -Uri $bundlesUrl -Method Get -Headers $authHeaders
$bundlesAfter | ConvertTo-Json -Depth 5
Write-Host "============================================="
Write-Host "Verificação finalizada com sucesso!"
Write-Host "============================================="

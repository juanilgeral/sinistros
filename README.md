# Sistema de Sinistros — Juanil Transportes Rodoviários

PWA para cadastro, consulta e acompanhamento de sinistros/colisões
envolvendo a frota, com anexo de documentos e fotos. Estrutura do
relatório segue a ordem de campos do formulário oficial E-BRAT (PMERJ).

## Telas

- `login.html` — acesso restrito (e-mail/senha do Firebase Auth)
- `index.html` — lista de processos, com busca por protocolo, placa
  ou nome, e filtro por status
- `form.html` — cadastro/edição de um sinistro, em 8 abas que seguem
  a mesma ordem do PDF/relatório: Ocorrência, Caminhão Juanil,
  Veículo Terceiro, Testemunhas, Relato, Documentos, Orçamentos, Status
- `detalhe.html` — renderiza o relatório completo (mesma estrutura
  do PDF), com botão "Imprimir / Salvar PDF" (usa o diálogo de
  impressão do navegador, já com CSS de impressão pronta) e botão
  para editar ou excluir o processo

## Funcionalidades adicionadas após o primeiro relatório real

- **Dois protocolos de E-BRAT**: como cada parte (terceiro e Juanil)
  costuma abrir o próprio E-BRAT junto à PMERJ, a aba "Documentos"
  tem campos separados para o protocolo de cada um, e ambos aparecem
  na Seção 6 do relatório.
- **Alerta de orçamento sem CNPJ**: a exigência padrão da Juanil é
  que todo orçamento formal venha com CNPJ ativo da oficina. Se o
  campo CNPJ de um orçamento ficar em branco, o formulário mostra
  "⚠ sem CNPJ — não conforme" ao lado do campo, e o relatório calcula
  o "menor orçamento" só entre os que têm CNPJ preenchido — avisando
  separadamente se existir um orçamento mais barato porém irregular
  (como aconteceu no caso Bragança Auto Center).
- **Comunicações recebidas**: repetidor na aba "Relato" para colar
  e-mails/mensagens recebidas das partes (ex.: pedido de urgência do
  terceiro). Aparecem citadas, com data e remetente, na Seção 7 do
  relatório.

## Como cada processo é identificado

Ao salvar um sinistro pela primeira vez, o sistema gera automaticamente
um número de protocolo no formato `SIN-2026-0001` (sequencial por ano,
usando uma transação no Firestore para nunca duplicar). Esse protocolo
é o ID do documento no Firestore e também o nome da pasta dos anexos
no Storage — é possível localizar um processo digitando o protocolo
na busca da tela inicial.

## Passo a passo para colocar no ar

1. **Criar o projeto Firebase**
   - Acesse https://console.firebase.google.com → "Adicionar projeto"
   - Ative o **plano Blaze** (necessário para usar o Storage — o plano
     gratuito não permite upload de arquivos). É pago por uso; para o
     volume de uma empresa pequena, o custo tende a ficar bem baixo.

2. **Ativar os serviços no console**
   - Firestore Database → criar banco (modo produção, região
     `southamerica-east1` recomendada, mesma do frota-field)
   - Storage → ativar
   - Authentication → método "E-mail/senha" → ativar

3. **Criar os usuários da equipe**
   - Authentication → Users → Add user, um para cada pessoa que vai
     acessar (operacional, jurídico, diretoria etc.)

4. **Pegar as credenciais do app Web**
   - Configurações do projeto → Seus apps → ícone Web (`</>`) →
     registrar app → copiar o objeto `firebaseConfig`
   - Colar em `firebase-config.js`, substituindo os valores de exemplo

5. **Publicar as regras de segurança**
   - Copiar o conteúdo de `firestore.rules` para Firestore → Regras → Publicar
   - Copiar o conteúdo de `storage.rules` para Storage → Regras → Publicar
   - (Ou, se preferir usar o Firebase CLI: `firebase deploy --only firestore:rules,storage`)

6. **Publicar no GitHub Pages**
   - Criar um repositório (ex.: `juanilgeral/sinistros`)
   - Subir todos os arquivos desta pasta na raiz (ou em `/docs`)
   - Settings → Pages → escolher a branch/pasta → salvar
   - O sistema fica disponível em algo como
     `https://juanilgeral.github.io/sinistros/`

7. **Testar**
   - Acessar `login.html`, entrar com um dos usuários criados
   - Cadastrar um sinistro de teste em `form.html`, conferir o
     relatório em `detalhe.html` e o botão de impressão/PDF

## Sobre os anexos

Cada categoria de documento (E-BRAT, CNH, RG, CPF, comprovante de
residência, CRLV, orçamentos, fotos dos danos, outros) tem sua própria
área de upload dentro da aba "Documentos" do formulário. Os arquivos
ficam no Firebase Storage em:

```
sinistros/{protocolo}/{categoria}/{timestamp}_{nome-do-arquivo}
```

Isso permite que qualquer pessoa autorizada da empresa, ao abrir o
processo pelo protocolo, veja e baixe todos os arquivos daquele
sinistro — como uma consulta de processo.

## Limitações conhecidas / próximos passos possíveis

- O comparativo de orçamentos e o checklist de documentos são
  calculados a partir do que foi preenchido/anexado — não há
  validação de formato de arquivo além do limite de 20MB por arquivo
  definido em `storage.rules`.
- Não há, por enquanto, exportação em lote (todos os processos) nem
  um segundo nível de permissão (ex.: só leitura para alguns
  usuários) — hoje qualquer usuário autenticado pode ler e editar
  qualquer processo. Se precisar de permissões diferentes por cargo,
  dá para evoluir `firestore.rules` para checar um campo de "papel"
  gravado em `/usuarios/{uid}`, no mesmo padrão já usado no projeto
  frota-field.
- O botão "Imprimir / Salvar PDF" usa a função de impressão do
  próprio navegador (não gera o arquivo automaticamente no servidor).
  Isso evita depender de bibliotecas extras, mas o resultado pode
  variar levemente entre navegadores.

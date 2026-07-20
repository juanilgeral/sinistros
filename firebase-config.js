// ============================================================
// Sistema de Sinistros — Juanil Transportes Rodoviários
// Configuração do Firebase (compartilhada por todas as páginas)
// ============================================================
//
// COMO CONFIGURAR:
// 1. Acesse https://console.firebase.google.com e crie um projeto
//    (ex.: "juanil-sinistros"), ou reutilize um projeto existente.
// 2. Ative no console: Firestore Database, Storage e Authentication
//    (método de login: E-mail/senha).
// 3. Em "Configurações do projeto" > "Seus apps" > Web (</>),
//    copie o objeto firebaseConfig e cole abaixo, substituindo
//    os valores de exemplo.
// 4. IMPORTANTE: o plano gratuito (Spark) do Firebase NÃO permite
//    Storage em projetos novos. Como este sistema guarda arquivos
//    (fotos, CNH, CRLV etc.), é necessário o plano Blaze (pago por
//    uso — o mesmo já usado no projeto frota-field). Sem isso, o
//    upload de anexos não funciona.
// 5. Publique as regras de segurança inclusas em firestore.rules
//    e storage.rules (Firebase Console > Firestore/Storage > Regras,
//    ou via Firebase CLI: firebase deploy --only firestore:rules,storage).
// 6. Crie os usuários autorizados em Authentication > Users
//    (um e-mail/senha para cada pessoa da empresa que vai acessar).
//
// ============================================================

export const firebaseConfig = {
  apiKey: "COLOQUE_AQUI_SUA_API_KEY",
  authDomain: "juanil-sinistros.firebaseapp.com",
  projectId: "juanil-sinistros",
  storageBucket: "juanil-sinistros.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:xxxxxxxxxxxxxxxxxxxxxx"
};

// Nome da coleção no Firestore onde os sinistros são gravados.
export const COLLECTION = "sinistros";

// Prefixo do número de protocolo gerado automaticamente.
// Formato final: SIN-2026-0001
export const PROTOCOLO_PREFIXO = "SIN";

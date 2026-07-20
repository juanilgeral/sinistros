// ============================================================
// Sistema de Sinistros — Juanil Transportes Rodoviários
// Núcleo: inicialização do Firebase, autenticação e helpers.
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc,
  deleteDoc, query, orderBy, limit as fsLimit, serverTimestamp, runTransaction
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import {
  getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

import { firebaseConfig, COLLECTION, PROTOCOLO_PREFIXO } from "./firebase-config.js";

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  query, orderBy, fsLimit, serverTimestamp, runTransaction,
  ref, uploadBytesResumable, getDownloadURL, deleteObject,
  signInWithEmailAndPassword, signOut, onAuthStateChanged
};

export const SINISTROS_COL = collection(db, COLLECTION);

/* ---------------- Autenticação: protege qualquer página ---------------- */
export function protegerPagina(callback) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      if (!location.pathname.endsWith("login.html")) {
        location.href = "login.html";
      }
    } else {
      callback(user);
    }
  });
}

/* ---------------- Geração de número de protocolo ---------------- */
// Formato: SIN-2026-0001 — sequencial por ano, usando um contador
// em /contadores/{ano} dentro de uma transação (evita duplicidade
// mesmo com dois usuários criando ao mesmo tempo).
export async function gerarProtocolo() {
  const ano = new Date().getFullYear();
  const contadorRef = doc(db, "contadores", String(ano));
  const numero = await runTransaction(db, async (tx) => {
    const snap = await tx.get(contadorRef);
    const atual = snap.exists() ? snap.data().ultimo || 0 : 0;
    const proximo = atual + 1;
    tx.set(contadorRef, { ultimo: proximo }, { merge: true });
    return proximo;
  });
  return `${PROTOCOLO_PREFIXO}-${ano}-${String(numero).padStart(4, "0")}`;
}

/* ---------------- Helpers de formatação ---------------- */
export function fmtData(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function fmtDinheiro(valor) {
  const n = parseFloat(valor);
  if (isNaN(n)) return "";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function campoOuPendente(valor, textoVazio = "Não informado — pendente") {
  if (valor === undefined || valor === null || String(valor).trim() === "") {
    return `<span class="pend">${textoVazio}</span>`;
  }
  return escapeHtml(String(valor));
}

export function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

export function toast(msg, tipo = "") {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = "toast show" + (tipo ? " " + tipo : "");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 3200);
}

export function statusBadge(status) {
  const map = {
    aberto: ["badge-aberto", "Aberto"],
    juridico: ["badge-juridico", "Com o jurídico"],
    concluido: ["badge-concluido", "Concluído"]
  };
  const [cls, label] = map[status] || map.aberto;
  return `<span class="badge ${cls}">${label}</span>`;
}

/* ---------------- Upload de anexos ---------------- */
// Faz upload de um arquivo para /sinistros/{protocolo}/{categoria}/{arquivo}
// e retorna {nome, url, categoria, tamanho, path}. onProgress(pct) opcional.
export function uploadAnexo(protocolo, categoria, file, onProgress) {
  return new Promise((resolve, reject) => {
    const path = `sinistros/${protocolo}/${categoria}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file);
    task.on(
      "state_changed",
      (snap) => {
        if (onProgress) onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
      },
      (err) => reject(err),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve({ nome: file.name, url, categoria, tamanho: file.size, path });
      }
    );
  });
}

export async function removerAnexo(path) {
  try {
    await deleteObject(ref(storage, path));
  } catch (e) {
    console.warn("Falha ao remover arquivo do Storage (pode já ter sido removido):", e);
  }
}

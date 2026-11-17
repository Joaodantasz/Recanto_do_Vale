/* Administração do calendário.
   Esta página NÃO altera o site sozinha: ela gera o arquivo datas.js,
   que você envia para o site no lugar do antigo. */

const MESES = document.getElementById("meses");
const LISTA = document.getElementById("lista");
const STATUS = document.getElementById("status");
const AVISO = document.getElementById("aviso");
const CAMPO_DE = document.getElementById("de");
const CAMPO_ATE = document.getElementById("ate");
const BTN_ANTES = document.getElementById("mes-anterior");
const BTN_DEPOIS = document.getElementById("mes-seguinte");

const paraData = (s) => {
    const [a, m, d] = s.split("-").map(Number);
    return new Date(a, m - 1, d);
};
const paraTexto = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const bonito = (s) => paraData(s).toLocaleDateString("pt-BR");

function dias(de, ate) {
    const lista = [];
    for (let d = paraData(de); d <= paraData(ate); d.setDate(d.getDate() + 1)) {
        lista.push(paraTexto(d));
    }
    return lista;
}

// Começa com o que já está publicado em datas.js
const alugados = new Set();
(window.ALUGADOS || []).forEach(({ de, ate }) => dias(de, ate).forEach((k) => alugados.add(k)));

const hoje = new Date();
hoje.setHours(0, 0, 0, 0);
const primeiroMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
let mesBase = new Date(primeiroMesAtual);
let alterado = false;

/* Junta dias seguidos em períodos */
function periodos() {
    const ordenados = [...alugados].sort();
    const lista = [];
    ordenados.forEach((k) => {
        const ultimo = lista[lista.length - 1];
        if (ultimo) {
            const seguinte = paraData(ultimo.ate);
            seguinte.setDate(seguinte.getDate() + 1);
            if (paraTexto(seguinte) === k) {
                ultimo.ate = k;
                return;
            }
        }
        lista.push({ de: k, ate: k });
    });
    return lista;
}

function mudou() {
    alterado = true;
    desenhar();
}

function alternar(chave) {
    if (alugados.has(chave)) alugados.delete(chave);
    else alugados.add(chave);
    mudou();
}

function criarMes(base) {
    const mes = document.createElement("div");
    mes.className = "mes";

    const titulo = document.createElement("h3");
    titulo.textContent = base.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    mes.appendChild(titulo);

    const grade = document.createElement("div");
    grade.className = "grade";

    ["D", "S", "T", "Q", "Q", "S", "S"].forEach((l) => {
        const s = document.createElement("span");
        s.className = "semana";
        s.textContent = l;
        grade.appendChild(s);
    });

    for (let i = 0; i < base.getDay(); i++) grade.appendChild(document.createElement("span"));

    const total = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
    for (let n = 1; n <= total; n++) {
        const dia = new Date(base.getFullYear(), base.getMonth(), n);
        const chave = paraTexto(dia);
        const b = document.createElement("button");
        b.type = "button";
        b.className = "dia";
        b.textContent = n;

        const ocupado = alugados.has(chave);
        if (dia.getTime() === hoje.getTime()) b.classList.add("hoje");
        if (ocupado) b.classList.add("alugado");
        if (dia < hoje) b.classList.add("passado");

        b.setAttribute("aria-label", `${bonito(chave)}, ${ocupado ? "alugado" : "livre"}`);
        b.addEventListener("click", () => alternar(chave));
        grade.appendChild(b);
    }

    mes.appendChild(grade);
    return mes;
}

function desenharLista() {
    LISTA.replaceChildren();
    const todos = periodos();

    if (!todos.length) {
        const vazio = document.createElement("li");
        vazio.className = "vazio";
        vazio.textContent = "Nenhuma data alugada.";
        LISTA.appendChild(vazio);
        return;
    }

    todos.forEach(({ de, ate }) => {
        const li = document.createElement("li");
        const n = dias(de, ate).length;

        const texto = document.createElement("span");
        texto.textContent =
            de === ate ? bonito(de) : `${bonito(de)} a ${bonito(ate)} (${n} dias)`;

        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = "Liberar";
        btn.addEventListener("click", () => {
            dias(de, ate).forEach((k) => alugados.delete(k));
            mudou();
        });

        li.append(texto, btn);
        LISTA.appendChild(li);
    });
}

function desenhar() {
    MESES.replaceChildren(
        criarMes(mesBase),
        criarMes(new Date(mesBase.getFullYear(), mesBase.getMonth() + 1, 1))
    );
    BTN_ANTES.disabled = mesBase <= primeiroMesAtual;
    desenharLista();
    STATUS.textContent = alterado
        ? "Você tem alterações que ainda não estão no site. Baixe o arquivo e envie."
        : "Nenhuma alteração por enquanto.";
}

function lerPeriodo() {
    const de = CAMPO_DE.value;
    const ate = CAMPO_ATE.value;
    if (!de || !ate) {
        AVISO.textContent = "Preencha as duas datas.";
        return null;
    }
    if (de > ate) {
        AVISO.textContent = "A data final precisa ser igual ou depois da inicial.";
        return null;
    }
    AVISO.textContent = "";
    return dias(de, ate);
}

document.getElementById("marcar").addEventListener("click", () => {
    const lista = lerPeriodo();
    if (!lista) return;
    lista.forEach((k) => alugados.add(k));
    mudou();
});

document.getElementById("liberar").addEventListener("click", () => {
    const lista = lerPeriodo();
    if (!lista) return;
    lista.forEach((k) => alugados.delete(k));
    mudou();
});

document.getElementById("baixar").addEventListener("click", () => {
    const linhas = periodos().map((p) => `    { de: "${p.de}", ate: "${p.ate}" },`);
    const conteudo =
        `/* Datas alugadas do Recanto do Vale.\n` +
        `   Este arquivo é gerado pela página admin.html: não precisa editar à mão.\n` +
        `   Atualizado em ${new Date().toLocaleString("pt-BR")} */\n` +
        `window.ALUGADOS = [\n${linhas.join("\n")}${linhas.length ? "\n" : ""}];\n`;

    const url = URL.createObjectURL(new Blob([conteudo], { type: "text/javascript" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "datas.js";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    alterado = false;
    STATUS.textContent = "Arquivo baixado. Agora envie o datas.js para o seu site.";
});

BTN_ANTES.addEventListener("click", () => {
    mesBase = new Date(mesBase.getFullYear(), mesBase.getMonth() - 1, 1);
    desenhar();
});

BTN_DEPOIS.addEventListener("click", () => {
    mesBase = new Date(mesBase.getFullYear(), mesBase.getMonth() + 1, 1);
    desenhar();
});

window.addEventListener("beforeunload", (e) => {
    if (alterado) {
        e.preventDefault();
        e.returnValue = "";
    }
});

desenhar();

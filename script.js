/* =====================================================
   CONFIGURAÇÃO — é só aqui que você mexe
   ===================================================== */

// Seu WhatsApp: código do país + DDD + número, só números.
// Exemplo: 55 + 11 + 912345678
const WHATSAPP = "5511939392805";

/* As datas alugadas ficam em datas.js (gerado pela página admin.html). */

/* =====================================================
   A partir daqui não precisa mexer
   ===================================================== */

const MESES = document.getElementById("meses");
const RESUMO = document.getElementById("resumo");
const LINK_WHATSAPP = document.getElementById("whatsapp");
const BTN_ANTES = document.getElementById("mes-anterior");
const BTN_DEPOIS = document.getElementById("mes-seguinte");

const paraData = (s) => {
    const [a, m, d] = s.split("-").map(Number);
    return new Date(a, m - 1, d);
};
const paraTexto = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const bonito = (d) => d.toLocaleDateString("pt-BR");

const hoje = new Date();
hoje.setHours(0, 0, 0, 0);

// Datas alugadas, vindas de datas.js
const alugados = new Set();
(window.ALUGADOS || []).forEach(({ de, ate }) => {
    for (let d = paraData(de); d <= paraData(ate); d.setDate(d.getDate() + 1)) {
        alugados.add(paraTexto(d));
    }
});

const primeiroMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
let mesBase = new Date(primeiroMesAtual);
let entrada = null;
let saida = null;
let aviso = "";

function haAlugadoEntre(a, b) {
    for (let d = new Date(a); d <= b; d.setDate(d.getDate() + 1)) {
        if (alugados.has(paraTexto(d))) return true;
    }
    return false;
}

function escolher(dia) {
    if (!entrada || saida) {
        entrada = dia;
        saida = null;
    } else if (dia <= entrada) {
        entrada = dia;
    } else if (haAlugadoEntre(entrada, dia)) {
        // Há data alugada no meio: recomeça a escolha a partir deste dia
        entrada = dia;
        aviso = "Há datas alugadas nesse período. Escolha outra saída.";
    } else {
        saida = dia;
    }
    desenhar();
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

        const passado = dia < hoje;
        const ocupado = alugados.has(chave);

        if (dia.getTime() === hoje.getTime()) b.classList.add("hoje");
        if (passado) b.classList.add("passado");
        if (ocupado) b.classList.add("alugado");

        if (passado || ocupado) {
            b.disabled = true;
            b.setAttribute("aria-label", `${bonito(dia)}, ${ocupado ? "alugado" : "data passada"}`);
        } else {
            b.setAttribute("aria-label", `${bonito(dia)}, livre`);
            b.addEventListener("click", () => escolher(dia));
        }

        if (entrada && dia.getTime() === entrada.getTime()) b.classList.add("escolhido");
        if (saida && dia.getTime() === saida.getTime()) b.classList.add("escolhido");
        if (entrada && saida && dia > entrada && dia < saida) b.classList.add("intervalo");

        grade.appendChild(b);
    }

    mes.appendChild(grade);
    return mes;
}

function atualizarResumo() {
    let msg;
    let texto;

    if (entrada && saida) {
        const noites = Math.round((saida - entrada) / 86400000);
        msg = `${bonito(entrada)} a ${bonito(saida)} (${noites} ${noites === 1 ? "noite" : "noites"})`;
        RESUMO.textContent = msg;
        const dias = noites + 1;
        texto =
            `Olá! Gostaria de consultar a disponibilidade do Recanto do Vale.\n\n` +
            `Entrada: ${bonito(entrada)}\n` +
            `Saída: ${bonito(saida)}\n` +
            `Estadia: ${noites} ${noites === 1 ? "noite" : "noites"} (${dias} dias)`;
    } else if (entrada) {
        RESUMO.textContent = aviso || `Entrada em ${bonito(entrada)}. Agora escolha o dia de saída.`;
        texto = `Olá! Gostaria de consultar a disponibilidade do Recanto do Vale a partir de ${bonito(entrada)}.`;
    } else {
        RESUMO.textContent = "Escolha o dia de entrada.";
        texto = "Olá! Gostaria de consultar as datas disponíveis do Recanto do Vale.";
    }

    aviso = "";
    LINK_WHATSAPP.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
}

function desenhar() {
    MESES.replaceChildren(
        criarMes(mesBase),
        criarMes(new Date(mesBase.getFullYear(), mesBase.getMonth() + 1, 1))
    );
    BTN_ANTES.disabled = mesBase <= primeiroMesAtual;
    atualizarResumo();
}

BTN_ANTES.addEventListener("click", () => {
    mesBase = new Date(mesBase.getFullYear(), mesBase.getMonth() - 1, 1);
    desenhar();
});

BTN_DEPOIS.addEventListener("click", () => {
    mesBase = new Date(mesBase.getFullYear(), mesBase.getMonth() + 1, 1);
    desenhar();
});

desenhar();

/* Cabeçalho muda de cor ao rolar a página */
const cabecalho = document.querySelector("header");
const marcarRolagem = () => cabecalho.classList.toggle("rolou", window.scrollY > 40);
window.addEventListener("scroll", marcarRolagem, { passive: true });
marcarRolagem();

/* Botão fixo de WhatsApp */
document.getElementById("whatsapp-fixo").href =
    `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Olá! Vi o site do Recanto do Vale e gostaria de mais informações.")}`;
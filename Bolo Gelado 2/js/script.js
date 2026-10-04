/* =========================================================
   BÃO BOLÊ - 3ª ENTREGA: JAVASCRIPT E INTERATIVIDADE
   1) Carrossel   2) Validação do contato
   3) Avaliações  4) Menu ativo ao rolar a página
   5) Rolagem suave
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    iniciarCarrossel();
    iniciarFormularioContato();
    iniciarAvaliacoes();
    iniciarMenuAtivo();
    iniciarRolagemSuave();
});


/* ---------- Funções auxiliares ---------- */

function mostrarErro(campo, mensagem) {
    limparErro(campo);
    campo.classList.add("invalido");
    var aviso = document.createElement("small");
    aviso.className = "erro-campo";
    aviso.textContent = mensagem;
    campo.insertAdjacentElement("afterend", aviso);
}

function limparErro(campo) {
    campo.classList.remove("invalido");
    var proximo = campo.nextElementSibling;
    if (proximo && proximo.classList.contains("erro-campo")) {
        proximo.remove();
    }
}

function mostrarStatus(form, texto, tipo) {
    var status = form.querySelector(".status-form");
    if (!status) {
        status = document.createElement("p");
        status.className = "status-form";
        status.setAttribute("role", "status");
        form.appendChild(status);
    }
    status.textContent = texto;
    status.className = "status-form " + tipo;
}


/* ---------- 1) CARROSSEL ---------- */

function iniciarCarrossel() {
    var carrossel = document.getElementById("carrossel");
    if (!carrossel) return;

    var slides = carrossel.querySelectorAll(".slide");
    var areaDots = carrossel.querySelector(".carrossel-dots");
    var atual = 0;
    var timer = null;

    // cria uma bolinha para cada foto
    slides.forEach(function (_, i) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", "Ir para a foto " + (i + 1));
        dot.addEventListener("click", function () {
            irPara(i);
            reiniciarAutoplay();
        });
        areaDots.appendChild(dot);
    });
    var dots = areaDots.querySelectorAll("button");

    function irPara(indice) {
        slides[atual].classList.remove("ativo");
        dots[atual].classList.remove("ativo");
        atual = (indice + slides.length) % slides.length;
        slides[atual].classList.add("ativo");
        dots[atual].classList.add("ativo");
    }

    function iniciarAutoplay() {
        clearInterval(timer);
        timer = setInterval(function () { irPara(atual + 1); }, 5000);
    }

    function reiniciarAutoplay() {
        iniciarAutoplay();
    }

    carrossel.querySelector(".anterior").addEventListener("click", function () {
        irPara(atual - 1);
        reiniciarAutoplay();
    });

    carrossel.querySelector(".proximo").addEventListener("click", function () {
        irPara(atual + 1);
        reiniciarAutoplay();
    });

    // pausa quando o mouse está em cima
    carrossel.addEventListener("mouseenter", function () { clearInterval(timer); });
    carrossel.addEventListener("mouseleave", iniciarAutoplay);

    // setas do teclado
    carrossel.setAttribute("tabindex", "0");
    carrossel.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") { irPara(atual - 1); reiniciarAutoplay(); }
        if (e.key === "ArrowRight") { irPara(atual + 1); reiniciarAutoplay(); }
    });

    // arrastar o dedo no celular
    var inicioX = 0;
    carrossel.addEventListener("touchstart", function (e) {
        inicioX = e.touches[0].clientX;
    }, { passive: true });
    carrossel.addEventListener("touchend", function (e) {
        var diferenca = e.changedTouches[0].clientX - inicioX;
        if (Math.abs(diferenca) > 50) {
            irPara(diferenca > 0 ? atual - 1 : atual + 1);
            reiniciarAutoplay();
        }
    });

    dots[0].classList.add("ativo");
    iniciarAutoplay();
}


/* ---------- 2) FORMULÁRIO DE CONTATO ---------- */

function iniciarFormularioContato() {
    var form = document.getElementById("form-contato");
    if (!form) return;

    var nome = document.getElementById("nome");
    var email = document.getElementById("email");
    var mensagem = document.getElementById("mensagem");
    var padraoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function validarNome() {
        if (nome.value.trim().length < 3) {
            mostrarErro(nome, "Digite seu nome (mínimo de 3 letras).");
            return false;
        }
        limparErro(nome);
        return true;
    }

    function validarEmail() {
        if (!padraoEmail.test(email.value.trim())) {
            mostrarErro(email, "Digite um e-mail válido. Exemplo: nome@email.com");
            return false;
        }
        limparErro(email);
        return true;
    }

    function validarMensagem() {
        if (mensagem.value.trim().length < 10) {
            mostrarErro(mensagem, "A mensagem precisa ter pelo menos 10 caracteres.");
            return false;
        }
        limparErro(mensagem);
        return true;
    }

    nome.addEventListener("blur", validarNome);
    email.addEventListener("blur", validarEmail);
    mensagem.addEventListener("blur", validarMensagem);

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        // as três funções rodam sempre, para mostrar todos os erros de uma vez
        var nomeOk = validarNome();
        var emailOk = validarEmail();
        var mensagemOk = validarMensagem();

        if (nomeOk && emailOk && mensagemOk) {
            mostrarStatus(form, "Mensagem enviada com sucesso! Obrigado pelo contato, " + nome.value.trim() + ".", "sucesso");
            form.reset();
        } else {
            mostrarStatus(form, "Confira os campos destacados e tente novamente.", "erro");
        }
    });
}


/* ---------- 3) AVALIAÇÕES ---------- */

function iniciarAvaliacoes() {
    var form = document.getElementById("form-avaliacao");
    var lista = document.getElementById("avaliacoes-lista");
    var resumo = document.getElementById("avaliacoes-resumo");
    if (!form || !lista) return;

    var CHAVE = "baobole-avaliacoes";
    var nome = document.getElementById("nome-avaliacao");
    var nota = document.getElementById("nota");
    var comentario = document.getElementById("comentario");

    var avaliacoes = carregar();

    function carregar() {
        try {
            return JSON.parse(localStorage.getItem(CHAVE)) || [];
        } catch (erro) {
            return [];
        }
    }

    function salvar() {
        try {
            localStorage.setItem(CHAVE, JSON.stringify(avaliacoes));
        } catch (erro) { /* sem localStorage: a lista funciona só nesta visita */ }
    }

    function estrelas(n) {
        return "★".repeat(n) + "☆".repeat(5 - n);
    }

    function desenhar() {
        lista.innerHTML = "";

        if (avaliacoes.length === 0) {
            resumo.textContent = "Ainda não há avaliações. Seja o primeiro a avaliar!";
            return;
        }

        var soma = avaliacoes.reduce(function (total, a) { return total + a.nota; }, 0);
        var media = (soma / avaliacoes.length).toFixed(1).replace(".", ",");
        resumo.textContent = "Nota média: " + media + " de 5 (" + avaliacoes.length +
            (avaliacoes.length === 1 ? " avaliação)" : " avaliações)");

        // mais recentes primeiro
        avaliacoes.slice().reverse().forEach(function (a) {
            var item = document.createElement("article");
            item.className = "avaliacao-item";

            var topo = document.createElement("div");
            topo.className = "avaliacao-topo";

            var autor = document.createElement("strong");
            autor.textContent = a.nome;

            var notaEl = document.createElement("span");
            notaEl.className = "avaliacao-estrelas";
            notaEl.textContent = estrelas(a.nota);
            notaEl.setAttribute("aria-label", "Nota " + a.nota + " de 5");

            var texto = document.createElement("p");
            texto.textContent = a.comentario;

            var data = document.createElement("small");
            data.textContent = a.data;

            topo.appendChild(autor);
            topo.appendChild(notaEl);
            item.appendChild(topo);
            item.appendChild(texto);
            item.appendChild(data);
            lista.appendChild(item);
        });
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        var ok = true;

        if (nome.value.trim().length < 2) {
            mostrarErro(nome, "Digite seu nome.");
            ok = false;
        } else { limparErro(nome); }

        if (nota.value === "") {
            mostrarErro(nota, "Escolha uma nota.");
            ok = false;
        } else { limparErro(nota); }

        if (comentario.value.trim().length < 5) {
            mostrarErro(comentario, "Escreva um comentário (mínimo de 5 caracteres).");
            ok = false;
        } else { limparErro(comentario); }

        if (!ok) {
            mostrarStatus(form, "Confira os campos destacados.", "erro");
            return;
        }

        avaliacoes.push({
            nome: nome.value.trim(),
            nota: parseInt(nota.value, 10),
            comentario: comentario.value.trim(),
            data: new Date().toLocaleDateString("pt-BR")
        });

        salvar();
        desenhar();
        form.reset();
        mostrarStatus(form, "Obrigado pela sua avaliação!", "sucesso");
    });

    desenhar();
}


/* ---------- 4) MENU ATIVO AO ROLAR ---------- */

function iniciarMenuAtivo() {
    var links = document.querySelectorAll("nav a[href^='#']");
    if (!links.length || !("IntersectionObserver" in window)) return;

    var observador = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
            if (entrada.isIntersecting) {
                links.forEach(function (link) {
                    link.classList.toggle("ativo", link.getAttribute("href") === "#" + entrada.target.id);
                });
            }
        });
    }, { rootMargin: "-40% 0px -55% 0px" });

    links.forEach(function (link) {
        var secao = document.querySelector(link.getAttribute("href"));
        if (secao) observador.observe(secao);
    });
}


/* ---------- 5) ROLAGEM SUAVE NO MENU ---------- */

function iniciarRolagemSuave() {
    document.querySelectorAll("a[href^='#']").forEach(function (link) {
        link.addEventListener("click", function (e) {
            var destino = document.querySelector(link.getAttribute("href"));
            if (!destino) return;
            e.preventDefault();
            destino.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });
}
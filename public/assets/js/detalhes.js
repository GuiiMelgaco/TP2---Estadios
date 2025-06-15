window.addEventListener('DOMContentLoaded', () => {
const usuario = JSON.parse(sessionStorage.getItem('usuarioLogado'));

  if (usuario) {
    btnLoginLogout.textContent = 'Logout';
  } else {
    btnLoginLogout.textContent = 'Login';
  }

});

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

if (!id || isNaN(id)) {
  window.location.href = 'index.html';
} else {
  carregarDetalhesEstadio();
}

async function carregarDetalhesEstadio() {
  try {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
      window.location.href = 'index.html';
      return;
    }

    const response = await fetch(`http://localhost:3000/estadios/${id}`);
    if (!response.ok) {
      window.location.href = 'index.html';
      return;
    }

    const estadio = await response.json();

    document.getElementById('estadio-imagem-principal').src = estadio.imagem;
    document.getElementById("nome-estadio").textContent = estadio.nome;
    document.getElementById("descricao").textContent = estadio.descricao;
    document.getElementById("capacidade").textContent = estadio.capacidade;
    document.getElementById("localizacao").textContent = estadio.localizacao;
    document.getElementById("timeMandante").textContent = estadio.timeMandante;
    document.getElementById("curiosidades").textContent = estadio.curiosidades;
    document.getElementById("recorde").textContent = estadio.recorde;
    document.getElementById("eventos").textContent = estadio.eventos;

    renderizarCarrosselDetalhes(estadio.imagens);

    const botaoFavorito = document.getElementById("botaoFavorito");
    const icon = botaoFavorito.querySelector("i");

    const usuario = JSON.parse(sessionStorage.getItem("usuarioLogado"));
    const favoritos = usuario?.favoritos || [];

    if (favoritos.includes(String(estadio.id))) {
      icon.classList.remove("bi-heart");
      icon.classList.add("bi-heart-fill", "text-danger");
    }

    botaoFavorito.addEventListener("click", async () => {
      if (!usuario) {
        Swal.fire({
          icon: "info",
          title: "Login necessário",
          text: "Faça login para favoritar estádios."
        });
        return;
      }

      let favoritos = usuario.favoritos || [];
      const idEstadio = String(estadio.id);
      const index = favoritos.indexOf(idEstadio);

      if (index > -1) {
        favoritos.splice(index, 1);
      } else {
        favoritos.push(idEstadio);
      }

      try {
        const res = await fetch(`http://localhost:3000/usuarios/${usuario.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ favoritos })
        });

        if (!res.ok) throw new Error("Erro ao atualizar favoritos");

        const usuarioAtualizado = await res.json();
        sessionStorage.setItem("usuarioLogado", JSON.stringify(usuarioAtualizado));

        if (favoritos.includes(idEstadio)) {
          icon.classList.remove("bi-heart");
          icon.classList.add("bi-heart-fill", "text-danger");
        } else {
          icon.classList.remove("bi-heart-fill", "text-danger");
          icon.classList.add("bi-heart");
        }
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: "Não foi possível atualizar os favoritos."
        });
      }
    });

  } catch (error) {
    console.error("Erro ao carregar estádio:", error);
    window.location.href = 'index.html';
  }
}


let currentIndex = 0;
let imagensGlobais = [];

function renderizarCarrosselDetalhes(imagens) {
  imagensGlobais = imagens;
  renderCarousel();
}

function renderCarousel() {
  const carouselImagens = document.getElementById("carousel-imagens");
  carouselImagens.innerHTML = "";

  const screenWidth = window.innerWidth;
  const imagensPorPagina = screenWidth <= 768 ? 1 : (screenWidth <= 992 ? 2 : 4);

  for (
    let i = currentIndex;
    i < currentIndex + imagensPorPagina && i < imagensGlobais.length;
    i++
  ) {
    const img = document.createElement("img");
    img.src = imagensGlobais[i];
    img.alt = `Imagem ${i + 1}`;
    img.className = "img-fluid rounded m-2";
    img.style.width = "300px";
    img.style.height = "200px";
    img.style.objectFit = "cover";
    carouselImagens.appendChild(img);
  }
}

function moveSlide(direction) {
  const screenWidth = window.innerWidth;
  const imagensPorPagina = screenWidth <= 768 ? 1 : (screenWidth <= 992 ? 2 : 4);

  currentIndex += direction;

  if (currentIndex < 0) currentIndex = 0;
  if (currentIndex > imagensGlobais.length - imagensPorPagina) {
    currentIndex = imagensGlobais.length - imagensPorPagina;
  }

  renderCarousel();
}

window.addEventListener("resize", () => {
  currentIndex = 0;
  renderCarousel();
});

carregarDetalhesEstadio();

window.onload = () => {
  const usuario = JSON.parse(sessionStorage.getItem('usuarioLogado'));
  const btnLoginLogout = document.getElementById('btnLoginLogout');
  const btnFavoritos = document.getElementById('btnFavoritos');
  const btnCadastro = document.getElementById('btnCadastro');

  if (usuario) {
    btnLoginLogout.textContent = 'Logout';
  } else {
    btnLoginLogout.textContent = 'Login';
  }

  btnLoginLogout.onclick = () => {
    const logado = sessionStorage.getItem('usuarioLogado');
    if (logado) {
      logout();
    } else {
      abrirModalLogin();
    }
  };

  if (btnCadastro) {
    if (!usuario || !usuario.admin) {
      btnCadastro.classList.add('opacidade-baixa');
    } else {
      btnCadastro.classList.remove('opacidade-baixa');
    }

    btnCadastro.addEventListener("click", function (event) {
      const usuario = JSON.parse(sessionStorage.getItem('usuarioLogado'));

      if (!usuario) {
        event.preventDefault();
        Swal.fire({
          icon: 'info',
          title: 'Login necessário',
          text: 'Você precisa estar logado como administrador para acessar esta tela.'
        });
        return;
      }

      if (!usuario.admin) {
        event.preventDefault();
        Swal.fire({
          icon: 'warning',
          title: 'Acesso restrito',
          text: 'Apenas administradores podem acessar esta tela.'
        });
        return;
      }
    });
  }

  if (btnFavoritos) {
    if (!usuario) {
      btnFavoritos.classList.add('opacidade-baixa');
    } else {
      btnFavoritos.classList.remove('opacidade-baixa');
    }

    btnFavoritos.addEventListener("click", function (event) {
      const usuario = JSON.parse(sessionStorage.getItem('usuarioLogado'));

      if (!usuario) {
        event.preventDefault();
        Swal.fire({
          icon: 'info',
          title: 'Login necessário',
          text: 'Você precisa estar logado para acessar seus favoritos.'
        });
        return;
      }
    });
  }
};



function abrirModalLogin() {
  document.getElementById('modalLogin').style.display = 'block';
}

function fecharModal(id) {
  document.getElementById(id).style.display = 'none';
  document.getElementById('erroLogin').textContent = '';
  document.getElementById('cadastroStatus').textContent = '';
}

function trocarParaCadastro() {
  fecharModal('modalLogin');
  document.getElementById('modalCadastro').style.display = 'block';
}

function realizarLogin() {
  const usuario = document.getElementById('loginUsuario').value.trim();
  const senha = document.getElementById('loginSenha').value.trim();

  fetch(`http://localhost:3000/usuarios?usuario=${usuario}&senha=${senha}`)
    .then(res => res.json())
    .then(data => {
      if (data.length > 0) {
        sessionStorage.setItem('usuarioLogado', JSON.stringify(data[0]));
        fecharModal('modalLogin');
        atualizarInterfaceUsuario();
      } else {
        document.getElementById('erroLogin').textContent = 'Usuário não encontrado. Faça o cadastro.';
      }
    });
}

function cadastrarUsuario() {
  const usuario = document.getElementById('cadastroLogin').value.trim();
  const nome = document.getElementById('cadastroNome').value.trim();
  const email = document.getElementById('cadastroEmail').value.trim();
  const senha = document.getElementById('cadastroSenha').value.trim();

  if (!usuario || !nome || !email || !senha) {
    document.getElementById('cadastroStatus').textContent = "Preencha todos os campos.";
    return;
  }

  fetch(`http://localhost:3000/usuarios?usuario=${usuario}`)
    .then(res => res.json())
    .then(data => {
      if (data.length > 0) {
        document.getElementById('cadastroStatus').textContent = "Usuário já existe.";
      } else {
        fetch('http://localhost:3000/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuario, nome, email, senha, admin: false, favoritos: []})
        })
        .then(() => {
          document.getElementById('cadastroStatus').textContent = "Usuário cadastrado com sucesso!";
          setTimeout(() => {
            fecharModal('modalCadastro');
            abrirModalLogin();
          }, 1500);
        });
      }
    });
}

function logout() {
  sessionStorage.removeItem('usuarioLogado');
  Swal.fire({
    icon: 'info',
    title: 'Logout realizado',
    text: 'Você foi desconectado.'
  }).then(() => {
    atualizarInterfaceUsuario();
  });
}

function atualizarInterfaceUsuario() {
  const usuario = JSON.parse(sessionStorage.getItem('usuarioLogado'));
  const btnLoginLogout = document.getElementById('btnLoginLogout');
  const btnFavoritos = document.getElementById('btnFavoritos');

  if (usuario) {
    btnLoginLogout.textContent = 'Logout';
    btnFavoritos.disabled = false;
  } else {
    btnLoginLogout.textContent = 'Login';
    btnFavoritos.disabled = true;
  }

  location.reload();
}
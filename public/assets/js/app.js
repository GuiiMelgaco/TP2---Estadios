window.addEventListener('DOMContentLoaded', () => {
const usuario = JSON.parse(sessionStorage.getItem('usuarioLogado'));

  if (usuario) {
    btnLoginLogout.textContent = 'Logout';
  } else {
    btnLoginLogout.textContent = 'Login';
  }

});

let estadiosGlobal = [];


document.addEventListener("DOMContentLoaded", () => {
  carregarEstadios();
});

document.getElementById("campoBusca").addEventListener("input", function () {
  const termo = this.value.toLowerCase();

  const filtrados = estadiosGlobal.filter(estadio =>
    estadio.nome.toLowerCase().includes(termo)
  );

  if (filtrados.length === 0) {
    const listaContainer = document.getElementById("lista-estadios");
    listaContainer.innerHTML = `<p class="text-center mt-3">Nenhum estádio encontrado para "${this.value}"</p>`;
  } else {
    renderizarListaEstadios(filtrados);
  }
});

window.addEventListener("focus", carregarEstadios);

async function carregarEstadios() {
  try {
    const response = await fetch("http://localhost:3000/estadios");
    const estadios = await response.json();
    
    estadiosGlobal = estadios;

    renderizarCarrossel(estadiosGlobal);
    renderizarListaEstadios(estadiosGlobal);
  } catch (error) {
    console.error("Erro ao carregar estádios:", error);
  }
}

function renderizarCarrossel(estadios) {
  const carouselInner = document.getElementById("carousel-inner");
  carouselInner.innerHTML = '';

  estadios.slice(0, 12).forEach((estadio, index) => {
    const activeClass = index === 0 ? "active" : "";
    const item = document.createElement("div");
    item.className = `carousel-item ${activeClass}`;
    item.innerHTML = `
      <a href="detalhes.html?id=${estadio.id}">
      <img src="${estadio.imagem}" class="d-block w-100" style="height: 450px; object-fit: cover;" alt="Imagem do ${estadio.nome}">
    </a>
    <div class="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded p-2">
      <h5>${estadio.nome}</h5>
      <p>${estadio.descricao}</p>
    </div>
  `;
    carouselInner.appendChild(item);
  });
}

function renderizarListaEstadios(estadios) {
  const container = document.getElementById("lista-estadios");
  container.innerHTML = "";

  // Pega o usuário logado e seus favoritos (array de strings)
  const usuario = JSON.parse(sessionStorage.getItem('usuarioLogado'));
  const favoritos = usuario?.favoritos || [];

  estadios.forEach(estadio => {
    const isFavorito = favoritos.includes(String(estadio.id));
    const iconClass = isFavorito ? "bi-heart-fill text-danger" : "bi-heart";

    const card = document.createElement("div");
    card.className = "col-md-4 mb-4";
    card.innerHTML = `
      <div class="card h-100 position-relative">
        <button type="button" class="favorite-btn position-absolute top-0 end-0 m-2 border-0 bg-transparent" data-id="${estadio.id}">
          <i class="bi ${iconClass}"></i>
        </button>
        <img src="${estadio.imagem}" class="card-img-top" style="height: 250px;object-fit:cover;" alt="${estadio.nome}">
        <div class="card-body">
          <h5 class="card-title">${estadio.nome}</h5>
          <p class="card-text">${estadio.descricao}</p>
          <a href="detalhes.html?id=${estadio.id}" class="btn btn-success mt-auto">Ver detalhes</a>
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  document.querySelectorAll(".favorite-btn").forEach(button => {
    button.addEventListener("click", function (event) {
      event.preventDefault();

      // Verifica se o usuário está logado
      const usuario = JSON.parse(sessionStorage.getItem('usuarioLogado'));
      if (!usuario) {
        Swal.fire({
          icon: 'info',
          title: 'Login necessário',
          text: 'Faça login para favoritar estádios.'
        });
        return;
      }

      const id = this.getAttribute("data-id"); // string
      let favoritos = usuario.favoritos || [];

      const index = favoritos.indexOf(id);
      if (index > -1) {
        // Já é favorito, remover
        favoritos.splice(index, 1);
      } else {
        // Adicionar favorito
        favoritos.push(id);
      }

      // Atualiza o array no usuário
      usuario.favoritos = favoritos;

      // Atualiza no backend via PATCH
      fetch(`http://localhost:3000/usuarios/${usuario.id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ favoritos })
      })
      .then(res => {
        if (!res.ok) throw new Error('Falha ao atualizar favoritos');
        return res.json();
      })
      .then(atualizadoUsuario => {
        // Atualiza sessionStorage com o usuário atualizado
        sessionStorage.setItem('usuarioLogado', JSON.stringify(atualizadoUsuario));

        // Atualiza a UI do botão
        const icon = button.querySelector("i");
        if (favoritos.includes(id)) {
          icon.classList.remove("bi-heart");
          icon.classList.add("bi-heart-fill", "text-danger");
        } else {
          icon.classList.remove("bi-heart-fill", "text-danger");
          icon.classList.add("bi-heart");
        }
      })
      .catch(err => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Não foi possível atualizar os favoritos.'
        });
      });
    });
  });
}


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

function tentarLogin() {
  const usuario = document.getElementById('loginUsuario').value.trim();
  const senha = document.getElementById('loginSenha').value.trim();
  const erroLogin = document.getElementById('erroLogin');

  if (!usuario || !senha) {
    erroLogin.textContent = 'Por favor, preencha todos os campos.';
    return;
  }

  erroLogin.textContent = '';

  realizarLogin(usuario, senha);
}

function realizarLogin(usuario, senha) {
  fetch(`http://localhost:3000/usuarios?usuario=${usuario}&senha=${senha}`)
    .then(res => res.json())
    .then(data => {
      if (data.length > 0) {
        sessionStorage.setItem('usuarioLogado', JSON.stringify(data[0]));
        fecharModal('modalLogin');
        atualizarInterfaceUsuario();
      } else {
        document.getElementById('erroLogin').textContent = 'Usuário não encontrado ou senha incorreta. Verifique os dados.';
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

  const novoUsuario = {
    usuario,
    nome,
    email,
    senha,
    favoritos: [],
    admin: false
  };

  console.log("Objeto usuário a ser cadastrado:", novoUsuario);

  fetch(`http://localhost:3000/usuarios?usuario=${usuario}`)
    .then(res => res.json())
    .then(data => {
      if (data.length > 0) {
        document.getElementById('cadastroStatus').textContent = "Usuário já existe.";
      } else {
        fetch('http://localhost:3000/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(novoUsuario)
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





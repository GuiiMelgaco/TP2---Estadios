window.addEventListener('DOMContentLoaded', () => {
  const btnFavoritos = document.getElementById('btnFavoritos');
const usuario = JSON.parse(sessionStorage.getItem('usuarioLogado'));
  if (btnFavoritos) {
    btnFavoritos.classList.add('active');
  }

  if (usuario) {
    btnLoginLogout.textContent = 'Logout';
  } else {
    btnLoginLogout.textContent = 'Login';
  }

});

document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(sessionStorage.getItem('usuarioLogado'));
  if (!usuario) {
    document.body.style.overflow = 'hidden';

    Swal.fire({
      icon: 'warning',
      title: 'Acesso negado',
      text: 'Você precisa fazer login para acessar os favoritos.',
      confirmButtonText: 'OK',
      backdrop: 'rgba(0,0,0,0.8)'
    }).then(() => {
      document.body.style.overflow = '';
      window.location.href = 'index.html';
    });
    return;
  }

  carregarFavoritos();
});

async function carregarFavoritos() {
  try {
    const usuario = JSON.parse(sessionStorage.getItem('usuarioLogado'));
    if (!usuario) {
      document.getElementById("mensagem-vazio").textContent = "Faça login para ver seus favoritos.";
      return;
    }

    const favoritos = usuario.favoritos || [];

    const response = await fetch("http://localhost:3000/estadios");
    const estadios = await response.json();
    const favoritosEstadios = estadios.filter(e => favoritos.includes(String(e.id)));
    const container = document.getElementById("lista-favoritos");
    const mensagem = document.getElementById("mensagem-vazio");
    container.innerHTML = "";
    mensagem.textContent = "";

      if (favoritosEstadios.length === 0) {
        mensagem.textContent = "Nenhum estádio favorito ainda.";
        return;
      }

      favoritosEstadios.forEach(estadio => {
      const card = document.createElement("div");
      card.className = "col-md-4 mb-4";

      card.innerHTML = `
        <div class="card h-100 position-relative">
          <button class="favorite-btn position-absolute top-0 end-0 m-2 border-0 bg-transparent active" data-id="${estadio.id}">
            <i class="bi bi-heart-fill text-danger"></i>
          </button>
          <img src="${estadio.imagem}" class="card-img-top" style="height: 250px; object-fit: cover;" alt="${estadio.nome}">
          <div class="card-body">
            <h5 class="card-title">${estadio.nome}</h5>
            <p class="card-text">${estadio.descricao}</p>
            <a href="detalhes.html?id=${estadio.id}" class="btn btn-success mt-auto">Ver detalhes</a>
          </div>
        </div>
      `;

      container.appendChild(card);
    });

    document.querySelectorAll(".favorite-btn").forEach(btn => {
      btn.addEventListener("click", async function () {
        const id = this.getAttribute("data-id");
        let novosFavoritos = usuario.favoritos.filter(favId => favId !== id);

        try {
          const res = await fetch(`http://localhost:3000/usuarios/${usuario.id}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ favoritos: novosFavoritos })
          });

          if (!res.ok) throw new Error('Falha ao atualizar favoritos');

          const usuarioAtualizado = await res.json();
          sessionStorage.setItem('usuarioLogado', JSON.stringify(usuarioAtualizado));
          carregarFavoritos();
        } catch (error) {
          console.error(error);
          Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Não foi possível atualizar os favoritos.'
          });
        }
      });
    });
  } catch (error) {
    console.error("Erro ao carregar favoritos:", error);
  }
}

window.onload = () => {
  const usuario = JSON.parse(sessionStorage.getItem('usuarioLogado'));
  const btnLoginLogout = document.getElementById('btnLoginLogout');
  const btnFavoritos = document.getElementById('btnFavoritos');
  const btnCadastro = document.getElementById('btnCadastro');

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

function logout() {
  sessionStorage.removeItem('usuarioLogado');
  Swal.fire({
    icon: 'info',
    title: 'Logout realizado',
    text: 'Você foi desconectado.'
  }).then(() => {
    window.location.href = 'index.html';
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
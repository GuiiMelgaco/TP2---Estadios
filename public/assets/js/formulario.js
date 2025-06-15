window.addEventListener('DOMContentLoaded', () => {
  const btnCadastro = document.getElementById('btnCadastro');
  const usuario = JSON.parse(sessionStorage.getItem('usuarioLogado'));
  if (btnCadastro) {
    btnCadastro.classList.add('active');
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
      text: 'Você precisa fazer login como administrador para acessar essa tela.',
      confirmButtonText: 'OK',
      backdrop: 'rgba(0, 0, 0, 0.8)'
    }).then(() => {
      document.body.style.overflow = '';
      window.location.href = 'index.html';
    });
    return;
  }
});

const url = "http://localhost:3000/estadios";
const form = document.getElementById("form-estadio");
const tabela = document.getElementById("tabela-estadios");
let idEdicao = null;
const botaoLimpar = document.getElementById("botao-limpar");

botaoLimpar.addEventListener("click", () => {
  form.reset();
  idEdicao = null;
  document.getElementById("botao-submit").textContent = "Cadastrar novo estádio";
});

async function carregarEstadios() {
  const response = await fetch(url);
  const estadios = await response.json();
  tabela.innerHTML = "";

  estadios.forEach(estadio => {
    let galeriaImgs = '';
    if (Array.isArray(estadio.imagens)) {
      galeriaImgs = estadio.imagens.map(img => 
        `<img src="${img}" alt="${estadio.nome}" style="width: 50px; height: auto; margin: 2px; border-radius: 3px;">`
      ).join('');
    }

    tabela.innerHTML += `
      <tr>
        <td>${estadio.nome}</td>
        <td><img src="${estadio.imagem}" alt="${estadio.nome}" style="width: 100px; height: auto;" /></td>
        <td>${estadio.capacidade}</td>
        <td>${estadio.localizacao}</td>
        <td>${estadio.timeMandante}</td>
        <td>${estadio.descricao}</td>
        <td>${estadio.curiosidades}</td>
        <td>${estadio.recorde || ''}</td>
        <td>${estadio.eventos || ''}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary" onclick="editarEstadio('${estadio.id}')">✏️</button>
          <button class="btn btn-sm btn-outline-danger" onclick="excluirEstadio('${estadio.id}')">🗑️</button>
        </td>
      </tr>
    `;
  });
}

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const imagensText = document.getElementById("imagens").value.trim();
  const imagensArray = imagensText ? imagensText.split(',').map(url => url.trim()) : [];

  const estadio = {
    nome: document.getElementById("nome").value,
    imagem: document.getElementById("imagem").value,
    capacidade: document.getElementById("capacidade").value,
    localizacao: document.getElementById("localizacao").value,
    timeMandante: document.getElementById("timeMandante").value,
    descricao: document.getElementById("descricao").value,
    curiosidades: document.getElementById("curiosidades").value,
    recorde: document.getElementById("recorde").value,
    eventos: document.getElementById("eventos").value,
    imagens: imagensArray,
    latitude: parseFloat(document.getElementById("latitude").value) || 0,
    longitude: parseFloat(document.getElementById("longitude").value) || 0
  };

  if (idEdicao) {
    await fetch(`${url}/${idEdicao}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(estadio)
    });
    idEdicao = null;
    document.getElementById("botao-submit").textContent = "Cadastrar novo estádio";
  } else {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(estadio)
    });
  }

  form.reset();
  carregarEstadios();
});

async function editarEstadio(id) {
  const response = await fetch(`${url}/${id}`);
  const estadio = await response.json();

  document.getElementById("nome").value = estadio.nome;
  document.getElementById("imagem").value = estadio.imagem;
  document.getElementById("capacidade").value = estadio.capacidade;
  document.getElementById("localizacao").value = estadio.localizacao;
  document.getElementById("timeMandante").value = estadio.timeMandante;
  document.getElementById("descricao").value = estadio.descricao;
  document.getElementById("curiosidades").value = estadio.curiosidades;
  document.getElementById("recorde").value = estadio.recorde || '';
  document.getElementById("eventos").value = estadio.eventos || '';
  document.getElementById("imagens").value = estadio.imagens ? estadio.imagens.join(', ') : '';
  document.getElementById("latitude").value = estadio.latitude || '';
  document.getElementById("longitude").value = estadio.longitude || '';

  idEdicao = id;
  document.getElementById("botao-submit").textContent = "Salvar alterações";
}

async function excluirEstadio(id) {
  const resultado = await Swal.fire({
    title: 'Tem certeza?',
    text: 'Esta ação irá excluir o estádio permanentemente.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sim, excluir!',
    cancelButtonText: 'Cancelar'
  });

  if (resultado.isConfirmed) {
    try {
      await fetch(`${url}/${id}`, {
        method: "DELETE"
      });

      Swal.fire({
        title: 'Excluído!',
        text: 'O estádio foi removido com sucesso.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      carregarEstadios();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      Swal.fire('Erro', 'Não foi possível excluir o estádio.', 'error');
    }
  }
}

carregarEstadios();

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

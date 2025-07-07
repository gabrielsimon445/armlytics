function addPeriodization() {
    window.location.href = "../html/periodization-form.html";
}

function carregarPeriodizacoes() {
  const periodizations = JSON.parse(localStorage.getItem("periodizations")) || [];

  const container = document.getElementById("cardsContainer");
  container.innerHTML = "";

  periodizations.forEach(periodizacao => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.width = "18rem";

    const body = document.createElement("div");
    body.className = "card-body";

    const title = document.createElement("h5");
    title.className = "card-title";
    title.textContent = periodizacao.nome;

    const description = document.createElement("p");
    description.className = "card-text";
    description.textContent = periodizacao.descricao;

    const btnAtualizar = document.createElement("a");
    btnAtualizar.className = "btn btn-warning me-2";
    btnAtualizar.textContent = "Atualizar";
    btnAtualizar.onclick = function () {
      window.location.href = `training-calendar.html?id=${periodizacao.id}`;
    };

    const btnIndicadores = document.createElement("a");
    btnIndicadores.href = "#";
    btnIndicadores.className = "btn btn-info text-white";
    btnIndicadores.textContent = "Indicadores";
    btnIndicadores.onclick = function () {
      window.location.href = `../html/dashboard.html?id=${periodizacao.id}`;
    };

    body.appendChild(title);
    body.appendChild(description);
    body.appendChild(btnAtualizar);
    body.appendChild(btnIndicadores);
    card.appendChild(body);
    container.appendChild(card);
  });
}

window.onload = carregarPeriodizacoes();
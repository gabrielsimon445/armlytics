

function getIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

function getPeriodizacaoPorId(id) {
    const periodizations = JSON.parse(localStorage.getItem("periodizations")) || [];
    return periodizations.find(p => p.id == id);
}

function gerarDias(dataInicio, dataTermino) {
    const dias = [];
    let atual = new Date(dataInicio);
    const fim = new Date(dataTermino);

    while (atual <= fim) {
    dias.push(new Date(atual));
    atual.setDate(atual.getDate() + 1);
    }

    return dias;
}

function montarCalendario(dias, calendarioDeTreinos) {
  const calendario = $('#calendario');
  calendario.empty();

  dias.forEach((dia) => {
    const dataStr = dia.toISOString().split('T')[0];
    const exercicios = calendarioDeTreinos[dataStr]?.exercicios || [];

  let listaExerciciosHtml = '';
  exercicios.forEach((ex) => {
    const concluidoClass = calendarioDeTreinos[dataStr].concluido ? 'text-success text-decoration-line-through' : '';
    listaExerciciosHtml += `
      <div class="text-start small ${concluidoClass}">
        • <strong>${ex.nome}</strong> - ${ex.series}x${ex.reps}
      </div>
    `;
  });

    const card = `
      <div class="col-md-4 mb-5">
        <div class="card p-2 text-center h-100 d-flex flex-column justify-content-between">
          <div>
            <strong>${dia.toLocaleDateString()}</strong>
            ${listaExerciciosHtml || '<div class="text-muted small mt-2">Sem exercícios</div>'}
          </div>
          <div class="mt-2">
            <button class="btn btn-sm btn-success" onclick="marcarComoExecutado('${dataStr}')">Concluir</button>
          </div>
        </div>
      </div>
    `;

    calendario.append(card);
  });
}

function marcarComoExecutado(dataStr) {
const id = getIdFromUrl();
  const periodizations = JSON.parse(localStorage.getItem("periodizations")) || [];
  const index = periodizations.findIndex(p => p.id == id);

  if (index === -1) {
    alert("Periodização não encontrada!");
    return;
  }

  const periodizacao = periodizations[index];

  const treinosDoDia = periodizacao.calendarioDeTreinos[dataStr];
  if (!treinosDoDia) {
    alert("Sem treinos neste dia.");
    return;
  }

  treinosDoDia.concluido = true;

  periodizacao.calendarioDeTreinos[dataStr] = treinosDoDia;
  periodizations[index] = periodizacao;

  localStorage.setItem("periodizations", JSON.stringify(periodizations));

  montarCalendario(gerarDias(periodizacao.dataInicio, periodizacao.dataTermino), periodizacao.calendarioDeTreinos);

  alert(`Treinos de ${dataStr} marcados como concluídos!`);
}

window.onload = function () {
    const id = getIdFromUrl();
    const periodizacao = getPeriodizacaoPorId(id);

    if (!periodizacao) {
        alert("Periodização não encontrada.");
        return;
    }

    const dias = gerarDias(periodizacao.dataInicio, periodizacao.dataTermino);
    montarCalendario(dias, periodizacao.calendarioDeTreinos);
};
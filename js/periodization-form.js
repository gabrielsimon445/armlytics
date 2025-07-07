let tabela;
const exerciciosPorData = {};

$(document).ready(function() {
    tabela = $('#tabela').DataTable({
        language: {
            url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/pt-PT.json"
        },
        info: false,
        lengthChange: false, 
        serverSide: false,
        processing: false,
        searching: false,
        columnDefs: [{
        targets: 3,
        data: null,
        defaultContent: `
            <button class="editar btn btn-sm btn-warning">✏️ Editar</button>
            <button class="excluir btn btn-sm btn-danger">🗑️ Excluir</button>
        `,
        orderable: false
    }]
    });
    addExercise();
    editExercise();
    deleteExercise();
    generateCalendar();
    selectExercise();
});

function addExercise() {
    $('#dialog').dialog({
        autoOpen: false,
        modal: true,
        buttons: {
            "Adicionar": function() {
                let nome = $('#nomeExercicio').val();
                let series = $('#series').val();
                let repeticoes = $('#repeticoes').val();

                if (nome && series && repeticoes) {
                    tabela.row.add([nome, series, repeticoes]).draw();
                    $('#formulario')[0].reset();
                    $(this).dialog("close");
                } else {
                    alert("Por favor, preencha todos os campos.");
                }
            },
            "Cancelar": function() {
                $(this).dialog("close");
            }
        }
    });

    $('#addExercise').click(function() {
        $('#dialog').dialog('open');
    });
}

function deleteExercise() {
    $('#tabela tbody').on('click', '.excluir', function() {
        tabela.row($(this).parents('tr')).remove().draw();
    });
}

function editExercise() {
   $('#tabela tbody').on('click', '.editar', function() {
        let linha = tabela.row($(this).parents('tr'));
        let dados = linha.data();

        $('#nome').val(dados[0]);
        $('#series').val(dados[1]);
        $('#repeticoes').val(dados[2]);

        $('#dialog').dialog({
            title: "Editar Exercício",
            buttons: {
                "Salvar": function() {
                    let nome = $('#nome').val();
                    let series = $('#series').val();
                    let repeticoes = $('#repeticoes').val();
                    linha.data([nome, series, repeticoes]).draw();
                    $('#formulario')[0].reset();
                    $(this).dialog("close");
                },
                "Cancelar": function() {
                    $(this).dialog("close");
                }
            }
        }).dialog('open');
    });
}

function generateCalendar() {
    $('#dataTermino').on('change', function () {
        const inicio = new Date($('#dataInicio').val());
        const fim = new Date($('#dataTermino').val());

        if (isNaN(inicio) || isNaN(fim) || fim < inicio) {
            alert('Selecione datas válidas!');
            return;
        }

        const dias = [];
        let data = new Date(inicio);

        while (data <= fim) {
            dias.push(new Date(data));
            data.setDate(data.getDate() + 1);
        }

        const calendario = $('#calendario');
        calendario.empty();

        dias.forEach((dia) => {
            const dataStr = dia.toISOString().split('T')[0];
            const card = `
            <div class="col-md-2 mb-3">
                <div class="card p-2 text-center">
                <strong>${dia.toLocaleDateString()}</strong>
                <button class="btn btn-sm btn-primary mt-2" onclick="abrirModalExercicio('${dataStr}')">Adicionar exercício</button>
                </div>
            </div>
            `;
            calendario.append(card);
        });
    });
}

function abrirModalExercicio(data) {
  const $modalTableBody = $('#tabela-exercicios-disponiveis tbody');
  $modalTableBody.empty();

  const dadosExercicios = tabela.rows().data().toArray();

  dadosExercicios.forEach((ex, index) => {
    $modalTableBody.append(`
      <tr>
        <td>${ex[0]}</td>
        <td>${ex[1]}</td>
        <td>${ex[2]}</td>
        <td>
          <button class="btn btn-sm btn-success selecionar-exercicio" data-index="${index}" data-data="${data}">
            Selecionar
          </button>
        </td>
      </tr>
    `);
  });

  if (!$.fn.DataTable.isDataTable('#tabela-exercicios-disponiveis')) {
    $('#tabela-exercicios-disponiveis').DataTable({
      language: {
        url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/pt-PT.json"
      }
    });
  } else {
    const table = $('#tabela-exercicios-disponiveis').DataTable();
    table.clear();
    table.rows.add($('#tabela-exercicios-disponiveis tbody tr'));
    table.draw();
  }

  $('#modalSelecionarExercicio').dialog({
    modal: true,
    width: 600,
    title: `Selecionar exercício para ${data}`
  });
}

function selectExercise() {
    $(document).on('click', '.selecionar-exercicio', function () {
        const index = $(this).data('index');
        const data = $(this).data('data');

        const ex = tabela.row(index).data();

          if (!ex) {
    alert('Exercício não encontrado!');
    return;
  }

        if (!exerciciosPorData[data]) {
            exerciciosPorData[data] = [];
        }

        const foco = $('#foco').first().val();
        if (foco == "VAZIO") {
            alert('Por favor, selecione um foco');
            return;
        }

        exerciciosPorData[data].push({
            nome: ex[0],
            series: ex[1],
            reps: ex[2],
            concluido: false,
            foco: foco
        });

        console.log(`Foco do exercício: ${exerciciosPorData[data]}`);
        console.log(`Exercício adicionado à data ${data}:`, exerciciosPorData[data]);

        $('#modalSelecionarExercicio').dialog('close');
    });
}

function salvarPeriodizacao() {
    const nome = $('#nome').first().val();
    const descricao = $('#descricao').first().val();
    const dataInicio = $('#dataInicio').val();
    const dataTermino = $('#dataTermino').val();

    const exerciciosCadastrados = tabela.rows().data().toArray().map(e => ({
        nome: e[0],
        series: e[1],
        reps: e[2]
    }));

    const novaPeriodizacao = {
        id: Date.now(),
        nome,
        descricao,
        dataInicio,
        dataTermino,
        exerciciosCadastrados,
        calendarioDeTreinos: exerciciosPorData
    };

    const periodizations = JSON.parse(localStorage.getItem("periodizations")) || [];

    periodizations.push(novaPeriodizacao);

    localStorage.setItem("periodizations", JSON.stringify(periodizations));

    alert('Periodização salva com sucesso!');
    window.location.href = 'periodization-list.html';
}
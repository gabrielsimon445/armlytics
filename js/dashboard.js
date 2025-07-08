google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(function() {
    numberDaysTrainedAndnotTrained();
    caloriesBurnedPerWorkout();
    exerciseFrequencyInPeriodization();
});

const id = getIdFromUrl();
const periodizacao = getPeriodizacaoPorId(id);

function numberDaysTrainedAndnotTrained() {
    let treinosExecutados = 0;
    let treinosNaoExecutados = 0;

    let calendarioDeTreinos = periodizacao.calendarioDeTreinos || {};
    Object.values(calendarioDeTreinos).forEach((dia) => {
        if (dia.concluido) {
            treinosExecutados++;
        } else {
            treinosNaoExecutados++;
        }
    });

    var data = google.visualization.arrayToDataTable([
    ['Treinos', 'Quantidade'],
    ['Treinos executados', treinosExecutados],
    ['Treinos não executados', treinosNaoExecutados]
    ]);

    var options = {
        title: 'Quantidade de treinos executados/não executados',
        backgroundColor: { fill: 'transparent' }
    };

    var chart = new google.visualization.PieChart(document.getElementById('numberDaysTrainedAndnotTrained'));

    chart.draw(data, options);
}

async function caloriesBurnedPerWorkout() {
    const [circuit, weight] = await Promise.all([
        getCaloriesBurnedFromApiNinjas('circuit'),
        getCaloriesBurnedFromApiNinjas('weight')
    ]);

    const treinos = periodizacao.calendarioDeTreinos || {};
    const caloriasPorData = {};

    for (const [data, { exercicios }] of Object.entries(treinos)) {
        const focos = exercicios.map(e => e.foco);
        let calorias = 0;

        if (focos.some(f => ['RESISTENCIA', 'FORTIFICAMENTO_ARTICULAR'].includes(f))) {
            calorias = circuit;
        } else if (focos.includes('FORCA')) {
            calorias = weight;
        }

        if (calorias) {
            caloriasPorData[data] = calorias;
        }
    }

    const dataTable = new google.visualization.DataTable();
    dataTable.addColumn('date', 'Data');
    dataTable.addColumn('number', 'Calorias queimadas');

    for (const [dataStr, calorias] of Object.entries(caloriasPorData)) {
        const [y, m, d] = dataStr.split('-').map(Number);
        dataTable.addRow([new Date(y, m - 1, d), calorias]);
    }

    new google.visualization.LineChart(document.getElementById('caloriesBurnedPerWorkout'))
    .draw(dataTable, {
        title: 'Calorias queimadas por treino',
        backgroundColor: { fill: 'transparent' }
    });
}

function exerciseFrequencyInPeriodization() {
    const id = getIdFromUrl();
    const periodizacao = getPeriodizacaoPorId(id);

    const nomesExercicios = periodizacao.exerciciosCadastrados.map(e => e.nome);
    const contagem = {};

    nomesExercicios.forEach(nome => contagem[nome] = 0);

    const calendario = periodizacao.calendarioDeTreinos;
    for (const dia in calendario) {
        const treino = calendario[dia];
        treino.exercicios.forEach(ex => {
        if (contagem.hasOwnProperty(ex.nome)) {
            contagem[ex.nome]++;
        }
        });
    }

    const chartData = [['Exercício', 'Frequência']];
    for (const nome in contagem) {
        chartData.push([nome, contagem[nome]]);
    }

    const data = google.visualization.arrayToDataTable(chartData);

    const options = {
        title: 'Frequência de Exercícios na Periodização',
        backgroundColor: 'transparent',
    };

    const chart = new google.visualization.PieChart(document.getElementById('exerciseFrequencyInPeriodization'));
    chart.draw(data, options);
}

function getIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

function getPeriodizacaoPorId(id) {
    const periodizations = JSON.parse(localStorage.getItem("periodizations")) || [];
    return periodizations.find(p => p.id == id);
}

async function getCaloriesBurnedFromApiNinjas(activity) {
    const response = await fetch(`https://api.api-ninjas.com/v1/caloriesburned?activity=${activity}`, {
        method: 'GET',
        headers: {
            'X-Api-Key': 'kLOue0oOwPbuosIi5fA5Cg==4RhPq0T9MjbNq869'
        }
    });
    const data = await response.json();
    return data[0]?.calories_per_hour || 0;
}
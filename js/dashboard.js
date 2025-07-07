google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(function() {
    numberDaysTrainedAndnotTrained();
    averageCaloriesBurnedPerWorkout();
});

const id = getIdFromUrl();
const periodizacao = getPeriodizacaoPorId(id);

function numberDaysTrainedAndnotTrained() {
    let treinosExecutados = 0;
    let treinosNaoExecutados = 0;

    let calendarioDeTreinos = periodizacao.calendarioDeTreinos || {};
    Object.values(calendarioDeTreinos).forEach((exerciciosDoDia) => {
        exerciciosDoDia.forEach((exercicio) => {
            if (exercicio.concluido) {
                treinosExecutados++;
            } else {
                treinosNaoExecutados++;
            }
        });
    });

    var data = google.visualization.arrayToDataTable([
    ['Treinos', 'Quantidade'],
    ['Treinos executados',     treinosExecutados],
    ['Treinos não executados',      treinosNaoExecutados]
    ]);

    var options = {
    title: 'Quantidade de treinos executados/não executados'
    };

    var chart = new google.visualization.PieChart(document.getElementById('numberDaysTrainedAndnotTrained'));

    chart.draw(data, options);
}

async function averageCaloriesBurnedPerWorkout() {
    // Calorias por tipo de treino (valores por hora)
    const caloriesBurnedCircuit = await getCaloriesBurnedFromApiNinjas('circuit'); // RESISTÊNCIA, FORTIFICAMENTO_ARTICULAR
    const caloriesBurnedWeight = await getCaloriesBurnedFromApiNinjas('weight');   // FORÇA

    const calendarioDeTreinos = periodizacao.calendarioDeTreinos || {};
    const caloriasPorData = {};
    let totalCalorias = 0;
    let totalTreinos = 0;

    Object.entries(calendarioDeTreinos).forEach(([data, exerciciosDoDia]) => {
        let caloriasDia = 0;

        exerciciosDoDia.forEach((exercicio) => {
            if (exercicio.concluido) {
                totalTreinos++;

                if (['RESISTENCIA', 'FORTIFICAMENTO_ARTICULAR'].includes(exercicio.foco)) {
                    caloriasDia += caloriesBurnedCircuit;
                } else if (exercicio.foco === 'FORCA') {
                    caloriasDia += caloriesBurnedWeight;
                }
            }
        });

        if (caloriasDia > 0) {
            caloriasPorData[data] = caloriasDia;
            totalCalorias += caloriasDia;
        }
    });

    const media = totalTreinos ? (totalCalorias / totalTreinos) : 0;
    localStorage.setItem('mediaCaloriasPorTreino', media.toFixed(2));

    const graficoData = [['Data', 'Calorias queimadas']];
    Object.entries(caloriasPorData).forEach(([dataStr, calorias]) => {
        // Supondo que a data vem no formato "YYYY-MM-DD"
        const partes = dataStr.split('-');
        const data = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
        graficoData.push([data, calorias]);
    });

   const dataTable = new google.visualization.DataTable();
dataTable.addColumn('date', 'Data');
dataTable.addColumn('number', 'Calorias queimadas');

Object.entries(caloriasPorData).forEach(([dataStr, calorias]) => {
    const partes = dataStr.split('-'); // YYYY-MM-DD
    const data = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
    dataTable.addRow([data, calorias]);
});

    const chart = new google.visualization.AreaChart(document.getElementById('averageCaloriesBurnedPerWorkout'));
    chart.draw(dataTable, options);
}


function quantityEachTypeExercise() {
    //pegar o nome de cada exercicio no localStorage exerciciosCadastrados
    //procurar por todo o calendario de treinos pelo nome de cada exercicio
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
            'X-Api-Key': 'API'
        }
    });
    const data = await response.json();
    return data[0]?.calories_per_hour || 0;
}
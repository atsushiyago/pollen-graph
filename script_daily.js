const query = new URL(document.location).searchParams;
const code = query.get('code');

document.getElementById('header').innerHTML =
  '<b>' +
  array[array.indexOf(code) - 1] +
  'の花粉飛散数グラフ（日ごと：観測開始日の2月3日から）</b><br><a href="hourly?code=' +
  code +
  '">1時間ごとのグラフはこちらを押してください</a>';

document.getElementById('footer').innerHTML =
  '<br><a href="https://weathernews.jp/" target="noopener">株式会社ウェザーニュース</a>のポールンロボで観測された<a href="https://wxtech.weathernews.com/pollen/index.html" target="noopener">データ</a>を利用しています<br>毎時10分ほど後に更新されるようです<p>はなこさんによる花粉観測は2021年で終了しています（<a href="https://www.env.go.jp/press/110339.html" target="noopener">環境省の報道発表資料</a>）<p><a href="index.html">トップページへ戻る</a>';

function getYYMMDD(day) {
  const dt = new Date();
  dt.setDate(dt.getDate() - day);
  const y = dt.getFullYear();
  const m = ('00' + (dt.getMonth() + 1)).slice(-2);
  const d = ('00' + dt.getDate()).slice(-2);
  const result = y + m + d;
  return result;
}

function getMMDD(day) {
  const dt = new Date();
  dt.setDate(dt.getDate() - day);
  const y = dt.getFullYear();
  const m = ('00' + (dt.getMonth() + 1)).slice(-2);
  const d = ('00' + dt.getDate()).slice(-2);
  const result = m + '/' + d;
  return result;
}

function draw_chart() {
  const labels = label_array;

  const data = {
    labels: labels,
    datasets: [
      {
        label: '花粉飛散数（個数/m^2）',
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: chartVal,
      },
    ],
  };

  const config = {
    type: 'line',
    data: data,
    options: {
      scales: {
        y: {
          display: true,
          suggestedMin: 0,
          suggestedMax: 20,
          beginAtZero: true,
        },
      },
    },
  };

  // Chart.defaults.font.size = 24;
  const myChart = new Chart(document.getElementById('myChart'), config);
}

let data_array = [],
  label_array = [],
  chartVal = [],
  total = 0,
  j = 0;

const urls = [
  'data/2/' + code,
  'data/3/' + code,
  'https://wxtech.weathernews.com/opendata/v1/pollen?citycode=' +
    code +
    '&start=20220401&end=' +
    getYYMMDD(0),
];

function convert_array(csv_data) {
  const data_string = csv_data.split('\n');
  for (let i = 0; i < data_string.length - 1; i++) {
    if (i > 0) {
      data_array[i] = data_string[i].split(',');
      if (data_array[i][2] == '-9999') {
        data_array[i][2] = null;
      }
      total += Number(data_array[i][2]);
      if ((i + 1) % 24 == 0) {
        chartVal.push(total);
        label_array.unshift(getMMDD(j));
        j++;
        total = 0;
      }
    }
  }
}

function draw_data() {
  document.getElementById('loading').innerHTML = '';
  draw_chart();
}

async function get_data() {
  Promise.all(
    urls.map((target) => fetch(target).then((result) => result.text()))
  )
    .then((results) => results.forEach((text) => convert_array(text)))
    .then(() => draw_data());
}

get_data();

'use strict';

//各要素の取得
const katakanaField = document.getElementById('katakana');
const kotobaField = document.getElementById('kotoba');
const typedField = document.getElementById('typed');
const untypedField = document.getElementById('untyped');
const countField = document.getElementById('count');

const timeElement = document.getElementById('time');
const start = document.getElementById('start');
const reset = document.getElementById('reset');
const hidden = document.getElementById('hidden')
const result = document.getElementById('result');

//全体的な時間
const time = 30000;

//入力した数
let missTypeCount = 0;
let successTypeCount = 0;

let loc = 0;

//各ワード
const word = [
  { japanese: '資産', kana: 'しさん', roma: 'sisann' },
  { japanese: '負債', kana: 'ふさい', roma: 'husai' },
  { japanese: '費用', kana: 'ひよう', roma: 'hiyou' },
  { japanese: '収益', kana: 'しゅうえき', roma: 'syuueki' },
  { japanese: '純資産', kana: 'じゅんしさん', roma: 'junsisann' },
  { japanese: '勘定科目', kana: 'かんじょうかもく', roma: 'kanjoukamoku' },
  { japanese: '財務諸表', kana: 'ざいむしょひょう', roma: 'zaimusyohyou' },
  { japanese: '損益計算書', kana: 'そんえきけいさんしょ', roma: 'sonnekikeisansyo' },
  { japanese: '貸借対照表', kana: 'たいしゃくたいしょうひょう', roma: 'taisyakutaisyouhyou' },
  { japanese: '株主資本等変動計算書', kana: 'かぶぬししほんとうへんどうけいさんしょ', roma: 'kabunusisihontouhendoukeisansho' },
  { japanese: 'キャッシュフロー計算書', kana: 'キャッシュフローけいさんしょ', roma: 'kyassyuhuro-keisansyo' },
];

//各ワードを定義
let katakana;
let kotoba;
let typed;
let untyped;
let counts = '　';

let remaining = time; //30000ミリ秒 つまり、30秒のこと
let intervalId = null;

//配列word 打つ部分である、ローマ字の合計を計算 143
let i = 0;
let wordLength = 0;
while (i < word.length) {
  wordLength += word[i].roma.length;
  i++;
}

// startボタンとresetボタンの無効、有効の切り替え
//最初、startボタンだけ押せる
function buttonInitial() {
  start.disabled = false;
  reset.disabled = true;
  start.classList.remove('disabled');
  reset.style.cursor = 'auto';
}
buttonInitial();

// startボタンを押した時
start.addEventListener('click', function (e) {
  if (intervalId !== null) { return; }
  ready();
});

function ready() {
  //各ワードを空にする。'　';なのは、'';だと、ブラウザ上でサイズがおかしくなる為
  katakanaField.textContent = '　';
  kotobaField.textContent = '　';
  typedField.textContent = '　';
  untypedField.textContent = '　';
  hidden.textContent = '';
  buttonCount();

  //1秒ごとに3.2.1の表示
  let readyTime = 3;
  let readyTimer = setInterval(function () {
    countField.innerHTML = readyTime;
    readyTime--;
    //カウントダウンが 0 になったらカウントダウンを止めて、ゲームスタート
    if (readyTime < 0) {
      clearInterval(readyTimer);
      gameStart();
      countField.innerHTML = counts; //そのままだと 0 で表示される為、空白にする
    };
  }, 1000);
}

//startボタンを押したら、3.2.1カウントの間、両方無効
function buttonCount() {
  start.disabled = true;
  reset.disabled = true;
  start.classList.add('disabled');
  start.style.cursor = 'auto';
}

//ゲームスタート
function gameStart() {
  let pre = new Date();
  intervalId = setInterval(function () {
    const now = new Date();
    remaining -= now - pre;

    //制限時間が 0 になる or ワードを打ち終えたらゲーム修了
    if (remaining < 0 || loc === wordLength) {
      gameEnd();
    }
    pre = now;
    updateTime();
  }, 10);
  //キーが押されたら、next();へ
  document.addEventListener('keydown', keyDown);
  next();
}

//各タイマーの計算
function updateTime() {
  const ms = Math.floor(remaining % 1000);
  const s = Math.floor(remaining / 1000) % 60;
  const m = Math.floor(remaining / 1000 / 60) % 60;
  const h = Math.floor(remaining / 1000 / 60 / 60) % 24;

  //ミリ秒、秒、分、時間を文字列に変換し、
  //msStrは3桁で表示、それ以外は2桁で表示する
  const msStr = ms.toString().padStart(3, '0');
  const sStr = s.toString().padStart(2, '0');
  const mStr = m.toString().padStart(2, '0');
  const hStr = h.toString().padStart(2, '0');

  timeElement.innerText = `${hStr}:${mStr}:${sStr}:${msStr}`;
}

function keyDown(e) {
  buttonRunning();
  //キーが押されたら、一致してなければ何もしない。
  if (e.key !== untyped.substring(0, 1)) {
    missTypeCount += 1;
    return;
  }
  //一致していれば、untypedからtypedに、1文字ずつ移す
  successTypeCount += 1;
  loc++;
  typed += untyped.substring(0, 1);
  untyped = untyped.substring(1);

  updateTextField();

  //出ているワードが打ち終えたら、次のワードへ行く
  if (untyped === '') {
    next();
  }
};

//タイピングしている間、1回何かのキーを押したら、resetボタンを押せる
function buttonRunning() {
  start.disabled = true;
  reset.disabled = false;
  reset.classList.remove('disabled');
  reset.style.cursor = 'pointer';
}

// idx が配列wordの中からワードをランダムで出して、1回出たワードは次以降は出てこないようにする
function next() {
  const idx = word.splice(Math.floor(Math.random() * word.length), 1)[0];

  //それを各ワードに代入 idx.〇〇〇;の形で
  kotoba = idx.japanese;
  katakana = idx.kana;
  typed = '';
  untyped = idx.roma;
  updateTextField();
}

// 打ち終えた後に次のワードを出す
function updateTextField() {
  katakanaField.textContent = katakana;
  kotobaField.textContent = kotoba;
  typedField.textContent = typed;
  untypedField.textContent = untyped;
}

//ゲーム終わり
function gameEnd() {
  remaining = 0;
  updateTime();
  clearInterval(intervalId);
  intervalId = null;
  document.removeEventListener('keydown', keyDown);
  hidden.textContent = 'Resetを押してね';
  result.textContent = `正タイプ数:${successTypeCount}, ミスタイプ数: ${missTypeCount}, 総タイプ数: ${missTypeCount + successTypeCount}`;
}

// resetボタンを押した時、色々エラーが出た為、再読み込みにした。
reset.addEventListener('click', function (e) {
  window.location.reload();
});
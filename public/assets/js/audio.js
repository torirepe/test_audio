// canvas要素を取得
var c = document.getElementById('effect');
var cw;
var ch;

// canvasサイズをwindowサイズにする
c.width = cw = window.innerWidth - 10;
c.height = ch = window.innerHeight - 10;

// 描画に必要なコンテキスト(canvasに描画するためのAPIにアクセスできるオブジェクト)を取得
var ctx = c.getContext('2d');

// AudioNodeを管理するAudioContextの生成
var audioCtx = new(window.AudioContext || window.webkitAudioContext)();


/**
 * 音声ファイルローダー
 */
var Loader = function (url) {
  this.url = ""; // 読み込む音声データのURL
};

// XMLHttpRequestを利用して音声データ(バッファ)を読み込む。
Loader.prototype.loadBuffer = function () {
  var loader, request;
  loader = this;
  request = new XMLHttpRequest();
  request.open('GET', this.url, true);
  request.responseType = 'arraybuffer';

  request.onload = function () {
    // 取得したデータをデコードする。
    audioCtx.decodeAudioData(this.response, function (buffer) {
      if (!buffer) {
        console.log('error');
        return;
      }
      loader.playSound(buffer); // デコードされたデータを再生する。
    }, function (error) {
      console.log('decodeAudioData error');
    });
  };

  request.onerror = function () {
    console.log('Loader: XHR error');
  };

  request.send();
};

// 読み込んだ音声データ(バッファ)を再生と波形データの描画を開始する。
Loader.prototype.playSound = function (buffer) {
  var visualizer = new Visualizer(buffer);
};


/**
 * ビジュアライザー
 */
var Visualizer = function (buffer) {
  this.sourceNode = audioCtx.createBufferSource(); // AudioBufferSourceNodeを作成
  this.sourceNode.buffer = buffer; // 取得した音声データ(バッファ)を音源に設定
  this.analyserNode = audioCtx.createAnalyser(); // AnalyserNodeを作成
  this.freqs = new Uint8Array(this.analyserNode.frequencyBinCount); // 周波数領域の波形データを格納する配列を生成 
  this.sourceNode.connect(this.analyserNode); // AudioBufferSourceNodeをAnalyserNodeに接続
  this.analyserNode.connect(audioCtx.destination); // AnalyserNodeをAudioDestinationNodeに接続
  this.sourceNode.start(0); // 再生開始
  this.draw(); // 描画開始
};

Visualizer.prototype.draw = function () {
  // 0~1まで設定でき、0に近いほど描画の更新がスムーズになり, 1に近いほど描画の更新が鈍くなる。
  this.analyserNode.smoothingTimeConstant = .98;

  // FFTサイズを指定する。デフォルトは2048。
  this.analyserNode.fftSize = 4096;

  // 周波数領域の波形データを引数の配列に格納するメソッド。
  // analyserNode.fftSize / 2の要素がthis.freqsに格納される。今回の配列の要素数は1024。
  this.analyserNode.getByteFrequencyData(this.freqs);

  // 全ての波形データを描画するために、一つの波形データのwidthを算出する。
  var barWidth = cw / this.analyserNode.frequencyBinCount;

  ctx.fillStyle = 'rgba(255, 255, 255, 1)';
  ctx.fillRect(0, 0, cw, ch);

  // analyserNode.frequencyBinCountはanalyserNode.fftSize / 2の数値。よって今回は1024。
  for (var i = 0; i < this.analyserNode.frequencyBinCount; ++i) {
    var value = this.freqs[i]; // 配列には波形データ 0 ~ 255までの数値が格納されている。
    var percent = value / 255; // 255が最大値なので波形データの%が算出できる。
    var height = ch * percent; // %に基づく描画する高さを算出

    ctx.fillStyle = '#ffff77';
    ctx.fillRect(cw/2 + (i * barWidth/2), ch*0.9, barWidth, -height * 0.2); // -をつけないと下に描画されてしまう。
    ctx.fillRect(cw/2 + (i * barWidth/2), ch*0.9 -1, barWidth, height * 0.1); // -をつけないと下に描画されてしまう。
    ctx.fillRect(cw/2 - (i * barWidth/2), ch*0.9, barWidth, -height * 0.2); // -をつけないと下に描画されてしまう。
    ctx.fillRect(cw/2 - (i * barWidth/2), ch*0.9 -1, barWidth, height * 0.1); // -をつけないと下に描画されてしまう。
  }

  window.requestAnimationFrame(this.draw.bind(this));
};

// requestAnimationFrameを多くのブラウザで利用するためにprefixの記載
var setUpRAF = function () {
  var requestAnimationFrame = window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
};

setUpRAF();
var loader = new Loader('sample.mp3');
loader.loadBuffer();

//ランダム
function randfunc(min, max) { // min ~ max - 1の乱数発生　例：１〜２の乱数ならば引数に1,3を渡す
  return Math.floor(Math.random() * (max - min) + min);
}

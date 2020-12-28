let word2Vec;

function modelLoaded() {
    select('#status').html('Model Loaded');
}

var arr = ["はっきり","しっかり","ちゃんと","ゆっくり","どんどん","じっと","すっかり","びっくり","きちん","ふと",
    "そろそろ","そっと","たっぷり","ほっと","ぼんやり","そっくり","さっぱり","ぴったり","あっさり","ばらばら",
    "ぎりぎり","すっきり","さっと","はっと","のんびり","じっくり","さっさ","めちゃくちゃ","ぱっと","こっそり",
    "ぐっと","いらいら","うっかり","がっかり","きっちり","にこにこ","きっぱり","ふっと","にっこり","どきどき",
    "ひっそり","うんざり","ぐるぐる","すっと","ぴんと","ずばり","ぼろぼろ","きらきら","ざっと","ごろごろ",
    "さらさら","ふらふら","どっと","ぶつぶつ","うろうろ","ぶらぶら","くっきり","ぎゅっ","ぞっと","くるくる",
    "かっと","むっと","ぎょっと","にやにや","うっすら","うっとり","ばたばた","ばったり","ぐったり","だらだら",
    "がたがた","ずらり","せっせ","ぐずぐず","こつこつ","ずるずる","びっしり","わくわく","すっぽり","ちょっぴり",
    "ちらちら","じわじわ","ばりばり","ふっくら","ぎっしり","しっとり","ぴかぴか","がっちり","ぽかん","じりじり",
    "がっくり","しんと","ぱらぱら","ごちゃごちゃ","すんなり","とんとん","おずおず","ぐっすり","がっしり","のろのろ",
    "つるつる","どろどろ","しっくり","ひらひら","ぶるぶる","ぐんぐん","はらはら","まじまじ","がんがん","てきぱき",
    "ぞろぞろ","からから","ばっちり","ぽっかり","きょとん"];

  var arr2 = arr.map(w => hiraToKana(w)).concat(arr);
    function hiraToKana(str) {
      return str.replace(/[\u3041-\u3096]/g, function(match) {
          var chr = match.charCodeAt(0) + 0x60;
          return String.fromCharCode(chr);
      });
    }
let selected_text;
let words;
let vectors;

function setup(){
    let canvas = createCanvas(640, 480);
    canvas.parent("map");
    frameRate(1);
    textAlign(CENTER,CENTER);
    word2Vec = ml5.word2vec('vectors5.json', modelLoaded);
    
    const select =document.getElementById("onomatopeSelect");
    select.addEventListener('change', ()=>{
      const w1 =document.getElementById("onomatopeLabel").textContent;
      const w2 = select.value;
      setTweetButton(w1+"と" +w2,"似すぎなオノマトペ");

    });
    


    $('#exampleModalLong').on('shown.bs.modal', function () {
        setTweetButton("","似すぎなオノマトペ");

      })
    
    


    let classes = ["btn","btn-outline-primary","btn-block", "mx-auto"];
    let target = document.getElementById("buttons");

    for (let i = 0; i < arr.length; i++) {
        const btn = document.createElement("btn");
        btn.innerText = arr[i];
        btn.classList.add(...classes);
        btn.setAttribute("data-target", "#exampleModalLong");
        btn.setAttribute("data-toggle", "modal");
        btn.addEventListener("click",()=>{
            near(btn.innerText);   
        });
       target.appendChild(btn);

       const div = document.createElement("div");
       const divclasses = ["col-sm-2","mt-3"];
       div.classList.add(...divclasses);
       div.appendChild(btn);
       target.appendChild(div);
    }
}


function near(word){
  let title = document.getElementById("exampleModalLongTitle");
  title.textContent = word;
  let label = document.getElementById("onomatopeLabel").textContent = word;
  let nearResults = document.getElementById("content");
  console.log(word);
  word2Vec.nearest(word,10, (error, result) => {
      let output ='';
      console.log(result);
      if (result) {
          for (let i = 0; i < result.length; i += 1) {
          output += `${result[i].word  }<br/>`;
          }
      } else {
          output = 'No word vector found';
      }
      nearResults.innerHTML = output;
  });
  nearestFromSet(word, arr2, (err, result) => {
    const select = document.getElementById("onomatopeSelect");
    select.innerHTML = '';
      if(result){
        words = result.map(r => r.word).slice(0,5);
        words.push(word);
        vectors = get2dVectors(words);
        words.forEach(w => {
          const o = document.createElement("option");
          o.textContent = w;
          select.appendChild(o);
        });
      }
      else{
        words = null;
        vectors = null;
      }
    });
}





      
function setTweetButton(text,hashtags){

    $('#tweet-area').empty(); //既存のボタン消す
    // htmlでスクリプトを読んでるからtwttがエラーなく呼べる
    // オプションは公式よんで。
    twttr.widgets.createShareButton(
      "",
      document.getElementById("tweet-area"),
      {
        size: "large", //ボタンはでかく
        text: text, // 狙ったテキスト
        hashtags: hashtags, // ハッシュタグ
        url: "//url" // URL
      }
    );
    
  }

  
  function nearestFromSet(word, set, cb){
    word2Vec.nearest(word, 10000, (err, result) => {
      if(result){
        const filtered = result.filter(r => set.some(w => w == r.word));
        cb(undefined, filtered);  
      }
      else{
        cb(undefined, null);
      }
    });
  }
  
  function get2dVectors(words){
    const vectors = words.map(w => word2Vec.model[w].dataSync());
    const eVectors = PCA.getEigenVectors(vectors);
      
    const data = PCA.computeAdjustedData(vectors, eVectors[0], eVectors[1]);
    return data.adjustedData;
  }
  
  function draw(){
    background(255);
    stroke(32);
    textSize(32);
    for(let i = 0; i < 10; i++){
      const x = width * i / 10;
      line(x, 0, x, height);
    }
    for(let i = 0; i < 10; i++){
      const y = height * i / 10;
      line(0, y, width, y);
    }
    if(!words || !vectors) return;
    const xmin = min(vectors[0]);
    const xmax = max(vectors[0]);
    const ymin = min(vectors[1]);
    const ymax = max(vectors[1]);
  
    stroke(0);
    for(let i = words.length-1; i >= 0; i--){
      const w = words[i];
      const m = textWidth(w) / 2;
      const x = map(vectors[0][i], xmin, xmax, m, width-m);
      const y = map(vectors[1][i], ymin, ymax, m, height-m);
      
      fill(228);
      rectMode(CENTER);
      rect(x, y, textWidth(w), textAscent(w) + textAscent(w), 8);
      fill(0);
      text(w, x, y);
    }
  }

  function mouseClicked(){
    const xmin = min(vectors[0]);
    const xmax = max(vectors[0]);
    const ymin = min(vectors[1]);
    const ymax = max(vectors[1]);
    for(let i = words.length-1; i >= 0; i--){
      const w = words[i];
      const m = textWidth(w) / 2;
      const x = map(vectors[0][i], xmin, xmax, m, width-m);
      const y = map(vectors[1][i], ymin, ymax, m, height-m);
      const ww = textWidth(w);
      const wh = textAscent(w) + textDescent(w);
      if(x - ww / 2 < mouseX && x + ww / 2 > mouseX && y - wh / 2 < mouseY && y + wh / 2 > mouseY){
        near(w);
        break;
      }
    }
  }

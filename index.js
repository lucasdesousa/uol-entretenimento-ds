/* ----------------------------------------------
    Aqui são todas as configurações dos plugins 
/* ---------------------------------------------- */
//Configurações do plugin
var Link_XML = "http://plugins.wiplay.com.br/modulos/plugins/getXml/Njg";
var Nome_Ponteiro = "plugin_uol_entretenimento";
var Duracao_Ponteiro = 2; //Em dias
var Tempo_Atualizacao = 20000; //Tempo para atualizar o feed (em ms [segundos * 100])
var Plugin_Dev = 0; //Se 1, a div 'demo' é exibida com o log do código.

//Configurações personalizadas (Apenas para plugin UOL - Texto Padrão)
var Categoria_UOL = "Entretenimento";
var Texto_UOL =
  "Esse é um texto com o número máximo de caractéres que esse modelo de página suporta, apenas teste";
var Creditos_UOL = "Créditos dessa foto";
var Data_UOL = "00/00/0000 00:00:00";

/* ----------------------------------------------
    Todas as variáveis que são usadas nos plugins
/* ---------------------------------------------- */
//Controle dos feeds
var Feed_Atual = "1984"; //Default
var ID_Feed_Atual = "0"; //0 - Index
var Limite_ID_Feed;

//Controle do XML
var Ponteiro;
var Nodes_XML, Arquivo_XML;

//Controle do calendário
var data = new Date();
var dias_data = [
  "DOMINGO",
  "SEGUNDA-FEIRA",
  "TERÇA-FEIRA",
  "QUARTA-FEIRA",
  "QUINTA-FEIRA",
  "SEXTA-FEIRA",
  "SÁBADO",
];
var meses_data = [
  "JANEIRO",
  "FEVEREIRO",
  "MARÇO",
  "ABRIL",
  "MAIO",
  "JUNHO",
  "JULHO",
  "AGOSTO",
  "SETEMBRO",
  "OUTUBRO",
  "NOVEMBRO",
  "DEZEMBRO",
];

/* ----------------------------------------------
    Funções de controle do plugin
/* ---------------------------------------------- */
//Função inicial "OnLoad"
function Iniciar_Plugin() {
  AtualizarDataHora();
  var atualizar = setInterval(AtualizarPage, Tempo_Atualizacao);
  if (Plugin_Dev == 1) {
    document.getElementById("demo").style.display = "block";
  }
}

//Função para atualizar a página após 'Tempo_Atualizacao'
function AtualizarPage() {
  window.location.reload(1);
}

/* ----------------------------------------------
    Funções de controle do calendário e relógio
/* ---------------------------------------------- */
//Função para formatar a data em 00:00 (4 digitos)
function addZero(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

//Função para atualizar os campos do 'container_hora'
function AtualizarDataHora() {
  var hora = new Date();
  document.getElementById("dia_sistema").innerHTML = dias_data[data.getDay()];
  document.getElementById("data_sistema").innerHTML =
    data.getDate() + " DE " + meses_data[data.getMonth()];
  document.getElementById("hora_sistema").innerHTML =
    addZero(hora.getHours()) + "h" + addZero(hora.getMinutes());
  var atualizarhoras = setInterval(AtualizarDataHora, 1000);
}

/* ----------------------------------------------------------------------
    Funções para salvamento de ponteiro e controle da sequência dos feeds  
/* ---------------------------------------------------------------------- */
//Função para criar um ponteiro (Web Storage ou Cookies)
function CriarPonteiro(nome, valor) {
  //Web Storage (se for compatível /HTML5)
  if (typeof Storage !== "undefined") {
    localStorage.setItem(nome, valor);
  }
  //Cookies (caso, o 'Web Storage' não seja compatível)
  else {
    var date = new Date();
    date.setTime(date.getTime() + Duracao_Ponteiro * 24 * 60 * 60 * 1000);
    var expirar = "; expires=" + date.toGMTString();
    document.cookie = nome + "=" + valor + expirar + ";path=/";
  }
}

//Função para ler um ponteiro nos cookies do navegador
function LerPonteiro(nome) {
  //Web Storage (se for compatível /HTML5)
  if (typeof Storage !== "undefined") {
    Ponteiro = localStorage.getItem(nome);
  }
  //Cookies (caso, o 'Web Storage' não seja compatível)
  else {
    var _c = String(document.cookie).split(";");
    var neq = k + "=";
    for (var i = 0; i < _c.length; i++) {
      var c = _c[i];
      while (c.charAt(0) === " ") {
        _c[i] = _c[i].substring(1, c.length);
      }

      if (_c[i].indexOf(neq) === 0) {
        Ponteiro = unescape(_c[i].substring(neq.length, _c[i].length));
      }
    }
    Ponteiro = 0;
  }
}

//Função para checar se o ponteiro existe, se não, é setado o default (Conferir "Controle dos Feeds")
function ChecarPonteiro() {
  LerPonteiro(Nome_Ponteiro);

  if (Ponteiro != null) {
    console.log("O ponteiro foi encontrado: " + Ponteiro);
    ID_Feed_Atual = Ponteiro;
  } else {
    console.log(
      "O ponteiro não foi encontrado, então a apresentação começará do Index!"
    );
    ID_Feed_Atual = "0";
  }

  AtribuirFeed(ID_Feed_Atual);
}

//Função para atualizar o ponteiro (para mudar para o próximo feed
function AtualizarPonteiro() {
  Ponteiro++;

  if (Ponteiro == Limite_ID_Feed) {
    Ponteiro = 0;
  }

  CriarPonteiro(Nome_Ponteiro, Ponteiro);
}

/* ----------------------------------------------
    Funções que manipulam o XML (CDS) 
/* ---------------------------------------------- */
//Função para buscar o XML no "Link_XML"
var CDS = new XMLHttpRequest();
CDS.onreadystatechange = function () {
  if (this.readyState == 4 && this.status == 200) {
    Controlar_XML(this);
  }
};
CDS.open("GET", Link_XML);
CDS.send();
parser = new DOMParser(); //Parser

//Função principal do XML (Atribui valores á algumas coisas)
function Controlar_XML(xml) {
  Arquivo_XML = xml.responseXML;
  Nodes_XML = Arquivo_XML.getElementsByTagName("feed");
  Limite_ID_Feed = Nodes_XML.length;

  ChecarPonteiro();
  console.log("Feeds disponíveis no XML: " + Limite_ID_Feed);
}

//Função para pegar o Feed através do ID_Feed_Atual
function AtribuirFeed(feed_id) {
  if (feed_id <= Limite_ID_Feed && feed_id != 0) {
    ID_Feed_Atual = feed_id;
    console.log("O Ponteiro existia e o feed atual é: " + feed_id);
  } else {
    console.log("O Ponteiro não existia e o feed foi setado para 0 (index)");
  }
  GetarCampos(ID_Feed_Atual);
}

//Função para pegar todos os dados do Feed através do ID_Feed_Atual
function GetarCampos(feed_id) {
  //Pegando todo conteúdo
  var Texto_XML =
    Arquivo_XML.getElementsByTagName("mediumtext1")[feed_id].childNodes[0].data;
  Conteudo_XML = parser.parseFromString(Texto_XML, "text/xml");
  var Campo_1 =
    Arquivo_XML.getElementsByTagName("feed_id")[feed_id].childNodes[0].data;
  var Campo_2 =
    Conteudo_XML.getElementsByTagName("noticia")[0].childNodes[0].nodeValue;
  var Campo_3 =
    Conteudo_XML.getElementsByTagName("cred_foto")[0].childNodes[0].nodeValue;
  var Campo_4 =
    Conteudo_XML.getElementsByTagName("data")[0].childNodes[0].nodeValue;

  //Setando os campos
  Feed_Atual = Campo_1;
  Texto_UOL = Campo_2;
  Creditos_UOL = Campo_3;
  Data_UOL = Campo_4;

  console.log("Removido do XML:\n" + Texto_XML);
  console.log("O ID do Feed_Atual é: " + Campo_1);
  console.log("A notícia é:\n" + Campo_2);
  console.log("O crédito da foto é:\n" + Campo_3);
  console.log("A data de publicação é:\n" + Campo_4);
  document.getElementById("demo").innerHTML =
    "Nenhum erro! Código funcionando!";

  AtualizarPonteiro();
  AlterarCampos();
}

/* ----------------------------------------------
    Funções que atualizam o conteúdo da página
/* ---------------------------------------------- */
//Funções para Alterar os Campos e a Imagem da Página
function AlterarCampos() {
  document.getElementById("categoria_uol").innerHTML = Categoria_UOL;
  document.getElementById("texto_uol").innerHTML = Texto_UOL;
  document.getElementById("creditos_uol").innerHTML = Creditos_UOL;
  document.getElementById("data_uol").innerHTML = Data_UOL;
  AlterarImagem();
}

function AlterarImagem() {
  var Imagem_UOL =
    "url('http://plugins.wiplay.com.br/assets/uploads/plugins_imagens/" +
    Categoria_UOL +
    "_" +
    Feed_Atual +
    ".jpg')";
  document.getElementById("container_imagem").style.backgroundImage =
    Imagem_UOL;
}

/* ---------------------------------------------------------------------------------------
    Notas de desenvolvimento - Ultima alteração do script: 11/10/2018 12:00
/* ---------------------------------------------------------------------------------------

    *Todos os console.log podem ser removidos, eles são usados para controle apenas.
    *Não sei se a função de cookies está funcionando bem (ela pode ser removida caso não seja necessária, porém está inerte).
    *O localStorage não tem validade de tempo.

    Caminho do script para entendimento:
    Iniciar_Plugin > AtualizarDataHora > Controlar_XML > ChecarPonteiro > AtribuirFeed > 
    GetarCampos > AtualizarPonteiro > AlterarCampos > AlterarImagem 

*/

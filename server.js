const express = require('express');
var request = require('request');
const app = express();

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36',
    'Content-Type' : 'application/json'
};


app.set('view engine', 'pug');

app.use(express.static(__dirname + '/public'));

app.get('/query1', (req, res) => {
    handleQuery1(res);
});
app.get('/query2', (req, res) => {
    handleQuery2(res);
});

app.get('/query3', (req, res) => {
    handleQuery3(res);
});

app.get('/query4', (req, res) => {
    handleQuery4(res);
});
app.get('/query5', (req, res) => {
    handleQuery5(res);
});

app.get('/', (req, res) => {
    res.render('index')
});

app.set('port', process.env.PORT || 8081);
const server = app.listen(app.get('port'), () => {
    console.log(`Express → Puerto ${server.address().port}`);
});



function queryWikidata(res, query, responseCallback){
    request({headers: headers,
        uri: query, method: 'GET',},function (error, response, body) {
        if(error){
            res.render('error')
        }
        if(response.statusCode !== 200){
            res.render('error')
        }
        if(response.statusCode == 200){
            responseCallback(body);
        }
    });

}

function sendResponse(res, page, param){
   console.log(param)
    res.render(page, {
        result: param
    });
}

function handleQuery1(res){
    var base = 'https://query.wikidata.org/sparql?format=json&query=';

    var queryTemp='select ?planet ?planetLabel ?imagenPlaneta (MAX(?distancia) AS ?distanciaMaximaTierra) (MAX(?max)as ?distanciaMaxSol) (MAX(?min) as ?distanciaMinSol)   where {' +
        ' {?planet wdt:P31 wd:Q3504248 .}' +
        '  UNION' +
        ' {?planet wdt:P31 wd:Q30014 .}' +
        ' ?planet wdt:P2583 ?distancia .' +
        ' ?planet wdt:P2243 ?max. ' +
        ' ?planet wdt:P2244 ?min. ' +
        ' ?planet wdt:P18 ?imagenPlaneta' +
        '  SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }' +
        '}GROUP BY ?planet ?planetLabel ?imagenPlaneta';

   var query=base+queryTemp;
    queryWikidata(res,query,function (body){
        var bodyJson = JSON.parse(body);
        sendResponse(res,'query1',bodyJson.results.bindings)
    })
}
function handleQuery2(res) {
    var base = 'https://query.wikidata.org/sparql?format=json&query=';
    var queryTemp='SELECT ?paisLabel (COUNT(?pais) AS ?total) WHERE { ?jugador wdt:P2416 wd:Q18515944 . ?jugador wdt:P27 ?pais . SERVICE wikibase:label { bd:serviceParam wikibase:language "en" } } GROUP BY ?paisLabel ORDER BY DESC(?total)'
    var query=base+queryTemp;
    queryWikidata(res,query,function (body){
        var bodyJson = JSON.parse(body);
        sendResponse(res,'query2',JSON.stringify(bodyJson.results.bindings))
    })
}
function handleQuery3(res) {
    var base = 'https://query.wikidata.org/sparql?format=json&query=';
    var queryTemp='SELECT ?equipo ?equipoLabel ?foto WHERE { ?equipo wdt:P118 wd:Q28454335 . OPTIONAL{?equipo wdt:P154 ?foto .} SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . } } LIMIT 100'
    var query=base+queryTemp;
    queryWikidata(res,query,function (body){
        var bodyJson = JSON.parse(body);
        sendResponse(res,'query3',bodyJson.results.bindings)
    })
}

function handleQuery4(res) {
    var base = 'https://query.wikidata.org/sparql?format=json&query=';
    var queryTemp='SELECT ?propietario ?propietarioLabel ?countt WHERE { { SELECT ?propietario (COUNT(DISTINCT ?equipo) AS ?countt) WHERE { ?equipo wdt:P112 ?propietario  .     SERVICE wikibase:label { bd:serviceParam wikibase:language "en" .  } }  GROUP BY ?propietario } FILTER ( ?countt > 1 ) ?equipo wdt:P112 ?propietario  . ?equipo wdt:P118 wd:Q28454335 .SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . } } ORDER BY DESC(?count)'
    var query=base+queryTemp;
    queryWikidata(res,query,function (body){
        var bodyJson = JSON.parse(body);
        sendResponse(res,'query4',bodyJson.results.bindings)
    })
}

function handleQuery5(res) {
    var base = 'https://query.wikidata.org/sparql?format=json&query=';
    var queryTemp='SELECT ?jugador ?jugadorLabel ?fullName ?hermano ?hermanoLabel ?fullName2 WHERE { ?jugador wdt:P2416 wd:Q18515944 . ?jugador wdt:P3373 ?hermano . OPTIONAL{?jugador wdt:P1559 ?fullName .} OPTIONAL{?hermano wdt:P1559 ?fullName2 .} SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . } }'
    var query=base+queryTemp;
    queryWikidata(res,query,function (body){
        var bodyJson = JSON.parse(body);
        sendResponse(res,'query5',bodyJson.results.bindings)
    })
}
//
//
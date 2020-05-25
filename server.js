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
    var queryTemp='SELECT  ?constelacion  ?constelacionLabel ?nombreCorto ?imagenConstelacion ?areaConstelacion  WHERE {' +
        '  ?constelacion  wdt:P31 wd:Q8928 .' +
        '  ?constelacion wdt:P18 ?imagenConstelacion .' +
        '  ?constelacion wdt:P361 wd:Q1998069 .' +
        '  ?constelacion wdt:P1813 ?nombreCorto .' +
        '  ?constelacion wdt:P2046 ?areaConstelacion .' +
        '  SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }' +
        '}ORDER BY DESC(?areaConstelacion)'
    var query=base+queryTemp;
    queryWikidata(res,query,function (body){
        var bodyJson = JSON.parse(body);
        sendResponse(res,'query2',bodyJson.results.bindings)
    })
}
function handleQuery3(res) {
    var base = 'https://query.wikidata.org/sparql?format=json&query=';
    var queryTemp='SELECT ?pais ?paisLabel (COUNT(DISTINCT ?asteroid) AS ?numeroAsteroides) WHERE {\n' +
        '\n' +
        '  ?asteroid wdt:P31 wd:Q3863 .\n' +
        '  ?asteroid wdt:P61 ?descubridor .\n' +
        '  ?descubridor wdt:P19 ?lugar .\n' +
        '  ?lugar wdt:P17 ?pais .            \n' +
        '            \n' +
        '  SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }\n' +
        '         \n' +
        '} GROUP BY ?pais ?paisLabel'
    var query=base+queryTemp;
    queryWikidata(res,query,function (body){
        var bodyJson = JSON.parse(body);
        sendResponse(res,'query3',bodyJson.results.bindings)
    })
}

function handleQuery4(res) {
    var base = 'https://query.wikidata.org/sparql?format=json&query=';
    var queryTemp = 'SELECT ?pais  ?paisLabel (COUNT(DISTINCT ?astronomer) AS ?numeroAstronomos)  WHERE {\n' +
        '  ?astronomer wdt:P106 wd:Q11063;\n' +
        '           wdt:P19 ?lugar ;\n' +
        '           wdt:P569 ?fechaNacimiento.\n' +
        '  ?lugar wdt:P17 ?pais .   \n' +
        '  FILTER("1900-01-01"^^xsd:dateTime <= ?fechaNacimiento ).\n' +
        '  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }         \n' +
        '}  GROUP BY ?pais ?paisLabel';
    var query=base+queryTemp;
    queryWikidata(res,query,function (body){
        var bodyJson = JSON.parse(body);
        sendResponse(res,'query4',bodyJson.results.bindings)
    })
}
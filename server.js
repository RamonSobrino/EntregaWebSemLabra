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
    queryWikidata(res,BASEURL+QUERY1,function (body){
        var bodyJson = JSON.parse(body);
        sendResponse(res,'query1',bodyJson.results.bindings)
    })
});

app.get('/query2', (req, res) => {
    queryWikidata(res,BASEURL+QUERY2,function (body){
        var bodyJson = JSON.parse(body);
        sendResponse(res,'query2',bodyJson.results.bindings)
    })
});

app.get('/query3', (req, res) => {
    queryWikidata(res,BASEURL+QUERY3,function (body){
        var bodyJson = JSON.parse(body);
        sendResponse(res,'query3',bodyJson.results.bindings)
    })
});

app.get('/query4', (req, res) => {
    queryWikidata(res,BASEURL+QUERY4,function (body){
        var bodyJson = JSON.parse(body);
        sendResponse(res,'query4',bodyJson.results.bindings)
    })
});

app.get('/', (req, res) => {
    res.render('index')
});

app.set('port', process.env.PORT || 8081);
const server = app.listen(app.get('port'), () => {
    console.log(`Express → Puerto ${server.address().port}`);
});

const BASEURL = 'https://query.wikidata.org/sparql?format=json&query=';
const QUERY1 = 'select ?planet ?planetLabel ?imagenPlaneta (MAX(?distancia) AS ?distanciaMaximaTierra) (MAX(?max)as ?distanciaMaxSol) (MAX(?min) as ?distanciaMinSol)   where {' +
    ' {?planet wdt:P31 wd:Q3504248 .}' +
    '  UNION' +
    ' {?planet wdt:P31 wd:Q30014 .}' +
    ' ?planet wdt:P2583 ?distancia .' +
    ' ?planet wdt:P2243 ?max. ' +
    ' ?planet wdt:P2244 ?min. ' +
    ' ?planet wdt:P18 ?imagenPlaneta' +
    '  SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }' +
    '}GROUP BY ?planet ?planetLabel ?imagenPlaneta';

const QUERY2 = 'SELECT  ?constelacion  ?constelacionLabel ?nombreCorto ?imagenConstelacion ?areaConstelacion  WHERE {' +
    '  ?constelacion  wdt:P31 wd:Q8928 .' +
    '  ?constelacion wdt:P18 ?imagenConstelacion .' +
    '  ?constelacion wdt:P361 wd:Q1998069 .' +
    '  ?constelacion wdt:P1813 ?nombreCorto .' +
    '  ?constelacion wdt:P2046 ?areaConstelacion .' +
    '  SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }' +
    '}ORDER BY DESC(?areaConstelacion)' ;
const QUERY3 = 'SELECT ?pais ?paisLabel (COUNT(DISTINCT ?asteroid) AS ?numeroAsteroides) WHERE {\n' +
    '\n' +
    '  ?asteroid wdt:P31 wd:Q3863 .\n' +
    '  ?asteroid wdt:P61 ?descubridor .\n' +
    '  ?descubridor wdt:P19 ?lugar .\n' +
    '  ?lugar wdt:P17 ?pais .            \n' +
    '            \n' +
    '  SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }\n' +
    '         \n' +
    '} GROUP BY ?pais ?paisLabel';
const QUERY4 = 'SELECT ?pais  ?paisLabel (COUNT(DISTINCT ?astronomer) AS ?numeroAstronomos)  WHERE {\n' +
    '  ?astronomer wdt:P106 wd:Q11063;\n' +
    '           wdt:P19 ?lugar ;\n' +
    '           wdt:P569 ?fechaNacimiento.\n' +
    '  ?lugar wdt:P17 ?pais .   \n' +
    '  FILTER("1900-01-01"^^xsd:dateTime <= ?fechaNacimiento ).\n' +
    '  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }         \n' +
    '}  GROUP BY ?pais ?paisLabel' ;
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
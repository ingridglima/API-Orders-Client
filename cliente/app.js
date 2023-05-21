var express = require ('express');
var { engine } = require ('express-handlebars');
var bodyParser = require('body-parser');
const axios = require('axios').default;

const app = express();

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Middleware to expose the app's shared templates to the client-side of the app
// for pages which need them.
function exposeTemplates (req, res, next) {
	// Uses the `ExpressHandlebars` instance to get the get the **precompiled**
	// templates which will be shared with the client-side of the app.
	hbs.getTemplates("shared/templates/", {
		cache: app.enabled("view cache"),
		precompiled: true,
	}).then((templates) => {
		// RegExp to remove the ".handlebars" extension from the template names.
		const extRegex = new RegExp(hbs.extname + "$");

		// Creates an array of templates which are exposed via
		// `res.locals.templates`.
		templates = Object.keys(templates).map((name) => {
			return {
				name: name.replace(extRegex, ""),
				template: templates[name],
			};
		});

		// Exposes the templates during view rendering.
		if (templates.length) {
			res.locals.templates = templates;
		}

		setImmediate(next);
	})
		.catch(next);
}

app.get('/', (req, res) => {
    res.render('home');
});

app.get("/novopedido", (req, res) => {
	res.render("novopedido", {
	});
});

app.post("/cadastrarpedido", (req, res) => {
	const result = axios.post('http://localhost:4000/novopedido', {cliente:req.body.cnomeclie,produto:req.body.cnomeprod,valor:req.body.nvalprodu})
	.then(function (response) {
		console.log(response.data);
		res.render("novopedido", {retorno: response.data.data.link, mensagem: "Produto cadastrado com sucesso!"});
	}).catch(function (error) {
		console.log(error.data);
	});
	
});

app.get("/listapedidos", (req, res) => {
	axios.get('http://localhost:4000/pedidos').then(function (response) {
		console.log(response.data);
		res.render("listapedidos", {retorno: response.data});
	}).catch(function (error) {
		console.log(error.data);
		res.render("listapedidos", {mensagem: "Não existem pedidos cadastrados!"});
	});
});

app.get("/localizarpedido", (req, res) => {
	res.render("localizarpedido", {});
});

app.post("/search", (req, res) => {
	let nnumeprod = req.body.nnumeprod;
	let baseurl = 'http://localhost:4000/pedidos/'.concat(nnumeprod);
	axios.get(baseurl).then(function (response) {
		console.log(response.data.pedido);
		res.render("localizarpedido", {retorno: response.data});
	}).catch(function (error) {
		console.log(error.data);
		res.render("localizarpedido", {mensagem: "Pedido não encontrado!"});
	});
});

app.listen(3000);
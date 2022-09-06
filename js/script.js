const api_url_base = "https://www.swapi.tech/api/"

async function GetApi(url) {
	try {
		const response = await fetch(url);
		var data = await response.json();
		return data;
	} catch (e) {
		console.log(e);
	}
}

function AddListeners() {
	let nav = document.getElementById('nav');
	let main = document.getElementById('main');
	nav.addEventListener('click', GetData);
	main.addEventListener('click', GetData);
	footer.addEventListener('click', GetData);

}

function GetData(ev) {
	var data
	if (ev) ev.preventDefault();
	let link = ev.target;
	let url = link.getAttribute('data-link');
	fetch(url)
		.then((resp) => {
			if (!resp.ok) throw new Error(resp.statusText);
			data = resp.json();
			return data;
		})
		.then(data => BuildList(data))
		.catch((err) => {
			console.error(err);
		});
}

function hideloader() {
	document.getElementById('loading').style.display = 'none';
}

async function Main() {
	try {
		let data = await GetApi(api_url_base);
		let df = document.createDocumentFragment();
		for (let [name, url] of Object.entries(data.result)) {
			let link = document.createElement('a');
			link.href = `${url}`;
			link.textContent = name;
			link.setAttribute('data-link', `${url}`);
			df.append(link);
		}
		document.getElementById('nav').append(df);
	} catch (e) {
		console.log(e);
	}
}

function BuildList(data) {
	let m = document.getElementById('main');
	// console.log(data);
	let record = true;
	if (typeof data.next === 'undefined')
		if (data.result.description) {
			data_result = Object.entries(data.result.properties);
			record = false;
		}
		else
			data_result = data.result;
	else
		data_result = data.results;
	if (record) {
		m.innerHTML = data_result
			.map((item) => {
				let nm = item.name || item.properties.title;
				let urls = item.url || item.properties.url;
				return `<p><a href="${urls} "data-link="${urls}">${nm}</a></p>`;
			})
			.join(' ');
	}
	else {
		result = data_result
			.map(async (item) => {
				if (item[0].indexOf('created') && item[0].indexOf('edited') && item[0].indexOf('url')) {
					let value_res = '';
					let tempvar = item[1];
					if (typeof tempvar == 'object') {
						for (let i = 0; i < tempvar.length; i += 1) {
							value_res = value_res + (await GetUrl(tempvar[i]).then(resp => value = resp));
						}
					}
					else if (tempvar.indexOf('https') !== -1)
						value_res = await GetUrl(tempvar).then(resp => value = resp)
					if (value_res === '')
						return `<p><strong>${item[0]}:</strong>   ${tempvar}</p>`;
					else
						return `<p><strong>${item[0]}:</strong>   ${value_res}</p>`;
				}
			})
		Promise.all(result).then((values) => {
			m.innerHTML = values.join(' ');
		});
	}
	let footer = document.getElementById('footer');
	footer.innerHTML = '';

	if (data.previous) {
		let prev = document.createElement('a');
		prev.href = data.previous;
		let url = new URL(data.previous);
		let labels = url.pathname.split('/api/');
		let label = labels[labels.length - 1];
		prev.textContent = `<< Previous ${label}`;
		prev.setAttribute('data-link', data.previous);
		footer.append(prev);
	}
	if (data.next) {
		let next = document.createElement('a');
		next.href = data.next;
		let url = new URL(data.next);
		let labels = url.pathname.split('/api/');
		let label = labels[labels.length - 1];
		next.textContent = `Next ${label} >>`;
		next.setAttribute('data-link', data.next);
		footer.append(next);
	}
}

async function GetUrl(temp) {
	try {
		let data = await GetApi(temp);
		url = data.result.properties.url;
		nm = data.result.properties.name;
		res = `<p><a href="${url} "data-link="${url}">${nm}</a></p>`
		return res;
	} catch (e) {
		console.log(e);
	}
}
function InitJs() {
	AddListeners();
	Main();
}

document.addEventListener('DOMContentLoaded', InitJs);

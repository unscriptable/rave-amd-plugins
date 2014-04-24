/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */

var es5Transform = require('rave/lib/es5Transform');
var beget = require('rave/lib/beget');
var createRequire = require('rave/lib/createRequire');
var normalizeCjs = require('rave/pipeline/normalizeCjs');
var path = require('rave/lib/path');
var uid = require('rave/lib/uid');
var metadata = require('rave/lib/metadata');
var overrideIf = require('rave/lib/overrideIf');

exports.create = create;
exports.createNormalize = createNormalize;
exports.locate = locate;
exports.fetch = fetch;
exports.translate = translate;
exports.createInstantiate = createInstantiate;
exports.parsePluginName = parsePluginName;
exports.createPluginRequire = createPluginRequire;
exports.createPluginMapper = createPluginMapper;
exports.getPluginConfig = getPluginConfig;
exports.createFactory = createFactory;
exports.pluginFilter = pluginFilter;

function create (context) {

	var pipeline = {
		normalize: createNormalize(createPluginMapper(context)),
		locate: locate,
		fetch: fetch,
		translate: translate,
		instantiate: createInstantiate(context)
	};

	return {
		pluginFilter: pluginFilter,
		pipeline: function (loader) {
			return overrideIf(this.pluginFilter, loader, pipeline);
		}
	};
}

function createPluginMapper (context) {
	return function (name) {
		var config = getPluginConfig(context, name);
		return config && config.name || name;
	}
}

function getPluginConfig (context, name) {
	var config = context.amdPluginMap && context.amdPluginMap[name];
	if (typeof config === 'string') config = { name: config };
	return config;
}

function createNormalize (mapper) {
	return function normalize (name, refName) {
		var parsed, pluginName, plugin, resourceName;

		parsed = parsePluginName(name);
		pluginName = mapper(normalizeCjs(parsed.plugin, refName));
		plugin = require(pluginName); // must be sync!

		if (plugin.normalize) {
			resourceName = plugin.normalize(parsed.resource, function (name) {
				return normalizeCjs(name, refName);
			}) || ''; // dojo plugins may return falsey values
		}
		else {
			resourceName = normalizeCjs(parsed.resource, refName);
		}

		return pluginName + '!' + resourceName;
	}
}

function locate (load) {
	return load.name;
}

function fetch (load) {}

function translate (load) {
	return load.source;
}

function createInstantiate (context) {
	return function instantiate (load) {
		var parsed, config, req, plugin;

		parsed = parsePluginName(load.name);
		plugin = require(parsed.plugin);
		config = getPluginConfig(context, plugin) || {};
		req = createPluginRequire(context, config);

		return new Promise(function (resolve, reject) {
			callback.error = reject;
			plugin.load(uid.parse(parsed.resource).name, req, callback, config);
			function callback (value) {
				resolve(createFactory(value));
			}
		});
	};
}
function parsePluginName (name) {
	var parts = name.split('!', 2);
	return {
		resource: parts.pop(),
		plugin: parts[0]
	};
}

function createPluginRequire (context, config) {
	// no relative require unless TC39 spec allows refName to be passed to pipeline
	var refName = '';
	var require = createRequire(context.loader, refName);

	// plugins have an additional API function: require.toUrl()
	require.toUrl = function (id) {
		var abs, pkgDescriptor;

		// ensure it's normalized
		abs = normalizeCjs(id, refName);
		if (path.isAbsUrl(abs)) return abs;

		pkgDescriptor = metadata.findDepPackage(context.packages, '', abs);
		if (pkgDescriptor) {
			abs = uid.parse(abs).modulePath;
			if (pkgDescriptor.location) {
				abs = path.joinPaths(location, abs);
			}
		}
		if (path.isAbsUrl(abs)) return abs;

		// join to baseUrl
		if (config.baseUrl) {
			abs = path.joinPaths(config.baseUrl, abs);
		}

		return abs;
	};

	return require;
}

function createFactory (value) {
	return {
		execute: function () {
			return new Module(es5Transform.toLoader(value));
		}
	}
}

function pluginFilter (load) {
	var plugin = typeof load === 'string' ? load : load.name;
	return parsePluginName(plugin).plugin;
}

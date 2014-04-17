/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */

var es5Transform = require('rave/lib/es5Transform');
var beget = require('rave/lib/beget');
var createRequire = require('rave/lib/createRequire');
var normalizeCjs = require('rave/pipeline/normalizeCjs');
var path = require('rave/lib/path');

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
exports.createFactory = createFactory;
exports.pluginFilter = pluginFilter;

function create (context) {

	var pipeline = {
		normalize: createNormalize(context, createPluginMapper(context)),
		locate: locate,
		fetch: fetch,
		translate: translate,
		instantiate: createInstantiate(context)
	};

	return {
		pipeline: function (loader) {
			return overrideIf(pluginFilter, loader, pipeline);
		}
	};
}

function createPluginMapper (context) {
	return function (name) {
		return context.amdPluginMap && context.amdPluginMap[name] || name;
	}
}

function createNormalize (context, mapper) {
	return function normalize (name, refName) {
		var parsed, pluginName, normalizeResource, resourceName;

		parsed = parsePluginName(name);
		pluginName = mapper(normalizeCjs(parsed.plugin, refName));

		// If plugin is not loaded, throw to be deterministic.
		if (!context.loader.has(pluginName)) {
			throw new Error('AMD plugin must be preloaded: ' + pluginName);
		}

		normalizeResource = context.loader.get(pluginName).normalize
			|| normalizeCjs;

		resourceName = normalizeResource(parsed.resource, refName);

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
		var loader, parsed, config, require;

		loader = context.loader;
		parsed = parsePluginName(load.name);
		config = beget(load.metadata.rave);
		require = createPluginRequire(loader, context);

		return loader.import(parsed.plugin).then(loadResource);

		function loadResource (plugin) {
			return new Promise(function (resolve, reject) {
				callback.error = reject;
				plugin.load(parsed.resource, require, callback, config);
				function callback (value) {
					resolve(createFactory(value));
				}
			});
		}
	};
}
function parsePluginName (name) {
	var parts = name.split('!', 2);
	return {
		resource: parts.pop(),
		plugin: parts[0]
	};
}

function createPluginRequire (loader, config) {
	var require = createRequire(loader, ''); // no relative require!
	// plugins have an additional API function: require.toUrl()
	require.toUrl = function (id) {
		// ensure it's normalized
		var abs = loader.normalize(id);
		// join to baseUrl
		if (!path.isAbsUrl(abs) && config.baseUrl) {
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
	return !!parsePluginName(plugin).plugin;
}

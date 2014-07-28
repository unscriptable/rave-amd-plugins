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
exports.createPluginPredicate = createPluginPredicate;

function create (context) {
	var mapper;

	if (!context.amdPluginMap) context.amdPluginMap = {};

	mapper = createPluginMapper(context);

	return {
		load: [
			{
				// amd plugins should use a pattern and possibly an additional
				// predicate:
				pattern: /!/,
				predicate: createPluginPredicate(context.amdPluginMap),
				hooks: {
					normalize: createNormalize(mapper),
					locate: locate,
					fetch: fetch,
					translate: translate,
					instantiate: createInstantiate(context, mapper)
				}
			}
		]
	};
}

function createPluginMapper (context) {
	var map = context.amdPluginMap;
	return function (name) {
		var info = map[name];
		// Attempt to create a mapping just in time. Plugin module must be
		// pre-loaded and module id must be normalized.
		if (typeof info === 'undefined') {
			info = {
				name: name,
				module: es5Transform.fromLoader(context.loader.get(name))
			};
			if (!info.module) {
				throw new Error('Plugin not found for ' + name);
			}
		}
		return info;
	}
}

function getPluginConfig (context, name) {
	// TODO:
	return {};
}

function createNormalize (mapper) {
	return function normalize (name, refName) {
		var parsed, info, plugin, pluginName, resourceName;

		parsed = parsePluginName(name);
		// bail early if this isn't a plugin-based name
		if (!parsed.plugin) return name;

		info = mapper(normalizeCjs(parsed.plugin, refName));
		plugin = info.module;
		pluginName = info.name;

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

function createInstantiate (context, mapper) {
	return function instantiate (load) {
		var parsed, plugin, config, req, loader;

		parsed = parsePluginName(load.name);
		plugin = mapper(parsed.plugin).module;
		config = getPluginConfig(context, plugin) || {};
		req = createPluginRequire(context);
		loader = context.loader;

		return new Promise(function (resolve, reject) {
			callback.error = reject;
			plugin.load(uid.parse(parsed.resource).name, req, callback, config);
			function callback (value) {
				resolve(createFactory(loader, value));
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

function createPluginRequire (context) {
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
		if (context.baseUrl) {
			abs = path.joinPaths(context.baseUrl, abs);
		}

		return abs;
	};

	return require;
}

function createFactory (loader, value) {
	return {
		execute: function () {
//			return loader.newModule(es5Transform.toLoader(value));
			return new Module(es5Transform.toLoader(value));
		}
	}
}

function createPluginPredicate (pluginMap) {
	return function (load) {
		var plugin = parsePluginName(load.name).plugin;
		return plugin && (plugin in pluginMap);
	}
}

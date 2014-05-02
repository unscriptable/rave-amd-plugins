/** @license MIT License (c) copyright 2014 original authors */
/** @author John Hann */

var buster = require('buster');
var assert = buster.assert;
var refute = buster.refute;
var fail = buster.referee.fail;

var raveExtension = require('../rave');

// TODO: use gent.js to generate better plugin-based module names

buster.testCase('rave-amd-plugins', {

	'create': {

		'should return an object with a pipeline function': function () {
			var extension = raveExtension.create({});
			assert.isFunction(extension.pipeline);
		},

		'// should test more things': function () {

		}

	},

	'createNormalize': {

		'should create a function': function () {
			var normalize = raveExtension.createNormalize();
			assert.isFunction(normalize);
		},

		'// should test more things': function () {

		}

	},

	'locate': {

		'should return name property': function () {
			var name = raveExtension.locate({ name: 'foo' });
			assert.same(name, 'foo');
		}

	},

	'fetch': {

		'should be a noop': function () {
			var nada = raveExtension.fetch();
			assert.same(nada, void 0);
		}

	},

	'translate': {

		'should return source property': function () {
			var source = raveExtension.locate({ source: 'foo' });
			assert.same(source, 'foo');
		}

	},

	'createInstantiate': {

		'// should be tested': function () {}

	},

	'parsePluginName': {

		'should split plugin name from module name': function () {
			var parsed = raveExtension.parsePluginName('foo!bar');
			assert.equals('foo', parsed.plugin);
			assert.equals('bar', parsed.resource);
		},

		'should return module name if not using plugin syntax': function () {
			var parsed = raveExtension.parsePluginName('bar');
			assert.equals('bar', parsed.resource);
			assert.equals(undefined, parsed.plugin);
		}

	},

	'createPluginRequire': {

		'// should be tested': function () {}

	},

	'createPluginMapper': {

		'// should be tested': function () {}

	},

	'createFactory': {

		'// should be tested': function () {}

	},

	'createPluginPredicate': {

		'// should detect plugin syntax in a string': function () {
			assert(raveExtension.pluginFilter('foo!bar'));
			assert(raveExtension.pluginFilter('blah@foo#0.8.1!bar'));
			assert(raveExtension.pluginFilter('foo!blah@bar#0.8.1'));
		},

		'// should not falsely detect a plugin syntax in non-plugin id string': function () {
			assert(raveExtension.pluginFilter('foo/bar'));
			assert(raveExtension.pluginFilter('blah@foo#0.8.1/bar'));
			assert(raveExtension.pluginFilter('foo/blah@bar#0.8.1'));
		},

		'// should detect plugin syntax in a load object': function () {
			assert(raveExtension.pluginFilter({ name: 'foo!bar' }));
			assert(raveExtension.pluginFilter({ name: 'blah@foo#0.8.1!bar' }));
			assert(raveExtension.pluginFilter({ name: 'foo!blah@bar#0.8.1' }));
		},

		'// should not falsely detect a plugin syntax in non-plugin load object': function () {
			assert(raveExtension.pluginFilter({ name: 'foo/bar' }));
			assert(raveExtension.pluginFilter({ name: 'blah@foo#0.8.1/bar' }));
			assert(raveExtension.pluginFilter({ name: 'foo/blah@bar#0.8.1' }));
		}

	}

});

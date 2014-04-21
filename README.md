# rave-amd-plugins

rave-amd-plugins is a RaveJS extension that adds the ability to use AMD plugins.

When using an ES6 loader, AMD plugins aren't the most efficient way to load
non-module resources.  However, refactoring to use ES6 loaders can be a hassle.
rave-amd-plugins allows existing AMD code bases to start using RaveJS without
immediate refactoring.

##Usage

**Note**: rave-amd-plugins is not intended to be used by application code
directly.  It is meant to be used and installed by other RaveJS extensions
that provide AMD plugins.

For instance, installing any of the following RaveJS extensions will install
rave-amd-plugins:

* [rave-curl-css](https://github.com/unscriptable/rave-curl-css)
* [rave-curl-domReady](https://github.com/unscriptable/rave-curl-domReady)
* [rave-curl-i18n](https://github.com/unscriptable/rave-curl-i18n)
* [rave-curl-js](https://github.com/unscriptable/rave-curl-js)
* [rave-curl-json](https://github.com/unscriptable/rave-curl-json)
* [rave-curl-link](https://github.com/unscriptable/rave-curl-link)
* [rave-curl-text](https://github.com/unscriptable/rave-curl-text)

If you have authored an AMD plugin and want to make it available to RaveJS-based
applications, you will need to create a RaveJS extension for your AMD plugin.

At the time this README was written, the process of creating a RaveJS
extension is not documented.  If you click on any of the existing extensions
above, you will see that it's an extremely minor effort.  However, keep in
mind that RaveJS's extension API will change *at least once* between now and
the release of version 1.0.

Here's all that an AMD plugin RaveJS extension needs to do:

* Declare a mapping of plugin *shortcut* id to plugin *actual* id.
  For instance, rave-curl-css declares that the "css" plugin id is
  actually "curl/plugin/css".
* Preload the AMD plugin module.  Since some AMD plugins must be preloaded by
  ES6 loaders, why not just preload all of them? The easiest way to do this is
  to simply `require("curl/plugin/css");`, for instance.
* Declare your plugin's package as a dependency in bower.json and package.json.

## Testing

To test the project via [buster.js](http://busterjs.org), simply type the
following from the root of the project:

```
npm install
npm test
```

## Contributing

Pull requests accepted!  Please see [Contributing](CONTRIBUTING.md).

## About

Brought to you by [cujoJS](http://cujojs.com).

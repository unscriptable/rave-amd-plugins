# rave-amd-plugins

rave-amd-plugins is a RaveJS extension that adds the ability to use AMD plugins.

When using an ES6 loader, AMD plugins aren't the most efficient way to load
non-module resources.  However, refactoring to use ES6 loaders can be a hassle.
rave-amd-plugins allows existing AMD code bases to start using RaveJS without
immediate refactoring.

**Note**: rave-amd-plugins is not intended to be used directly.  It is meant
to be used and installed by other RaveJS extensions that provide AMD plugins.

For instance, installing any of the following RaveJS extensions will install
rave-amd-plugins:

* [rave-curl-css](https://github.com/unscriptable/rave-curl-css)
* [rave-curl-domReady](https://github.com/unscriptable/rave-curl-domReady)
* [rave-curl-i18n](https://github.com/unscriptable/rave-curl-i18n)
* [rave-curl-js](https://github.com/unscriptable/rave-curl-js)
* [rave-curl-json](https://github.com/unscriptable/rave-curl-json)
* [rave-curl-link](https://github.com/unscriptable/rave-curl-link)
* [rave-curl-text](https://github.com/unscriptable/rave-curl-text)

## Testing

To test the shim via [buster.js](http://busterjs.org), simply type the
following from the root of the project:

```
npm install
npm test
```

## Contributing

Pull requests accepted!  Please see [Contributing](CONTRIBUTING.md).

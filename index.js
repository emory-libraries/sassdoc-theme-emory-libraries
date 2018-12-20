/**
 * Load utilities.
 */
const extend = require('extend');
const fs = extend(require('fs-extra'), {
  readdirSyncRecursive: require('fs-readdir-recursive')
});
const path = require('path');

/**
 * Identify paths to theme files and resources.
 */
const dir = {
  helpers: 'extensions/helpers',
  annotations: 'extensions/annotations',
  extras: 'extensions/extras',
  partials: 'dist/views/partials',
  template: 'dist/views',
  assets: 'dist/'
};

/**
 * Load helpers to extend the handlebars.js templating engine.
 */
const helpers = extend(require('handlebars-helpers')(), fs.readdirSyncRecursive(path.join(__dirname, dir.helpers)).reduce((helpers, helper) => {

  let definition = require(path.join(__dirname, dir.helpers, helper));
  
  return extend(helpers, definition);
  
}, {}));

/**
 * Load partials for use with the handlebars.js templating engine.
 */
const partials = fs.readdirSyncRecursive(path.join(__dirname, dir.partials)).reduce((partials, partial) => {
  
  let ext = path.extname(partial);
  let include = partial.replace(ext, '');

  partials[include] = path.join(dir.partials.replace(dir.template, ''), include);
  
  return partials;
  
}, {});

/**
 * Load custom annotations to extend our SassDoc documentation.
 */
const annotations = fs.readdirSyncRecursive(path.join(__dirname, dir.annotations)).reduce((annotations, annotation) => {
  
  annotations.push(require(path.join(__dirname, dir.annotations, annotation)));
  
  return annotations;
  
}, []);

/**
 * Themeleon template helper, using consolidate.js module.
 *
 * See <https://github.com/themeleon/themeleon>.
 * See <https://github.com/tj/consolidate.js>.
 */
const themeleon = require('themeleon')().use('consolidate');

/**
 * Load SassDoc Extras.
 *
 * See <https://github.com/SassDoc/sassdoc-extras>.
 */
const extras = require('sassdoc-extras');

/**
 * Load any custom extras that should be loaded into
 * our theme, then merge them with our SassDoc Extras.
 */
fs.readdirSyncRecursive(path.join(__dirname, dir.extras)).forEach((extra) => {
  
  const ext = path.extname(extra);
  const name = path.basename(extra, `.${ext}`);
  
  extras[name] = require(path.join(__dirname, dir.extras, extra));
  
});

/**
 * The theme function. You can directly export it like this:
 *
 *     module.exports = themeleon(__dirname, function (t) {});
 *
 * ... but here we want more control on the template variables, so there
 * is a little bit of preprocessing below.
 *
 * The theme function describes the steps to render the theme.
 */
const theme = themeleon(__dirname, function (t) { 
  
  /**
   * Copy the assets folder from the theme's directory in the
   * destination directory.
   */
  fs.readdirSync(path.join(__dirname, dir.assets)).filter((asset) => {
    
    return asset != dir.template.replace(dir.assets, '');
    
  }).forEach((asset) => t.copy(path.join(dir.assets, asset), asset));

  /**
   * Initialize our theme options to be passed into the templating engine.
   */
  const options = extend(t.ctx, {
    partials,
    helpers
  });

  /**
   * Render the template with the theme's context (`ctx` below)
   * as `index.html` in the destination directory.
   */
  t.handlebars(path.join(dir.template, 'index.handlebars'), 'index.html', options);
  
});

/**
 * Actual theme function. It takes the destination directory `dest`
 * (that will be handled by Themeleon), and the context variables `ctx`.
 *
 * Here, we will modify the context to have a `view` key defaulting to
 * a literal object, but that can be overriden by the user's
 * configuration.
 */
module.exports = function (dest, ctx) {
 
  /**
   * Initializes theme configurations.
   */
  let config = fs.readJsonSync(path.resolve(__dirname, '.sassdocrc'));

  /**
   * Apply default values for groups and display.
   */
  ctx.groups = extend(config.groups, ctx.groups);
  ctx.display = extend(config.display, ctx.display);

  // Extend top-level context keys.
  ctx = extend({}, config, ctx);
  
  /**
   * Extract the names of the SassDoc Extras that can be
   * loaded into the theme and that should be added to the 
   * context's data set.
   */
  const extrasIgnore = ['length', 'name', 'prototype'];
  const extrasNames = Object.getOwnPropertyNames(extras).filter((extra) => !extrasIgnore.includes(extra));
  const extrasLoading = extrasNames.filter((extra) => extra.indexOf('by') !== 0);
  const extrasProperties = extrasNames.filter((extra) => extra.indexOf('by') === 0);
  
  /**
   * Extend SassDoc with SassDoc Extras.
   */
  extras(ctx, ...extrasLoading);

  /**
   * Use SassDoc Extra's indexer to index the data by group and type, so we
   * have the following structure:
   *
   *     {
   *       "group-slug": {
   *         "function": [...],
   *         "mixin": [...],
   *         "variable": [...]
   *       },
   *       "another-group": {
   *         "function": [...],
   *         "mixin": [...],
   *         "variable": [...]
   *       }
   *     }
   *
   * You can then use `data.byGroupAndType` instead of `data` in your
   * templates to manipulate the indexed object.
   */
  extrasProperties.forEach((extra) => ctx.data[extra] = extras[extra](ctx.data, ctx));

  /**
   * Avoid key collision with Handlebars default `data`.
   *
   * @see https://github.com/SassDoc/generator-sassdoc-theme/issues/22
   */
  ctx._data = ctx.data;
  delete ctx.data;

  /**
   * Now we have prepared the data, and we can proxy to the Themeleon
   * generator for rendering our theme.
   */
  return theme.apply(this, arguments);
  
};

/**
 * Extend the theme using custom annotations.
 */
module.exports.annotations = annotations;

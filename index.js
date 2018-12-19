/**
 * Load utilities.
 */
const extend = require('extend');
const fs = extend(require('fs'), {
  readdirSyncRecursive: require('fs-readdir-recursive')
});
const path = require('path');

/**
 * Load helpers to extend the handlebars.js templating engine.
 */
const helpers = extend(require('handlebars-helpers')(), fs.readdirSyncRecursive(path.join(__dirname, 'helpers')).reduce((helpers, helper) => {

  let definition = require(`./helpers/${helper}`);
  
  return extend(helpers, definition);
  
}, {}));

/**
 * Load partials for use with the handlebars.js templating engine.
 */
const partials = fs.readdirSyncRecursive(path.join(__dirname, 'views/partials')).reduce((partials, partial) => {
  
  let ext = path.extname(partial);
  let include = partial.replace(ext, '');

  partials[include] = `partials/${include}`;
  
  return partials;
  
}, {});

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
 * The theme function. You can directly export it like this:
 *
 *     module.exports = themeleon(__dirname, function (t) {});
 *
 * ... but here we want more control on the template variables, so there
 * is a little bit of preprocessing below.
 *
 * The theme function describes the steps to render the theme.
 */
const theme = themeleon(__dirname, (theme) => {
  
  /**
   * Copy the assets folder from the theme's directory in the
   * destination directory.
   */
  theme.copy('assets');

  /**
   * Initialize our theme options to be passed into the templating engine.
   */
  var options = extend(theme.ctx, {
    partials,
    helpers
  });

  /**
   * Render `views/index.handlebars` with the theme's context (`ctx` below)
   * as `index.html` in the destination directory.
   */
  theme.handlebars('views/index.handlebars', 'index.html', options);
  
});

/**
 * Actual theme function. It takes the destination directory `dest`
 * (that will be handled by Themeleon), and the context variables `ctx`.
 *
 * Here, we will modify the context to have a `view` key defaulting to
 * a literal object, but that can be overriden by the user's
 * configuration.
 */
module.exports = function (dest, context) {
  
  /**
   * Initializes theme definitions.
   */
  let definitions = {
    display: {
      access: ['public', 'private'],
      alias: false,
      watermark: true,
    },
    groups: {
      'undefined': 'General',
    },
    'shortcutIcon': 'http://sass-lang.com/favicon.ico',
  };

  // Apply default values for groups and display.
  context.groups = extend(definitions.groups, context.groups);
  context.display = extend(definitions.display, context.display);

  // Extend top-level context keys.
  context = extend({}, definitions, context);
  
  /**
   * Extend SassDoc with SassDoc Extras.
   */
  extras(context, ...[
    'description',
    'markdown',
    'display',
    'groupName',
    'shortcutIcon',
    'sort',
    'resolveVariables'
  ]);

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
  context.data.byGroupAndType = extras.byGroupAndType(context.data);

  /**
   * Avoid key collision with Handlebars default `data`.
   *
   * @see https://github.com/SassDoc/generator-sassdoc-theme/issues/22
   */
  context._data = context.data;
  delete context.data;

  /**
   * Now we have prepared the data, and we can proxy to the Themeleon
   * generator for rendering our theme.
   */
  return theme.apply(this, arguments);
  
};

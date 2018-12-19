/**
 * Initialize array methods for use as handlebar helpers.
 */
module.exports = {
  
  concat: () => Array.from(arguments).slice(0, -1).join(''),
  
  indexOf: ( lookup, value ) => !Array.isArray(lookup) && typeof lookup !== 'string' ? -1 : lookup.indexOf(value)
  
};
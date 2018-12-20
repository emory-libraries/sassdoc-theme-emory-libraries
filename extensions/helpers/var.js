/**
 * Initialize variable methods for use as handlebar helpers.
 */
module.exports = {
  
  set: ( key, value, context ) => context[key] = value,
  
  unset: ( key, context ) => delete context[key]
  
};
/**
 * Load utilities.
 */
const extend = require('extend');

/**
 * Initialize object methods for use as handlebar helpers.
 */
module.exports = {
  
  unpick( props, context, options ) {
    
    // Get the keys to be removed from the object.
    let keys = Array.isArray(props) ? props : [props];
    
    // Initialize the result.
    let result = extend({}, context);

    // Remove items from the result.
    for( let i = 0; i < keys.length; i++ ) {
      
      // Get the key.
      let key = keys[i].split('.');
      
      // Initialize a pointer.
      let pointer = result;
      
      // Find the key.
      for( let x = 0; x < key.length - 1; x++ ) {
        
        // Move the pointer.
        pointer = pointer[key[x]];
        
      }
      
      // Delete the value.
      delete pointer[key[key.length - 1]];
      
    }

    // Compile blocks.
    if ( options.fn ) return Object.keys(result).length ? options.fn(result) : options.inverse(context);
    
    // Otherwise, return the result.
    return result;
    
  }
  
};
/**
 * Initialize array methods for use as handlebar helpers.
 */
module.exports = {
  
  concat: () => Array.from(arguments).slice(0, -1).join(''),
  
  indexOf: ( lookup, value ) => !Array.isArray(lookup) && typeof lookup !== 'string' ? -1 : lookup.indexOf(value),
  
  push( array, value ) {
    
    let result = array;
    
    result.push(value);
    
    return result;
    
  },
  
  where( array, key, value, comparator ) {
    
    // Set the comparator.
    if( typeof comparator != 'string' ) comparator = '==';
    
    // Get keys.
    const keys = key.split('.');
    
    // Find object items.
    const objects = array.filter((item) => typeof item == 'object' && !Array.isArray(item) && item !== null);
   
    // Ignore arrays without objects.
    if( objects.length === 0 ) return [];
    
    // Find objects with key-value pairs.
    const matches = objects.filter((object) => {
      
      // Initialize pointer.
      let pointer = object;
      
      // Move pointer.
      for( let i = 0; i < keys.length; i++ ) {
        
        // Move the pointer if the key exists.
        if( pointer[keys[i]] ) pointer = pointer[keys[i]];
        
        // Otherwise, ignore the object.
        else return false;
        
      }

      // Compare the pointer and value.
      switch( comparator ) {
        case '===': return pointer === value;
        case '>': return pointer > value;
        case '>=': return pointer >= value;
        case '<': return pointer < value;
        case '<=': return pointer <= value;
        default: return pointer == value;
      }
      
    });
   
    // Return matches.
    return matches;
    
  }
  
};
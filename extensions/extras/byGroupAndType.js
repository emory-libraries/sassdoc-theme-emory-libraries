'use strict'

module.exports = function byGroupAndType (items, ctx) {
  
  // Capture namespace.
  ctx.namespace = ctx.namespace || '';
  
  // Build regex for detecting namespaced group names.
  const regex = new RegExp(`^${ctx.namespace}[.]`, 'i');
  
  // Initialize the sorted data.
  const sorted = {};
  
  // Create utility methods to help with sorting.
  const utils = {
    
    group( pointer, groups ) {
      
      // Recursively build groups.
      groups.forEach((group) => {
        
        // Initialize the group if it doesn't already exist.
        if( !Object.keys(pointer).includes(group) ) pointer[group] = {};
        
        // Move the pointer.
        pointer = pointer[group];
        
      });
      
      // Return the group.
      return pointer;
      
    },
    
    type( pointer, type ) {
      
      // Initialize the type if it doesn't already exist.
      if( !Object.keys(pointer).includes(type) ) pointer[type] = [];
      
      // Move the pointer.
      pointer = pointer[type];
      
      // Return the type.
      return pointer;
      
    },
    
    sort( accumulator, item, group, type ) {
      
      // Create group(s).
      let grouped = utils.group(accumulator, group);
      
      // Create type.
      let typed = utils.type(grouped, type);
      
      // Add the item.
      typed.push(item);
      
    }
    
  };

  // Sort the items based on group and type.
  items.forEach((item) => {
    
    // Capture the item's group and type.
    let group = item.group[0].replace(regex, '').split('.');
    let type = item.context.type;
    
    // Sort the item.
    utils.sort(sorted, item, group, type);
    
  });
  
  // Return sorted.
  return sorted;
  
};
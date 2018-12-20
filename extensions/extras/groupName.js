'use strict'

/**
 * Compute a `groupName` object from `group` array with slug as key and
 * title as value. Also compute a `groups` property in `ctx`.
 */
module.exports = function groupName (ctx) {
  
  // Capture groups.
  ctx.groups = ctx.groups || {};
  
  // Capture namespace.
  ctx.namespace = ctx.namespace || '';
  
  // Set delimiter characters.
  const delimiters = ['.'];
  
  // Build regex for detecting namespaced group names.
  const regex = new RegExp(`^${ctx.namespace}[${delimiters.join('')}]`, 'i');

  // Configure groups.
  Object.keys(ctx.groups).forEach((slug) => {
    
    // Capture the old slug.
    const old = slug;
    
    // Determine if the group is namespaced.
    const namespaced = regex.test(old);
    
    // Determine if the group is nested.
    const nested = delimiters.map((delimiter) => old.indexOf(delimiter) > -1).indexOf(true) > -1;
    
    // Convert the slug to lowercase, remove any namespacing, and get any nested groups.
    slug = old.toLowerCase().replace(regex, '').split(new RegExp(`[${delimiters.join('')}]`));
    
    // Permit nested groups.
    slug.forEach((slug) => {
      
      // Save the group slug and title.
      ctx.groups[slug] = ctx.groups[slug] || slug;
      
    });
    
    // Remove old namespaced and nested groups.
    if( namespaced || nested ) delete ctx.groups[old];
    
  }); 

  // Build the groupings.
  ctx.data.forEach((item) => { 
    
    // Initialize groupings.
    let group = {};

    // Interpret groupings.
    item.group.forEach((slug) => { 
      
      // Get the group slug.
      slug = slug.toLowerCase().replace(regex, '').split(new RegExp(`[${delimiters.join('')}]`));
      
      // Permit nested groups.
      slug.forEach((slug) => {
        
        // Save the group slug and title.
        group[slug] = ctx.groups[slug] = Object.keys(ctx.groups).includes(slug) ? ctx.groups[slug] : slug;
        
      });

    });

    // Save groupings.
    item.groupName = group;
    
  });
  
};
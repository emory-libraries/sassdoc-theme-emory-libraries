'use strict'

/**
 * Compute a `patternSrc` object from pattern `ctx`.
 */
module.exports = function patternSrc (items, ctx) {
  
  // Capture namespace.
  ctx.namespace = ctx.namespace || '';
  
  // Build regex for detecting namespaced group names.
  const regex = new RegExp(`^${ctx.namespace}[.]`, 'i');
  
  // Capture pattern source.
  const sources = [];
  
  // Extract pattern source data.
  items.forEach((item) => { 
    
    // Initialize source data.
    const data = {
      name: item.context.name,
      type: item.context.type,
      scope: item.context.scope,
      groupNamespaced: item.group
    };
    
    // Get groups without namespace.
    data.group = data.groupNamespaced.map((group) => group.replace(regex, ''));
    
    // Get source path.
    data.src = data.group.map((group) => `${group}-${data.type}-${data.name}`);
    
    // Save source data.
    sources.push(data);
    
  });

  // Return sources.
  return sources;
  
};
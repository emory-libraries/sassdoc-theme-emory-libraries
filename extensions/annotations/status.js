module.exports = function status () {
  
  return {
    
    name: 'status',

    parse: (text) => text.trim().toLowerCase(),

    multiple: false
    
  };
  
};
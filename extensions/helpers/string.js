/**
 * Initialize string methods for use as handlebar helpers.
 */
module.exports = {
  
  combine: ( ...strings ) => strings.slice(0, -1).join(''),
  
  removeFromBeginning: ( str, x ) => str.indexOf(x) === 0 ? str.substring(x.length) : str,
  
  removeFromEnd: ( str, x ) => str.indexOf(x) === (str.length - x.length) ? str.substring(0, str.length - x.length) : str,
  
  regexReplace: ( string, regex, replacement, modifiers = '' ) => string.replace(new RegExp(regex, modifiers), replacement)
  
};
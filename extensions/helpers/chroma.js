/**
 * Load utilities.
 */
const extend = require('extend');

/**
 * Load and extend chroma.js.
 *
 * See <https://vis4.net/chromajs/>
 */
const chroma = extend(require('chroma-js'), {
  
  isColor( value ) { try { this(value); return true; } catch(error) { return false; } },
  
  isEqual( a, b ) { return chroma(a) == chroma(b); },
  
  inverse( color, light = null, dark = null, step = .05 ) { 
    
    const threshold = [7, 4.5];
    
    const utils = {
      
      __contrastColors( colorX, colorA, colorB ) {
        
        contrastA = chroma.contrast(colorX, colorA);
        contrastB = chroma.contrast(colorX, colorB);
        
        thresholdA = threshold.map((threshold) => contrastA >= threshold);
        thresholdB = threshold.map((threshold) => contrastB >= threshold);

        if( thresholdA.indexOf(true) > thresholdB.indexOf(true) ) return colorA;
        if( thresholdB.indexOf(true) > thresholdA.indexOf(true) ) return colorB;   
        return contrastA > contrastB ? colorA : colorB;
        
      },
      
      __contrastSelf( colorX, step ) {
        
        let colorA = colorX;
        let colorB = colorX;
        
        let contrastA; 
        let contrastB;
        
        let thresholdA; 
        let thresholdB;
        
        const done = function() {
        
          if( chroma.isEqual(colorA, 'white') && chroma.isEqual(colorB, 'black') ) return true;
          
          if( thresholdA.indexOf(true) > -1 || thresholdB.indexOf(true) > -1 ) return true;

          return false;

        };
        
        do {
          
          colorA = chroma(colorA).brighten(step);
          colorB = chroma(colorB).darken(step);
          
          contrastA = chroma.contrast(colorX, colorA);
          contrastB = chroma.contrast(colorX, colorB);
          
          thresholdA = threshold.map((threshold) => contrastA >= threshold);
          thresholdB = threshold.map((threshold) => contrastB >= threshold);
          
        } while( done() === false )
          
        return contrastA > contrastB ? colorA : colorB;
        
      },
      
      constrastAgainstColors: (color, light, dark) => utils.contrastColors(color, light, dark),
      
      contrastAgainstSelf: (color) => utils.contrastSelf(color)
      
    };
    
    if( light && dark ) return utils.contrastAgainstColors(color, light, dark);
    
    return utils.contrastAgainstSelf(color, step);
    
  }
  
});

/**
 * Export chroma as a handlebar helper.
 */
module.exports = {
  
  chroma( color, method = null, ...options ) {
  
    const source = options.pop();

    const methods = [
      'mix',
      'scale',
      'bezier',
      'average',
      'blend',
      'random',
      'contrast',
      'distance',
      'deltaE',
      'limits',
      'temparature',
      'cubehelix',
      'inverse',
      'isEqual'
    ];

    const filters = [
      'alpha',
      'darken',
      'brighten',
      'saturate',
      'desaturate',
      'luminance',
      'mode',
      'gamma'
    ];

    const getters = [
      'hex',
      'name', 
      'css',
      'rgb',
      'rgba',
      'hsl',
      'hsv',
      'hsi',
      'lab',
      'lch',
      'hcl',
      'temparature',
      'gl',
    ];

    const scale = [
      'mode',
      'gamma',
      'padding',
      'cache',
      'correctLightness',
      'colors',
      'classes',
      'domain'
    ];

    const cubehelix = [
      'start',
      'rotations',
      'hue',
      'gamma',
      'lightness'
    ];

    // Normalize arguments.
    if( methods.includes(color) ) {

      let temp = color;

      color = method;
      method = temp;

    }

    else if( method.indexOf('=') > -1 || !methods.includes(method) ) {

      options.unshift(method);
      method = null;

    }

    // Normalize colors.
    if( methods.includes(color) || filters.includes(color) || getters.includes(color) ) {

      options.unshift(color);
      color = undefined;

    }

    else if( /\[ *(?:([^,\[\]]*?)(?=\,|\])\,? *)* *\]/.test(color) ) {

      color = color.replace(/\[|\]/g, '').split(',').map((c) => c.trim().replace(/\'|\"/g, ''));

    } 

    // Handle color checks.
    if( color && method == 'isColor' ) return chroma.isColor(color);

    // Verify color.
    if( !Array.isArray(color) ) {

      if( !color && !method ) return;

      if( !chroma.isColor(color) && !['cubehelix', 'scale', 'random'].includes(method) ) return;

    }

    // Initialize result.
    let result;

    // Handle method implementations.
    if( method ) {

      if( method == 'scale' ) result = chroma[method](color);

      else {

        if( Array.isArray(color) ) result = chroma[method](...color);

        else result = chroma[method](color);

      }

    }

    else result = chroma(color);

    // Handle options.
    if( options.length > 0 ) {

      // Convert the options into an object.
      options = options.map((option) => option.trim().split('=')).reduce((object, option) => {

        object[option[0]] = option[1];

        return object;

      }, {});

      // Extract getters.
      const get = Object.keys(options).filter((option) => {

        return getters.includes(option);

      });

      // Loop through options.
      for( let key in options ) {

        // Remove any getters.
        if( get.includes(key) ) {

          delete options[key];

          continue;

        }

        // Get the value.
        let value = options[key];

        // Normalize truthy values.
        if( value === true ) value = undefined;

        // Verify methods.
        switch( method ) {

          case 'scale':

            if( !scale.includes(key) ) continue;

            break;

          case 'cubehelix':

            if( !cubehelix.includes(key) ) continue;

            break;

          default:

            if( !filters.concat(['scale']).includes(key) ) continue;

            break;

        }

        // Apply option.
        if( result[key] ) result = result[key](value);

      }

      // Only use getters if given.
      if( get.length > 0 ) {

        // Initialize gotten values.
        let gotten = {};

        // Handle getters.
        for( let getter of get ) {

          gotten[getter] = result[getter]();

        }

        // Use the gotten values.
        result = gotten;

      }

    }

    // Return.
    return result;

  }
  
};
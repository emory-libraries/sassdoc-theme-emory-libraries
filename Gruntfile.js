/**
 * Load utilities.
 */
const extend = require('extend');
const path = extend(require('path'), {
  extnameComplete: require('path-complete-extname')
});
const fs = require('fs-extra');
const grunt = require('grunt');

/** 
 * Identify the root paths of any Sass projects
 * on your local machine that you wish to compile
 * using this theme. This is handy for recompiling
 * any SassDocs on your system while making changes
 * to this theme. Paths should be relative to this
 * package's root directory.
 */
const projects = [
  '../template-sass'
];

/**
 * Identify theme-specific paths.
 */
const dir = {
  root: './',
  src: {
    root: 'src',
    scss: 'src/scss',
    js: 'src/js',
    images: 'src/images',
    template: 'src/views'
  },
  dist: {
    root: 'dist',
    js: 'dist/js',
    css: 'dist/css',
    image: 'dist/images',
    template: 'dist/views'
  },
  projects: projects.map((project) => path.resolve(project))
};

/**
 * Identify the theme's CSS (stylesheet) files. This
 * will be used to dynamically build our `<link/>`
 * tags.
 */
const css = [
  'main.css'
];

/**
 * Define the theme's JS dependencies.
 */
const dependencies = [
  'jquery',
  'prism', 
  'fuse'
];

/**
 * Identify the theme's JS (script) files and
 * merge any JS dependencies. This will be used
 * to dynamically build our `<script/>` tags.
 */
const js = [
  ...dependencies.map((script) => `dependencies/${script}.js`),
  'main.js'
];

/**
 * Set the default port for use with browserSync.
 */
const port = 3000;

/** Enable browserSync task for multiple projects
 * by assigning each project to its own custom 
 * port.
 */
const browserSync = dir.projects.map((project, index) => {
  
  let setting = {};
  
  let docs = path.resolve(project, 'docs');
  
  setting[path.basename(project)] = {
    options: {
      watchTask: true,
      server: {
        baseDir: docs
      },
      port: port + index
    },
    bsFiles: {
      src: [
        path.resolve(docs, '*.html'),
        path.resolve(docs, '**/*.css'),
        path.resolve(docs, '**/*.js'),
        path.resolve(docs, '**/*.{svg,png,jpg,jpeg,gif}')
      ]
    }
  };
  
  return setting;
  
}).reduce((settings, setting) => extend(settings, setting), {});

/**
 * Enable SassDoc compilation for multiple projects.
 *
 * See: http://sassdoc.com/customising-the-view
 */
const sassdoc = dir.projects.map((project) => {
  
  let setting = {};
  
  let pkg = path.join(project, 'package.json');
  let config = path.join(project, '.sassdocrc');
  let docs = path.join(project, 'docs');
  
  setting[path.basename(project)] = {
    options: {
      dest: docs,
      package: pkg,
      config: config,
      cache: false,
    },
    src: grunt.file.expand([
      path.join(project, '**/scss/**/*.scss'),
      '!' + path.join(project, '**/scss/vends/**/*.scss')
    ])
  };
  
  return setting;
  
}).reduce((settings, setting) => extend(settings, setting), {});

/** 
 * Tasks configuration.
 */
var config = {

  pkg: grunt.file.readJSON('package.json'),
  
  dir: dir,

  'dart-sass': {
    dev: {
      options: {
        sourceMap: false,
        outputStyle: 'expanded'
      },
      files: [{
        expand: true,
        cwd: '<%= dir.src.scss %>',
        src: ['*.scss'],
        dest: '<%= dir.dist.css %>',
        ext: '.css'
      }]
    },
    dist: {
      options: {
        sourceMap: false,
        outputStyle: 'compressed'
      },
      files: [{
        expand: true,
        cwd: '<%= dir.src.scss %>',
        src: ['*.scss'],
        dest: '<%= dir.dist.css %>',
        ext: '.css'
      }]
    }
  },

  watch: {
    scss: {
      files: ['<%= dir.src.scss %>/**/*.scss'],
      tasks: ['dart-sass:dev', 'postcss', 'copy:css']
    },
    js: {
      files: ['<%= dir.src.js %>/**/*.js'],
      tasks: [/*'jshint', */'babel', 'copy:dependencies', 'copy:js']
    },
    template: {
      files: ['<%= dir.src.template %>/**/*.handlebars'],
      tasks: ['replace:dev', 'sassdoc']
    },
    images: {
      files: ['<%= dir.src.images %>/**/*'],
      tasks: ['svgmin', 'imagemin']
    },
    config: {
      files: ['index.js', 'Gruntfile.js', '.babelrc', '.jshintrc'],
      tasks: ['sassdoc'],
      options: {
        reload: true
      }
    }
  },

  browserSync,
  
  postcss: {
    options: {
      processors: [
        require('autoprefixer')({browsers: ['last 2 versions', '> 1%', 'ie 9']})
      ]
    },
    default: {
      files: [{
        expand: true,
        cwd: '<%= dir.dist.css %>',
        src: ['{,*/}*.css'],
        dest: '<%= dir.dist.css %>'
      }]
    }
  },
  
  cssmin: {
    dist: {
      files: [{
        expand: true,
        cwd: '<%= dir.dist.css %>',
        src: ['*.css', '!*.min.css'],
        dest: '<%= dir.dist.css %>',
        ext: '.min.css'
      }]
    }
  },

  uglify: {
    options: {},
    dist: {
      files: [{
        expand: true,
        cwd: '<%= dir.dist.js %>',
        src: ['*.js', '!*.min.js'],
        dest: '<%= dir.dist.js %>',
        ext: '.min.js'
      }]
    }
  },

  svgmin: {
    dist: {
      files: [{
        expand: true,
        cwd: '<%= dir.src.images %>',
        src: ['**/*.svg'],
        dest: '<%= dir.dist.images %>'
      }]
    }
  },

  imagemin: {
    dist: {
      files: [{
        expand: true,
        cwd: '<%= dir.src.images %>',
        src: ['**/*.{gif,jpeg,jpg,png}'],
        dest: '<%= dir.dist.images %>'
      }]
    }
  },

  sassdoc,
  
  babel: {
    default: {
      files: [{
        expand: true,
        cwd: '<%= dir.src.js %>',
        src: ['*.js'],
        dest: '<%= dir.dist.js %>'
      }]
    }
  },
  
  jshint: {
    dev: {
      options: {
        jshintrc: true
      },
      src: ['<%= dir.src.js %>/*.js', '!<%= dir.src.js %>/dependencies/*.js']
    }
  },
  
  clean: {
    dist: ['<%= dir.dist.root %>'],
    unminjs: ['<%= dir.dist.js %>/**/*.js', '!<%= dir.dist.js %>/**/*.min.js'],
    unmincss: ['<%= dir.dist.css %>/**/*.css', '!<%= dir.dist.css %>/**/*.min.css']
  },
  
  copy: {
    dependencies: {
      files: [{
        expand: true,
        cwd: '<%= dir.src.js %>',
        src: ['dependencies/**/*.js'],
        dest: '<%= dir.dist.js %>'
      }]
    },
    js: {
      files: dir.projects.reduce((files, project) => {
        
        files.push({
          expand: true,
          cwd: '<%= dir.dist.js %>',
          src: ['**/*.js'],
          dest:  path.resolve(project, 'docs/js')
        });
        
        return files;
        
      }, [])
    },
    css: {
      files: dir.projects.reduce((files, project) => {
        
        files.push({
          expand: true,
          cwd: '<%= dir.dist.css %>',
          src: ['**/*.css'],
          dest:  path.resolve(project, 'docs/css')
        });
        
        return files;
        
      }, [])
    }
  },
  
  replace: {
    dev: {
      options: {
        patterns: [
          {
            match: 'css',
            replacement: () => css.map((src) => {
              
              const template = '<link rel="stylesheet" href=":src">';
              const prefix = 'css/';
              const suffix = '.css';
              const ext = path.extnameComplete(src);
              
              return template.replace(':src', path.join(prefix, src.replace(ext, '') + suffix));
              
            }).join("\n\t")
          },
          {
            match: 'js',
            replacement: () => js.map((src) => {
              
              const template = '<script src=":src"></script>';
              const prefix = 'js/';
              const suffix = '.js';
              const ext = path.extnameComplete(src);
              
              return template.replace(':src', path.join(prefix, src.replace(ext, '') + suffix));
              
            }).join("\n\t")
          },
          {
            match: 'gtm:head',
            replacement: ''
          },
          {
            match: 'gtm:body',
            replacement: ''
          }
        ]
      },
      files: [{
        expand: true, 
        cwd: '<%= dir.src.template %>',
        src: ['**/*.handlebars'],
        dest: '<%= dir.dist.template %>'
      }]
    },
    dist: {
      options: {
        patterns: [
          {
            match: 'css',
            replacement: () => css.map((src) => {
              
              const template = '<link rel="stylesheet" href=":src">';
              const prefix = 'css/';
              const suffix = '.min.css';
              const ext = path.extnameComplete(src);
              
              return template.replace(':src', path.join(prefix, src.replace(ext, '') + suffix));
              
            }).join("\n\t")
          },
          {
            match: 'js',
            replacement: () => js.map((src) => {
              
              const template = '<script src=":src"></script>';
              const prefix = 'js/';
              const suffix = '.min.js';
              const ext = path.extnameComplete(src);
              
              return template.replace(':src', path.join(prefix, src.replace(ext, '') + suffix));
              
            }).join("\n\t")
          },
          {
            match: 'gtm:head',
            replacement: '{{#if googleAnalytics}}{{> gtm-head}}{{/if}}'
          },
          {
            match: 'gtm:body',
            replacement: '{{#if googleAnalytics}}{{> gtm-body}}{{/if}}'
          }
        ]
      },
      files: [{
        expand: true, 
        cwd: '<%= dir.src.template %>',
        src: ['**/*.handlebars'],
        dest: '<%= dir.dist.template %>'
      }]
    }
  }

};

/**
 * Initializes and exports Grunt configurations and tasks.
 */
module.exports = function (grunt) {

  // Load Grunt tasks.
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take.
  require('time-grunt')(grunt);

  // Initialize our Grunt configurations.
  grunt.initConfig(config);
  
  // Register a build task for development environments.
  // This task should build our theme and deploy it to all
  // of our projects.
  grunt.registerTask('build:dev', [
    'clean:dist',
    'replace:dev',
    'dart-sass:dev',
    'postcss',
    'copy:dependencies',
    'babel',
    'svgmin',
    'imagemin',
    'copy:js',
    'copy:css',
    'sassdoc'
  ]);
  
  // Register a build task for production environments. 
  grunt.registerTask('build:dist', [
    'clean:dist',
    'replace:dist',
    'dart-sass:dist',
    'postcss',
    'cssmin',
    'copy:dependencies',
    'babel',
    'uglify',
    'svgmin',
    'imagemin',
    'clean:unminjs',
    'clean:unmincss',
    'copy:js',
    'copy:css',
    'sassdoc'
  ]);
  
  // Register a `dev` task to use while building our theme.
  grunt.registerTask('dev', [
    'build:dev',
    'browserSync',
    'watch'
  ]);

  // Register a `dist` task to use for deploying our theme.
  grunt.registerTask('dist', [
    'build:dist'
  ]);
  
  // Register the default Grunt task.
  grunt.registerTask('default', ['dev']);

};

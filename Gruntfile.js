'use strict';

module.exports = function (grunt) {
    var build = grunt.file.exists('local.build.conf.json') ? grunt.file.readJSON('local.build.conf.json') : grunt.file.readJSON('build.conf.json')

    var fs = require("fs"),
        php = require('phpjs'),
        Util = {
            jsBasePath: build.sourcePath + '_src/',
            parseBasePath: build.sourcePath + '_parse/',
            cssBasePath: build.sourcePath + 'themes/default/_css/',

            fetchScripts: function (readFile, basePath, except) {

                var sources = fs.readFileSync(readFile);
                sources = /\[([^\]]+\.js'[^\]]+)\]/.exec(sources);
                sources = sources[1].replace(/\/\/.*\n/g, '\n').replace(/'|"|\n|\t|\s/g, '');
                sources = sources.split(",");
                sources.forEach(function (filepath, index) {
                    if (except && php.in_array(filepath, except)) {
                        return false;
                    }
                    sources[ index ] = basePath + filepath;
                });

                return sources;
            },

            fetchStyles: function (except) {

                var sources = fs.readFileSync(this.cssBasePath + "ueditor.css"),
                    filepath = null,
                    pattern = /@import\s+([^;]+)*;/g,
                    src = [];

                while (filepath = pattern.exec(sources)) {
                    if (except && php.in_array(filepath[1], except)) {
                        continue;
                    }
                    src.push(this.cssBasePath + filepath[ 1 ].replace(/'|"/g, ""));
                }

                return src;

            },

            fetchScriptsByArray: function(modules, extendModules) {
                var sources = [];
                for (var i = 0; i < modules.length; i++) {
                    if (modules[i].indexOf(this.jsBasePath)) {
                        sources.push(modules[i]);
                    } else {
                        sources.push(this.jsBasePath + modules[i]);
                    }
                }

                return sources.concat(extendModules);
            },

            fetchStylesByArray: function(styles, extendStyles) {
                var sources = [];
                for (var i = 0; i < modules.length; i++) {
                    if (modules[i].indexOf(this.cssBasePath)) {
                        sources.push(modules[i]);
                    } else {
                        sources.push(this.cssBasePath + modules[i]);
                    }
                }

                return sources.concat(extendModules);
            }

        },
        packageJson = grunt.file.readJSON('package.json'),
        server = grunt.option('server') || '',
        encode = grunt.option('encode') || 'utf8',
        disDir = "dist/",
        banner = '/*!\n * ' + packageJson.name + '\n * version: ' + packageJson.version + '\n * build: <%= new Date() %>\n */\n\n';

    //init
    (function () {

        server = typeof server === "string" ? server.toLowerCase() : 'php';
        encode = typeof encode === "string" ? encode.toLowerCase() : 'utf8';

        //disDir = 'dist/' + encode + '-' + server + '/';
        disDir = 'dist/';

    })();

    grunt.initConfig({
        pkg: packageJson,
        concat: {
            js: {
                options: {
                    banner: '/*!\n * ' + packageJson.name + '\n * version: ' + packageJson.version + '\n * build: <%= new Date() %>\n */\n\n' +
                        '(function(){\n\n',
                    footer: '\n\n})();\n',
                    process: function (src, s) {
                        var filename = s.substr(s.indexOf('/') + 1);
                        return '// ' + filename + '\n' + src.replace('/_css/', '/css/') + '\n';
                    }
                },
                src: Util.fetchScripts(build.sourcePath + "_examples/editor_api.js", Util.jsBasePath, build.exceptModules).concat(build.extendModules || []),
                dest: disDir + packageJson.name + '.all.js'
            },
            parse: {
                options: {
                    banner: '/*!\n * ' + packageJson.name + ' parse\n * version: ' + packageJson.version + '\n * build: <%= new Date() %>\n */\n\n' +
                        '(function(){\n\n',
                    footer: '\n\n})();\n'
                },
                src: Util.fetchScripts(build.sourcePath + "ueditor.parse.js", Util.parseBasePath, build.exceptParse).concat(build.extendParse || []),
                dest: disDir + packageJson.name + '.parse.js'
            },
            css: {
                src: Util.fetchStyles(build.exceptStyles).concat(build.extendStyles),
                dest: disDir + 'themes/default/css/ueditor.css'
            }
        },
        cssmin: {
            options: {
                banner: banner
            },
            files: {
                expand: true,
                cwd: disDir + 'themes/default/css/',
                src: ['*.css', '!*.min.css'],
                dest: disDir + 'themes/default/css/',
                ext: '.min.css'
            }
        },
        closurecompiler: {
            dist: {
                options: {
                    banner: '/*!\n * ' + packageJson.name + '\n * version: ' + packageJson.version + '\n * build: <%= new Date() %>\n */'
                },
                src: disDir + '<%= pkg.name %>.all.js',
                dest: disDir + '<%= pkg.name %>.all.min.js'
            },
            parse: {
                options: {
                    banner: '/*!\n * ' + packageJson.name + ' parse\n * version: ' + packageJson.version + '\n * build: <%= new Date() %>\n */'
                },
                src: disDir + '<%= pkg.name %>.parse.js',
                dest: disDir + '<%= pkg.name %>.parse.min.js'
            }
        },
        copy: {
            base: {
                files: [
                    {

                        src: [ '*.html', 'themes/iframe.css', 'themes/default/dialogbase.css', 'themes/default/images/**', 'dialogs/**', 'lang/**', 'third-party/**' ],
                        dest: disDir,
                        expand: true,
                        cwd: build.sourcePath

                    }
                ]
            },
            extend: {
                files: [
                    {
                        src: [ 'ext-dialogs/**' ],
                        dest: disDir,
                        expand: true,
                        cwd: 'src'
                    }
                ]
            },
            demo: {
                files: [
                    {
                        src: build.sourcePath + '_examples/completeDemo.html',
                        dest: disDir + 'index.html'
                    }
                ]
            },
            php: {

                expand: true,
                src: 'php/**',
                dest: disDir,
                cwd: build.sourcePath

            },
            asp: {

                expand: true,
                src: 'asp/**',
                dest: disDir,
                cwd: build.sourcePath

            },
            jsp: {

                expand: true,
                src: 'jsp/**',
                dest: disDir,
                cwd: build.sourcePath

            },
            net: {

                expand: true,
                src: 'net/**',
                dest: disDir,
                cwd: build.sourcePath

            }
        },
        transcoding: {

            options: {
                charset: encode
            },
            src: [disDir + '**/*.html', disDir + '**/*.js', disDir + '**/*.css', disDir + '**/*.json', disDir + '**/*.jsp', disDir + '**/*.asp']

        },
        replace: {

            fileEncode: {
                src: [ disDir + '**/*.html', disDir + 'dialogs/**/*.js', disDir + '**/*.css', disDir + '**/*.php', disDir + '**/*.jsp', disDir + '**/*.ashx', disDir + '**/*.asp' ],
                overwrite: true,
                replacements: [
                    {
                        from: /utf-8/gi,
                        to: 'gbk'
                    }
                ]
            },
            demo: {
                src: disDir + 'index.html',
                overwrite: true,
                replacements: [
                    {
                        from: /\.\.\//gi,
                        to: ''
                    },
                    {
                        from: 'editor_api.js',
                        to: packageJson.name + '.all.min.js'
                    }
                ]
            },
            gbkasp: {
                src: [ disDir + 'asp/*.asp' ],
                overwrite: true,
                replacements: [
                    {
                        from: /65001/gi,
                        to: '936'
                    }
                ]
            }

        },
        clean: {
            build: {
                src: [
                    disDir + "jsp/src",
                    disDir + "*/upload",
                    disDir + ".DS_Store",
                    disDir + "**/.DS_Store",
                    disDir + ".git",
                    disDir + "**/.git"
                ]
            }
        }

    });

    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-closurecompiler');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-transcoding');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', 'UEditor build', function () {

        var tasks = [ 'concat', 'cssmin', 'closurecompiler', 'copy:base', 'copy:extend', 'copy:demo', 'replace:demo', 'clean' ];

        if (server) {
            tasks.push('copy:' + server);
        }

        if (encode === 'gbk') {
            tasks.push('replace:fileEncode');
            if (server === 'asp') {
                tasks.push('replace:gbkasp');
            }
        }

        tasks.push('transcoding');

        //config修改
        updateConfigFile();

        grunt.task.run(tasks);

    });


    function updateConfigFile() {

        var filename = build.sourcePath + 'ueditor.config.js',
            targetFile = 'ueditor.config.js',
            file = grunt.file.read(filename),
            path = server + "/",
            suffix = server === "net" ? ".ashx" : "." + server;

        file = file.replace(/php\//ig, path).replace(/\.php/ig, suffix);

        if (encode == 'gbk') {
            file = file.replace(/utf-8/gi, 'gbk');
        }

        //写入到dist
        if (grunt.file.write(disDir + targetFile, file)) {

            grunt.log.writeln('config file update success');

        } else {
            grunt.log.warn('config file update error');
        }

    }

};
